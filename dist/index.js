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
exports.default = app;
//# sourceMappingURL=index.js.map