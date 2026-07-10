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
  flag: string;
  crest: string;
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

const teamFlags: Partial<Record<TeamCode, string>> = {
  ARG: "/teams/flag-arg.svg",
  ENG: "/teams/flag-eng.svg",
  MEX: "/teams/flag-mex.svg",
};

const teamCrests: Partial<Record<TeamCode, string>> = {
  ARG: "/teams/crest-arg.svg",
  ENG: "/teams/crest-eng.svg",
  MEX: "/teams/crest-mex.svg",
};

function teamFlag(team: TeamCode): string {
  return teamFlags[team] ?? "/teams/flag-mex.svg";
}

function teamCrest(team: TeamCode): string {
  return teamCrests[team] ?? "/teams/crest-mex.svg";
}

const corePlayers: Player[] = [
  {
    id: "eng-09",
    name: "Harry Kane",
    displayName: "Kane",
    team: "ENG",
    number: 9,
    role: "ST",
    side: "away",
    portrait: "/players/generated-web/arg-10-messi-chibi.webp",
    flag: "/teams/flag-eng.svg",
    crest: "/teams/crest-eng.svg",
    baseline: {
      pace: 72,
      finishing: 93,
      chanceCreation: 86,
      passing: 84,
      ballCarry: 78,
      defending: 48,
      pressing: 72,
      aerial: 86,
      stamina: 82,
      composure: 94,
    },
    current: {
      pace: 70,
      finishing: 95,
      chanceCreation: 88,
      passing: 85,
      ballCarry: 77,
      defending: 49,
      pressing: 74,
      aerial: 88,
      stamina: 81,
      composure: 96,
    },
    live: {
      minutes: 64,
      goals: 2,
      assists: 0,
      shots: 5,
      shotsOnTarget: 3,
      xg: 0.92,
      xa: 0.16,
      touches: 42,
      progressivePasses: 4,
      progressiveCarries: 1,
      keyPasses: 1,
      finalThirdEntries: 5,
      successfulDribbles: 1,
      duelsWon: 8,
      tackles: 1,
      interceptions: 0,
      ballRecoveries: 4,
      pressures: 14,
      pressureRegains: 3,
      foulsWon: 2,
      foulsCommitted: 1,
      turnovers: 4,
      distanceKm: 7.7,
      sprintCount: 13,
    },
    form: {
      last5: 89,
      season: 90,
      trend: [7.5, 7.8, 8.1, 7.9, 8.3, 8.7],
      condition: "hot",
      note: "Box touches and penalty-area composure are above baseline; England's clearest finishing edge runs through him.",
    },
    traits: ["box finishing", "drop-link pass", "penalty-area calm"],
    events: [
      { minute: 19, type: "goal", detail: "first-time finish from the penalty spot lane", impact: 0.86 },
      { minute: 43, type: "hold-up", detail: "linked the second runner through central pressure", impact: 0.24 },
      { minute: 71, type: "goal", detail: "late box movement converted England's third", impact: 0.9 },
    ],
  },
  {
    id: "eng-10",
    name: "Jude Bellingham",
    displayName: "Bellingham",
    team: "ENG",
    number: 10,
    role: "AM",
    side: "away",
    portrait: "/players/generated-web/arg-09-alvarez-chibi.webp",
    flag: "/teams/flag-eng.svg",
    crest: "/teams/crest-eng.svg",
    baseline: {
      pace: 82,
      finishing: 86,
      chanceCreation: 88,
      passing: 87,
      ballCarry: 90,
      defending: 76,
      pressing: 88,
      aerial: 80,
      stamina: 91,
      composure: 89,
    },
    current: {
      pace: 83,
      finishing: 88,
      chanceCreation: 91,
      passing: 89,
      ballCarry: 92,
      defending: 78,
      pressing: 91,
      aerial: 81,
      stamina: 92,
      composure: 91,
    },
    live: {
      minutes: 64,
      goals: 0,
      assists: 1,
      shots: 3,
      shotsOnTarget: 1,
      xg: 0.32,
      xa: 0.38,
      touches: 67,
      progressivePasses: 7,
      progressiveCarries: 6,
      keyPasses: 3,
      finalThirdEntries: 9,
      successfulDribbles: 4,
      duelsWon: 9,
      tackles: 3,
      interceptions: 1,
      ballRecoveries: 8,
      pressures: 22,
      pressureRegains: 5,
      foulsWon: 4,
      foulsCommitted: 2,
      turnovers: 5,
      distanceKm: 8.9,
      sprintCount: 19,
    },
    form: {
      last5: 88,
      season: 87,
      trend: [7.2, 7.6, 7.9, 8.0, 8.4, 8.5],
      condition: "hot",
      note: "Pressing return and carry volume are above baseline, feeding England's central chance creation.",
    },
    traits: ["late box surge", "carry through contact", "counter-press trigger"],
    events: [
      { minute: 22, type: "carry", detail: "broke Mexico's second line under contact", impact: 0.24 },
      { minute: 51, type: "assist", detail: "threaded the final pass before England's equalizer", impact: 0.68 },
      { minute: 66, type: "press regain", detail: "forced a rushed clearance into the half-space", impact: 0.2 },
    ],
  },
  {
    id: "eng-07",
    name: "Bukayo Saka",
    displayName: "Saka",
    team: "ENG",
    number: 7,
    role: "W",
    side: "away",
    portrait: "/players/generated-web/arg-24-enzo-chibi.webp",
    flag: "/teams/flag-eng.svg",
    crest: "/teams/crest-eng.svg",
    baseline: {
      pace: 88,
      finishing: 83,
      chanceCreation: 86,
      passing: 84,
      ballCarry: 89,
      defending: 62,
      pressing: 84,
      aerial: 62,
      stamina: 88,
      composure: 86,
    },
    current: {
      pace: 90,
      finishing: 85,
      chanceCreation: 88,
      passing: 85,
      ballCarry: 91,
      defending: 64,
      pressing: 86,
      aerial: 61,
      stamina: 90,
      composure: 87,
    },
    live: {
      minutes: 64,
      goals: 1,
      assists: 0,
      shots: 4,
      shotsOnTarget: 2,
      xg: 0.46,
      xa: 0.24,
      touches: 54,
      progressivePasses: 5,
      progressiveCarries: 7,
      keyPasses: 2,
      finalThirdEntries: 10,
      successfulDribbles: 4,
      duelsWon: 7,
      tackles: 2,
      interceptions: 1,
      ballRecoveries: 6,
      pressures: 18,
      pressureRegains: 3,
      foulsWon: 3,
      foulsCommitted: 1,
      turnovers: 5,
      distanceKm: 8.2,
      sprintCount: 24,
    },
    form: {
      last5: 86,
      season: 85,
      trend: [7.1, 7.3, 7.6, 7.8, 8.0, 8.2],
      condition: "hot",
      note: "Wide isolation output is above baseline; Mexico must double the right channel early.",
    },
    traits: ["right-wing isolation", "cutback timing", "recovery sprint"],
    events: [
      { minute: 33, type: "shot", detail: "inside cut forced a low save", impact: 0.2 },
      { minute: 51, type: "goal", detail: "arrived at the back-post lane for England's second", impact: 0.78 },
      { minute: 63, type: "carry", detail: "pinned the fullback and opened the final-third switch", impact: 0.17 },
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
    portrait: "/players/generated-web/mex-11-gimenez-chibi.webp",
    flag: "/teams/flag-mex.svg",
    crest: "/teams/crest-mex.svg",
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
    portrait: "/players/generated-web/mex-04-edson-chibi.webp",
    flag: "/teams/flag-mex.svg",
    crest: "/teams/crest-mex.svg",
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
      { minute: 44, type: "interception", detail: "read diagonal pass into England's central pocket", impact: 0.23 },
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
    portrait: "/players/generated-web/mex-18-chavez-chibi.webp",
    flag: "/teams/flag-mex.svg",
    crest: "/teams/crest-mex.svg",
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

type ExtraPlayerSeed = {
  id: string;
  name: string;
  displayName: string;
  team: TeamCode;
  side: "home" | "away";
  number: number;
  role: PlayerRole;
  portrait?: string;
  base: PlayerAbility;
  currentLift: Partial<PlayerAbility>;
  statBias: Partial<PlayerLiveStats>;
  condition: PlayerForm["condition"];
  traits: string[];
};

const extraPlayerSeeds: ExtraPlayerSeed[] = [
  {
    id: "eng-01",
    name: "Jordan Pickford",
    displayName: "Pickford",
    team: "ENG",
    side: "away",
    number: 1,
    role: "GK",
    portrait: "/players/generated-web/arg-23-martinez-chibi.webp",
    base: ability(68, 48, 57, 78, 60, 86, 59, 80, 76, 88),
    currentLift: { composure: 2, defending: 2, passing: 1 },
    statBias: { touches: 36, progressivePasses: 5, ballRecoveries: 6, duelsWon: 2, xg: 0, xa: 0.01, turnovers: 2 },
    condition: "stable",
    traits: ["reaction save", "box voice", "long diagonal outlet"],
  },
  {
    id: "eng-05",
    name: "John Stones",
    displayName: "Stones",
    team: "ENG",
    side: "away",
    number: 5,
    role: "CB",
    portrait: "/players/generated-web/arg-13-romero-chibi.webp",
    base: ability(73, 61, 72, 83, 73, 87, 78, 84, 82, 86),
    currentLift: { defending: 2, passing: 2, composure: 1 },
    statBias: { touches: 62, progressivePasses: 6, tackles: 3, interceptions: 2, ballRecoveries: 7, duelsWon: 8, pressures: 11, foulsCommitted: 1 },
    condition: "stable",
    traits: ["line step", "carry from center-back", "aerial control"],
  },
  {
    id: "eng-06",
    name: "Marc Guehi",
    displayName: "Guehi",
    team: "ENG",
    side: "away",
    number: 6,
    role: "CB",
    portrait: "/players/generated-web/arg-03-tagliafico-chibi.webp",
    base: ability(77, 58, 64, 76, 70, 84, 80, 82, 85, 81),
    currentLift: { defending: 2, stamina: 2, pressing: 1 },
    statBias: { touches: 56, progressivePasses: 4, tackles: 3, interceptions: 3, pressures: 13, ballRecoveries: 7, sprintCount: 14 },
    condition: "stable",
    traits: ["recovery cover", "near-post block", "rest-defense spacing"],
  },
  {
    id: "eng-04",
    name: "Declan Rice",
    displayName: "Rice",
    team: "ENG",
    side: "away",
    number: 4,
    role: "DM",
    portrait: "/players/generated-web/arg-07-de-paul-chibi.webp",
    base: ability(78, 72, 80, 86, 80, 86, 88, 78, 91, 86),
    currentLift: { pressing: 3, stamina: 2, passing: 1, defending: 1 },
    statBias: { touches: 72, progressivePasses: 8, keyPasses: 2, tackles: 4, interceptions: 3, ballRecoveries: 10, pressures: 21, pressureRegains: 5 },
    condition: "hot",
    traits: ["midfield screen", "counter press", "diagonal switch"],
  },
  {
    id: "eng-08",
    name: "Phil Foden",
    displayName: "Foden",
    team: "ENG",
    side: "away",
    number: 8,
    role: "AM",
    portrait: "/players/generated-web/arg-20-mac-allister-chibi.webp",
    base: ability(82, 84, 89, 88, 90, 55, 80, 58, 86, 88),
    currentLift: { chanceCreation: 2, composure: 2, ballCarry: 2 },
    statBias: { touches: 61, progressivePasses: 7, keyPasses: 3, finalThirdEntries: 7, xg: 0.18, xa: 0.31, successfulDribbles: 3, turnovers: 4 },
    condition: "hot",
    traits: ["inside pocket", "press escape", "reverse pass"],
  },
  {
    id: "eng-11",
    name: "Marcus Rashford",
    displayName: "Rashford",
    team: "ENG",
    side: "away",
    number: 11,
    role: "W",
    portrait: "/players/generated-web/arg-11-di-maria-chibi.webp",
    base: ability(91, 82, 77, 75, 86, 45, 74, 67, 84, 78),
    currentLift: { pace: 1, finishing: 1, composure: 1 },
    statBias: { touches: 38, shots: 3, shotsOnTarget: 1, xg: 0.24, xa: 0.16, keyPasses: 2, successfulDribbles: 3, sprintCount: 23, turnovers: 5 },
    condition: "stable",
    traits: ["left-channel burst", "direct shot", "back-line pin"],
  },
  {
    id: "eng-18",
    name: "Anthony Gordon",
    displayName: "Gordon",
    team: "ENG",
    side: "away",
    number: 18,
    role: "W",
    portrait: "/players/generated-web/arg-17-garnacho-chibi.webp",
    base: ability(89, 76, 77, 74, 85, 56, 84, 61, 88, 77),
    currentLift: { pace: 2, ballCarry: 2, pressing: 2 },
    statBias: { touches: 31, shots: 2, shotsOnTarget: 1, xg: 0.17, xa: 0.14, successfulDribbles: 3, pressures: 18, sprintCount: 22, turnovers: 5 },
    condition: "hot",
    traits: ["bench acceleration", "left-channel carry", "touchline press"],
  },
  {
    id: "eng-16",
    name: "Kobbie Mainoo",
    displayName: "Mainoo",
    team: "ENG",
    side: "away",
    number: 16,
    role: "CM",
    portrait: "/players/generated-web/arg-06-paredes-chibi.webp",
    base: ability(76, 70, 80, 84, 83, 73, 80, 66, 84, 84),
    currentLift: { passing: 2, composure: 2, ballCarry: 1 },
    statBias: { touches: 52, progressivePasses: 6, keyPasses: 1, tackles: 2, interceptions: 2, ballRecoveries: 6, pressures: 12, turnovers: 2 },
    condition: "stable",
    traits: ["tempo lock", "press escape", "third-man support"],
  },
  {
    id: "mex-13",
    name: "Guillermo Ochoa",
    displayName: "Ochoa",
    team: "MEX",
    side: "home",
    number: 13,
    role: "GK",
    base: ability(62, 48, 55, 70, 58, 84, 52, 78, 72, 88),
    currentLift: { defending: 3, composure: 2 },
    statBias: { touches: 31, progressivePasses: 3, ballRecoveries: 6, duelsWon: 2, xg: 0, xa: 0, turnovers: 1 },
    condition: "hot",
    traits: ["reaction save", "near-post guard", "crowd lift"],
  },
  {
    id: "mex-03",
    name: "Cesar Montes",
    displayName: "Montes",
    team: "MEX",
    side: "home",
    number: 3,
    role: "CB",
    base: ability(66, 57, 60, 71, 62, 82, 75, 86, 80, 75),
    currentLift: { aerial: 2, defending: 2, composure: -1 },
    statBias: { touches: 49, tackles: 3, interceptions: 2, duelsWon: 9, ballRecoveries: 6, pressures: 9, foulsCommitted: 2 },
    condition: "stable",
    traits: ["aerial first contact", "box clearance", "deep block"],
  },
  {
    id: "mex-15",
    name: "Johan Vasquez",
    displayName: "Vasquez",
    team: "MEX",
    side: "home",
    number: 15,
    role: "CB",
    base: ability(70, 58, 62, 72, 66, 80, 78, 81, 82, 74),
    currentLift: { defending: 1, pressing: 2, stamina: 1 },
    statBias: { touches: 53, progressivePasses: 4, tackles: 3, interceptions: 3, ballRecoveries: 7, pressures: 13, duelsWon: 7 },
    condition: "stable",
    traits: ["left channel cover", "recovery run", "diagonal pass"],
  },
  {
    id: "mex-19",
    name: "Jorge Sanchez",
    displayName: "Sanchez",
    team: "MEX",
    side: "home",
    number: 19,
    role: "W",
    base: ability(83, 63, 72, 73, 80, 72, 82, 65, 86, 72),
    currentLift: { pace: 2, pressing: 2, defending: 1 },
    statBias: { touches: 47, progressiveCarries: 5, finalThirdEntries: 6, tackles: 2, pressures: 18, sprintCount: 21, turnovers: 4 },
    condition: "hot",
    traits: ["right-lane burst", "touchline press", "recovery sprint"],
  },
  {
    id: "mex-22",
    name: "Hirving Lozano",
    displayName: "Lozano",
    team: "MEX",
    side: "home",
    number: 22,
    role: "W",
    base: ability(89, 80, 78, 73, 85, 45, 74, 58, 83, 76),
    currentLift: { pace: 1, ballCarry: 2, finishing: -1 },
    statBias: { touches: 42, shots: 3, shotsOnTarget: 1, xg: 0.25, xa: 0.18, successfulDribbles: 4, sprintCount: 24, turnovers: 7 },
    condition: "risk",
    traits: ["inside cut", "transition sprint", "isolation threat"],
  },
  {
    id: "mex-09",
    name: "Raul Jimenez",
    displayName: "Raul",
    team: "MEX",
    side: "home",
    number: 9,
    role: "ST",
    base: ability(70, 80, 76, 75, 70, 55, 70, 84, 76, 82),
    currentLift: { aerial: 1, composure: 1, pace: -2 },
    statBias: { touches: 26, shots: 2, shotsOnTarget: 1, xg: 0.21, xa: 0.08, duelsWon: 5, foulsWon: 2, pressures: 9 },
    condition: "stable",
    traits: ["hold-up wall", "penalty-box feel", "near-post pin"],
  },
  {
    id: "mex-07",
    name: "Uriel Antuna",
    displayName: "Antuna",
    team: "MEX",
    side: "home",
    number: 7,
    role: "W",
    base: ability(86, 70, 73, 71, 82, 55, 78, 59, 85, 72),
    currentLift: { pace: 2, pressing: 2, chanceCreation: 1 },
    statBias: { touches: 36, shots: 2, shotsOnTarget: 1, xg: 0.13, xa: 0.22, keyPasses: 2, successfulDribbles: 2, pressures: 16, sprintCount: 22 },
    condition: "hot",
    traits: ["touchline burst", "low cross", "counter outlet"],
  },
  {
    id: "mex-05",
    name: "Erick Gutierrez",
    displayName: "Gutierrez",
    team: "MEX",
    side: "home",
    number: 5,
    role: "CM",
    base: ability(70, 68, 76, 80, 74, 73, 80, 67, 84, 78),
    currentLift: { passing: 2, stamina: 1, defending: 1 },
    statBias: { touches: 59, progressivePasses: 6, keyPasses: 2, tackles: 2, interceptions: 2, ballRecoveries: 7, pressures: 14, turnovers: 3 },
    condition: "stable",
    traits: ["left-foot recycle", "second-ball cover", "middle-third balance"],
  },
];

const extraPlayers = extraPlayerSeeds.map(makeExtraPlayer);

export const matchPlayers: Player[] = [...corePlayers, ...extraPlayers];

function makeExtraPlayer(seed: ExtraPlayerSeed): Player {
  const current = {
    pace: seed.base.pace + (seed.currentLift.pace ?? 0),
    finishing: seed.base.finishing + (seed.currentLift.finishing ?? 0),
    chanceCreation: seed.base.chanceCreation + (seed.currentLift.chanceCreation ?? 0),
    passing: seed.base.passing + (seed.currentLift.passing ?? 0),
    ballCarry: seed.base.ballCarry + (seed.currentLift.ballCarry ?? 0),
    defending: seed.base.defending + (seed.currentLift.defending ?? 0),
    pressing: seed.base.pressing + (seed.currentLift.pressing ?? 0),
    aerial: seed.base.aerial + (seed.currentLift.aerial ?? 0),
    stamina: seed.base.stamina + (seed.currentLift.stamina ?? 0),
    composure: seed.base.composure + (seed.currentLift.composure ?? 0),
  };
  const live = liveStats(seed.statBias);
  const lastTrend = Number((6.8 + (current.composure + current.stamina + current.pressing) / 90).toFixed(1));
  return {
    ...seed,
    portrait:
      seed.portrait ?? `/players/generated-web/${seed.id}-${seed.displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-chibi.webp`,
    flag: teamFlag(seed.team),
    crest: teamCrest(seed.team),
    baseline: seed.base,
    current,
    live,
    form: {
      last5: clamp(Math.round((current.composure + current.stamina + current.pressing) / 3), 60, 94),
      season: clamp(Math.round((seed.base.composure + seed.base.stamina + seed.base.passing) / 3), 60, 94),
      trend: [lastTrend - 0.7, lastTrend - 0.4, lastTrend - 0.2, lastTrend, lastTrend + 0.1, lastTrend + 0.2],
      condition: seed.condition,
      note: `${seed.displayName} profile: ${seed.traits.join(", ")}.`,
    },
    events: [
      { minute: 12 + (seed.number % 9), type: "touch", detail: `${seed.traits[0]} shaped the next phase`, impact: 0.1 + (seed.number % 4) * 0.03 },
      { minute: 35 + (seed.number % 11), type: "duel", detail: `${seed.traits[1]} changed local momentum`, impact: 0.12 + (seed.number % 3) * 0.04 },
      { minute: 54 + (seed.number % 8), type: "read", detail: `${seed.traits[2]} is the late-match watch item`, impact: 0.09 + (seed.number % 5) * 0.03 },
    ],
  };
}

function ability(
  pace: number,
  finishing: number,
  chanceCreation: number,
  passing: number,
  ballCarry: number,
  defending: number,
  pressing: number,
  aerial: number,
  stamina: number,
  composure: number,
): PlayerAbility {
  return { pace, finishing, chanceCreation, passing, ballCarry, defending, pressing, aerial, stamina, composure };
}

function liveStats(overrides: Partial<PlayerLiveStats>): PlayerLiveStats {
  return {
    minutes: 64,
    goals: 0,
    assists: 0,
    shots: 1,
    shotsOnTarget: 0,
    xg: 0.04,
    xa: 0.06,
    touches: 42,
    progressivePasses: 3,
    progressiveCarries: 1,
    keyPasses: 0,
    finalThirdEntries: 2,
    successfulDribbles: 0,
    duelsWon: 4,
    tackles: 1,
    interceptions: 1,
    ballRecoveries: 4,
    pressures: 8,
    pressureRegains: 1,
    foulsWon: 1,
    foulsCommitted: 1,
    turnovers: 3,
    distanceKm: 7.4,
    sprintCount: 10,
    ...overrides,
  };
}

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
