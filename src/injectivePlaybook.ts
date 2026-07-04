export type InjectiveTechKey = "x402" | "cctp" | "mcp" | "agent-skill";

export type InjectivePlay = {
  key: InjectiveTechKey;
  label: string;
  status: "demo-live" | "dry-run" | "production-ready-shape";
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
    status: "dry-run",
    hook: "A watch-party host unlocks a premium tactical report only when the endpoint receives an X-PAYMENT header.",
    fanAction: "Click Simulate x402 Unlock, then use the unlocked player/event report as the paid intelligence card.",
    implementation: "server/x402-report-server.ts returns HTTP 402 requirements for /api/premium-report/:matchId and emits X-PAYMENT-RESPONSE when paid.",
    proof: "npm run server:x402 plus curl /api/premium-report/cup-001 returns 402, then 200 with X-PAYMENT.",
    productionStep: "Replace the demo header with @x402/express facilitator verification and a real receiving address.",
    scoreBoost: "+1 x402 technical point; turns match analysis into a pay-per-request football data product.",
  },
  {
    key: "cctp",
    label: "USDC CCTP Fan Pool",
    status: "production-ready-shape",
    hook: "Every premium brief carries a CCTP memo so a fan group can settle a cross-chain USDC prize pool into an Injective-oriented flow.",
    fanAction: "Copy the memo cup-signal:<match>:watch-brief for a watch-party USDC pool or player-of-the-match bounty.",
    implementation: "buildWatchBrief() emits Base Sepolia -> Injective testnet USDC settlement metadata with a deterministic memo.",
    proof: "The app, MCP build_watch_brief tool, and x402 response all expose the same cctp object.",
    productionStep: "Wire the memo into Circle CCTP burn/attestation/mint flow, then reconcile the minted USDC on Injective.",
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
  liveDemoHooks: injectivePlays.filter((play) => play.status === "demo-live").length,
  dryRunBoundaries: injectivePlays.filter((play) => play.status === "dry-run").map((play) => play.key),
  maxHackathonTechBonus: 4,
};
