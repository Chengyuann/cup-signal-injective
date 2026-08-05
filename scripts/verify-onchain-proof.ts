import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createPublicClient, defineChain, http } from "viem";

const record = JSON.parse(await readFile("public/proofs/onchain-proof.json", "utf8"));
const artifact = JSON.parse(await readFile("artifacts/CupSignalProofRegistry.json", "utf8"));
const judgeProof = JSON.parse(await readFile("public/proofs/judge-proof.json", "utf8"));
const chain = defineChain({
  id: 1439,
  name: "Injective EVM Testnet",
  nativeCurrency: { name: "Injective", symbol: "INJ", decimals: 18 },
  rpcUrls: { default: { http: ["https://k8s.testnet.json-rpc.injective.network/"] } },
});
const client = createPublicClient({ chain, transport: http() });
const address = record.contract.address as `0x${string}`;
const code = await client.getCode({ address });
assert.ok(code && code !== "0x", "Contract bytecode is missing");

const latest = (await client.readContract({
  address,
  abi: artifact.abi,
  functionName: "latestProof",
})) as {
  proofSha256: `0x${string}`;
  cctpMemoSha256: `0x${string}`;
  proofUri: string;
  anchoredAt: bigint;
  submitter: `0x${string}`;
};

assert.equal(latest.proofSha256.toLowerCase(), `0x${judgeProof.sha256}`.toLowerCase());
assert.equal(latest.proofUri, record.anchor.proofUri);
assert.equal(latest.submitter.toLowerCase(), record.deployer.toLowerCase());

console.log(
  JSON.stringify(
    {
      ok: true,
      contract: address,
      proofSha256: latest.proofSha256,
      proofUri: latest.proofUri,
      anchoredAt: latest.anchoredAt.toString(),
      submitter: latest.submitter,
    },
    null,
    2,
  ),
);
