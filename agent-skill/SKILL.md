---
name: cup-signal-watch-party-analyst
description: Generate World Cup watch-party briefs and Injective Global Cup scoring posts from Cup Signal MCP tools.
---

# Cup Signal Watch-Party Analyst

Use this skill when a user wants a concise World Cup match read, a watch-party prompt, or an Injective Global Cup X update based on the Cup Signal app.

## Required Context

- Prefer the local MCP server command: `npm run mcp`
- Useful tools:
  - `list_fixtures`
  - `forecast_match`
  - `build_watch_brief`
  - `rank_teams`
  - `rank_match_players`
- Use `global_cup_commentary` for a post draft.

## Workflow

1. Call `list_fixtures` and pick the requested match.
2. Call `forecast_match` for probability, score, volatility, and tactical read.
3. Call `build_watch_brief` for free summary, premium report, x402 resource, and USDC CCTP memo.
4. Call `rank_match_players` when the user asks for player ratings, form comparison, or dashboard commentary.
5. Produce a short answer with:
   - one-line match signal,
   - top player rating and ability-delta note,
   - one watch-party interaction prompt,
   - one live screenshot/comment idea for `#InjectiveGlobalCupHackathon`,
   - a clear note if payment is still dry-run.

## Style

- Keep the output useful for fans, not betting advice.
- Do not claim a real on-chain payment happened unless the user provides proof.
- If posting to X, include `@injective`, `@NinjaLabsHQ`, `@NinjaLabsCN`, and `#InjectiveGlobalCupHackathon`.
