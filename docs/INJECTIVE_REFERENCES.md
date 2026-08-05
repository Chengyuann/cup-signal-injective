# Injective References Used

This project was implemented against current public documentation and keeps the production boundary explicit.

## x402

Cup Signal runs the premium report as a 402-gated API resource:

- `GET /api/premium-report/:matchId`
- returns an `accepts` payment requirement when no payment header exists
- settles native testnet USDC when a valid EIP-3009 PAYMENT-SIGNATURE exists
- also retains a local demo-header harness for zero-funds reproduction

Injective documents x402 as an HTTP 402-based payment protocol for pay-per-request services on Injective EVM.

Current references:

- Injective x402 guide: https://docs.injective.network/developers-ai/x402
- Injective EVM Testnet uses chain ID `1439`, represented as CAIP-2 `eip155:1439`.
- Current x402 v2 requirements use `amount`, a top-level `resource`, and an `accepts` array.
- The generated proof bundle validates the local harness.
- Public x402 and agent receipt files prove real testnet settlement.

## USDC CCTP

Cup Signal emits a deterministic CCTP checkout memo:

```json
{
  "source": "Base Sepolia",
  "destination": "Injective testnet",
  "token": "USDC",
  "memo": "cup-signal:cup-001:watch-brief"
}
```

The included testnet proof records a completed CCTP V2 transfer:

- Base Sepolia burn transaction,
- Circle IRIS attestation status `complete`,
- Injective Testnet `receiveMessage` transaction,
- destination USDC balance increase.

Circle announced CCTP support for Injective Testnet in March 2026 and
Injective Mainnet support in May 2026. The repository now includes funded testnet execution and transaction
reconciliation. Mainnet operation still requires production custody and limits.

## MCP Server

Cup Signal provides a local MCP server for World Cup match context. This can be paired with the official Injective MCP server for chain operations such as transfers, bridging, raw EVM transactions, or trading.

The repository uses `@modelcontextprotocol/sdk` `1.30.x`. The MCP 2026-07-28
specification introduces a new stateless core and breaking changes. Cup Signal
keeps the current tested stdio server during judging and records the migration
as post-competition work.

## Agent Skill

`agent-skill/SKILL.md` is a portable instruction file for agents. It teaches the agent how to call Cup Signal tools and produce live match commentary without overclaiming on-chain execution.

## Player Rating Layer

The player board is intentionally separated from official data claims:

- live player ratings are deterministic local TypeScript calculations,
- generated avatars are original fan-art assets and not official photos,
- `rank_match_players` exposes player ratings through MCP,
- `/api/player-ratings` exposes the same data through the local x402 report server for agent or dashboard use.

## Injective Playbook Endpoint

`/api/injective-playbook` and MCP `get_injective_playbook` expose the same four product hooks:

- x402 Paid Scout Intel
- USDC CCTP Fan Pool
- MCP Match Analyst Server
- Agent Skill Live Posting Coach

This is included so judges can inspect the integration logic without reading all source files.

## Security review

- No private key is stored in the repository; deployment and test wallets use
  Cloudflare/GitHub/local secret stores.
- The unused Coinbase facilitator package was removed.
- Production dependencies were upgraded and `npm audit --omit=dev` reports no known vulnerabilities as of 2026-08-05.
- The Pages artifact is audited before deployment for the correct base path,
  proof bundle, and required video files.
