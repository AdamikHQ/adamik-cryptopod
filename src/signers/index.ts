import { NarvalSigner } from "./narval";
import { FireblocksSigner } from "./fireblocks";

export type SIGNER = "fireblocks" | "narval";

export interface Signer {
  name: SIGNER;

  createWallet(userId: string): Promise<string>;
  createAccount(
    walletId: string,
    chainId: string
  ): Promise<{ address: string }>;

  sign(transaction: unknown): Promise<string>;
  getSupportedAssets(): Promise<any>;
}

export const SIGNERS: Record<SIGNER, Signer> = {
  fireblocks: new FireblocksSigner(),
  narval: new NarvalSigner(), // FIXME: narval init happens every time, should be done once
};
