---
name: cup-signal-watch-party-analyst
description: Generate World Cup watch-party briefs and Injective Global Cup scoring posts from Cup Signal MCP tools.
---

# Cup Signal Watch-Party Analyst

Use this skill when a user wants a concise World Cup match read, a watch-party prompt, or an Injective Global Cup X update based on the Cup Signal app.

## Required Context

- Prefer the local MCP server command: `npm run mcp`
- When discussing payment, CCTP, wallets, or transactions, read
  `references/payment-boundaries.md`.
- Useful tools:
  - `list_fixtures`
  - `forecast_match`
  - `build_watch_brief`
  - `rank_teams`
  - `rank_match_players`
  - `get_worldcup_2026_data`
  - `get_injective_playbook`
- Use `global_cup_commentary` for a post draft.

## Workflow

1. Call `list_fixtures` and pick the requested match.
2. Call `forecast_match` for probability, score, volatility, and tactical read.
3. Call `build_watch_brief` for free summary, premium report, x402 resource, and USDC CCTP memo.
4. Call `rank_match_players` when the user asks for player ratings, form comparison, or dashboard commentary.
5. Call `get_injective_playbook` when the output needs to explain x402, CCTP, MCP Server, or Agent Skills to judges.
6. Produce a short answer with:
   - one-line match signal,
   - top player rating and ability-delta note,
   - one Injective technical hook and how a fan uses it,
   - one watch-party interaction prompt,
   - one live screenshot/comment idea for `#InjectiveGlobalCupHackathon`,
   - the public settlement receipt when discussing the live x402 flow,
   - a clear note when using only the local zero-funds harness.

## Style

- Keep the output useful for fans, not betting advice.
- Use `public/proofs/x402-payment.json` or `public/proofs/agent-x402-run.json`
  before claiming a real x402 payment.
- Keep the local dry-run harness distinct from the public facilitator receipt.
- Use `public/proofs/cctp-transfer.json` before claiming the completed testnet
  CCTP transfer; require fresh proof for any later transfer or mainnet claim.
- If posting to X, include `@injective`, `@NinjaLabsHQ`, `@NinjaLabsCN`, and `#InjectiveGlobalCupHackathon`.
