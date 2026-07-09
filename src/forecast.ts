import { defaultWeights, matches, teamByCode } from "./data";
import type { Match, Prediction, Team, WatchBrief, Weights } from "./types";

const weightKeys = Object.keys(defaultWeights) as (keyof Weights)[];

export function weightedRating(team: Team, weights: Weights = defaultWeights): number {
  const total = weightKeys.reduce((sum, key) => sum + weights[key], 0);
  const travelScore = team.homeTravel;
  const formScore = (team.tempo + team.fanMood + team.depth) / 3;
  const dimensions: Record<keyof Weights, number> = {
    form: formScore,
    attack: team.attack,
    defense: team.defense,
    pressure: team.pressure,
    travel: travelScore,
  };
  return weightKeys.reduce((sum, key) => sum + dimensions[key] * (weights[key] / total), 0);
}

function sigmoid(value: number): number {
  return 1 / (1 + Math.exp(-value));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function predictMatch(match: Match, weights: Weights = defaultWeights): Prediction {
  const home = teamByCode(match.home);
  const away = teamByCode(match.away);
  const homeRating = weightedRating(home, weights);
  const awayRating = weightedRating(away, weights);
  const liveTilt =
    match.status === "live"
      ? (match.shotPressureHome - match.shotPressureAway) * 0.045 +
        ((match.homeGoals ?? 0) - (match.awayGoals ?? 0)) * 0.42
      : 0;
  const xgTilt = (match.xgHome - match.xgAway) * 0.18;
  const weatherDrag = match.weather === "humid" ? -0.08 : match.weather === "rain" ? -0.04 : 0.02;
  const homeLogit = (homeRating - awayRating) * 0.13 + liveTilt + xgTilt + weatherDrag;
  const rawHome = sigmoid(homeLogit);
  const draw = clamp(0.26 - Math.abs(rawHome - 0.5) * 0.18 + (match.status === "live" ? 0.03 : 0), 0.12, 0.31);
  const homeWin = clamp(rawHome * (1 - draw), 0.05, 0.9);
  const awayWin = clamp(1 - homeWin - draw, 0.05, 0.9);
  const projectedScore = projectScore(match, homeWin, awayWin);
  const edge = Math.max(homeWin, draw, awayWin) === draw ? "draw" : homeWin > awayWin ? "home" : "away";
  const confidence = Math.max(homeWin, draw, awayWin);
  const volatility = clamp(
    100 - Math.abs(homeRating - awayRating) * 3 + Math.abs(match.shotPressureHome - match.shotPressureAway) * 0.3,
    18,
    91,
  );

  return {
    match,
    home,
    away,
    homeWin,
    draw,
    awayWin,
    projectedScore,
    edge,
    confidence,
    volatility,
    recommendedAction: makeAction(match, edge, volatility, home, away),
    tacticalRead: makeTacticalRead(match, home, away, homeRating, awayRating),
    fanUtility: makeFanUtility(match, edge, home, away),
  };
}

function projectScore(match: Match, homeWin: number, awayWin: number): [number, number] {
  const liveHome = match.homeGoals ?? 0;
  const liveAway = match.awayGoals ?? 0;
  const hasActualScore = match.status === "live" || match.status === "final";
  const baselineHome = hasActualScore ? liveHome : Math.round(match.xgHome);
  const baselineAway = hasActualScore ? liveAway : Math.round(match.xgAway);
  if (match.status === "final") return [baselineHome, baselineAway];
  const homeAdd = homeWin > 0.48 ? 1 : homeWin < 0.28 ? 0 : match.xgHome > 1.55 ? 1 : 0;
  const awayAdd = awayWin > 0.48 ? 1 : awayWin < 0.28 ? 0 : match.xgAway > 1.55 ? 1 : 0;
  return [clamp(baselineHome + homeAdd, 0, 4), clamp(baselineAway + awayAdd, 0, 4)];
}

function makeAction(match: Match, edge: Prediction["edge"], volatility: number, home: Team, away: Team): string {
  if (match.status === "live" && volatility > 70) {
    return "Wait five minutes before posting a public call; live pressure is swinging too fast.";
  }
  if (edge === "draw") {
    return "Frame the watch party around exact-score guesses instead of winner picks.";
  }
  const team = edge === "home" ? home : away;
  return `Use ${team.name} as the main pick, but pair it with a risk note instead of a hard guarantee.`;
}

function makeTacticalRead(match: Match, home: Team, away: Team, homeRating: number, awayRating: number): string[] {
  const leader = homeRating >= awayRating ? home : away;
  const trailer = leader === home ? away : home;
  return [
    `${leader.name} has the cleaner weighted profile at ${homeRating >= awayRating ? homeRating.toFixed(1) : awayRating.toFixed(1)}.`,
    `${trailer.name} can flip the read if set pieces create an early xG spike.`,
    `Live pressure index is ${match.shotPressureHome}-${match.shotPressureAway}, so the next substitution window matters more than possession share.`,
  ];
}

function makeFanUtility(match: Match, edge: Prediction["edge"], home: Team, away: Team): string[] {
  const winnerName = edge === "draw" ? "both sides" : edge === "home" ? home.name : away.name;
  return [
    `Group chat prompt: ask friends for a ${winnerName} result plus one scorer before kickoff.`,
    "Premium brief can be unlocked as a paid x402 resource for watch-party hosts.",
    `If using live comments for the Injective Global Cup points race, capture this match panel during ${match.kickoffLocal}.`,
  ];
}

export function buildPredictions(weights: Weights = defaultWeights): Prediction[] {
  return matches.map((match) => predictMatch(match, weights));
}

export function buildWatchBrief(matchId: string, weights: Weights = defaultWeights): WatchBrief {
  const prediction = predictMatch(
    matches.find((match) => match.id === matchId) ?? matches[0],
    weights,
  );
  const leader = prediction.edge === "away" ? prediction.away : prediction.home;
  const [homeGoals, awayGoals] = prediction.projectedScore;
  const scoreKind = prediction.match.status === "final" ? "final result" : "projection";
  return {
    matchId: prediction.match.id,
    headline: `${prediction.home.name} vs ${prediction.away.name}: ${leader.name} carries the sharper live edge`,
    freeSummary: `${prediction.home.name} ${homeGoals}-${awayGoals} ${prediction.away.name} ${scoreKind}, confidence ${Math.round(
      prediction.confidence * 100,
    )} percent, volatility ${Math.round(prediction.volatility)}.`,
    premiumReport: [
      ...prediction.tacticalRead,
      ...prediction.fanUtility,
      `Payment unlock path: x402 protects /api/premium-report/${prediction.match.id}; CCTP note prepares USDC settlement from Base testnet to Injective testnet.`,
    ],
    payment: {
      protocol: "x402",
      price: "$0.10",
      network: "base-sepolia",
      receiver: "0x0000000000000000000000000000000000004020",
      resource: `/api/premium-report/${prediction.match.id}`,
    },
    cctp: {
      source: "Base Sepolia",
      destination: "Injective testnet",
      token: "USDC",
      memo: `cup-signal:${prediction.match.id}:watch-brief`,
    },
  };
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}
