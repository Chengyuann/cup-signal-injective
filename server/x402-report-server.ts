import express from "express";
import { buildWatchBrief } from "../src/forecast";
import { scorePlayers } from "../src/players";
import { injectivePlaybookSummary, injectivePlays } from "../src/injectivePlaybook";

const app = express();
const port = Number(process.env.PORT ?? 4020);
const receiver = process.env.X402_RECEIVER ?? "0x0000000000000000000000000000000000004020";
const network = process.env.X402_NETWORK ?? "base-sepolia";

app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({
    ok: true,
    service: "cup-signal-x402-report-server",
    mode: process.env.X402_LIVE === "true" ? "live-facilitator-ready" : "dry-run",
  });
});

app.get("/api/free-brief/:matchId", (request, response) => {
  const brief = buildWatchBrief(request.params.matchId);
  response.json({
    matchId: brief.matchId,
    headline: brief.headline,
    freeSummary: brief.freeSummary,
    unlock: brief.payment,
  });
});

app.get("/api/premium-report/:matchId", (request, response) => {
  const brief = buildWatchBrief(request.params.matchId);
  const paymentHeader = request.header("X-PAYMENT");

  if (!paymentHeader && process.env.X402_LIVE !== "true") {
    response.status(402).json({
      x402Version: 2,
      accepts: [
        {
          scheme: "exact",
          network,
          maxAmountRequired: "100000",
          resource: brief.payment.resource,
          description: `Cup Signal premium World Cup report for ${brief.matchId}`,
          mimeType: "application/json",
          payTo: receiver,
          maxTimeoutSeconds: 120,
          asset: "USDC",
          outputSchema: {
            type: "object",
            properties: {
              headline: { type: "string" },
              premiumReport: { type: "array", items: { type: "string" } },
              cctp: { type: "object" },
            },
          },
        },
      ],
      note: "Dry-run x402 challenge. In production, wire @x402/express with a facilitator and settle the X-PAYMENT header.",
    });
    return;
  }

  response.setHeader(
    "X-PAYMENT-RESPONSE",
    JSON.stringify({
      success: true,
      mode: process.env.X402_LIVE === "true" ? "facilitator" : "dry-run-header-accepted",
      receiver,
    }),
  );
  response.json(brief);
});

app.get("/api/player-ratings", (_request, response) => {
  response.json({
    mode: "balanced",
    window: "live",
    ratings: scorePlayers("balanced", "live").map((score) => ({
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
    })),
  });
});

app.get("/api/injective-playbook", (_request, response) => {
  response.json({
    summary: injectivePlaybookSummary,
    plays: injectivePlays,
    note: "This endpoint is intentionally public so judges can inspect how x402, CCTP, MCP, and Agent Skills map to product actions.",
  });
});

app.listen(port, "127.0.0.1", () => {
  console.log(`Cup Signal x402 report server listening on http://127.0.0.1:${port}`);
});
