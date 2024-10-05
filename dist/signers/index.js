"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIGNERS = void 0;
const narval_1 = require("./narval");
const fireblocks_1 = require("./fireblocks");
const adamik_signer_1 = require("./adamik_signer");
exports.SIGNERS = {
    fireblocks: new fireblocks_1.FireblocksSigner(),
    narval: new narval_1.NarvalSigner(), // FIXME: narval init happens every time, should be done once
    adamik: new adamik_signer_1.AdamikSigner(),
};
//# sourceMappingURL=index.js.map