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
class FireblocksSigner {
    constructor() {
        this.name = "fireblocks";
        // Create a Fireblocks API instance
        this.instance = new ts_sdk_1.Fireblocks({
            secretKey: process.env.FIREBLOCKS_SECRET_KEY.replace(/\\n/g, "\n"),
        });
    }
    registerUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const vault = yield this.instance.vaults.createVaultAccount({
                createVaultAccountRequest: {
                    name: "Vault Account",
                    hiddenOnUI: false,
                    autoFuel: false,
                },
            });
            if (vault.statusCode !== 200) {
                console.log("fireblocks - vault creation failed");
                return Promise.reject("fireblocks - vault creation failed");
            }
            console.log("fireblocks - created vault");
            const chainId = "ethereum"; // TODO: get chainId from vault
            return [
                {
                    walletId: vault.data.id,
                    address: "0x0", // TODO: Get address from vault
                    chainId,
                },
            ];
        });
    }
}
exports.FireblocksSigner = FireblocksSigner;
//# sourceMappingURL=fireblocks.js.map