import { spawn, type ChildProcess } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { matches } from "../src/data";
import { buildWatchBrief, predictMatch } from "../src/forecast";

const outputPath = "public/proofs/judge-proof.json";
const port = 4600 + (process.pid % 200);
const baseUrl = `http://127.0.0.1:${port}`;
const match = matches[0];
const prediction = predictMatch(match);
const brief = buildWatchBrief(match.id);
let server: ChildProcess | undefined;

try {
  server = spawn(process.execPath, ["./node_modules/tsx/dist/cli.mjs", "server/x402-report-server.ts"], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port), X402_LIVE: "false" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  await waitForServer(server);

  const challengeResponse = await fetch(`${baseUrl}/api/premium-report/${match.id}`);
  const challenge = await challengeResponse.json();
  const paidResponse = await fetch(`${baseUrl}/api/premium-report/${match.id}`, {
    headers: { "X-PAYMENT": "judge-proof-dry-run" },
  });
  const paid = await paidResponse.json();

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["./node_modules/tsx/dist/cli.mjs", "mcp/cup-signal-mcp.ts"],
    cwd: process.cwd(),
    stderr: "pipe",
  });
  const client = new Client({ name: "cup-signal-proof", version: "0.1.0" });
  await client.connect(transport);
  const tools = await client.listTools();
  const mcpForecast = await client.callTool({
    name: "forecast_match",
    arguments: { matchId: match.id },
  });
  const mcpBrief = await client.callTool({
    name: "build_watch_brief",
    arguments: { matchId: match.id },
  });
  await client.close();

  const proof = {
    version: 1,
    generatedAt: new Date().toISOString(),
    project: "Cup Signal",
    boundaries: {
      x402: "Dry-run HTTP 402 handshake. No settlement transaction is claimed.",
      cctp: "Deterministic USDC CCTP settlement intent. No burn, attestation, or mint transaction is claimed.",
      mcp: "Live local stdio MCP server verified by the official TypeScript SDK.",
      agentSkill: "Portable SKILL.md workflow verified against the local MCP tool names.",
    },
    model: {
      matchId: match.id,
      projection: prediction.projectedScore,
      probabilities: {
        home: prediction.homeWin,
        draw: prediction.draw,
        away: prediction.awayWin,
      },
      probabilityTotal: prediction.homeWin + prediction.draw + prediction.awayWin,
      confidence: prediction.confidence,
      volatility: prediction.volatility,
    },
    x402: {
      request: `GET /api/premium-report/${match.id}`,
      challengeStatus: challengeResponse.status,
      challengeVersion: challenge.x402Version,
      resource: challenge.resource,
      accepts: challenge.accepts,
      paidStatus: paidResponse.status,
      paymentResponseHeader: paidResponse.headers.get("x-payment-response"),
      unlockedHeadline: paid.headline,
    },
    cctp: brief.cctp,
    mcp: {
      sdk: "@modelcontextprotocol/sdk",
      tools: tools.tools.map((tool) => tool.name),
      forecastContentItems: contentLength(mcpForecast),
      briefContentItems: contentLength(mcpBrief),
    },
    agentSkill: {
      path: "agent-skill/SKILL.md",
      workflow: [
        "list_fixtures",
        "forecast_match",
        "build_watch_brief",
        "rank_match_players",
        "get_injective_playbook",
      ],
    },
  };

  const canonical = JSON.stringify(proof, null, 2);
  const envelope = {
    ...proof,
    sha256: createHash("sha256").update(canonical).digest("hex"),
  };
  await mkdir("public/proofs", { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(envelope, null, 2)}\n`);
  console.log(`Wrote ${outputPath}`);
} finally {
  server?.kill("SIGTERM");
}

function contentLength(result: unknown): number {
  if (
    result &&
    typeof result === "object" &&
    "content" in result &&
    Array.isArray((result as { content?: unknown }).content)
  ) {
    return (result as { content: unknown[] }).content.length;
  }
  return 0;
}

async function waitForServer(process: ChildProcess): Promise<void> {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (process.exitCode !== null) throw new Error(`x402 server exited with code ${process.exitCode}`);
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch {
      // Service is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Timed out waiting for x402 proof server");
}
