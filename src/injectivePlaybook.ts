export type InjectiveTechKey = "x402" | "cctp" | "mcp" | "agent-skill";

export type InjectivePlay = {
  key: InjectiveTechKey;
  label: string;
  status: "demo-live" | "live-settled" | "intent-only";
  hook: string;
  fanAction: string;
  implementation: string;
  proof: string;
  productionStep: string;
  scoreBoost: string;
};

export const injectivePlays: InjectivePlay[] = [
  {
    key: "x402",
    label: "x402 Paid Scout Intel",
    status: "live-settled",
    hook: "A watch-party host or agent pays native testnet USDC to unlock a premium tactical report through the public x402 API.",
    fanAction: "Inspect the live settlement proof or use the local harness to preview the premium report.",
    implementation: "Cloudflare Workers serves the public x402 v2 endpoint; the official Injective SDK verifies EIP-3009 signatures and settles native testnet USDC.",
    proof: "The public x402 and agent proof files contain PAYMENT-RESPONSE receipts, transaction hashes, and payer/payee balance reconciliation.",
    productionStep: "Add KMS custody, atomic idempotency, rate limits, and mainnet operating policy before accepting real-value payments.",
    scoreBoost: "+1 x402 technical point; turns match analysis into a pay-per-request football data product.",
  },
  {
    key: "cctp",
    label: "USDC CCTP Fan Pool",
    status: "live-settled",
    hook: "A fan-group USDC pool can move from Base Sepolia to Injective Testnet through Circle CCTP V2.",
    fanAction: "Inspect the burn, Circle attestation, destination mint, and the reconciled Cup Signal memo.",
    implementation: "Circle Bridge Kit performs approve and burn on Base Sepolia; the resume path retrieves the IRIS attestation and calls receiveMessage on Injective.",
    proof: "public/proofs/cctp-transfer.json records the source transaction, event nonce, complete attestation, destination transaction, and USDC balance delta.",
    productionStep: "Add production relayer monitoring, retry queues, KMS custody, and mainnet limits before moving real-value USDC.",
    scoreBoost: "+1 CCTP technical point; makes live fan rewards cross-chain instead of purely local.",
  },
  {
    key: "mcp",
    label: "MCP Match Analyst Server",
    status: "demo-live",
    hook: "Agents can query fixtures, forecasts, player ratings, and the real World Cup 2026 data snapshot through MCP tools.",
    fanAction: "Run npm run check:mcp to verify forecast_match, rank_match_players, build_watch_brief, and get_worldcup_2026_data.",
    implementation: "mcp/cup-signal-mcp.ts exposes tools and a reusable Global Cup commentary prompt over stdio.",
    proof: "npm run check:mcp lists all tools and calls representative forecast, player, and World Cup data tools.",
    productionStep: "Pair this local MCP with the official Injective MCP server for wallet, bridge, trade, or EVM actions.",
    scoreBoost: "+1 MCP technical point; turns the web app into an agent-readable football data source.",
  },
  {
    key: "agent-skill",
    label: "Agent Skill Live Posting Coach",
    status: "demo-live",
    hook: "A portable Agent Skill tells an AI agent how to produce match reads, player notes, and X replies for the scoring loop.",
    fanAction: "Use agent-skill/SKILL.md with the MCP server to generate a live reply during a match window.",
    implementation: "The skill orders list_fixtures -> forecast_match -> build_watch_brief -> rank_match_players -> commentary.",
    proof: "npm run demo:agent prints a match forecast, x402 resource, CCTP memo, and top-player ratings.",
    productionStep: "Add live sports feed credentials and optionally let the agent ask the official Injective MCP to execute settlement.",
    scoreBoost: "+1 Agent Skills technical point; gives judges a repeatable agent workflow, not just a webpage.",
  },
];

export const injectivePlaybookSummary = {
  totalTechHooks: injectivePlays.length,
  liveDemoHooks: injectivePlays.filter((play) => play.status !== "intent-only").length,
  dryRunBoundaries: injectivePlays.filter((play) => play.status === "intent-only").map((play) => play.key),
  maxHackathonTechBonus: 4,
};
