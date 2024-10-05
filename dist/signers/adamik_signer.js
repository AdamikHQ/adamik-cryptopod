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
exports.AdamikSigner = void 0;
class AdamikSigner {
    constructor() {
        this.ADAMIK_SIGNER_URL = "https://adamik-multichain-signer.vercel.app";
        this.name = "adamik";
    }
    sign(transaction) {
        throw new Error("Method not implemented.");
    }
    getSupportedAssets() {
        throw new Error("Method not implemented.");
    }
    createWallet(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const walletId = yield fetch(`${this.ADAMIK_SIGNER_URL}/api/register?uuid=${userId}`, {
                method: "GET",
            });
            return (yield walletId.json()).user.uuid;
        });
    }
    createAccount(walletId, chainId) {
        return __awaiter(this, void 0, void 0, function* () {
            const addresses = yield fetch(`${this.ADAMIK_SIGNER_URL}/api/address?uuid=${walletId}`, {
                method: "GET",
            });
            return {
                address: (yield addresses.json())[`${chainId}_address`],
            };
        });
    }
}
exports.AdamikSigner = AdamikSigner;
//# sourceMappingURL=adamik_signer.js.map