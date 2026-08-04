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

console.log(JSON.stringify({ ok: true, results }, null, 2));
