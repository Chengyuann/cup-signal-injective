# Cup Signal Judge Guide

This guide is the fastest way to verify the Cup Signal loop: World Cup signal,
paid report, cross-chain USDC, MCP tools, agent workflow, and on-chain proof.

## 1. Open the product

- MVP: https://chengyuann.github.io/cup-signal-injective/
- Full demo: https://chengyuann.github.io/cup-signal-injective/media/cup-signal-demo-v2.mp4
- x402/on-chain update: https://chengyuann.github.io/cup-signal-injective/media/cup-signal-x402-onchain-update.mp4
- Generated proof bundle: https://chengyuann.github.io/cup-signal-injective/proofs/judge-proof.json
- Real x402 settlement: https://chengyuann.github.io/cup-signal-injective/proofs/x402-payment.json
- Public x402 API: https://cup-signal-x402.mcy23.workers.dev/api/premium-report/cup-001
- Agent auto-payment proof: https://chengyuann.github.io/cup-signal-injective/proofs/agent-x402-run.json
- CCTP transfer proof: https://chengyuann.github.io/cup-signal-injective/proofs/cctp-transfer.json

Recommended product path:

1. Inspect the World Cup data panel.
2. Change forecast weights in the signal cockpit.
3. Switch player rating modes and select a player.
4. Inspect the x402, CCTP, and proof registry live badges.
5. Click `Preview paid report` and inspect the Injective Playbook / Agent Output panels.

## 2. Reproduce in under three minutes

```bash
npm install
npm test
npm run check:mcp
npm run proof:judge
```

Expected result:

- 12 automated tests pass.
- 7 MCP tools are listed and representative tools return content.
- `public/proofs/judge-proof.json` records:
  - an HTTP `402 Payment Required` challenge,
  - a local zero-funds request returning `200`,
  - the `X-PAYMENT-RESPONSE` header,
  - the completed CCTP transfer evidence,
  - the MCP tool inventory,
  - deterministic forecast output.

## 3. Manual HTTP proof

```bash
npm run server:x402
curl -i http://127.0.0.1:4020/api/premium-report/cup-001
curl -i -H 'X-PAYMENT: judge-demo' \
  http://127.0.0.1:4020/api/premium-report/cup-001
```

The first request returns `402`. The second returns `200` with an
`X-PAYMENT-RESPONSE` header.

## 4. Technology status

| Technology | Current evidence | Boundary |
| --- | --- | --- |
| x402 | Public v2 API plus real 0.01 native testnet USDC EIP-3009 settlement | Testnet payment; no mainnet value claimed |
| USDC CCTP | Completed 1 USDC Base Sepolia → Injective Testnet CCTP V2 flow | Testnet only; no mainnet transfer claimed |
| MCP Server | 7 tools, 1 resource, 1 prompt over stdio | Local server; official Injective MCP can be paired for chain actions |
| Agent Skill | Portable Skill plus a budget-gated public x402 client and receipt | Testnet only; requires explicit `--yes` before signing |
| On-chain proof | Deployed proof registry on Injective EVM Testnet with RPC readback verification | Anchors evidence hashes; payment and CCTP receipts are linked separately |

## 5. Why the boundaries matter

The receipts are testnet by design, but the mechanics are real: x402 settles
native Injective testnet USDC, the agent signs and pays under a budget cap, and
CCTP burns on Base Sepolia then mints on Injective Testnet. Player ratings are a
demo analytics layer over public match context, not official live player data.

## 6. On-chain verification

The proof registry anchors the stable judge-proof hash, not a payment claim.

```bash
npm run contract:compile
npm run contract:verify:testnet
```

After deployment, the public record is available at:

```text
https://chengyuann.github.io/cup-signal-injective/proofs/onchain-proof.json
```

Contract:

```text
0x751784E837763cE0cB1786b2A0741092B15bB808
```

Anchor transaction:

```text
0x1040a8c5a6ac29d62b618eadadd95aff5e259ff580c4dcdffeab6fcbb345a7bd
```

## 7. Real x402 receipt

Public endpoint:

```text
https://cup-signal-x402.mcy23.workers.dev/api/premium-report/cup-001
```

Settlement transaction:

```text
0x52bcffdd6ce893f5bb1310f6f2ba3dc0a8e67d3b6d5900317f448210e319b32c
```

The public proof records payer/payee balance changes, HTTP 200 premium response,
and the decoded `PAYMENT-RESPONSE` receipt.

## 8. Agent payment

The agent first quotes without signing, enforces a maximum spend of 0.01 USDC,
then requires `--yes` before signing:

```bash
npm run agent:x402
npm run agent:x402 -- --yes
```

Agent settlement:

```text
0x1876f7d842193750d961167c545aed6fbb952c7188ba0367cd3e13bb5c687e6a
```
