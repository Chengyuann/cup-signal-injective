# Cup Signal Judge Guide

This guide is the shortest reproducible path through the submission.

## 1. Open the product

- MVP: https://chengyuann.github.io/cup-signal-injective/
- Full demo: https://chengyuann.github.io/cup-signal-injective/media/cup-signal-demo-v2.mp4
- x402/on-chain update: https://chengyuann.github.io/cup-signal-injective/media/cup-signal-x402-onchain-update.mp4
- Generated proof bundle: https://chengyuann.github.io/cup-signal-injective/proofs/judge-proof.json
- Real x402 settlement: https://chengyuann.github.io/cup-signal-injective/proofs/x402-payment.json
- Public x402 API: https://cup-signal-x402.mcy23.workers.dev/api/premium-report/cup-001
- Agent auto-payment proof: https://chengyuann.github.io/cup-signal-injective/proofs/agent-x402-run.json

Recommended product path:

1. Inspect the World Cup data panel.
2. Change forecast weights in the signal cockpit.
3. Switch player rating modes and select a player.
4. Click `Simulate x402 Unlock`.
5. Inspect the Injective Playbook and Agent Output panels.

## 2. Reproduce in under three minutes

```bash
npm install
npm test
npm run check:mcp
npm run proof:judge
```

Expected result:

- 6 automated tests pass.
- 7 MCP tools are listed and representative tools return content.
- `public/proofs/judge-proof.json` records:
  - an HTTP `402 Payment Required` challenge,
  - a dry-run paid request returning `200`,
  - the `X-PAYMENT-RESPONSE` header,
  - the CCTP settlement intent,
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
| USDC CCTP | Consistent Base Sepolia to Injective testnet intent and memo | No burn, attestation, or mint transaction claimed |
| MCP Server | 7 tools, 1 resource, 1 prompt over stdio | Local server; official Injective MCP can be paired for chain actions |
| Agent Skill | Portable `agent-skill/SKILL.md` using the MCP tool names | Generates a workflow; does not autonomously spend funds |
| On-chain proof | Deployed proof registry on Injective EVM Testnet with RPC readback verification | Anchors evidence hashes only; it is not an x402 or CCTP settlement |

## 5. Why the boundaries matter

Cup Signal does not fabricate a wallet payment, CCTP transfer, transaction hash,
or official live player data. The submission demonstrates the product and
protocol interfaces that can be upgraded to real settlement once a funded
wallet, facilitator, and production sports feed are configured.

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
0x4a8109bffeebfefb70fc36f829eefb258aaa7aca49420c72133d7c22fc615e19
```

## 7. Real x402 receipt

Public endpoint:

```text
https://cup-signal-x402.mcy23.workers.dev/api/premium-report/cup-001
```

Settlement transaction:

```text
0xb41852a70b83d36ac8ccf7e0cc78822f27ae7bf983d113508ab1f4a9f1930ef1
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
