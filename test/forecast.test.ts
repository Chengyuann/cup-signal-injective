import assert from "node:assert/strict";
import test from "node:test";
import { defaultWeights, matches } from "../src/data";
import { buildWatchBrief, predictMatch, weightedRating } from "../src/forecast";

test("prediction probabilities remain normalized", () => {
  for (const match of matches) {
    const prediction = predictMatch(match);
    const total = prediction.homeWin + prediction.draw + prediction.awayWin;

    assert.ok(Math.abs(total - 1) < 1e-9);
    assert.ok(prediction.confidence >= 0 && prediction.confidence <= 1);
    assert.ok(prediction.volatility >= 18 && prediction.volatility <= 91);
  }
});

test("weighted ratings are finite with the default model", () => {
  const prediction = predictMatch(matches[0]);

  assert.ok(Number.isFinite(weightedRating(prediction.home, defaultWeights)));
  assert.ok(Number.isFinite(weightedRating(prediction.away, defaultWeights)));
});

test("watch brief exposes x402 and CCTP intent without settlement claims", () => {
  const brief = buildWatchBrief("cup-001");

  assert.equal(brief.payment.protocol, "x402");
  assert.equal(brief.cctp.token, "USDC");
  assert.match(brief.cctp.memo, /^cup-signal:/);
  assert.match(brief.payment.resource, /^\/api\/premium-report\//);
});
