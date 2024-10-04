import { NarvalSigner } from "./narval";

export type SIGNER = "fireblocks" | "narval";

export interface Signer {
  name: SIGNER;

  registerNewWallet(chainId: string): Promise<string>;
}

export const SIGNERS: Record<SIGNER, Signer> = {
  fireblocks: {
    name: "fireblocks",
    registerNewWallet(chainId: string): Promise<string> {
      // TODO
      return Promise.resolve("fireblocks_wallet_id");
    },
  },
  narval: new NarvalSigner(),
};
