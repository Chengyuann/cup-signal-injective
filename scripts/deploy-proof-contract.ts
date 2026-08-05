import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  encodeFunctionData,
  formatEther,
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

const deploymentHash = await walletClient.deployContract({
  account,
  abi: artifact.abi,
  bytecode: artifact.bytecode,
});
const deploymentReceipt = await publicClient.waitForTransactionReceipt({ hash: deploymentHash });
if (!deploymentReceipt.contractAddress) throw new Error("Deployment did not return a contract address");

const proofHash = `0x${judgeProof.sha256}` as `0x${string}`;
const cctpMemoHash = `0x${createHash("sha256").update(judgeProof.cctp.memo).digest("hex")}` as `0x${string}`;
const proofUri = "https://chengyuann.github.io/cup-signal-injective/proofs/judge-proof.json";
const anchorHash = await walletClient.sendTransaction({
  account,
  to: deploymentReceipt.contractAddress,
  data: encodeFunctionData({
    abi: artifact.abi,
    functionName: "anchorProof",
    args: [proofHash, cctpMemoHash, proofUri],
  }),
});
const anchorReceipt = await publicClient.waitForTransactionReceipt({ hash: anchorHash });
const latest = await publicClient.readContract({
  address: deploymentReceipt.contractAddress,
  abi: artifact.abi,
  functionName: "latestProof",
});

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
    address: deploymentReceipt.contractAddress,
    deploymentTransaction: deploymentHash,
    deploymentBlock: deploymentReceipt.blockNumber.toString(),
    explorer: `${chain.blockExplorers.default.url}/address/${deploymentReceipt.contractAddress}`,
  },
  anchor: {
    proofSha256: proofHash,
    cctpMemoSha256: cctpMemoHash,
    proofUri,
    transaction: anchorHash,
    block: anchorReceipt.blockNumber.toString(),
    explorer: `${chain.blockExplorers.default.url}/tx/${anchorHash}`,
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
