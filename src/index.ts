import "dotenv/config";

import express from "express";
import { SIGNERS, type SIGNER } from "./signers";
import { prisma } from "./prisma_client";

const app = express();

// enable JSON body parser
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/users", (req, res) => {
  res.send("Hello World!");
});

// Input request body
type Wallet = {
  chainId: string;
};

const WALLETS_SIGNERS: Record<string, SIGNER> = {
  ethereum: "fireblocks",
};

app.post("/users", async (req, res) => {
  const chainId = "ethereum"; // TODO, go through all supported chains
  const userId = req.body.id;

  // Check if user exists
  const user = await prisma.user.findUnique({
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
  const signer = SIGNERS[signerName];
  const wallets = await signer.registerUser(userId);
  for (const wallet of wallets) {
    const user = await prisma.user.create({
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
    console.log(
      `wallet ${user.Wallet[0].id} with address ${user.Wallet[0].address} registered for user ${user.userName} for chain ${user.Wallet[0].chainId}`,
    );
  }

  res.send(`User ${userId} registered`);
});

export default app;
