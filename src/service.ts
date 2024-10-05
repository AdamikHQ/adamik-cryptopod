import { Account, Wallet } from "@prisma/client";
import { prisma } from "./prisma_client";
import { SIGNERS, type SIGNER } from "./signers";

const WALLETS_SIGNERS: Record<string, SIGNER> = {
  ethereum: "fireblocks",
};

const supportedChains = ["ethereum"]; // TODO: make this configurable

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
              id: account.walletId,
            },
          });

          return {
            chainId: account.chainId,
            address: account.address,
            provider: "fireblocks",
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

  for (const chainId of supportedChains) {
    const signerName = WALLETS_SIGNERS[chainId];
    const signer = SIGNERS[signerName];

    // 1. check if wallet exists
    let wallet = await prisma.wallet.findUnique({
      where: {
        userName_provider: {
          userName: userId,
          provider: signerName,
        },
      },
    });

    // if not, create it
    if (!wallet) {
      const wallet_id = await signer.createWallet();
      wallet = await prisma.wallet.create({
        data: {
          userName: userId,
          provider: signerName,
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
          chainId: chainId,
        },
      },
    });

    // if not, create it
    if (!account) {
      const { address } = await signer.createAccount(wallet.id, chainId);
      const account_created = await prisma.account.create({
        data: {
          userName: userId,
          walletId: wallet.id,
          chainId: chainId,
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
