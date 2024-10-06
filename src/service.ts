import { Account, Wallet } from "@prisma/client";
import { prisma } from "./prisma_client";
import { SIGNERS, type SIGNER } from "./signers";

const WALLETS_SIGNERS: { chainId: string; signer: SIGNER }[] = [
  {
    chainId: "sepolia",
    signer: "narval",
  },
  {
    chainId: "bitcoin-testnet",
    signer: "fireblocks",
  },
  {
    chainId: "tron",
    signer: "adamik",
  },
  {
    chainId: "avalanche-fuji",
    signer: "fireblocks",
  },
  // {
  //   chainId: "DFK",
  //   signer: "fireblocks",
  // },
  // {
  //   chainId: "Dexalot",
  //   signer: "fireblocks",
  // },
  // {
  //   chainId: "tron",
  //   signer: "adamik",
  // },
  // {
  //   chainId: "cosmos",
  //   signer: "adamik",
  // },
];

async function getBalance(address: string, chainId: string): Promise<string> {
  const balance_response = await fetch(
    "https://api.adamik.io/api/account/state?include=native",
    {
      headers: {
        Authorization: process.env.ADAMIK_API_KEY,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        chainId,
        accountId: address,
      }),
    },
  );

  let balance =
    balance_response.status === 200
      ? (await balance_response.json()).balances.native.total
      : 0;

  const chain_response = await fetch(
    `https://api.adamik.io/api/chains/${chainId}`,
    {
      headers: {
        Authorization: process.env.ADAMIK_API_KEY,
        "Content-Type": "application/json",
      },
      method: "GET",
    },
  );

  const decimals =
    chain_response.status === 200
      ? Number((await chain_response.json()).decimals)
      : 0;
  console.log(`fix balance ${balance} for ${chainId}`);
  balance =
    decimals && !Number.isNaN(decimals) ? balance / 10 ** decimals : balance;
  console.log(`after new balance ${balance} for ${chainId}`);

  return balance.toString();
}

export async function getAccounts(
  userId: string,
): Promise<
  { chainId: string; address: string; balance: string; provider: SIGNER }[]
> {
  return await prisma.account
    .findMany({
      where: {
        userName: userId,
      },
    })
    .then((accounts) =>
      Promise.all(
        accounts.map(async (account) => {
          // fetch provider from database
          const { provider } = await prisma.wallet.findUnique({
            where: {
              userName_provider: {
                userName: account.userName,
                provider: account.provider,
              },
            },
          });

          return {
            chainId: account.chainId,
            address: account.address,
            provider: provider as SIGNER,
            balance: await getBalance(account.address, account.chainId),
          };
        }),
      ),
    );
}

export async function registerUser(userId: string): Promise<void> {
  // check if user exists
  let user = await prisma.user.findUnique({
    where: {
      userName: userId,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        userName: userId,
      },
    });
  }

  for (const chain of WALLETS_SIGNERS) {
    const signer = SIGNERS[chain.signer];

    // 1. check if wallet exists
    let wallet = await prisma.wallet.findUnique({
      where: {
        userName_provider: {
          userName: userId,
          provider: signer.name,
        },
      },
    });

    // if not, create it
    if (!wallet) {
      const wallet_id = await signer.createWallet(userId);
      wallet = await prisma.wallet.create({
        data: {
          userName: userId,
          provider: signer.name,
          id: wallet_id,
        },
      });
      console.log(`wallet ${wallet.id} registered for user ${wallet.userName}`);
    } else {
      console.log(
        `wallet ${wallet.id} already registered for user ${wallet.userName}`,
      );
    }

    // 2. check if account exists
    let account = await prisma.account.findUnique({
      where: {
        userName_chainId: {
          userName: userId,
          chainId: chain.chainId,
        },
      },
    });

    // if not, create it
    if (!account) {
      const { address } = await signer.createAccount(wallet.id, chain.chainId);
      const account_created = await prisma.account.create({
        data: {
          userName: userId,
          provider: signer.name,
          chainId: chain.chainId,
          address: address,
        },
      });
      console.log(
        `account ${account_created.chainId} registered for user ${account_created.userName}`,
      );
    } else {
      console.log(
        `account ${account.chainId} already registered for user ${account.userName}`,
      );
    }
  }
}

export async function sign(
  userId: string,
  chainId: string,
  transaction: unknown,
): Promise<string> {
  const signer = SIGNERS["fireblocks"]; // TODO pick the right one

  /*
  const { provider } = await prisma.wallet.findUnique({
    where: {
      userName_provider: {
        userName: userId,
        provider: signer.name,
      },
    },
  });
  */

  return signer.sign(transaction);
}

export async function getSupportedAssets() {
  const signer = SIGNERS["fireblocks"]; // TODO pick the right one
  const supportedAssets = await signer.getSupportedAssets();
  return supportedAssets;
}
