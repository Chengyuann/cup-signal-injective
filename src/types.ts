export type TeamCode =
  | "ARG"
  | "BRA"
  | "FRA"
  | "ENG"
  | "ESP"
  | "GER"
  | "POR"
  | "NED"
  | "USA"
  | "MEX"
  | "JPN"
  | "MAR";

export type Team = {
  code: TeamCode;
  name: string;
  group: string;
  confederation: string;
  fifaRank: number;
  attack: number;
  defense: number;
  tempo: number;
  setPieces: number;
  depth: number;
  homeTravel: number;
  pressure: number;
  fanMood: number;
  note: string;
};

export type MatchStatus = "upcoming" | "live" | "final";

export type Match = {
  id: string;
  round: string;
  venue: string;
  kickoffLocal: string;
  home: TeamCode;
  away: TeamCode;
  status: MatchStatus;
  minute?: number;
  homeGoals?: number;
  awayGoals?: number;
  xgHome: number;
  xgAway: number;
  shotPressureHome: number;
  shotPressureAway: number;
  weather: "dry" | "humid" | "rain" | "indoor";
  liveDataSource: string;
};

export type WeightKey = "form" | "attack" | "defense" | "pressure" | "travel";

export type Weights = Record<WeightKey, number>;

export type Prediction = {
  match: Match;
  home: Team;
  away: Team;
  homeWin: number;
  draw: number;
  awayWin: number;
  projectedScore: [number, number];
  edge: "home" | "away" | "draw";
  confidence: number;
  volatility: number;
  recommendedAction: string;
  tacticalRead: string[];
  fanUtility: string[];
};

export type WatchBrief = {
  matchId: string;
  headline: string;
  freeSummary: string;
  premiumReport: string[];
  payment: {
    protocol: "x402";
    price: string;
    network: string;
    receiver: string;
    resource: string;
  };
  cctp: {
    source: string;
    destination: string;
    token: "USDC";
    memo: string;
  };
};
