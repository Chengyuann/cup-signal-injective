import { mkdir, writeFile } from "node:fs/promises";
import { BridgeChain, BridgeKit } from "@circle-fin/bridge-kit";
import { createViemAdapterFromPrivateKey } from "@circle-fin/adapter-viem-v2";

const confirmed = process.argv.includes("--yes");
const privateKey = process.env.X402_PAYER_PRIVATE_KEY as `0x${string}` | undefined;
if (!privateKey) throw new Error("X402_PAYER_PRIVATE_KEY is required");

const amount = process.env.CCTP_AMOUNT_USDC ?? "1";
const recipient = "0x36090AA807e6B13bdD162F7852cB0793b0d87c1a";
const kit = new BridgeKit();
const adapter = createViemAdapterFromPrivateKey({ privateKey });
const route = {
  from: { adapter, chain: "Base_Sepolia" as const },
  to: {
    adapter,
    chain: "Injective_Testnet" as const,
    recipientAddress: recipient,
  },
  amount,
  config: { transferSpeed: "SLOW" as const },
};

const estimate = await kit.estimate(route);
console.log(stringify({ status: "quote", amount, recipient, estimate }));
if (!confirmed) process.exit(0);

const result = await kit.bridge(route);
const proof = {
  version: 1,
  status: result.state,
  source: "Base Sepolia",
  destination: "Injective Testnet",
  sourceDomain: 6,
  destinationDomain: 29,
  token: "USDC",
  amount,
  recipient,
  memo: "cup-signal:cup-001:watch-brief",
  estimate,
  result,
  generatedAt: new Date().toISOString(),
};
await mkdir("public/proofs", { recursive: true });
await writeFile("public/proofs/cctp-transfer.json", `${stringify(proof)}\n`);
console.log(stringify(proof));

function stringify(value: unknown): string {
  return JSON.stringify(
    value,
    (_key, item) => (typeof item === "bigint" ? item.toString() : item),
    2,
  );
}
