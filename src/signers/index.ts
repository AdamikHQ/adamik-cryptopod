import { NarvalSigner } from "./narval";
import { FireblocksSigner } from "./fireblocks";

export type SIGNER = "fireblocks" | "narval";

export interface Signer {
  name: SIGNER;

  createWallet(): Promise<string>; // returns provider's wallet id
  createAccount(
    walletId: string,
    chainId: string,
  ): Promise<{ address: string }>;
}

export const SIGNERS: Record<SIGNER, Signer> = {
  fireblocks: new FireblocksSigner(),
  narval: new NarvalSigner(), // FIXME: narval init happens every time, should be done once
};
