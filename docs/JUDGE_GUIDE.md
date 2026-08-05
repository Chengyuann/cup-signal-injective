# Cup Signal Judge Guide

This guide is the shortest reproducible path through the submission.

## 1. Open the product

- MVP: https://chengyuann.github.io/cup-signal-injective/
- Full demo: https://chengyuann.github.io/cup-signal-injective/media/cup-signal-demo-v2.mp4
- Generated proof bundle: https://chengyuann.github.io/cup-signal-injective/proofs/judge-proof.json

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
| x402 | Schema-validated v2 HTTP 402 challenge on Injective EVM Testnet (`eip155:1439`) and deterministic unlock response | Dry-run header, no settlement transaction claimed |
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
