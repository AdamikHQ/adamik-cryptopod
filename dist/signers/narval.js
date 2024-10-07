"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NarvalSigner = void 0;
const signature_1 = require("@narval-xyz/armory-sdk/signature");
const armory_sdk_1 = require("@narval-xyz/armory-sdk");
const assert_1 = __importDefault(require("assert"));
const uuid_1 = require("uuid");
const accounts_1 = require("viem/accounts");
const getEnv = (key) => {
    const value = process.env[key];
    (0, assert_1.default)(value !== undefined, `Missing env variable ${key}`);
    return value;
};
const clientId = getEnv("ARMORY_CLIENT_ID");
const clientSecret = getEnv("ARMORY_CLIENT_SECRET");
const getPrivateKey = (key) => {
    return getEnv(key);
};
const userPrivateKey = getPrivateKey("ARMORY_USER_PRIVATE_KEY");
const addr = (0, accounts_1.privateKeyToAddress)(userPrivateKey);
const userJwk = (0, armory_sdk_1.privateKeyToJwk)(userPrivateKey, "ES256K", addr);
const accountId = `eip155:eoa:${addr}`;
const unsafeSignerPrivateKey = process.env.ARMORY_USER_PRIVATE_KEY;
const signerAddress = (0, accounts_1.privateKeyToAddress)(unsafeSignerPrivateKey);
const signerJwk = (0, signature_1.secp256k1PrivateKeyToJwk)(unsafeSignerPrivateKey, signerAddress); // Need to pass the address as kid since my Datastore only references the address, not the whole pubkey.
const entityStorePrivateKey = getPrivateKey("ARMORY_ENTITY_STORE_PRIVATE_KEY");
const policyStorePrivateKey = getPrivateKey("ARMORY_POLICY_STORE_PRIVATE_KEY");
class NarvalSigner {
    constructor() {
        this.name = "narval";
        console.log("narval - init auth client");
        this.authClient = new armory_sdk_1.AuthClient({
            host: "https://auth.armory.narval.xyz",
            clientId,
            signer: {
                jwk: userJwk,
                alg: "EIP191",
                sign: (0, armory_sdk_1.buildSignerEip191)(userPrivateKey),
            },
        });
        console.log("narval - init vault client");
        this.vaultClient = new armory_sdk_1.VaultClient({
            host: "https://vault.armory.narval.xyz",
            clientId,
            signer: {
                jwk: userJwk,
                alg: "EIP191",
                sign: (0, armory_sdk_1.buildSignerEip191)(userPrivateKey),
            },
        });
        console.log("narval - init entity store client");
        this.entityStoreClient = new armory_sdk_1.EntityStoreClient({
            clientSecret,
            host: "https://auth.armory.narval.xyz",
            clientId,
            signer: {
                jwk: userJwk,
                alg: "EIP191",
                sign: (0, armory_sdk_1.buildSignerEip191)(userPrivateKey),
            },
        });
    }
    async createWallet(userId) {
        return "narval"; // TODO: create a Narval user per cryptopod user registered, and limit their access to their own wallets?
    }
    async createAccount(_1, // unused, all cryptopod users use the same narval user
    _2 // unused, narval wallets provide only evm string anyway
    ) {
        console.log("narval - requesting wallet create access token");
        // Request access to create wallet and account.
        const walletCreateAccessToken = await this.authClient.requestAccessToken({
            action: armory_sdk_1.Action.GRANT_PERMISSION,
            resourceId: "vault",
            nonce: (0, uuid_1.v4)(),
            permissions: [armory_sdk_1.Permission.WALLET_CREATE],
        });
        console.log("narval - generating wallet");
        const { account } = await this.vaultClient.generateWallet({
            accessToken: walletCreateAccessToken,
        });
        const { data: entity } = await this.entityStoreClient.fetch();
        const newEntities = {
            ...entity,
            accounts: [
                ...(entity.accounts || []),
                {
                    id: account.id,
                    address: account.address,
                    accountType: "eoa",
                },
            ],
        };
        await this.entityStoreClient.signAndPush(newEntities);
        return { address: account.address };
    }
    // TODO
    async sign(transaction) {
        const request = {
            resourceId: accountId,
            action: armory_sdk_1.Action.SIGN_MESSAGE,
            nonce: (0, uuid_1.v4)(),
            //message: transaction,
            message: "Narval Testing",
        };
        try {
            console.log("\n\n Authorization Request");
            const accessToken = await this.authClient.requestAccessToken(request);
            console.log("\n\n Authorization Response:", accessToken);
            if (accessToken) {
                console.log("\n\n🔏 Sending signing request...");
                const { signature } = await this.vaultClient.sign({
                    accessToken,
                    data: request,
                });
                console.log("\n\n✅ Signature:", signature);
                return signature;
            }
        }
        catch (error) {
            console.error(error);
            throw new Error("Narval signing error");
        }
    }
    async getSupportedAssets() {
        throw new Error("Not implemented");
    }
}
exports.NarvalSigner = NarvalSigner;
//# sourceMappingURL=narval.js.map