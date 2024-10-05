import { NarvalSigner } from "./narval";
import { FireblocksSigner } from "./fireblocks";

export type SIGNER = "fireblocks" | "narval";

export interface Signer {
  name: SIGNER;

  registerUser(
    chainId: string,
  ): Promise<{ walletId: string; address: string; chainId: string }[]>;
}

export const SIGNERS: Record<SIGNER, Signer> = {
  fireblocks: new FireblocksSigner(),
  narval: new NarvalSigner(),
};
