import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { eventSnapshot, matches, teams } from "../src/data";
import { buildPredictions, buildWatchBrief, predictMatch } from "../src/forecast";

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
