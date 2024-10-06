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
exports.FireblocksSigner = void 0;
const ts_sdk_1 = require("@fireblocks/ts-sdk");
const chainIdMappings = {
    "bitcoin-testnet": "BTC_TEST",
    sepolia: "ETH_TEST5", // ETH_TEST is deprecated and gets refused by fireblocks
    "avalanche-fuji": "AVAXTEST", // TODO
    // polygon: "polygon", // TODO
    // arbitrum: "arbitrum", // TODO
};
class FireblocksSigner {
    constructor() {
        this.name = "fireblocks";
        // Create a Fireblocks API instance
        this.instance = new ts_sdk_1.Fireblocks({
            secretKey: process.env.FIREBLOCKS_SECRET_KEY.replace(/\\n/g, "\n"),
        });
    }
    createWallet(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const vault = yield this.instance.vaults.createVaultAccount({
                createVaultAccountRequest: {
                    name: `Vault of user ${userId}`,
                    hiddenOnUI: false,
                    autoFuel: false,
                },
            });
            if (vault.statusCode !== 200) {
                console.log("fireblocks - vault creation failed");
                return Promise.reject("fireblocks - vault creation failed");
            }
            console.log("fireblocks - created vault");
            return vault.data.id;
        });
    }
    createAccount(walletId, chainId) {
        return __awaiter(this, void 0, void 0, function* () {
            const vaultWallet = yield this.instance.vaults.createVaultAccountAsset({
                vaultAccountId: walletId,
                assetId: chainIdMappings[chainId],
            });
            console.log(`fireblocks - created account ${chainId}`);
            return { address: vaultWallet.data.address };
        });
    }
    sign(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transactionResponse = yield this.instance.transactions.createTransaction({
                    transactionRequest: transaction,
                });
                const txId = transactionResponse.data.id;
                if (!txId) {
                    throw new Error("Transaction ID is undefined.");
                }
                // TODO
                const txInfo = yield this.getTxStatus(txId);
                console.log(JSON.stringify(txInfo, null, 2));
                const signature = txInfo.signedMessages[0].signature;
                console.log(JSON.stringify(signature));
                const encodedSig = Buffer.from([
                    Number.parseInt(signature.v.toString(), 16) + 31,
                ]).toString("hex") + signature.fullSig;
                console.log("Encoded Signature:", Buffer.from(encodedSig, "hex").toString("base64"));
                return encodedSig;
            }
            catch (error) {
                console.error(error);
                throw new Error(`Could not sign: ${error.toString()}`);
            }
        });
    }
    getTxStatus(txId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield this.instance.transactions.getTransaction({ txId });
                let tx = response.data;
                let messageToConsole = `Transaction ${tx.id} is currently at status - ${tx.status}`;
                console.log(messageToConsole);
                while (tx.status !== ts_sdk_1.TransactionStateEnum.Completed) {
                    yield new Promise((resolve) => setTimeout(resolve, 3000));
                    response = yield this.instance.transactions.getTransaction({ txId });
                    tx = response.data;
                    switch (tx.status) {
                        case ts_sdk_1.TransactionStateEnum.Blocked:
                        case ts_sdk_1.TransactionStateEnum.Cancelled:
                        case ts_sdk_1.TransactionStateEnum.Failed:
                        case ts_sdk_1.TransactionStateEnum.Rejected:
                            throw new Error(`Signing request failed/blocked/cancelled: Transaction: ${tx.id} status is ${tx.status}`);
                        default:
                            console.log(messageToConsole);
                            break;
                    }
                }
                while (tx.status !== ts_sdk_1.TransactionStateEnum.Completed)
                    ;
                return tx;
            }
            catch (error) {
                throw error;
            }
        });
    }
    getSupportedAssets() {
        return __awaiter(this, void 0, void 0, function* () {
            const truc = yield this.instance.blockchainsAssets.getSupportedAssets();
            return truc;
        });
    }
}
exports.FireblocksSigner = FireblocksSigner;
//# sourceMappingURL=fireblocks.js.map