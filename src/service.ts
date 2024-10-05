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
  // {
  //   chainId: "avalanche",
  //   signer: "fireblocks",
  // },
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
            balance: "100", // TODO: get balance from adamik
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
          username: wallet.userName,
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
