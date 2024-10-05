import type { SIGNER, Signer } from ".";

import {
  AccountEntity,
  Action,
  AuthClient,
  EntityStoreClient,
  Hex,
  Permission,
  VaultClient,
  buildSignerEip191,
  privateKeyToJwk,
} from "@narval-xyz/armory-sdk";
import assert from "assert";
import { v4 as uuid } from "uuid";
import { privateKeyToAddress } from "viem/accounts";

const getEnv = (key: string): string => {
  const value = process.env[key];

  assert(value !== undefined, `Missing env variable ${key}`);

  return value;
};

const clientId = getEnv("ARMORY_CLIENT_ID");
const clientSecret = getEnv("ARMORY_CLIENT_SECRET");
const getPrivateKey = (key: string) => {
  return getEnv(key) as Hex;
};
const userPrivateKey = getPrivateKey("ARMORY_USER_PRIVATE_KEY");
const addr = privateKeyToAddress(userPrivateKey);
const userJwk = privateKeyToJwk(userPrivateKey, "ES256K", addr);

const entityStorePrivateKey = getPrivateKey("ARMORY_ENTITY_STORE_PRIVATE_KEY");
const policyStorePrivateKey = getPrivateKey("ARMORY_POLICY_STORE_PRIVATE_KEY");

export const addAccount = async ({ account }: { account: AccountEntity }) => {
  const entityStoreClient = new EntityStoreClient({
    clientSecret,
    host: "https://auth.armory.narval.xyz",
    clientId,
    signer: {
      jwk: userJwk,
      alg: "EIP191",
      sign: buildSignerEip191(userPrivateKey),
    },
  }); // Same as Auth config, with system-manager credential
  const { data: entity } = await entityStoreClient.fetch();

  const newEntities = {
    ...entity,
    accounts: [
      ...(entity.accounts || []),
      {
        id: account.id,
        address: account.address as Hex,
        accountType: "eoa" as const,
      },
    ],
  };

  await entityStoreClient.signAndPush(newEntities);
};

export class NarvalSigner implements Signer {
  name: SIGNER = "narval";

  public async registerUser(
    chainId: string,
  ): Promise<{ walletId: string; address: string; chainId: string }[]> {
    console.log("narval - init auth client");
    const authClient = new AuthClient({
      host: "https://auth.armory.narval.xyz",
      clientId,
      signer: {
        jwk: userJwk,
        alg: "EIP191",
        sign: buildSignerEip191(userPrivateKey),
      },
    });

    console.log("narval - init vault client");
    const vaultClient = new VaultClient({
      host: "https://vault.armory.narval.xyz",
      clientId,
      signer: {
        jwk: userJwk,
        alg: "EIP191",
        sign: buildSignerEip191(userPrivateKey),
      },
    });
    console.log("narval - requesting wallet create access token");
    // Request access to create wallet and account.
    const walletCreateAccessToken = await authClient.requestAccessToken({
      action: Action.GRANT_PERMISSION,
      resourceId: "vault",
      nonce: uuid(),
      permissions: [Permission.WALLET_CREATE],
    });
    console.log("narval - generating wallet");
    const { account } = await vaultClient.generateWallet({
      accessToken: walletCreateAccessToken,
    });
    console.log("narval - adding wallet to entity store");
    await addAccount({
      account: {
        ...account,
        accountType: "eoa" as const,
        address: account.address as Hex,
      },
    });
    console.log(`narval - wallet created with address ${account.address}`);
    return [
      {
        walletId: account.id,
        address: account.address as Hex,
        chainId: chainId,
      },
    ];
  }
}
