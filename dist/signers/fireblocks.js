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
    bitcoin: "BTC_TEST",
    ethereum: "ETH_TEST5", // ETH_TEST is deprecated and gets refused by fireblocks
    // polygon: "polygon", // TODO
    // avalanche: "avalanche", // TODO
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
            // TODO: create a fireblock account
            console.log("fireblocks - creating account");
            const vaultWallet = yield this.instance.vaults.createVaultAccountAsset({
                vaultAccountId: walletId,
                assetId: chainIdMappings[chainId],
            });
            console.log(`fireblocks - activated asset ${chainId}`);
            return { address: vaultWallet.data.address };
        });
    }
}
exports.FireblocksSigner = FireblocksSigner;
//# sourceMappingURL=fireblocks.js.map