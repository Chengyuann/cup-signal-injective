import assert from "node:assert/strict";

const publicUrls = [
  "https://chengyuann.github.io/cup-signal-injective/",
  "https://chengyuann.github.io/cup-signal-injective/media/cup-signal-teaser.mp4",
  "https://chengyuann.github.io/cup-signal-injective/media/cup-signal-demo-v2.mp4",
  "https://github.com/Chengyuann/cup-signal-injective",
  "https://chengyuann.github.io/cup-signal-injective/media/cup-signal-x402-onchain-update.mp4",
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

try {
  const response = await fetch("https://cup-signal-x402.mcy23.workers.dev/health", {
    headers: { "user-agent": "Cup-Signal-Submission-Check/1.0" },
    redirect: "follow",
  });
  assert.equal(response.status, 200, `public x402 health returned ${response.status}`);
  const health = await response.json();
  assert.equal(health.network, "eip155:1439");
  results.push({
    url: response.url,
    status: response.status,
    x402Api: health.service,
  });
} catch (error) {
  if (process.env.REQUIRE_PUBLIC_X402_API === "true") throw error;
  results.push({
    url: "https://cup-signal-x402.mcy23.workers.dev/health",
    status: "unreachable-from-this-network",
    note: String(error),
  });
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

const x402ProofResponse = await fetch(
  "https://chengyuann.github.io/cup-signal-injective/proofs/x402-payment.json",
  { headers: { "user-agent": "Cup-Signal-Submission-Check/1.0" } },
);
if (x402ProofResponse.status === 200) {
  const payment = await x402ProofResponse.json();
  assert.equal(payment.status, "settled");
  assert.equal(payment.payment.amountUsdc, "0.01");
  assert.match(payment.transaction.hash, /^0x[0-9a-fA-F]{64}$/);
  results.push({
    url: x402ProofResponse.url,
    status: x402ProofResponse.status,
    x402Settlement: payment.transaction.hash,
  });
} else if (process.env.REQUIRE_X402_SETTLEMENT === "true") {
  throw new Error(`Public x402 payment proof returned ${x402ProofResponse.status}`);
}

const agentProofResponse = await fetch(
  "https://chengyuann.github.io/cup-signal-injective/proofs/agent-x402-run.json",
  { headers: { "user-agent": "Cup-Signal-Submission-Check/1.0" } },
);
if (agentProofResponse.status === 200) {
  const agent = await agentProofResponse.json();
  assert.equal(agent.status, "success");
  assert.equal(agent.quote.withinBudget, true);
  assert.match(agent.receipt.transaction, /^0x[0-9a-fA-F]{64}$/);
  results.push({
    url: agentProofResponse.url,
    status: agentProofResponse.status,
    agentSettlement: agent.receipt.transaction,
  });
}

const cctpProofResponse = await fetch(
  "https://chengyuann.github.io/cup-signal-injective/proofs/cctp-transfer.json",
  { headers: { "user-agent": "Cup-Signal-Submission-Check/1.0" } },
);
if (cctpProofResponse.status === 200) {
  const cctp = await cctpProofResponse.json();
  assert.equal(cctp.status, "success");
  assert.equal(cctp.attestationStatus, "complete");
  assert.match(cctp.sourceTransaction, /^0x[0-9a-fA-F]{64}$/);
  assert.match(cctp.destinationTransaction, /^0x[0-9a-fA-F]{64}$/);
  results.push({
    url: cctpProofResponse.url,
    status: cctpProofResponse.status,
    cctpSource: cctp.sourceTransaction,
    cctpDestination: cctp.destinationTransaction,
  });
} else if (process.env.REQUIRE_CCTP_PROOF === "true") {
  throw new Error(`Public CCTP proof returned ${cctpProofResponse.status}`);
}

console.log(JSON.stringify({ ok: true, results }, null, 2));
