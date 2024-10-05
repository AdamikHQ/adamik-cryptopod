"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIGNERS = void 0;
const narval_1 = require("./narval");
const fireblocks_1 = require("./fireblocks");
exports.SIGNERS = {
    fireblocks: new fireblocks_1.FireblocksSigner(),
    narval: new narval_1.NarvalSigner(), // FIXME: narval init happens every time, should be done once
};
//# sourceMappingURL=index.js.map