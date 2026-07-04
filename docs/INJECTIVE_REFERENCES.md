# Injective References Used

This project was implemented against current public documentation and keeps the production boundary explicit.

## x402

Cup Signal models the premium report as a 402-gated API resource:

- `GET /api/premium-report/:matchId`
- returns an `accepts` payment requirement when no payment header exists
- returns the premium JSON report when a demo `X-PAYMENT` header exists

Injective documents x402 as an HTTP 402-based payment protocol for pay-per-request services on Injective EVM.

## USDC CCTP

Cup Signal emits a CCTP checkout intent:

```json
{
  "source": "Base Sepolia",
  "destination": "Injective testnet",
  "token": "USDC",
  "memo": "cup-signal:cup-001:watch-brief"
}
```

The app does not claim to execute a transfer. Production integration should use the CCTP burn, attestation, and mint flow.

## MCP Server

Cup Signal provides a local MCP server for World Cup match context. This can be paired with the official Injective MCP server for chain operations such as transfers, bridging, raw EVM transactions, or trading.

## Agent Skill

`agent-skill/SKILL.md` is a portable instruction file for agents. It teaches the agent how to call Cup Signal tools and produce live match commentary without overclaiming on-chain execution.

## Player Rating Layer

The new player board keeps the same dry-run boundary:

- live player ratings are deterministic local TypeScript calculations,
- generated avatars are original fan-art assets and not official photos,
- `rank_match_players` exposes player ratings through MCP,
- `/api/player-ratings` exposes the same data through the local x402 report server for agent or dashboard use.
