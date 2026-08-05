import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  encodeFunctionData,
  formatEther,
  getContractAddress,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

const privateKey = process.env.INJECTIVE_PRIVATE_KEY as `0x${string}` | undefined;
if (!privateKey) throw new Error("INJECTIVE_PRIVATE_KEY is required");

const chain = defineChain({
  id: 1439,
  name: "Injective EVM Testnet",
  nativeCurrency: { name: "Injective", symbol: "INJ", decimals: 18 },
  rpcUrls: { default: { http: ["https://k8s.testnet.json-rpc.injective.network/"] } },
  blockExplorers: { default: { name: "Blockscout", url: "https://testnet.blockscout.injective.network" } },
});
const account = privateKeyToAccount(privateKey);
const publicClient = createPublicClient({ chain, transport: http() });
const walletClient = createWalletClient({ account, chain, transport: http() });
const artifact = JSON.parse(await readFile("artifacts/CupSignalProofRegistry.json", "utf8"));
const judgeProofText = await readFile("public/proofs/judge-proof.json", "utf8");
const judgeProof = JSON.parse(judgeProofText);
const balance = await publicClient.getBalance({ address: account.address });
if (balance === 0n) {
  throw new Error(`Deployer ${account.address} has zero testnet INJ`);
}

const startingNonce = await publicClient.getTransactionCount({ address: account.address });
let deploymentHash: `0x${string}` | null = null;
let contractAddress: `0x${string}`;
let deploymentBlock: string | null = null;

if (startingNonce === 0) {
  deploymentHash = await walletClient.deployContract({
    account,
    abi: artifact.abi,
    bytecode: artifact.bytecode,
  });
  contractAddress = getContractAddress({ from: account.address, nonce: 0n });
  await waitForCode(contractAddress);
} else {
  deploymentHash = (process.env.PROOF_DEPLOYMENT_TX_HASH as `0x${string}` | undefined) ?? null;
  contractAddress = getContractAddress({ from: account.address, nonce: 0n });
  const code = await publicClient.getCode({ address: contractAddress });
  if (!code || code === "0x") {
    throw new Error(`Nonce ${startingNonce} is consumed but expected contract ${contractAddress} has no bytecode`);
  }
}

const proofHash = `0x${judgeProof.sha256}` as `0x${string}`;
const cctpMemoHash = `0x${createHash("sha256").update(judgeProof.cctp.memo).digest("hex")}` as `0x${string}`;
const proofUri = "https://chengyuann.github.io/cup-signal-injective/proofs/judge-proof.json";
type LatestProof = {
  proofSha256: `0x${string}`;
  cctpMemoSha256: `0x${string}`;
  proofUri: string;
  anchoredAt: bigint;
  submitter: `0x${string}`;
};

let latest = (await publicClient.readContract({
  address: contractAddress,
  abi: artifact.abi,
  functionName: "latestProof",
})) as LatestProof;
let anchorHash = (process.env.PROOF_ANCHOR_TX_HASH as `0x${string}` | undefined) ?? null;
let anchorBlock: string | null = null;

if (latest.proofSha256.toLowerCase() !== proofHash.toLowerCase()) {
  anchorHash = await walletClient.sendTransaction({
    account,
    to: contractAddress,
    data: encodeFunctionData({
      abi: artifact.abi,
      functionName: "anchorProof",
      args: [proofHash, cctpMemoHash, proofUri],
    }),
  });
  latest = await waitForProof(contractAddress, proofHash);
  anchorBlock = (await publicClient.getBlockNumber()).toString();
}

const record = {
  version: 1,
  status: "live",
  network: {
    name: chain.name,
    chainId: chain.id,
    caip2: `eip155:${chain.id}`,
    rpcUrl: chain.rpcUrls.default.http[0],
    explorerUrl: chain.blockExplorers.default.url,
  },
  deployer: account.address,
  balanceBeforeInj: formatEther(balance),
  contract: {
    name: artifact.contractName,
    address: contractAddress,
    deploymentTransaction: deploymentHash,
    deploymentBlock,
    explorer: `${chain.blockExplorers.default.url}/address/${contractAddress}`,
  },
  anchor: {
    proofSha256: proofHash,
    cctpMemoSha256: cctpMemoHash,
    proofUri,
    transaction: anchorHash,
    block: anchorBlock,
    explorer: anchorHash ? `${chain.blockExplorers.default.url}/tx/${anchorHash}` : null,
    eventSignature:
      "ProofAnchored(bytes32,bytes32,string,uint64,address)",
  },
  readback: latest,
  generatedAt: new Date().toISOString(),
};

await writeFile("public/proofs/onchain-proof.json", `${JSON.stringify(record, bigintReplacer, 2)}\n`);
console.log(JSON.stringify(record, bigintReplacer, 2));

function bigintReplacer(_key: string, value: unknown) {
  return typeof value === "bigint" ? value.toString() : value;
}

async function waitForCode(address: `0x${string}`): Promise<void> {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    const code = await publicClient.getCode({ address });
    if (code && code !== "0x") return;
    await new Promise((resolve) => setTimeout(resolve, 1_500));
  }
  throw new Error(`Timed out waiting for deployed bytecode at ${address}`);
}

async function waitForProof(
  address: `0x${string}`,
  proofHash: `0x${string}`,
): Promise<LatestProof> {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    const latest = (await publicClient.readContract({
      address,
      abi: artifact.abi,
      functionName: "latestProof",
    })) as LatestProof;
    if (latest.proofSha256.toLowerCase() === proofHash.toLowerCase()) return latest;
    await new Promise((resolve) => setTimeout(resolve, 1_500));
  }
  throw new Error(`Timed out waiting for proof ${proofHash} at ${address}`);
}
