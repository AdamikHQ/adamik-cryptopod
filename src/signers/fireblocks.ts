import type { SIGNER, Signer } from ".";
import {
  Fireblocks,
  FireblocksResponse,
  TransactionResponse,
  TransactionStateEnum,
} from "@fireblocks/ts-sdk";

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
    chainId: string
  ): Promise<{ address: string }> {
    const vaultWallet = await this.instance.vaults.createVaultAccountAsset({
      vaultAccountId: walletId,
      assetId: chainIdMappings[chainId],
    });

    console.log(`fireblocks - created account ${chainId}`);
    return { address: vaultWallet.data.address };
  }

  async sign(transaction: unknown): Promise<string> {
    try {
      const transactionResponse =
        await this.instance.transactions.createTransaction({
          transactionRequest: transaction,
        });
      const txId = transactionResponse.data.id;
      if (!txId) {
        throw new Error("Transaction ID is undefined.");
      }

      // TODO
      const txInfo = await this.getTxStatus(txId);
      console.log(JSON.stringify(txInfo, null, 2));
      const signature = txInfo.signedMessages[0].signature;

      console.log(JSON.stringify(signature));

      const encodedSig =
        Buffer.from([
          Number.parseInt(signature.v.toString(), 16) + 31,
        ]).toString("hex") + signature.fullSig;
      console.log(
        "Encoded Signature:",
        Buffer.from(encodedSig, "hex").toString("base64")
      );
      return encodedSig;
    } catch (error) {
      console.error(error);
      throw new Error(`Could not sign: ${error.toString()}`);
    }
  }

  async getTxStatus(txId: string): Promise<TransactionResponse> {
    try {
      let response: FireblocksResponse<TransactionResponse> =
        await this.instance.transactions.getTransaction({ txId });
      let tx: TransactionResponse = response.data;
      let messageToConsole: string = `Transaction ${tx.id} is currently at status - ${tx.status}`;

      console.log(messageToConsole);
      while (tx.status !== TransactionStateEnum.Completed) {
        await new Promise((resolve) => setTimeout(resolve, 3000));

        response = await this.instance.transactions.getTransaction({ txId });
        tx = response.data;

        switch (tx.status) {
          case TransactionStateEnum.Blocked:
          case TransactionStateEnum.Cancelled:
          case TransactionStateEnum.Failed:
          case TransactionStateEnum.Rejected:
            throw new Error(
              `Signing request failed/blocked/cancelled: Transaction: ${tx.id} status is ${tx.status}`
            );
          default:
            console.log(messageToConsole);
            break;
        }
      }
      while (tx.status !== TransactionStateEnum.Completed);
      return tx;
    } catch (error) {
      throw error;
    }
  }

  async getSupportedAssets(): Promise<any> {
    const truc = await this.instance.blockchainsAssets.getSupportedAssets();
    return truc;
  }
}
