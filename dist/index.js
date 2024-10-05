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
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const service_1 = require("./service");
const ts_sdk_1 = require("@fireblocks/ts-sdk");
const app = (0, express_1.default)();
// enable JSON body parser
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.post("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.body.id;
        yield (0, service_1.registerUser)(userId);
        const accounts = yield (0, service_1.getAccounts)(userId);
        res.json(accounts);
    }
    catch (error) {
        if (error instanceof ts_sdk_1.FireblocksError) {
            console.error(error.message);
            res.status(500).json({ error: error.message });
            return;
        }
        console.error(error);
        res.status(500).json({ error });
    }
}));
app.post("/transactions", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.body.id; // TODO, use this to get the Fireblocks/Narval id
        const chainId = "ETH_TEST5"; // TODO Get from request
        const message = "0x02f283aa36a780843b9aca0085383cd6b41f82520894d9cf97a8eb01d27b1f5a8809273137d92758c31287038d7ea4c6800080c0";
        console.log("XXX - /sign - userId:", userId);
        const transaction = {
            assetId: chainId,
            operation: ts_sdk_1.TransactionOperation.Raw,
            source: {
                type: ts_sdk_1.TransferPeerPathType.VaultAccount,
                id: "22",
            },
            note: ``,
            extraParameters: {
                rawMessageData: {
                    algorithm: "MPC_ECDSA_SECP256K1", // Optional
                    messages: [
                        {
                            content: message, // TODO
                            //derivationPath: [44, 0, 0, 0, 0], // TODO ?
                        },
                    ],
                },
            },
        };
        const signature = yield (0, service_1.sign)(userId, chainId, transaction);
        // FIXME DEBUG TBR
        console.log("XXX - signature:", signature);
        res.json(signature);
    }
    catch (error) {
        console.log("XXX - error:", error.toString());
        res.status(500).json({ error });
    }
    // TODO
}));
app.get("/assets", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const supportedAssets = yield (0, service_1.getSupportedAssets)();
    res.json(supportedAssets);
}));
exports.default = app;
//# sourceMappingURL=index.js.map