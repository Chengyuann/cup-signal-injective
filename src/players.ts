import type { TeamCode } from "./types";

export type PlayerRole = "GK" | "CB" | "DM" | "CM" | "AM" | "W" | "ST";
export type RatingMode = "balanced" | "attack" | "defense" | "pressing";
export type WindowKey = "live" | "last5" | "season";

export type PlayerAbility = {
  pace: number;
  finishing: number;
  chanceCreation: number;
  passing: number;
  ballCarry: number;
  defending: number;
  pressing: number;
  aerial: number;
  stamina: number;
  composure: number;
};

export type PlayerLiveStats = {
  minutes: number;
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  xg: number;
  xa: number;
  touches: number;
  progressivePasses: number;
  progressiveCarries: number;
  keyPasses: number;
  finalThirdEntries: number;
  successfulDribbles: number;
  duelsWon: number;
  tackles: number;
  interceptions: number;
  ballRecoveries: number;
  pressures: number;
  pressureRegains: number;
  foulsWon: number;
  foulsCommitted: number;
  turnovers: number;
  distanceKm: number;
  sprintCount: number;
};

export type PlayerForm = {
  last5: number;
  season: number;
  trend: number[];
  condition: "hot" | "stable" | "fatigued" | "risk";
  note: string;
};

export type Player = {
  id: string;
  name: string;
  displayName: string;
  team: TeamCode;
  number: number;
  role: PlayerRole;
  side: "home" | "away";
  portrait: string;
  baseline: PlayerAbility;
  current: PlayerAbility;
  live: PlayerLiveStats;
  form: PlayerForm;
  traits: string[];
  events: { minute: number; type: string; detail: string; impact: number }[];
};

export type PlayerScore = {
  player: Player;
  score: number;
  delta: number;
  grade: string;
  liveImpact: number;
  abilityIndex: number;
  formIndex: number;
  statIndex: number;
  risk: number;
  strengths: string[];
  watchItem: string;
};

export const abilityLabels: { key: keyof PlayerAbility; label: string; short: string }[] = [
  { key: "pace", label: "Pace", short: "PAC" },
  { key: "finishing", label: "Finishing", short: "FIN" },
  { key: "chanceCreation", label: "Creation", short: "CRE" },
  { key: "passing", label: "Passing", short: "PAS" },
  { key: "ballCarry", label: "Carry", short: "CAR" },
  { key: "defending", label: "Defending", short: "DEF" },
  { key: "pressing", label: "Pressing", short: "PRS" },
  { key: "aerial", label: "Aerial", short: "AIR" },
  { key: "stamina", label: "Stamina", short: "STA" },
  { key: "composure", label: "Composure", short: "CMP" },
];

