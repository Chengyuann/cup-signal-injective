import assert from "node:assert/strict";

const publicUrls = [
  "https://chengyuann.github.io/cup-signal-injective/",
  "https://chengyuann.github.io/cup-signal-injective/media/cup-signal-teaser.mp4",
  "https://chengyuann.github.io/cup-signal-injective/media/cup-signal-demo-v2.mp4",
  "https://github.com/Chengyuann/cup-signal-injective",
];

const results = [];
for (const url of publicUrls) {
  const response = await fetch(url, {
    headers: { "user-agent": "Cup-Signal-Submission-Check/1.0" },
    redirect: "follow",
  });
  assert.equal(response.status, 200, `${url} returned ${response.status}`);
  results.push({
    url,
    status: response.status,
    contentType: response.headers.get("content-type"),
    contentLength: response.headers.get("content-length"),
  });
  await response.body?.cancel();
}

const proofResponse = await fetch("https://chengyuann.github.io/cup-signal-injective/proofs/judge-proof.json", {
  headers: { "user-agent": "Cup-Signal-Submission-Check/1.0" },
});
if (proofResponse.status === 200) {
  const proof = await proofResponse.json();
  assert.equal(proof.x402.challengeStatus, 402);
  assert.equal(proof.x402.paidStatus, 200);
  assert.equal(proof.x402.accepts[0].network, "eip155:1439");
  assert.equal(proof.mcp.tools.length, 7);
  results.push({
    url: proofResponse.url,
    status: proofResponse.status,
    x402Network: proof.x402.accepts[0].network,
    mcpTools: proof.mcp.tools.length,
  });
} else if (process.env.REQUIRE_PUBLIC_PROOF === "true") {
  throw new Error(`Public proof bundle returned ${proofResponse.status}`);
} else {
  results.push({
    url: proofResponse.url,
    status: proofResponse.status,
    note: "Proof bundle is pending the next Pages deployment.",
  });
}

const onchainResponse = await fetch(
  "https://chengyuann.github.io/cup-signal-injective/proofs/onchain-proof.json",
  { headers: { "user-agent": "Cup-Signal-Submission-Check/1.0" } },
);
if (onchainResponse.status === 200) {
  const onchain = await onchainResponse.json();
  assert.equal(onchain.network.chainId, 1439);
  assert.ok(["pending", "live"].includes(onchain.status));
  if (process.env.REQUIRE_ONCHAIN_PROOF === "true") {
    assert.equal(onchain.status, "live");
    assert.match(onchain.contract.address, /^0x[0-9a-fA-F]{40}$/);
    assert.match(onchain.anchor.transaction, /^0x[0-9a-fA-F]{64}$/);
  }
  results.push({
    url: onchainResponse.url,
    status: onchainResponse.status,
    onchainStatus: onchain.status,
    contract: onchain.contract?.address ?? null,
  });
} else if (process.env.REQUIRE_ONCHAIN_PROOF === "true") {
  throw new Error(`Public on-chain proof returned ${onchainResponse.status}`);
}

console.log(JSON.stringify({ ok: true, results }, null, 2));
