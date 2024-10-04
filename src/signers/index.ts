import { NarvalSigner } from "./narval";
import { FireblocksSigner } from "./fireblocks";

export type SIGNER = "fireblocks" | "narval";

export interface Signer {
  name: SIGNER;

  registerNewWallet(chainId: string): Promise<string>;
}

export const SIGNERS: Record<SIGNER, Signer> = {
  fireblocks: new FireblocksSigner(),
  narval: new NarvalSigner(),
};
