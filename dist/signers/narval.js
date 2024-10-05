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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NarvalSigner = exports.addAccount = void 0;
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
const entityStorePrivateKey = getPrivateKey("ARMORY_ENTITY_STORE_PRIVATE_KEY");
const policyStorePrivateKey = getPrivateKey("ARMORY_POLICY_STORE_PRIVATE_KEY");
const addAccount = (_a) => __awaiter(void 0, [_a], void 0, function* ({ account }) {
    const entityStoreClient = new armory_sdk_1.EntityStoreClient({
        clientSecret,
        host: "https://auth.armory.narval.xyz",
        clientId,
        signer: {
            jwk: userJwk,
            alg: "EIP191",
            sign: (0, armory_sdk_1.buildSignerEip191)(userPrivateKey),
        },
    }); // Same as Auth config, with system-manager credential
    const { data: entity } = yield entityStoreClient.fetch();
    const newEntities = Object.assign(Object.assign({}, entity), { accounts: [
            ...(entity.accounts || []),
            {
                id: account.id,
                address: account.address,
                accountType: "eoa",
            },
        ] });
    yield entityStoreClient.signAndPush(newEntities);
});
exports.addAccount = addAccount;
class NarvalSigner {
    constructor() {
        this.name = "narval";
    }
    registerUser(chainId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("narval - init auth client");
            const authClient = new armory_sdk_1.AuthClient({
                host: "https://auth.armory.narval.xyz",
                clientId,
                signer: {
                    jwk: userJwk,
                    alg: "EIP191",
                    sign: (0, armory_sdk_1.buildSignerEip191)(userPrivateKey),
                },
            });
            console.log("narval - init vault client");
            const vaultClient = new armory_sdk_1.VaultClient({
                host: "https://vault.armory.narval.xyz",
                clientId,
                signer: {
                    jwk: userJwk,
                    alg: "EIP191",
                    sign: (0, armory_sdk_1.buildSignerEip191)(userPrivateKey),
                },
            });
            console.log("narval - requesting wallet create access token");
            // Request access to create wallet and account.
            const walletCreateAccessToken = yield authClient.requestAccessToken({
                action: armory_sdk_1.Action.GRANT_PERMISSION,
                resourceId: "vault",
                nonce: (0, uuid_1.v4)(),
                permissions: [armory_sdk_1.Permission.WALLET_CREATE],
            });
            console.log("narval - generating wallet");
            const { account } = yield vaultClient.generateWallet({
                accessToken: walletCreateAccessToken,
            });
            console.log("narval - adding wallet to entity store");
            yield (0, exports.addAccount)({
                account: Object.assign(Object.assign({}, account), { accountType: "eoa", address: account.address }),
            });
            console.log(`narval - wallet created with address ${account.address}`);
            return [
                {
                    walletId: account.id,
                    address: account.address,
                    chainId: chainId,
                },
            ];
        });
    }
}
exports.NarvalSigner = NarvalSigner;
//# sourceMappingURL=narval.js.map