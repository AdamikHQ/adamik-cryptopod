import "dotenv/config";

import express from "express";
import { getAccounts, getSupportedAssets, registerUser, sign } from "./service";
import {
  FireblocksError,
  TransactionOperation,
  TransferPeerPathType,
} from "@fireblocks/ts-sdk";
import { keccak256 } from "viem";

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

app.post("/sign", async (req, res) => {
  try {
    const userId = req.body.id; // TODO, use this to get the Fireblocks/Narval id
    const chainId = "ETH"; // TODO Get from request
    const message = keccak256("0x5445535412121212").slice(2); // TODO get from request

    console.log("XXX - /sign - userId:", userId);

    const transaction = {
      assetId: chainId,
      operation: TransactionOperation.Raw,
      source: {
        type: TransferPeerPathType.VaultAccount,
        id: "31",
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

    const signature = await sign(userId, chainId, transaction);

    // FIXME DEBUG TBR
    console.log("XXX - signature:", signature);

    res.json(signature);
  } catch (error) {
    console.log("XXX - error:", error.toString());
    res.status(500).json({ error });
  }

  // TODO
});

app.get("/assets", async (req, res) => {
  const supportedAssets = await getSupportedAssets();
  res.json(supportedAssets);
});

export default app;
