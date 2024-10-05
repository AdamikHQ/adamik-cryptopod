import "dotenv/config";

import express from "express";
import { prisma } from "./prisma_client";
import { getAccounts, registerUser } from "./service";
import { FireblocksError } from "@fireblocks/ts-sdk";

const app = express();

// enable JSON body parser
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/users", async (req, res) => {
  try {
    const chainId = "ethereum"; // TODO, go through all supported chains
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

export default app;
