"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccounts = getAccounts;
exports.registerUser = registerUser;
exports.sign = sign;
exports.getSupportedAssets = getSupportedAssets;
const prisma_client_1 = require("./prisma_client");
const signers_1 = require("./signers");
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
function getBalance(address, chainId) {
    return __awaiter(this, void 0, void 0, function* () {
        const balance_response = yield fetch("https://api.adamik.io/api/account/state?include=native", {
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
            ? (yield balance_response.json()).balances.native.total
            : 0;
        const chain_response = yield fetch(`https://api.adamik.io/api/chains/${chainId}`, {
            headers: {
                Authorization: process.env.ADAMIK_API_KEY,
                "Content-Type": "application/json",
            },
            method: "GET",
        });
        const decimals = chain_response.status === 200
            ? Number((yield chain_response.json()).decimals)
            : 0;
        console.log(`fix balance ${balance} for ${chainId}`);
        balance =
            decimals && !Number.isNaN(decimals) ? balance / Math.pow(10, decimals) : balance;
        console.log(`after new balance ${balance} for ${chainId}`);
        return balance.toString();
    });
}
function getAccounts(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield prisma_client_1.prisma.account
            .findMany({
            where: {
                userName: userId,
            },
        })
            .then((accounts) => Promise.all(accounts.map((account) => __awaiter(this, void 0, void 0, function* () {
            // fetch provider from database
            const { provider } = yield prisma_client_1.prisma.wallet.findUnique({
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
                balance: yield getBalance(account.address, account.chainId),
            };
        }))));
    });
}
function registerUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        // check if user exists
        let user = yield prisma_client_1.prisma.user.findUnique({
            where: {
                userName: userId,
            },
        });
        if (!user) {
            user = yield prisma_client_1.prisma.user.create({
                data: {
                    userName: userId,
                },
            });
        }
        for (const chain of WALLETS_SIGNERS) {
            const signer = signers_1.SIGNERS[chain.signer];
            // 1. check if wallet exists
            let wallet = yield prisma_client_1.prisma.wallet.findUnique({
                where: {
                    userName_provider: {
                        userName: userId,
                        provider: signer.name,
                    },
                },
            });
            // if not, create it
            if (!wallet) {
                const wallet_id = yield signer.createWallet(userId);
                wallet = yield prisma_client_1.prisma.wallet.create({
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
            let account = yield prisma_client_1.prisma.account.findUnique({
                where: {
                    userName_chainId: {
                        userName: userId,
                        chainId: chain.chainId,
                    },
                },
            });
            // if not, create it
            if (!account) {
                const { address } = yield signer.createAccount(wallet.id, chain.chainId);
                const account_created = yield prisma_client_1.prisma.account.create({
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
    });
}
function sign(userId, chainId, transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const signer = signers_1.SIGNERS["fireblocks"]; // TODO pick the right one
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
    });
}
function getSupportedAssets() {
    return __awaiter(this, void 0, void 0, function* () {
        const signer = signers_1.SIGNERS["fireblocks"]; // TODO pick the right one
        const supportedAssets = yield signer.getSupportedAssets();
        return supportedAssets;
    });
}
//# sourceMappingURL=service.js.map