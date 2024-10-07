"use strict";
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
    async createWallet(userId) {
        const walletId = await fetch(`${this.ADAMIK_SIGNER_URL}/api/register?uuid=${userId}`, {
            method: "GET",
        });
        return (await walletId.json()).user.uuid;
    }
    async createAccount(walletId, chainId) {
        const addresses = await fetch(`${this.ADAMIK_SIGNER_URL}/api/address?uuid=${walletId}`, {
            method: "GET",
        });
        return {
            address: (await addresses.json())[`${chainId}_address`],
        };
    }
}
exports.AdamikSigner = AdamikSigner;
//# sourceMappingURL=adamik_signer.js.map