import "dotenv/config";

import express from "express";
import { getAccounts, getSupportedAssets, registerUser, sign } from "./service";
import {
  FireblocksError,
  TransactionOperation,
  TransferPeerPathType,
} from "@fireblocks/ts-sdk";
import { keccak256, serializeTransaction } from "viem";
//import { createHash } from "crypto";

const app = express();

// enable JSON body parser
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/users", async (req, res) => {
  try {
    const userId = req.body.id;

    await registerUser(userId);

    const accounts = await getAccounts(userId);

    res.json(accounts);
  } catch (error) {
    if (error instanceof FireblocksError) {
      console.error(error.message);
      res.status(500).json({ error: error.message });
      return;
    }
    console.error(error);
    res.status(500).json({ error });
  }
});

// TODO
app.post("/transactions", async (req, res) => {
  try {
    const userId = req.body.id; // TODO, use this to get the Fireblocks/Narval id
    const chainId = "ETH_TEST5"; // TODO Get from request

    const message =
      "0x02ed83aa36a780843b9aca008535636c237e82520894d9cf97a8eb01d27b1f5a8809273137d92758c3128203e880c0"; // TODO get from request

    //const hash = createHash("sha256").update(message, "utf8").digest();
    //const content = createHash("sha256").update(hash).digest("hex");

    /*
    const message = {
      to: "0x8bc6922Eb94e4858efaF9F433c35Bc241F69e8a6" as `0x${string}`,
      value: 1n,
      from: "0x8bc6922Eb94e4858efaF9F433c35Bc241F69e8a6" as `0x${string}`,
      chainId: 8453,
      nonce: 8,
      type: "eip1559" as "eip1559",
      maxPriorityFeePerGas: 1000000n,
      maxFeePerGas: 4144765n,
      gas: 21000n,
      authorizationList: undefined as any,
    };

    const content = keccak256(serializeTransaction(message)).slice(2);
    */

    //console.log("XXX - /sign - userId:", userId);

    const transaction = {
      assetId: chainId,
      operation: TransactionOperation.Raw,
      source: {
        type: TransferPeerPathType.VaultAccount,
        id: "22",
      },
      note: ``,
      extraParameters: {
        rawMessageData: {
          algorithm: "MPC_ECDSA_SECP256K1", // Optional
          messages: [
            {
              content: message,
              //derivationPath: [44, 0, 0, 0, 0], // TODO ?
            },
          ],
        },
      },
    };

    const signature = await sign(userId, chainId, transaction);

    console.log("XXX - signature:", signature);

    res.json(signature);
  } catch (error) {
    console.log("XXX - error:", error.toString());
    res.status(500).json({ error });
  }

});

app.get("/assets", async (req, res) => {
  const supportedAssets = await getSupportedAssets();
  res.json(supportedAssets);
});

export default app;
