import { mkdir, writeFile } from "node:fs/promises";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const privateKey = generatePrivateKey();
const account = privateKeyToAccount(privateKey);

await mkdir(".agent/secrets", { recursive: true });
await writeFile(
  ".agent/secrets/injective-testnet-deployer.env",
  `INJECTIVE_PRIVATE_KEY=${privateKey}\nINJECTIVE_DEPLOYER_ADDRESS=${account.address}\n`,
  { mode: 0o600 },
);
await writeFile(
  ".agent/injective-testnet-deployer.json",
  `${JSON.stringify(
    {
      address: account.address,
      network: "Injective EVM Testnet",
      chainId: 1439,
      rpcUrl: "https://k8s.testnet.json-rpc.injective.network/",
      explorerUrl: "https://testnet.blockscout.injective.network/",
      createdAt: new Date().toISOString(),
      secretFile: ".agent/secrets/injective-testnet-deployer.env",
    },
    null,
    2,
  )}\n`,
);
console.log(account.address);
