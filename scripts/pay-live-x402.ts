import { mkdir, writeFile } from "node:fs/promises";
import { createInjectiveClient, parsePaymentResponseHeader } from "@injectivelabs/x402/client";
import { createPublicClient, defineChain, formatUnits, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const confirmed = process.argv.includes("--yes");
if (!confirmed) {
  throw new Error("Refusing to sign: pass --yes only after explicit user confirmation");
}

const privateKey = process.env.X402_PAYER_PRIVATE_KEY as `0x${string}` | undefined;
if (!privateKey) throw new Error("X402_PAYER_PRIVATE_KEY is required");

const endpoint = process.env.X402_ENDPOINT ?? "http://127.0.0.1:4021/api/premium-report/cup-001";
const rpcUrl =
  process.env.INJECTIVE_RPC_URL ??
  "https://testnet.evm.archival.chain.virtual.json-rpc.injective.network/";
const payer = privateKeyToAccount(privateKey).address;
const usdc = "0x0C382e685bbeeFE5d3d9C29e29E341fEE8E84C5d";
const chain = defineChain({
  id: 1439,
  name: "Injective EVM Testnet",
  nativeCurrency: { name: "Injective", symbol: "INJ", decimals: 18 },
  rpcUrls: { default: { http: [rpcUrl] } },
});
const publicClient = createPublicClient({ chain, transport: http() });
const erc20Abi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const challengeResponse = await fetch(endpoint);
if (challengeResponse.status !== 402) {
  throw new Error(`Expected initial 402, received ${challengeResponse.status}`);
}
const challenge = await challengeResponse.json();
const requirement = challenge.accepts?.[0];
if (!requirement) throw new Error("Payment requirement is missing");
if (requirement.network !== "eip155:1439") throw new Error(`Unexpected network ${requirement.network}`);
if (requirement.asset.toLowerCase() !== usdc.toLowerCase()) throw new Error(`Unexpected asset ${requirement.asset}`);
if (requirement.amount !== "10000") throw new Error(`Unexpected payment amount ${requirement.amount}`);

const payee = requirement.payTo as `0x${string}`;
const [payerBefore, payeeBefore] = await Promise.all([
  publicClient.readContract({ address: usdc, abi: erc20Abi, functionName: "balanceOf", args: [payer] }),
  publicClient.readContract({ address: usdc, abi: erc20Abi, functionName: "balanceOf", args: [payee] }),
]);

const client = createInjectiveClient({
  privateKey,
  rpcUrl,
  preferredNetworks: ["eip155:1439"],
});
const paidResponse = await client.fetch(endpoint);
const body = await paidResponse.json();
const receipt = parsePaymentResponseHeader(paidResponse);
if (!paidResponse.ok) throw new Error(`Paid request returned ${paidResponse.status}: ${JSON.stringify(body)}`);
if (!receipt?.success || !receipt.transaction) throw new Error("Settlement receipt is missing or unsuccessful");

const transactionReceipt = await publicClient.waitForTransactionReceipt({
  hash: receipt.transaction,
  confirmations: 1,
});
const [payerAfter, payeeAfter] = await Promise.all([
  publicClient.readContract({ address: usdc, abi: erc20Abi, functionName: "balanceOf", args: [payer] }),
  publicClient.readContract({ address: usdc, abi: erc20Abi, functionName: "balanceOf", args: [payee] }),
]);

const proof = {
  version: 1,
  status: "settled",
  endpoint,
  network: {
    name: chain.name,
    chainId: chain.id,
    caip2: "eip155:1439",
    rpcUrl,
  },
  payment: {
    scheme: requirement.scheme,
    asset: usdc,
    symbol: "USDC",
    amountBaseUnits: requirement.amount,
    amountUsdc: formatUnits(BigInt(requirement.amount), 6),
    payer,
    payee,
  },
  receipt,
  transaction: {
    hash: receipt.transaction,
    blockNumber: transactionReceipt.blockNumber.toString(),
    status: transactionReceipt.status,
    explorer: `https://testnet.blockscout.injective.network/tx/${receipt.transaction}`,
  },
  balances: {
    payerBefore: formatUnits(payerBefore, 6),
    payerAfter: formatUnits(payerAfter, 6),
    payeeBefore: formatUnits(payeeBefore, 6),
    payeeAfter: formatUnits(payeeAfter, 6),
  },
  response: {
    status: paidResponse.status,
    headline: body.headline,
    settlement: body.settlement,
  },
  generatedAt: new Date().toISOString(),
};

await mkdir("public/proofs", { recursive: true });
await writeFile("public/proofs/x402-payment.json", `${JSON.stringify(proof, null, 2)}\n`);
console.log(JSON.stringify(proof, null, 2));
