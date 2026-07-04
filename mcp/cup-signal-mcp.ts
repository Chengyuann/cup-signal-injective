import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { eventSnapshot, matches, teams } from "../src/data";
import { buildPredictions, buildWatchBrief, predictMatch } from "../src/forecast";
import { scorePlayers } from "../src/players";
import { tournamentStats, worldCupGroups, worldCupMatches, worldCupSource, worldCupTeams } from "../src/worldcupData";
import { injectivePlaybookSummary, injectivePlays } from "../src/injectivePlaybook";

const server = new McpServer({
  name: "cup-signal-injective-mcp",
  version: "0.1.0",
});

server.registerResource(
  "global-cup-event",
  "cup-signal://event",
  {
    title: "Injective Global Cup event context",
    description: "Hackathon scoring and submission context used by Cup Signal.",
    mimeType: "application/json",
  },
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify(eventSnapshot, null, 2),
      },
    ],
  }),
);

server.registerTool(
  "list_fixtures",
  {
    title: "List World Cup fixtures",
    description: "Return the demo World Cup fixture slate and current live status.",
    inputSchema: {
      status: z.enum(["all", "upcoming", "live", "final"]).default("all"),
    },
  },
  async ({ status }) => {
    const filtered = status === "all" ? matches : matches.filter((match) => match.status === status);
    return jsonResult(filtered);
  },
);

server.registerTool(
  "forecast_match",
  {
    title: "Forecast a match",
    description: "Run the deterministic Cup Signal forecast model for a specific match.",
    inputSchema: {
      matchId: z.string().describe("Match id, for example cup-001"),
    },
  },
  async ({ matchId }) => {
    const match = matches.find((candidate) => candidate.id === matchId);
    if (!match) {
      return {
        isError: true,
        content: [{ type: "text", text: `Unknown matchId ${matchId}` }],
      };
    }
    return jsonResult(predictMatch(match));
  },
);

server.registerTool(
  "build_watch_brief",
  {
    title: "Build watch-party brief",
    description: "Generate the free and premium report payload, including x402 and CCTP payment metadata.",
    inputSchema: {
      matchId: z.string().describe("Match id, for example cup-001"),
    },
  },
  async ({ matchId }) => jsonResult(buildWatchBrief(matchId)),
);

server.registerTool(
  "rank_teams",
  {
    title: "Rank teams",
    description: "Return model-ranked teams across the demo team pool.",
    inputSchema: {
      limit: z.number().min(1).max(12).default(6),
    },
  },
  async ({ limit }) => {
    const predictions = buildPredictions();
    const teamPressure = new Map<string, number>();
    for (const prediction of predictions) {
      teamPressure.set(prediction.home.code, prediction.homeWin);
      teamPressure.set(prediction.away.code, prediction.awayWin);
    }
    const ranked = teams
      .map((team) => ({
        code: team.code,
        name: team.name,
        attack: team.attack,
        defense: team.defense,
        pressure: team.pressure,
        liveEdge: teamPressure.get(team.code) ?? 0,
        note: team.note,
      }))
      .sort((a, b) => b.attack + b.defense + b.pressure + b.liveEdge * 50 - (a.attack + a.defense + a.pressure + a.liveEdge * 50))
      .slice(0, limit);
    return jsonResult(ranked);
  },
);

server.registerTool(
  "rank_match_players",
  {
    title: "Rank match players",
    description: "Return live player ratings with current-form-vs-baseline deltas.",
    inputSchema: {
      mode: z.enum(["balanced", "attack", "defense", "pressing"]).default("balanced"),
      window: z.enum(["live", "last5", "season"]).default("live"),
      limit: z.number().min(1).max(6).default(6),
    },
  },
  async ({ mode, window, limit }) => {
    const ranked = scorePlayers(mode, window)
      .slice(0, limit)
      .map((score) => ({
        player: score.player.name,
        team: score.player.team,
        role: score.player.role,
        score: Number(score.score.toFixed(2)),
        grade: score.grade,
        abilityDelta: Number(score.delta.toFixed(1)),
        liveImpact: Number(score.liveImpact.toFixed(1)),
        risk: Number(score.risk.toFixed(1)),
        strengths: score.strengths,
        watchItem: score.watchItem,
      }));
    return jsonResult(ranked);
  },
);

server.registerTool(
  "get_worldcup_2026_data",
  {
    title: "Get World Cup 2026 data",
    description: "Return the real-data snapshot sourced from openfootball/worldcup and rezarahiminia/worldcup2026.",
    inputSchema: {
      section: z.enum(["summary", "groups", "matches"]).default("summary"),
      limit: z.number().min(1).max(104).default(12),
    },
  },
  async ({ section, limit }) => {
    if (section === "groups") return jsonResult({ source: worldCupSource, groups: worldCupGroups });
    if (section === "matches") return jsonResult({ source: worldCupSource, matches: worldCupMatches.slice(0, limit) });
    return jsonResult({
      source: worldCupSource,
      stats: tournamentStats,
      sampleTeams: worldCupTeams.slice(0, 8),
      openingMatches: worldCupMatches.slice(0, 4),
      knockoutSample: worldCupMatches.filter((match) => match.type !== "group").slice(0, 4),
    });
  },
);

server.registerTool(
  "get_injective_playbook",
  {
    title: "Get Injective playbook",
    description: "Explain how Cup Signal uses x402, USDC CCTP, MCP Server, and Agent Skills as product actions.",
    inputSchema: {
      tech: z.enum(["all", "x402", "cctp", "mcp", "agent-skill"]).default("all"),
    },
  },
  async ({ tech }) => {
    const plays = tech === "all" ? injectivePlays : injectivePlays.filter((play) => play.key === tech);
    return jsonResult({ summary: injectivePlaybookSummary, plays });
  },
);

server.registerPrompt(
  "global_cup_commentary",
  {
    title: "Generate X commentary",
    description: "Prompt template for posting a match update in the Global Cup scoring thread.",
    argsSchema: {
      matchId: z.string(),
      tone: z.enum(["sharp", "friendly", "technical"]).default("sharp"),
    },
  },
  ({ matchId, tone }) => {
    const brief = buildWatchBrief(matchId);
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Write a concise ${tone} X reply for #InjectiveGlobalCupHackathon using this Cup Signal brief:\n${JSON.stringify(
              brief,
              null,
              2,
            )}`,
          },
        },
      ],
    };
  },
);

function jsonResult(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(value, null, 2),
      },
    ],
  };
}

const transport = new StdioServerTransport();
await server.connect(transport);
