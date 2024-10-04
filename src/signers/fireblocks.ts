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

  private async run() {
    try {
      const vault = await this.instance.vaults.createVaultAccount({
        createVaultAccountRequest: {
          name: "Vault Account",
          hiddenOnUI: false,
          autoFuel: false,
        },
      });
      console.log("fireblocks - created vault");
      return vault;
    } catch (e) {
      console.log(e);
    }
  }

  public async registerNewWallet(chainId: string): Promise<string> {
    await this.run();
    return Promise.resolve("fireblocks_wallet_id");
  }
}