export const matchPlayers: Player[] = [
  {
    id: "arg-10",
    name: "Lionel Messi",
    displayName: "Messi",
    team: "ARG",
    number: 10,
    role: "AM",
    side: "away",
    portrait: "/players/argentina-playmaker-chibi.png",
    baseline: {
      pace: 78,
      finishing: 93,
      chanceCreation: 96,
      passing: 94,
      ballCarry: 92,
      defending: 36,
      pressing: 58,
      aerial: 45,
      stamina: 76,
      composure: 97,
    },
    current: {
      pace: 75,
      finishing: 91,
      chanceCreation: 98,
      passing: 95,
      ballCarry: 90,
      defending: 38,
      pressing: 61,
      aerial: 43,
      stamina: 73,
      composure: 98,
    },
    live: {
      minutes: 64,
      goals: 0,
      assists: 1,
      shots: 3,
      shotsOnTarget: 2,
      xg: 0.48,
      xa: 0.42,
      touches: 58,
      progressivePasses: 8,
      progressiveCarries: 5,
      keyPasses: 4,
      finalThirdEntries: 7,
      successfulDribbles: 3,
      duelsWon: 5,
      tackles: 1,
      interceptions: 0,
      ballRecoveries: 3,
      pressures: 8,
      pressureRegains: 2,
      foulsWon: 3,
      foulsCommitted: 1,
      turnovers: 5,
      distanceKm: 7.2,
      sprintCount: 11,
    },
    form: {
      last5: 88,
      season: 91,
      trend: [7.6, 8.1, 7.9, 8.4, 8.0, 8.6],
      condition: "hot",
      note: "Chance volume is still elite; sprint load is managed, so watch his late-game burst timing.",
    },
    traits: ["left-foot creation", "half-space pause", "late box entry"],
    events: [
      { minute: 18, type: "key pass", detail: "split Mexico's midfield line", impact: 0.28 },
      { minute: 39, type: "assist", detail: "cutback into the penalty spot", impact: 0.72 },
      { minute: 57, type: "shot", detail: "curling effort saved near post", impact: 0.2 },
    ],
  },
  {
    id: "arg-09",
    name: "Julian Alvarez",
    displayName: "Alvarez",
    team: "ARG",
    number: 9,
    role: "ST",
    side: "away",
    portrait: "/players/julian-alvarez-chibi.png",
    baseline: {
      pace: 84,
      finishing: 86,
      chanceCreation: 79,
      passing: 78,
      ballCarry: 82,
      defending: 55,
      pressing: 91,
      aerial: 69,
      stamina: 89,
      composure: 83,
    },
    current: {
      pace: 86,
      finishing: 88,
      chanceCreation: 82,
      passing: 80,
      ballCarry: 83,
      defending: 58,
      pressing: 94,
      aerial: 70,
      stamina: 91,
      composure: 85,
    },
    live: {
      minutes: 64,
      goals: 1,
      assists: 0,
      shots: 4,
      shotsOnTarget: 2,
      xg: 0.71,
      xa: 0.09,
      touches: 36,
      progressivePasses: 3,
      progressiveCarries: 2,
      keyPasses: 1,
      finalThirdEntries: 5,
      successfulDribbles: 1,
      duelsWon: 7,
      tackles: 2,
      interceptions: 1,
      ballRecoveries: 5,
      pressures: 24,
      pressureRegains: 6,
      foulsWon: 2,
      foulsCommitted: 2,
      turnovers: 4,
      distanceKm: 8.1,
      sprintCount: 22,
    },
    form: {
      last5: 84,
      season: 82,
      trend: [7.0, 7.2, 7.4, 7.7, 7.9, 8.3],
      condition: "hot",
      note: "Pressing return is above baseline and directly feeds Argentina's second-ball control.",
    },
    traits: ["counter-press trigger", "near-post runs", "second-ball hunting"],
    events: [
      { minute: 23, type: "press regain", detail: "forced rushed clearance", impact: 0.19 },
      { minute: 39, type: "goal", detail: "first-time finish from central cutback", impact: 0.83 },
      { minute: 61, type: "duel", detail: "won aerial outlet under pressure", impact: 0.12 },
    ],
  },
  {
    id: "arg-24",
    name: "Enzo Fernandez",
    displayName: "Enzo",
    team: "ARG",
    number: 24,
    role: "CM",
    side: "away",
    portrait: "/players/player-placeholder-chibi.png",
    baseline: {
      pace: 70,
      finishing: 72,
      chanceCreation: 84,
      passing: 88,
      ballCarry: 79,
      defending: 77,
      pressing: 81,
      aerial: 67,
      stamina: 86,
      composure: 85,
    },
    current: {
      pace: 71,
      finishing: 71,
      chanceCreation: 85,
      passing: 90,
      ballCarry: 80,
      defending: 78,
      pressing: 83,
      aerial: 66,
      stamina: 87,
      composure: 86,
    },
    live: {
      minutes: 64,
      goals: 0,
      assists: 0,
      shots: 1,
      shotsOnTarget: 0,
      xg: 0.06,
      xa: 0.18,
      touches: 71,
      progressivePasses: 9,
      progressiveCarries: 3,
      keyPasses: 2,
      finalThirdEntries: 8,
      successfulDribbles: 1,
      duelsWon: 6,
      tackles: 3,
      interceptions: 2,
      ballRecoveries: 8,
      pressures: 14,
      pressureRegains: 3,
      foulsWon: 1,
      foulsCommitted: 1,
      turnovers: 3,
      distanceKm: 8.5,
      sprintCount: 14,
    },
    form: {
      last5: 80,
      season: 83,
      trend: [7.1, 7.3, 7.0, 7.6, 7.5, 7.8],
      condition: "stable",
      note: "Passing load is high without hurting turnover control.",
    },
    traits: ["switch pass", "rest-defense anchor", "tempo reset"],
    events: [
      { minute: 11, type: "progressive pass", detail: "released right winger behind fullback", impact: 0.17 },
      { minute: 46, type: "interception", detail: "blocked central counter lane", impact: 0.16 },
      { minute: 63, type: "switch", detail: "changed attack point under pressure", impact: 0.14 },
    ],
  },
  {
    id: "mex-11",
    name: "Santiago Gimenez",
    displayName: "Gimenez",
    team: "MEX",
    number: 11,
    role: "ST",
    side: "home",
    portrait: "/players/santiago-gimenez-chibi.png",
    baseline: {
      pace: 78,
      finishing: 84,
      chanceCreation: 72,
      passing: 70,
      ballCarry: 74,
      defending: 46,
      pressing: 78,
      aerial: 83,
      stamina: 82,
      composure: 79,
    },
    current: {
      pace: 80,
      finishing: 86,
      chanceCreation: 73,
      passing: 71,
      ballCarry: 75,
      defending: 48,
      pressing: 81,
      aerial: 85,
      stamina: 84,
      composure: 82,
    },
    live: {
      minutes: 64,
      goals: 1,
      assists: 0,
      shots: 5,
      shotsOnTarget: 3,
      xg: 0.77,
      xa: 0.05,
      touches: 31,
      progressivePasses: 1,
      progressiveCarries: 2,
      keyPasses: 0,
      finalThirdEntries: 4,
      successfulDribbles: 1,
      duelsWon: 8,
      tackles: 1,
      interceptions: 0,
      ballRecoveries: 2,
      pressures: 18,
      pressureRegains: 4,
      foulsWon: 3,
      foulsCommitted: 2,
      turnovers: 6,
      distanceKm: 7.6,
      sprintCount: 18,
    },
    form: {
      last5: 82,
      season: 80,
      trend: [6.8, 7.1, 7.5, 7.4, 7.9, 8.2],
      condition: "hot",
      note: "Box presence and aerial wins are running above normal level.",
    },
    traits: ["back-post header", "box pin", "first-contact target"],
    events: [
      { minute: 7, type: "shot", detail: "near-post run, keeper save", impact: 0.19 },
      { minute: 28, type: "goal", detail: "header from left-side delivery", impact: 0.81 },
      { minute: 52, type: "foul won", detail: "held long outlet under pressure", impact: 0.12 },
    ],
  },
  {
    id: "mex-04",
    name: "Edson Alvarez",
    displayName: "Edson",
    team: "MEX",
    number: 4,
    role: "DM",
    side: "home",
    portrait: "/players/edson-alvarez-chibi.png",
    baseline: {
      pace: 67,
      finishing: 58,
      chanceCreation: 68,
      passing: 77,
      ballCarry: 66,
      defending: 86,
      pressing: 83,
      aerial: 84,
      stamina: 87,
      composure: 78,
    },
    current: {
      pace: 66,
      finishing: 57,
      chanceCreation: 66,
      passing: 74,
      ballCarry: 64,
      defending: 89,
      pressing: 86,
      aerial: 86,
      stamina: 85,
      composure: 77,
    },
    live: {
      minutes: 64,
      goals: 0,
      assists: 0,
      shots: 1,
      shotsOnTarget: 0,
      xg: 0.05,
      xa: 0.11,
      touches: 62,
      progressivePasses: 5,
      progressiveCarries: 1,
      keyPasses: 1,
      finalThirdEntries: 2,
      successfulDribbles: 0,
      duelsWon: 9,
      tackles: 5,
      interceptions: 3,
      ballRecoveries: 10,
      pressures: 17,
      pressureRegains: 5,
      foulsWon: 1,
      foulsCommitted: 3,
      turnovers: 4,
      distanceKm: 8.3,
      sprintCount: 12,
    },
    form: {
      last5: 79,
      season: 81,
      trend: [7.4, 7.6, 7.3, 7.8, 7.7, 7.9],
      condition: "stable",
      note: "Defensive actions are above average, but foul risk is creeping up.",
    },
    traits: ["screening", "aerial duel", "counter stop"],
    events: [
      { minute: 20, type: "tackle", detail: "stopped central carry before box", impact: 0.22 },
      { minute: 44, type: "interception", detail: "read diagonal pass into Messi zone", impact: 0.23 },
      { minute: 59, type: "foul", detail: "late challenge near half-space", impact: -0.13 },
    ],
  },
  {
    id: "mex-18",
    name: "Luis Chavez",
    displayName: "Chavez",
    team: "MEX",
    number: 18,
    role: "CM",
    side: "home",
    portrait: "/players/player-placeholder-chibi.png",
    baseline: {
      pace: 72,
      finishing: 74,
      chanceCreation: 77,
      passing: 81,
      ballCarry: 73,
      defending: 72,
      pressing: 79,
      aerial: 64,
      stamina: 86,
      composure: 76,
    },
    current: {
      pace: 73,
      finishing: 76,
      chanceCreation: 80,
      passing: 83,
      ballCarry: 75,
      defending: 73,
      pressing: 82,
      aerial: 64,
      stamina: 88,
      composure: 78,
    },
    live: {
      minutes: 64,
      goals: 0,
      assists: 1,
      shots: 2,
      shotsOnTarget: 1,
      xg: 0.16,
      xa: 0.33,
      touches: 66,
      progressivePasses: 7,
      progressiveCarries: 4,
      keyPasses: 3,
      finalThirdEntries: 7,
      successfulDribbles: 2,
      duelsWon: 5,
      tackles: 2,
      interceptions: 1,
      ballRecoveries: 7,
      pressures: 16,
      pressureRegains: 4,
      foulsWon: 2,
      foulsCommitted: 1,
      turnovers: 5,
      distanceKm: 8.7,
      sprintCount: 15,
    },
    form: {
      last5: 81,
      season: 78,
      trend: [6.9, 7.2, 7.1, 7.6, 7.8, 8.1],
      condition: "hot",
      note: "Delivery quality is up; he is Mexico's main chance stabilizer.",
    },
    traits: ["left-foot delivery", "late run", "tempo pass"],
    events: [
      { minute: 28, type: "assist", detail: "early cross to far-post header", impact: 0.7 },
      { minute: 36, type: "key pass", detail: "slipped runner through right channel", impact: 0.18 },
      { minute: 55, type: "pressure regain", detail: "won second ball after corner", impact: 0.11 },
    ],
  },
];

