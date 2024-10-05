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

  public async registerUser(
    chainId: string,
  ): Promise<{ walletId: string; address: string; chainId: string }[]> {
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
    return [
      {
        walletId: vault.data.id,
        address: "0x0", // TODO: Get address from vault
        chainId: chainId,
      },
    ];
  }
}
