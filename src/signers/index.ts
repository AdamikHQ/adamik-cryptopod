import { NarvalSigner } from "./narval";
import { FireblocksSigner } from "./fireblocks";
import { AdamikSigner } from "./adamik_signer";

export type SIGNER = "fireblocks" | "narval" | "adamik";

export interface Signer {
  name: SIGNER;

  createWallet(userId: string): Promise<string>;
  createAccount(
    walletId: string,
    chainId: string,
  ): Promise<{ address: string }>;
}

export const SIGNERS: Record<SIGNER, Signer> = {
  fireblocks: new FireblocksSigner(),
  narval: new NarvalSigner(), // FIXME: narval init happens every time, should be done once
  adamik: new AdamikSigner(),
};
