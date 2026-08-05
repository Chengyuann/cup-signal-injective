import { mkdir, writeFile } from "node:fs/promises";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const privateKey = generatePrivateKey();
const account = privateKeyToAccount(privateKey);

await mkdir(".agent/secrets", { recursive: true });
await writeFile(
  ".agent/secrets/injective-x402-payer.env",
  `X402_PAYER_PRIVATE_KEY=${privateKey}\nX402_PAYER_ADDRESS=${account.address}\n`,
  { mode: 0o600 },
);
await writeFile(
  ".agent/injective-x402-payer.json",
  `${JSON.stringify(
    {
      address: account.address,
      network: "Injective EVM Testnet",
      chainId: 1439,
      token: {
        symbol: "USDC",
        address: "0x0C382e685bbeeFE5d3d9C29e29E341fEE8E84C5d",
      },
      createdAt: new Date().toISOString(),
      secretFile: ".agent/secrets/injective-x402-payer.env",
    },
    null,
    2,
  )}\n`,
);
console.log(account.address);
