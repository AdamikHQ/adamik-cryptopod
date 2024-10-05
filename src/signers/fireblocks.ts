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
  async createWallet(userId: string): Promise<string> {
    const vault = await this.instance.vaults.createVaultAccount({
      createVaultAccountRequest: {
        name: `Vault of user ${userId}`,
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
    // await this.instance.vaults.activateAssetForVaultAccount({
    //   vaultAccountId: walletId,
    //   assetId: chainId,
    // });
    console.log("fireblocks - activated asset");
    return { address: "0x0" };
  }
}
