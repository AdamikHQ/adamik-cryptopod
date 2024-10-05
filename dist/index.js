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
const signers_1 = require("./signers");
const prisma_client_1 = require("./prisma_client");
const app = (0, express_1.default)();
// enable JSON body parser
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.get("/users", (req, res) => {
    res.send("Hello World!");
});
const WALLETS_SIGNERS = {
    ethereum: "fireblocks",
};
app.post("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const chainId = "ethereum"; // TODO, go through all supported chains
    const userId = req.body.id;
    // Check if user exists
    const user = yield prisma_client_1.prisma.user.findUnique({
        where: {
            userName: userId,
        },
        include: {
            Wallet: true,
        },
    });
    if (user) {
        res.status(400).send(`User ${userId} already exists`);
        return;
    }
    const signerName = WALLETS_SIGNERS[chainId];
    const signer = signers_1.SIGNERS[signerName];
    const wallets = yield signer.registerUser(userId);
    for (const wallet of wallets) {
        const user = yield prisma_client_1.prisma.user.create({
            data: {
                userName: userId,
                Wallet: {
                    create: {
                        provider: signerName,
                        address: wallet.address,
                        chainId: wallet.chainId,
                        remote_id: wallet.walletId,
                    },
                },
            },
            include: {
                Wallet: true,
            },
        });
        console.log(`wallet ${user.Wallet[0].id} with address ${user.Wallet[0].address} registered for user ${user.userName} for chain ${user.Wallet[0].chainId}`);
    }
    res.send(`User ${userId} registered`);
}));
exports.default = app;
//# sourceMappingURL=index.js.map