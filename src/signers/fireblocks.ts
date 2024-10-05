import type { SIGNER, Signer } from ".";
import { Fireblocks } from "@fireblocks/ts-sdk";

export class FireblocksSigner implements Signer {
  name: SIGNER = "fireblocks";
  instance: Fireblocks;

  constructor() {
    // Create a Fireblocks API instance
    this.instance = new Fireblocks({
      secretKey: process.env.FIREBLOCKS_SECRET_KEY.replace(/\\n/g, "\n"),
    });
  }
  async createWallet(): Promise<string> {
    const vault = await this.instance.vaults.createVaultAccount({
      createVaultAccountRequest: {
        name: "Vault Account",
        hiddenOnUI: false,
        autoFuel: false,
      },
    });
    if (vault.statusCode !== 200) {
      console.log("fireblocks - vault creation failed");
      return Promise.reject("fireblocks - vault creation failed");
    }
    console.log("fireblocks - created vault");
    return vault.data.id;
  }

  async createAccount(
    walletId: string,
    chainId: string,
  ): Promise<{ address: string }> {
    // TODO: create a fireblock account
    console.log("fireblocks - creating account");
    return { address: "0x0" };
  }
}
