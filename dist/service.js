"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccounts = getAccounts;
exports.registerUser = registerUser;
exports.sign = sign;
exports.getSupportedAssets = getSupportedAssets;
const prisma_client_1 = require("./prisma_client");
const signers_1 = require("./signers");
const ADAMIK_API_URL = "https://api.adamik.io/api";
const WALLETS_SIGNERS = [
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
        signer: "narval",
    },
    {
        chainId: "defi-kingdoms",
        signer: "narval",
    },
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
async function getBalance(address, chainId) {
    const balance_response = await fetch(ADAMIK_API_URL + "/account/state?include=native", {
        headers: {
            Authorization: process.env.ADAMIK_API_KEY,
            "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
            chainId,
            accountId: address,
        }),
    });
    let balance = balance_response.status === 200
        ? (await balance_response.json()).balances.native.total
        : 0;
    const chain_response = await fetch(ADAMIK_API_URL + `/chains/${chainId}`, {
        headers: {
            Authorization: process.env.ADAMIK_API_KEY,
            "Content-Type": "application/json",
        },
        method: "GET",
    });
    const decimals = chain_response.status === 200
        ? Number((await chain_response.json()).decimals)
        : 0;
    console.log(`fix balance ${balance} for ${chainId}`);
    balance =
        decimals && !Number.isNaN(decimals) ? balance / 10 ** decimals : balance;
    console.log(`after new balance ${balance} for ${chainId}`);
    return balance.toString();
}
async function getAccounts(userId) {
    return await prisma_client_1.prisma.account
        .findMany({
        where: {
            userName: userId,
        },
    })
        .then((accounts) => Promise.all(accounts.map(async (account) => {
        // fetch provider from database
        const { provider } = await prisma_client_1.prisma.wallet.findUnique({
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
            provider: provider,
            balance: await getBalance(account.address, account.chainId),
        };
    })));
}
async function registerUser(userId) {
    // check if user exists
    let user = await prisma_client_1.prisma.user.findUnique({
        where: {
            userName: userId,
        },
    });
    if (!user) {
        user = await prisma_client_1.prisma.user.create({
            data: {
                userName: userId,
            },
        });
    }
    for (const chain of WALLETS_SIGNERS) {
        const signer = signers_1.SIGNERS[chain.signer];
        // 1. check if wallet exists
        let wallet = await prisma_client_1.prisma.wallet.findUnique({
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
            wallet = await prisma_client_1.prisma.wallet.create({
                data: {
                    userName: userId,
                    provider: signer.name,
                    id: wallet_id,
                },
            });
            console.log(`wallet ${wallet.id} registered for user ${wallet.userName}`);
        }
        else {
            console.log(`wallet ${wallet.id} already registered for user ${wallet.userName}`);
        }
        // 2. check if account exists
        let account = await prisma_client_1.prisma.account.findUnique({
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
            const account_created = await prisma_client_1.prisma.account.create({
                data: {
                    userName: userId,
                    provider: signer.name,
                    chainId: chain.chainId,
                    address: address,
                },
            });
            console.log(`account ${account_created.chainId} registered for user ${account_created.userName}`);
        }
        else {
            console.log(`account ${account.chainId} already registered for user ${account.userName}`);
        }
    }
}
async function sign(userId, chainId, transaction) {
    //const signer = SIGNERS["fireblocks"]; // TODO pick the right one
    const signer = signers_1.SIGNERS["narval"]; // TODO pick the right one
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
async function getSupportedAssets() {
    const signer = signers_1.SIGNERS["fireblocks"]; // TODO pick the right one
    const supportedAssets = await signer.getSupportedAssets();
    return supportedAssets;
}
//# sourceMappingURL=service.js.map