import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const basePath = "/cup-signal-injective/";
const html = await readFile("dist/index.html", "utf8");

assert.match(html, /\/cup-signal-injective\/assets\/index-[^"]+\.js/);
assert.match(html, /\/cup-signal-injective\/assets\/index-[^"]+\.css/);
assert.match(html, /\/cup-signal-injective\/favicon\.svg/);

const requiredFiles = [
  "dist/proofs/judge-proof.json",
  "dist/media/cup-signal-loop.mp4",
  "dist/media/cup-signal-teaser.mp4",
  "dist/media/cup-signal-demo-v2.mp4",
];

for (const file of requiredFiles) {
  const metadata = await stat(file);
  assert.ok(metadata.size > 0, `${file} must not be empty`);
}

const proof = JSON.parse(await readFile("dist/proofs/judge-proof.json", "utf8"));
assert.equal(proof.x402.challengeStatus, 402);
assert.equal(proof.x402.paidStatus, 200);
assert.equal(proof.x402.accepts[0].network, "eip155:1439");
assert.equal(proof.model.probabilityTotal, 1);
assert.equal(proof.mcp.tools.length, 7);

let onchainStatus = "pending";
try {
  const onchain = JSON.parse(await readFile("dist/proofs/onchain-proof.json", "utf8"));
  assert.equal(onchain.network.chainId, 1439);
  assert.match(onchain.contract.address, /^0x[0-9a-fA-F]{40}$/);
  assert.match(onchain.anchor.transaction, /^0x[0-9a-fA-F]{64}$/);
  onchainStatus = "live";
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}

console.log(
  JSON.stringify(
    {
      ok: true,
      basePath,
      requiredFiles,
      x402Network: proof.x402.accepts[0].network,
      mcpTools: proof.mcp.tools.length,
      onchainStatus,
    },
    null,
    2,
  ),
);
