import { buildWatchBrief, predictMatch } from "../src/forecast";
import { matches } from "../src/data";

const match = matches[0];
const prediction = predictMatch(match);
const brief = buildWatchBrief(match.id);

console.log(`# Cup Signal Agent Demo

Tool: forecast_match
Match: ${prediction.home.name} vs ${prediction.away.name}
Projection: ${prediction.projectedScore[0]}-${prediction.projectedScore[1]}
Confidence: ${Math.round(prediction.confidence * 100)}%

Tool: build_watch_brief
Headline: ${brief.headline}
x402 resource: ${brief.payment.resource}
CCTP memo: ${brief.cctp.memo}

Agent reply:
${brief.freeSummary}
${prediction.recommendedAction}
`);
