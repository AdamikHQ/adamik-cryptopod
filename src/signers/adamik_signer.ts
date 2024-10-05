import { SIGNER, Signer } from ".";

export class AdamikSigner implements Signer {
  name: SIGNER;

  constructor() {
    this.name = "adamik";
  }
  sign(transaction: unknown): Promise<string> {
    throw new Error("Method not implemented.");
  }
  getSupportedAssets(): Promise<any> {
    throw new Error("Method not implemented.");
  }

  ADAMIK_SIGNER_URL = "https://adamik-multichain-signer.vercel.app";

  async createWallet(userId: string): Promise<string> {
    const walletId = await fetch(
      `${this.ADAMIK_SIGNER_URL}/api/register?uuid=${userId}`,
      {
        method: "GET",
      },
    );
    return (await walletId.json()).user.uuid;
  }

  async createAccount(
    walletId: string,
    chainId: string,
  ): Promise<{ address: string }> {
    const addresses = await fetch(
      `${this.ADAMIK_SIGNER_URL}/api/address?uuid=${walletId}`,
      {
        method: "GET",
      },
    );
    return {
      address: (await addresses.json())[`${chainId}_address`],
    };
  }
}
