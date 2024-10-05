import "dotenv/config";

import express from "express";
import { prisma } from "./prisma_client";
import { getAccounts, registerUser } from "./service";

const app = express();

// enable JSON body parser
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/users", async (req, res) => {
  const chainId = "ethereum"; // TODO, go through all supported chains
  const userId = req.body.id;

  await registerUser(userId);

  const accounts = await getAccounts(userId);
  res.json(accounts);
});

export default app;
