import { SIGNER, SIGNERS } from "api/signers";
import { Request, Response, NextFunction } from "express";

// Input request body
type Wallet = {
  chainId: string;
};

const WALLETS_SIGNERS: Record<string, SIGNER> = {
  ethereum: "narval",
};

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.body.userId;
  for (const [chainId, signerName] of Object.entries(WALLETS_SIGNERS)) {
    const signer = SIGNERS[signerName];
    const walletId = await signer.registerNewWallet(chainId);
    // TODO: store userId and walletId in database
  }
  res.status(200).json({ message: "Hello World" });
};
