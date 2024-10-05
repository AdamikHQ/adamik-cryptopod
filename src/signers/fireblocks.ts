import type { SIGNER, Signer } from ".";
import { Fireblocks } from "@fireblocks/ts-sdk";

const chainIdMappings: { [k: string]: string } = {
  "bitcoin-testnet": "BTC_TEST",
  sepolia: "ETH_TEST5", // ETH_TEST is deprecated and gets refused by fireblocks
  // polygon: "polygon", // TODO
  // avalanche: "avalanche", // TODO
  // arbitrum: "arbitrum", // TODO
};

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
    const vaultWallet = await this.instance.vaults.createVaultAccountAsset({
      vaultAccountId: walletId,
      assetId: chainIdMappings[chainId],
    });

    console.log(`fireblocks - created account ${chainId}`);
    return { address: vaultWallet.data.address };
  }
}
