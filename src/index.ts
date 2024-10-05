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
    const userId = req.body.id;

    await registerUser(userId);

    const accounts = await getAccounts(userId);

    const accounts_with_balances = await Promise.all(
      accounts.map(async (account) => {
        const balance_response = await fetch(
          "https://api.adamik.io/api/account/state?",
          {
            headers: {
              Authorization: process.env.ADAMIK_API_KEY,
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
              chainId: account.chainId,
              accountId: account.address,
            }),
          },
        );

        let balance =
          balance_response.status === 200 ? await balance_response.json() : 0;
        return {
          ...account,
          balance, // TODO: handle decimals
        };
      }),
    );

    res.json(accounts_with_balances);
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
