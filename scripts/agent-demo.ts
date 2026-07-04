import { buildWatchBrief, predictMatch } from "../src/forecast";
import { matches } from "../src/data";
import { scorePlayers } from "../src/players";

const match = matches[0];
const prediction = predictMatch(match);
const brief = buildWatchBrief(match.id);
const topPlayers = scorePlayers("balanced", "live").slice(0, 3);

console.log(`# Cup Signal Agent Demo

Tool: forecast_match
Match: ${prediction.home.name} vs ${prediction.away.name}
Projection: ${prediction.projectedScore[0]}-${prediction.projectedScore[1]}
Confidence: ${Math.round(prediction.confidence * 100)}%

Tool: build_watch_brief
Headline: ${brief.headline}
x402 resource: ${brief.payment.resource}
CCTP memo: ${brief.cctp.memo}

Tool: rank_match_players
Top players:
${topPlayers.map((score, index) => `${index + 1}. ${score.player.displayName} ${score.score.toFixed(2)} (${score.grade}), delta ${score.delta > 0 ? "+" : ""}${score.delta.toFixed(1)}`).join("\n")}

Agent reply:
${brief.freeSummary}
${prediction.recommendedAction}
`);