const modeWeights: Record<RatingMode, Partial<Record<keyof PlayerAbility, number>>> = {
  balanced: {
    finishing: 0.12,
    chanceCreation: 0.13,
    passing: 0.12,
    ballCarry: 0.1,
    defending: 0.1,
    pressing: 0.11,
    aerial: 0.07,
    stamina: 0.09,
    composure: 0.12,
    pace: 0.04,
  },
  attack: {
    finishing: 0.2,
    chanceCreation: 0.18,
    passing: 0.13,
    ballCarry: 0.14,
    pace: 0.08,
    pressing: 0.06,
    stamina: 0.06,
    composure: 0.11,
    aerial: 0.04,
  },
  defense: {
    defending: 0.24,
    pressing: 0.16,
    aerial: 0.13,
    passing: 0.1,
    stamina: 0.13,
    composure: 0.1,
    pace: 0.06,
    ballCarry: 0.04,
    chanceCreation: 0.04,
  },
  pressing: {
    pressing: 0.25,
    stamina: 0.18,
    pace: 0.11,
    defending: 0.14,
    ballCarry: 0.06,
    passing: 0.08,
    composure: 0.07,
    chanceCreation: 0.06,
    finishing: 0.05,
  },
};

export function abilityAverage(ability: PlayerAbility, mode: RatingMode = "balanced"): number {
  const weights = modeWeights[mode];
  const entries = Object.entries(weights) as [keyof PlayerAbility, number][];
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  return entries.reduce((sum, [key, weight]) => sum + ability[key] * (weight / total), 0);
}

