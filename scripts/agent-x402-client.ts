import { mkdir, writeFile } from "node:fs/promises";
import {
  createInjectiveClient,
  parsePaymentRequired,
  parsePaymentResponseHeader,
} from "@injectivelabs/x402/client";
import { formatUnits } from "viem";

const endpoint =
  process.env.X402_ENDPOINT ??
  "https://cup-signal-x402.mcy23.workers.dev/api/premium-report/cup-001";
const maxSpendBaseUnits = BigInt(process.env.X402_MAX_SPEND_BASE_UNITS ?? "10000");
const confirmed = process.argv.includes("--yes");

const challengeResponse = await fetch(endpoint);
if (challengeResponse.status !== 402) {
  throw new Error(`Expected 402 challenge, received ${challengeResponse.status}`);
}
const requiredHeader = challengeResponse.headers.get("payment-required");
if (!requiredHeader) throw new Error("PAYMENT-REQUIRED header is missing");
const required = parsePaymentRequired(requiredHeader);
const option = required.accepts.find((item) => item.network === "eip155:1439");
if (!option) throw new Error("No Injective Testnet payment option was offered");
if (option.asset.toLowerCase() !== "0x0c382e685bbeefe5d3d9c29e29e341fee8e84c5d") {
  throw new Error(`Agent policy rejected asset ${option.asset}`);
}
if (BigInt(option.amount) > maxSpendBaseUnits) {
  throw new Error(`Agent policy rejected price ${option.amount}; max is ${maxSpendBaseUnits}`);
}

const quote = {
  endpoint,
  network: option.network,
  asset: option.asset,
  amountBaseUnits: option.amount,
  amountUsdc: formatUnits(BigInt(option.amount), 6),
  payTo: option.payTo,
  withinBudget: true,
};
if (!confirmed) {
  console.log(JSON.stringify({ status: "confirmation_required", quote }, null, 2));
  process.exit(0);
}

const privateKey = process.env.X402_PAYER_PRIVATE_KEY as `0x${string}` | undefined;
if (!privateKey) throw new Error("X402_PAYER_PRIVATE_KEY is required for confirmed payment");
const client = createInjectiveClient({
  privateKey,
  rpcUrl: "https://testnet.evm.archival.chain.virtual.json-rpc.injective.network/",
  preferredNetworks: ["eip155:1439"],
});
const response = await client.fetch(endpoint);
const body = await response.json();
const receipt = parsePaymentResponseHeader(response);
if (!response.ok || !receipt?.success) {
  throw new Error(`Agent payment failed: ${JSON.stringify({ status: response.status, body, receipt })}`);
}

const result = {
  status: "success",
  quote,
  receipt,
  response: {
    status: response.status,
    headline: body.headline,
    premiumReport: body.premiumReport,
  },
  completedAt: new Date().toISOString(),
};
await mkdir("public/proofs", { recursive: true });
await writeFile("public/proofs/agent-x402-run.json", `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
