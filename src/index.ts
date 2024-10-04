import "dotenv/config";

import express from "express";
import { SIGNERS, type SIGNER } from "./signers";

const app = express();

// enable JSON body parser
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/users", (req, res) => {
  res.send("Hello World!");
});

const userId = "test_user_id"; // FIXME Get from request instead

// Input request body
type Wallet = {
  chainId: string;
};

const WALLETS_SIGNERS: Record<string, SIGNER> = {
  ethereum: "narval",
};

app.post("/users", async (req, res) => {
  const chainId = "ethereum"; // TODO, go through all supported chains
  const signerName = WALLETS_SIGNERS[chainId];
  const signer = SIGNERS[signerName];
  await signer.registerNewWallet(req.body.chainId);
  res.send("User registered!");
});

export default app;