export function scorePlayer(player: Player, mode: RatingMode = "balanced", window: WindowKey = "live"): PlayerScore {
  const abilityIndex = abilityAverage(player.current, mode);
  const baselineIndex = abilityAverage(player.baseline, mode);
  const formIndex = window === "season" ? player.form.season : window === "last5" ? player.form.last5 : player.form.last5 * 0.64 + player.form.trend.at(-1)! * 10 * 0.36;
  const statIndex = liveStatIndex(player, mode);
  const risk = riskIndex(player);
  const liveImpact = statIndex * 0.42 + formIndex * 0.22 + abilityIndex * 0.36 - risk * 0.08;
  const score = clamp(5.4 + (liveImpact - 45) / 6.2, 4.8, 9.8);
  const delta = abilityIndex - baselineIndex;
  return {
    player,
    score,
    delta,
    grade: grade(score),
    liveImpact,
    abilityIndex,
    formIndex,
    statIndex,
    risk,
    strengths: topStrengths(player, mode),
    watchItem: watchItem(player, delta, risk),
  };
}

export function scorePlayers(mode: RatingMode = "balanced", window: WindowKey = "live"): PlayerScore[] {
  return matchPlayers.map((player) => scorePlayer(player, mode, window)).sort((a, b) => b.score - a.score);
}

