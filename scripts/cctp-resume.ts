import { mkdir, readFile, writeFile } from "node:fs/promises";
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  formatUnits,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

const burnTx =
  process.env.CCTP_BURN_TX ??
  "0x91da650b7b6139192850ccad68aa5cf4300f24ab63271c81a8b0ce7593641760";
const privateKey = process.env.X402_PAYER_PRIVATE_KEY as `0x${string}` | undefined;
if (!privateKey) throw new Error("X402_PAYER_PRIVATE_KEY is required");

const account = privateKeyToAccount(privateKey);
const injective = defineChain({
  id: 1439,
  name: "Injective EVM Testnet",
  nativeCurrency: { name: "Injective", symbol: "INJ", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet.evm.archival.chain.virtual.json-rpc.injective.network/"] },
  },
});
const publicClient = createPublicClient({ chain: injective, transport: http() });
const walletClient = createWalletClient({ account, chain: injective, transport: http() });
const usdc = "0x0C382e685bbeeFE5d3d9C29e29E341fEE8E84C5d";
const transmitter = "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275";
const erc20Abi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
const transmitterAbi = [
  {
    type: "function",
    name: "receiveMessage",
    stateMutability: "nonpayable",
    inputs: [
      { name: "message", type: "bytes" },
      { name: "attestation", type: "bytes" },
    ],
    outputs: [{ name: "success", type: "bool" }],
  },
] as const;

const irisUrl = `https://iris-api-sandbox.circle.com/v2/messages/6?transactionHash=${burnTx}`;
const irisResponse = await fetch(irisUrl);
if (!irisResponse.ok) throw new Error(`Circle IRIS returned HTTP ${irisResponse.status}`);
const iris = await irisResponse.json();
const record = iris.messages?.[0];
if (!record || record.attestation === "PENDING" || !record.message) {
  console.log(
    JSON.stringify(
      {
        status: record?.status ?? "not_found",
        sourceTransaction: burnTx,
        eventNonce: record?.eventNonce,
        irisUrl,
      },
      null,
      2,
    ),
  );
  process.exit(2);
}

const balanceBefore = await publicClient.readContract({
  address: usdc,
  abi: erc20Abi,
  functionName: "balanceOf",
  args: [account.address],
});
const hash = await walletClient.writeContract({
  account,
  chain: injective,
  address: transmitter,
  abi: transmitterAbi,
  functionName: "receiveMessage",
  args: [record.message, record.attestation],
});
const receipt = await publicClient.waitForTransactionReceipt({ hash, confirmations: 1 });
const balanceAfter = await publicClient.readContract({
  address: usdc,
  abi: erc20Abi,
  functionName: "balanceOf",
  args: [account.address],
});

let existing: Record<string, unknown> = {};
try {
  existing = JSON.parse(await readFile("public/proofs/cctp-transfer.json", "utf8"));
} catch {
  // A fresh resume can still create a complete proof.
}
const proof = {
  ...existing,
  version: 1,
  status: receipt.status === "success" ? "success" : receipt.status,
  source: "Base Sepolia",
  destination: "Injective Testnet",
  sourceDomain: 6,
  destinationDomain: 29,
  token: "USDC",
  amount: "1",
  recipient: account.address,
  memo: "cup-signal:cup-001:watch-brief",
  sourceTransaction: burnTx,
  eventNonce: record.eventNonce,
  attestationStatus: record.status,
  destinationTransaction: hash,
  destinationBlock: receipt.blockNumber.toString(),
  balanceBefore: formatUnits(balanceBefore, 6),
  balanceAfter: formatUnits(balanceAfter, 6),
  explorer: {
    source: `https://sepolia.basescan.org/tx/${burnTx}`,
    destination: `https://testnet.blockscout.injective.network/tx/${hash}`,
  },
  completedAt: new Date().toISOString(),
};
await mkdir("public/proofs", { recursive: true });
await writeFile("public/proofs/cctp-transfer.json", `${JSON.stringify(proof, null, 2)}\n`);
console.log(JSON.stringify(proof, null, 2));
