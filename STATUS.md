# Cup Signal Technical Status

Last reviewed: 2026-08-05.

## Verified

- Public MVP and both submitted video URLs return successfully.
- GitHub Pages builds with `/cup-signal-injective/` as the base path.
- Daily World Cup data refresh no longer deploys an incorrect root-path build.
- Forecast probabilities are normalized and covered by automated tests.
- The local zero-funds harness returns a structured, schema-valid HTTP 402 challenge.
- The public Worker settles native testnet USDC through x402 v2 on Injective
  EVM Testnet (`eip155:1439`).
- Public and agent PAYMENT-RESPONSE receipts include transaction and balance
  reconciliation evidence.
- MCP server exposes 7 tools, 1 resource, and 1 prompt.
- Agent Skill references the actual MCP tool names.
- `public/proofs/judge-proof.json` is generated from live local HTTP and MCP calls.

## Honest boundaries

- The local harness is a dry-run; the public endpoint has completed real
  testnet USDC settlements.
- A 1 USDC CCTP V2 transfer completed from Base Sepolia to Injective Testnet,
  including burn, Circle attestation, destination mint, and balance reconciliation.
- Tournament schedule/team data is sourced from public repositories.
- Player ratings and player event data are simulated product analytics.
- The proof-registry contract is deployed on Injective EVM Testnet and its
  on-chain readback matches the public judge-proof SHA-256.
- A real 0.01 native testnet USDC x402 payment settled through the public
  Cloudflare Worker endpoint and returned a PAYMENT-RESPONSE receipt.
- A budget-gated agent independently discovered the public 402, accepted the
  0.01 USDC quote, paid, replayed the request, and decoded the receipt.
- Blockscout reports the proof registry source as Verified (Exact Match).

## Current operating path

### x402

The public endpoint already uses the official Injective x402 package with a
funded receiver, EIP-3009 signatures, facilitator settlement, and persisted
public receipts. The local harness remains available for zero-funds judging.

Before mainnet or real-value operation, add KMS-backed key custody, atomic
idempotency, rate limits, abuse controls, and an explicit mainnet spend policy.
Secrets remain in Cloudflare, GitHub, and local secret stores rather than source.

### CCTP

The testnet sequence is complete:

1. approve and burn 1 USDC on Base Sepolia,
2. retrieve the Circle CCTP V2 attestation,
3. submit `receiveMessage` on Injective Testnet,
4. reconcile the destination USDC balance with the Cup Signal memo.

Proof: `public/proofs/cctp-transfer.json`.

### MCP and Agent Skills

The project uses the stable TypeScript SDK currently committed in the lockfile.
The MCP 2026-07-28 specification introduces a stateless core and breaking
changes; migration should happen after the competition rather than during the
judging window. The Agent Skill remains portable and references the current
tool inventory.

### On-chain proof registry

The minimal `CupSignalProofRegistry` contract is designed for Injective EVM
Testnet. It anchors the stable judge-proof SHA-256, CCTP memo SHA-256, and
public proof URI. It does not handle funds; x402 settlement is independently
evidenced by native USDC transfer receipts.

Deployed contract:

```text
0x751784E837763cE0cB1786b2A0741092B15bB808
```

Anchor transaction:

```text
0x1040a8c5a6ac29d62b618eadadd95aff5e259ff580c4dcdffeab6fcbb345a7bd
```

The chain stores proof and memo hashes only. This is timestamped evidence, not
an x402 settlement or CCTP transfer claim.

### Real x402 settlement

- Public endpoint:
  `https://cup-signal-x402.mcy23.workers.dev/api/premium-report/cup-001`
- Settlement transaction:
  `0x52bcffdd6ce893f5bb1310f6f2ba3dc0a8e67d3b6d5900317f448210e319b32c`
- Payer balance: `19.98 -> 19.97 USDC`
- Payee balance: `0.02 -> 0.03 USDC`
- Asset: native Injective Testnet USDC
- Scheme: x402 v2 exact payment using EIP-3009

### Agent payment

- Policy: Injective Testnet native USDC only
- Max spend: `0.01 USDC`
- Settlement:
  `0x1876f7d842193750d961167c545aed6fbb952c7188ba0367cd3e13bb5c687e6a`
- Proof:
  `https://chengyuann.github.io/cup-signal-injective/proofs/agent-x402-run.json`