function liveStatIndex(player: Player, mode: RatingMode): number {
  const s = player.live;
  const attacking =
    s.goals * 18 +
    s.assists * 14 +
    s.xg * 12 +
    s.xa * 10 +
    s.shotsOnTarget * 3.1 +
    s.keyPasses * 3 +
    s.finalThirdEntries * 1.4 +
    s.successfulDribbles * 2.2 +
    s.progressiveCarries * 1.2 +
    s.progressivePasses * 1.1;
  const defending = s.tackles * 3.2 + s.interceptions * 3.4 + s.ballRecoveries * 1.6 + s.duelsWon * 1.35 + s.pressureRegains * 2.4;
  const pressing = s.pressures * 0.9 + s.pressureRegains * 3 + s.distanceKm * 2.2 + s.sprintCount * 0.52;
  const control = s.touches * 0.18 + s.progressivePasses * 1.6 + s.turnovers * -1.7 + s.foulsWon * 1.1 + s.foulsCommitted * -1.0;
  const raw =
    mode === "attack"
      ? attacking * 0.58 + control * 0.2 + pressing * 0.12 + defending * 0.1
      : mode === "defense"
        ? defending * 0.54 + pressing * 0.2 + control * 0.18 + attacking * 0.08
        : mode === "pressing"
          ? pressing * 0.5 + defending * 0.2 + control * 0.15 + attacking * 0.15
          : attacking * 0.34 + defending * 0.24 + pressing * 0.2 + control * 0.22;
  return clamp(raw, 42, 98);
}

function riskIndex(player: Player): number {
  const s = player.live;
  const fatigue = Math.max(0, s.distanceKm - 7.9) * 8 + Math.max(0, s.sprintCount - 18) * 0.8;
  const discipline = s.foulsCommitted * 5.5;
  const possession = s.turnovers * 2.4;
  return clamp(fatigue + discipline + possession, 8, 68);
}

function topStrengths(player: Player, mode: RatingMode): string[] {
  const ability = player.current;
  const ranked = abilityLabels
    .map((item) => ({ ...item, value: ability[item.key], delta: ability[item.key] - player.baseline[item.key] }))
    .sort((a, b) => b.value + b.delta * 1.4 - (a.value + a.delta * 1.4));
  const stat =
    mode === "defense"
      ? `${player.live.tackles + player.live.interceptions} stop actions`
      : mode === "pressing"
        ? `${player.live.pressures} pressures`
        : `${(player.live.xg + player.live.xa).toFixed(2)} xG+xA`;
  return [ranked[0].label, ranked[1].label, stat];
}

function watchItem(player: Player, delta: number, risk: number): string {
  if (risk > 52) return `${player.displayName} is productive but risk is high; watch fouls and late sprints.`;
  if (delta > 2.4) return `${player.displayName} is playing above baseline; keep feeding the current role.`;
  if (delta < -2.4) return `${player.displayName} is below normal ability level; simplify touches for five minutes.`;
  return `${player.displayName} is close to normal level; next event likely comes from role fit, not raw form.`;
}

function grade(score: number): string {
  if (score >= 9) return "S";
  if (score >= 8.2) return "A";
  if (score >= 7.4) return "B+";
  if (score >= 6.7) return "B";
  return "C";
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
