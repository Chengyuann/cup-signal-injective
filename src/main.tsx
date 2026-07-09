import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  BarChart3,
  Bot,
  CheckCircle2,
  CircleDollarSign,
  Crosshair,
  FileJson,
  GitBranch,
  Gauge,
  LineChart,
  Medal,
  Radio,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trophy,
  WalletCards,
} from "lucide-react";
import { defaultWeights, eventSnapshot, matches } from "./data";
import { buildPredictions, buildWatchBrief, formatPercent } from "./forecast";
import { abilityLabels, scorePlayers, type PlayerScore, type RatingMode, type WindowKey } from "./players";
import type { Prediction, WeightKey, Weights } from "./types";
import { worldCupGroups, worldCupMatches, worldCupSource, worldCupStadiums, worldCupTeams, type WorldCupGroup, type WorldCupMatch, type WorldCupStadium, type WorldCupTeam } from "./worldcupData";
import { injectivePlaybookSummary, injectivePlays, type InjectivePlay } from "./injectivePlaybook";
import "./styles.css";

const weightLabels: Record<WeightKey, string> = {
  form: "Form",
  attack: "Attack",
  defense: "Defense",
  pressure: "Pressure",
  travel: "Travel",
};

type Lang = "en" | "zh";
type RefreshState = "idle" | "loading" | "success" | "error";
type WorldCupRuntimeData = {
  teams: WorldCupTeam[];
  groups: WorldCupGroup[];
  matches: WorldCupMatch[];
  stadiums: WorldCupStadium[];
  source: Record<string, string>;
  updatedAt: string;
  mode: "snapshot" | "live-browser";
  error?: string;
};

const copy = {
  en: {
    playbookTitle: "Four technical hooks, four matchday actions",
    playbookBody:
      "x402 gates paid scout intel, CCTP frames a USDC fan pool, MCP Server hands match data to agents, and Agent Skills turn live football context into a repeatable posting workflow.",
    realTitle: "Real World Cup 2026 data is wired in",
    realBody:
      "The data layer uses openfootball/worldcup and rezarahiminia/worldcup2026: 48 teams, 12 groups, 72 group-stage matches, 32 knockout slots, and 16 stadiums.",
    playerTitle: "Live player ratings, form state, and ability deltas",
    playerBody:
      "The board combines match events, xG/xA, pressing, defensive actions, running load, and pre-match ability into a rating. Change the mode and the radar, ranking, risk note, and star card update together.",
    motionTitle: "Match momentum as a moving data scene",
    motionBody:
      "Pitch routes, live rankings, player portraits, and Injective payment nodes share one animated canvas. It shows who is creating edge, where the ball is moving, and which panel is worth capturing next.",
    langButton: "ZH",
    langLabel: "Language",
    refreshIdle: "Refresh Live Data",
    refreshLoading: "Updating...",
    refreshSuccess: "Live data updated",
    refreshError: "Live API unavailable",
  },
  zh: {
    playbookTitle: "四个技术点不是贴标签，而是观赛动作",
    playbookBody:
      "x402 负责付费情报，CCTP 负责 USDC 球迷奖池，MCP Server 负责把数据交给 Agent，Agent Skill 负责把实时赛事转成可发帖的操作流。",
    realTitle: "接入 2026 世界杯真实赛程数据",
    realBody:
      "数据层来自 openfootball/worldcup 与 rezarahiminia/worldcup2026：48 支球队、12 个小组、72 场小组赛、32 场淘汰赛槽位和 16 座球场。",
    playerTitle: "本场球员评分、实时状态和能力差值",
    playerBody:
      "面板把本场事件、xG/xA、压迫、防守动作、跑动负荷和赛前能力值合成评分；切换评分口径时，雷达图、排名、风险提示和球星卡都会同步变化。",
    motionTitle: "把比赛走势做成会动的数据场景",
    motionBody:
      "球场线路、实时排名、球员头像和链上支付节点被放在同一个动态画布里。它不是装饰背景，而是把谁在制造优势、球权往哪里走、下一步该截图什么表达出来。",
    langButton: "EN",
    langLabel: "语言",
    refreshIdle: "更新实时数据",
    refreshLoading: "更新中...",
    refreshSuccess: "实时数据已更新",
    refreshError: "实时接口不可用",
  },
} satisfies Record<Lang, Record<string, string>>;

const initialWorldCupRuntimeData: WorldCupRuntimeData = {
  teams: worldCupTeams,
  groups: worldCupGroups,
  matches: worldCupMatches,
  stadiums: worldCupStadiums,
  source: worldCupSource,
  updatedAt: "",
  mode: "snapshot",
};

function assetPath(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}

async function fetchJsonWithTimeout(url: string, timeoutMs = 12000): Promise<unknown> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { accept: "application/json" } });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return response.json();
  } finally {
    window.clearTimeout(timer);
  }
}

async function fetchLiveWorldCupData(): Promise<WorldCupRuntimeData> {
  const base = "https://worldcup26.ir/get";
  const [teamPayload, stadiumPayload, gamePayload] = await Promise.all([
    fetchJsonWithTimeout(`${base}/teams`),
    fetchJsonWithTimeout(`${base}/stadiums`),
    fetchJsonWithTimeout(`${base}/games`),
  ]);
  const teams = ((teamPayload as { teams?: unknown[] }).teams ?? (Array.isArray(teamPayload) ? teamPayload : [])).map(normalizeLiveTeam);
  const stadiums = ((stadiumPayload as { stadiums?: unknown[] }).stadiums ?? (Array.isArray(stadiumPayload) ? stadiumPayload : [])).map(normalizeLiveStadium);
  const teamById = new Map(teams.map((team) => [team.id, team]));
  const stadiumById = new Map(stadiums.map((stadium) => [stadium.id, stadium]));
  const matches = ((gamePayload as { games?: unknown[] }).games ?? (Array.isArray(gamePayload) ? gamePayload : [])).map((item) =>
    normalizeLiveMatch(item, teamById, stadiumById),
  );
  if (teams.length < 40 || stadiums.length < 10 || matches.length < 60) {
    throw new Error(`incomplete payload: ${teams.length} teams, ${stadiums.length} stadiums, ${matches.length} matches`);
  }
  const groups = [...new Set(teams.map((team) => team.group).filter(Boolean))]
    .sort()
    .map((group) => ({ group, teams: teams.filter((team) => team.group === group).map((team) => team.fifaCode) }));
  return {
    teams,
    stadiums,
    groups,
    matches,
    source: {
      liveApi: `${base}/*`,
      updateMode: "browser-live-api",
      teams: `${base}/teams`,
      groupMatches: `${base}/games`,
      stadiums: `${base}/stadiums`,
      knockout: "current bundled snapshot for knockout slots",
      context: "browser refresh",
    },
    updatedAt: new Date().toISOString(),
    mode: "live-browser",
  };
}

function normalizeLiveTeam(item: unknown): WorldCupTeam {
  const record = item as Record<string, unknown>;
  return {
    id: Number(record.id),
    name: String(record.name_en ?? record.name ?? "TBD"),
    fifaCode: String(record.fifa_code ?? record.fifaCode ?? "TBD"),
    iso2: String(record.iso2 ?? "TBD"),
    group: String(record.groups ?? record.group ?? ""),
    flag: String(record.flag ?? ""),
  };
}

function normalizeLiveStadium(item: unknown): WorldCupStadium {
  const record = item as Record<string, unknown>;
  return {
    id: Number(record.id),
    name: String(record.name_en ?? record.name ?? record.fifa_name ?? ""),
    city: String(record.city_en ?? record.city ?? ""),
    country: String(record.country_en ?? record.country ?? ""),
    capacity: Number(record.capacity ?? 0),
  };
}

function normalizeLiveMatch(item: unknown, teamById: Map<number, WorldCupTeam>, stadiumById: Map<number, WorldCupStadium>): WorldCupMatch {
  const record = item as Record<string, unknown>;
  const home = teamById.get(Number(record.home_team_id));
  const away = teamById.get(Number(record.away_team_id));
  const stadium = stadiumById.get(Number(record.stadium_id));
  return {
    id: Number(record.id),
    type: String(record.type ?? "group"),
    group: String(record.group ?? ""),
    matchday: Number(record.matchday ?? 0),
    localDate: String(record.local_date ?? record.localDate ?? ""),
    date: String(record.date ?? ""),
    home: home?.fifaCode ?? "TBD",
    away: away?.fifaCode ?? "TBD",
    homeName: home?.name ?? "TBD",
    awayName: away?.name ?? "TBD",
    stadium: stadium?.name ?? "",
    city: stadium?.city ?? "",
    country: stadium?.country ?? "",
    source: "worldcup26.ir browser refresh",
  };
}

function App() {
  const [lang, setLang] = useState<Lang>("en");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [weights, setWeights] = useState<Weights>(defaultWeights);
  const [selectedId, setSelectedId] = useState(matches[0].id);
  const [ratingMode, setRatingMode] = useState<RatingMode>("balanced");
  const [windowKey, setWindowKey] = useState<WindowKey>("live");
  const [selectedPlayerId, setSelectedPlayerId] = useState("arg-10");
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [worldData, setWorldData] = useState<WorldCupRuntimeData>(initialWorldCupRuntimeData);
  const [refreshState, setRefreshState] = useState<RefreshState>("idle");
  const [refreshMessage, setRefreshMessage] = useState("");
  const predictions = useMemo(() => buildPredictions(weights), [weights]);
  const selected = predictions.find((prediction) => prediction.match.id === selectedId) ?? predictions[0];
  const brief = useMemo(() => buildWatchBrief(selected.match.id, weights), [selected.match.id, weights]);
  const playerScores = useMemo(() => scorePlayers(ratingMode, windowKey), [ratingMode, windowKey]);
  const selectedPlayer = playerScores.find((score) => score.player.id === selectedPlayerId) ?? playerScores[0];

  useEffect(() => {
    setSelectedPlayerId(playerScores[0].player.id);
  }, [playerScores]);

  useEffect(() => {
    const handleScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handlePointer = (event: PointerEvent) => {
      document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);
    };
    window.addEventListener("pointermove", handlePointer, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointer);
  }, []);

  function unlockReport() {
    setLoading(true);
    window.setTimeout(() => {
      setPaid(true);
      setLoading(false);
    }, 650);
  }

  async function refreshLiveData() {
    setRefreshState("loading");
    setRefreshMessage(copy[lang].refreshLoading);
    try {
      const next = await fetchLiveWorldCupData();
      setWorldData(next);
      setRefreshState("success");
      setRefreshMessage(`${copy[lang].refreshSuccess}: ${next.teams.length} teams / ${next.matches.length} matches`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setRefreshState("error");
      setRefreshMessage(`${copy[lang].refreshError}: ${message}`);
      setWorldData((current) => ({ ...current, error: message }));
    }
  }

  return (
    <main>
      <div className="scroll-progress" style={{ transform: `scaleX(${scrollProgress})` }} />
      <LanguageToggle lang={lang} onToggle={() => setLang((current) => (current === "en" ? "zh" : "en"))} />
      <Hero selected={selected} lang={lang} refreshState={refreshState} refreshMessage={refreshMessage} onRefresh={refreshLiveData} />
      <LiveTicker selected={selected} topPlayer={playerScores[0]} />
      <MotionPromptStrip />
      <RealWorldCupDataPanel lang={lang} data={worldData} refreshState={refreshState} refreshMessage={refreshMessage} />
      <section className="shell app-grid" aria-label="Cup Signal cockpit">
        <MatchRail predictions={predictions} selectedId={selectedId} onSelect={setSelectedId} />
        <SignalPanel selected={selected} />
        <ControlPanel weights={weights} setWeights={setWeights} />
      </section>
      <PlayerDashboard
        lang={lang}
        scores={playerScores}
        selectedScore={selectedPlayer}
        selectedPlayerId={selectedPlayer.player.id}
        onSelect={setSelectedPlayerId}
        ratingMode={ratingMode}
        onMode={setRatingMode}
        windowKey={windowKey}
        onWindow={setWindowKey}
      />
      <WorldCupMotionPanel lang={lang} scores={playerScores} selected={selected} />
      <InjectivePlaybookPanel lang={lang} />
      <section className="shell lower-grid">
        <InjectivePanel paid={paid} loading={loading} onUnlock={unlockReport} brief={brief} />
        <AgentPanel selected={selected} />
      </section>
      <section className="shell submission-band">
        <div>
          <p className="eyebrow">Submission Pack</p>
          <h2>Built for the Global Cup scoring loop</h2>
          <p>
            README, MCP command, Agent Skill spec, x402 endpoint, and CCTP checkout memo are included in the repository.
            The public tweet draft can use this page screenshot plus the GitHub and demo links.
          </p>
        </div>
        <div className="submission-list">
          {eventSnapshot.judgingFocus.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>
    </main>
  );
}

function MotionPromptStrip() {
  const prompts = [
    "Animated matchday cockpit",
    "x402 unlock moment",
    "CCTP fan-pool rail",
    "MCP agent analyst",
    "FUT-style player card",
    "World Cup data stream",
  ];
  return (
    <section className="motion-prompt-strip" aria-label="Motion design prompt strip">
      <div className="prompt-track">
        {[...prompts, ...prompts].map((prompt, index) => (
          <span key={`${prompt}-${index}`}>{prompt}</span>
        ))}
      </div>
    </section>
  );
}

function LanguageToggle({ lang, onToggle }: { lang: Lang; onToggle: () => void }) {
  return (
    <button className="language-toggle" onClick={onToggle} aria-label={copy[lang].langLabel}>
      <span>{lang.toUpperCase()}</span>
      <strong>{copy[lang].langButton}</strong>
    </button>
  );
}

function InjectivePlaybookPanel({ lang }: { lang: Lang }) {
  return (
    <section className="shell injective-playbook reveal-block tilt-card" aria-label="Injective technology playbook">
      <div className="playbook-copy">
        <p className="eyebrow">Injective Playbook</p>
        <h2>{copy[lang].playbookTitle}</h2>
        <p>{copy[lang].playbookBody}</p>
      </div>
      <div className="playbook-score">
        <strong>{injectivePlaybookSummary.totalTechHooks}/4</strong>
        <span>technical hooks covered</span>
      </div>
      <div className="playbook-grid">
        {injectivePlays.map((play) => (
          <PlaybookCard key={play.key} play={play} />
        ))}
      </div>
    </section>
  );
}

function PlaybookCard({ play }: { play: InjectivePlay }) {
  const icon =
    play.key === "x402" ? (
      <CircleDollarSign size={18} />
    ) : play.key === "cctp" ? (
      <GitBranch size={18} />
    ) : play.key === "mcp" ? (
      <FileJson size={18} />
    ) : (
      <Bot size={18} />
    );
  return (
    <article className={`playbook-card ${play.key}`}>
      <div className="playbook-card-head">
        {icon}
        <span>{play.status}</span>
      </div>
      <h3>{play.label}</h3>
      <p>{play.hook}</p>
      <div className="playbook-lines">
        <span>
          <strong>Fan action</strong>
          {play.fanAction}
        </span>
        <span>
          <strong>Proof</strong>
          {play.proof}
        </span>
        <span>
          <strong>Bonus</strong>
          {play.scoreBoost}
        </span>
      </div>
    </article>
  );
}

function RealWorldCupDataPanel({
  lang,
  data,
  refreshState,
  refreshMessage,
}: {
  lang: Lang;
  data: WorldCupRuntimeData;
  refreshState: RefreshState;
  refreshMessage: string;
}) {
  const openingMatches = data.matches.slice(0, 6);
  const knockoutPreview = data.matches.filter((match) => match.type !== "group").slice(0, 6);
  const lookup = new Map(data.teams.map((team) => [team.fifaCode, team]));
  const stats = {
    teams: data.teams.length,
    groups: data.groups.length,
    matches: data.matches.length,
    stadiums: data.stadiums.length,
  };
  return (
    <section className="shell real-data-panel reveal-block tilt-card" aria-label="World Cup real data panel">
      <div className="real-data-head">
        <div>
          <p className="eyebrow">Real Data Layer</p>
          <h2>{copy[lang].realTitle}</h2>
          <p>{copy[lang].realBody}</p>
        </div>
        <div className="source-stack">
          <span>{data.source.teams}</span>
          <span>{data.mode === "live-browser" ? `Browser refresh ${data.updatedAt}` : data.source.knockout}</span>
        </div>
      </div>
      {refreshMessage ? <div className={`refresh-status ${refreshState}`}>{refreshMessage}</div> : null}
      <div className="real-stat-grid">
        <Metric label="Teams" value={String(stats.teams)} />
        <Metric label="Groups" value={String(stats.groups)} />
        <Metric label="Matches" value={String(stats.matches)} />
        <Metric label="Stadiums" value={String(stats.stadiums)} />
      </div>
      <div className="real-data-body">
        <div className="group-matrix">
          {data.groups.map((group) => (
            <div key={group.group}>
              <strong>Group {group.group}</strong>
              {group.teams.map((code, index) => {
                const team = lookup.get(code);
                return (
                  <span key={`${group.group}-${code}-${index}`}>
                    {team?.flag ? <img src={team.flag} alt="" /> : <i />}
                    {team?.name ?? code}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
        <div className="schedule-stack">
          <div>
            <strong>Opening slate</strong>
            {openingMatches.map((match) => (
              <MatchMini key={match.id} match={match} />
            ))}
          </div>
          <div>
            <strong>Knockout slots</strong>
            {knockoutPreview.map((match) => (
              <MatchMini key={match.id} match={match} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MatchMini({ match }: { match: WorldCupMatch }) {
  return (
    <article className="match-mini">
      <span>#{match.id}</span>
      <strong>
        {match.homeName} / {match.awayName}
      </strong>
      <small>
        {match.localDate} · {match.city || match.stadium}
      </small>
    </article>
  );
}

function LiveTicker({ selected, topPlayer }: { selected: Prediction; topPlayer: PlayerScore }) {
  const items = [
    `${selected.home.code} ${selected.projectedScore[0]}-${selected.projectedScore[1]} ${selected.away.code}`,
    `xG ${selected.match.xgHome.toFixed(2)} / ${selected.match.xgAway.toFixed(2)}`,
    `Top player ${topPlayer.player.displayName} ${topPlayer.score.toFixed(2)}`,
    `Volatility ${Math.round(selected.volatility)}`,
    `x402 resource /api/premium-report/${selected.match.id}`,
    "MCP tool rank_match_players ready",
  ];
  return (
    <section className="ticker-band" aria-label="Live match data ticker">
      <div className="ticker-track">
        {[...items, ...items].map((item, index) => (
          <span key={`${item}-${index}`}>{item}</span>
        ))}
      </div>
    </section>
  );
}

function PlayerDashboard({
  lang,
  scores,
  selectedScore,
  selectedPlayerId,
  onSelect,
  ratingMode,
  onMode,
  windowKey,
  onWindow,
}: {
  lang: Lang;
  scores: PlayerScore[];
  selectedScore: PlayerScore;
  selectedPlayerId: string;
  onSelect: (id: string) => void;
  ratingMode: RatingMode;
  onMode: (mode: RatingMode) => void;
  windowKey: WindowKey;
  onWindow: (key: WindowKey) => void;
}) {
  const top = scores[0];
  const teamSplit = scores.reduce(
    (acc, score) => {
      acc[score.player.side] += score.score;
      return acc;
    },
    { home: 0, away: 0 },
  );
  const homeScores = scores.filter((score) => score.player.side === "home").length;
  const awayScores = scores.filter((score) => score.player.side === "away").length;
  const homeAvg = teamSplit.home / homeScores;
  const awayAvg = teamSplit.away / awayScores;

  return (
    <section id="players" className="shell player-dashboard reveal-block" aria-label="Player data dashboard">
      <div className="player-head">
        <div>
          <p className="eyebrow">Player Data Board</p>
          <h2>{copy[lang].playerTitle}</h2>
          <p>{copy[lang].playerBody}</p>
        </div>
        <div className="mode-controls" aria-label="Player dashboard controls">
          <div>
            {(["balanced", "attack", "defense", "pressing"] as RatingMode[]).map((mode) => (
              <button key={mode} className={ratingMode === mode ? "active" : ""} onClick={() => onMode(mode)}>
                {mode}
              </button>
            ))}
          </div>
          <div>
            {(["live", "last5", "season"] as WindowKey[]).map((key) => (
              <button key={key} className={windowKey === key ? "active" : ""} onClick={() => onWindow(key)}>
                {key}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="player-grid">
        <section className="panel player-list-panel tilt-card">
          <div className="panel-title">
            <Medal size={18} />
            <span>Live Rating Table</span>
          </div>
          <div className="team-edge">
            <div>
              <img src={assetPath("/teams/crest-mex.svg")} alt="" />
              <span>Mexico avg</span>
              <strong>{homeAvg.toFixed(2)}</strong>
            </div>
            <div>
              <img src={assetPath("/teams/crest-arg.svg")} alt="" />
              <span>Argentina avg</span>
              <strong>{awayAvg.toFixed(2)}</strong>
            </div>
          </div>
          <div className="player-score-list">
            {scores.map((score, index) => (
              <button
                key={score.player.id}
                className={selectedPlayerId === score.player.id ? "player-row active" : "player-row"}
                onClick={() => onSelect(score.player.id)}
              >
                <span className="rank">{String(index + 1).padStart(2, "0")}</span>
                <img src={assetPath(score.player.portrait)} alt="" />
                <span>
                  <strong>
                    {score.player.displayName}
                    <img src={assetPath(score.player.flag)} alt="" />
                    <img src={assetPath(score.player.crest)} alt="" />
                  </strong>
                  <small>
                    {score.player.team} · #{score.player.number} · {score.player.role}
                  </small>
                </span>
                <b>{score.score.toFixed(2)}</b>
              </button>
            ))}
          </div>
        </section>

        <section className="panel player-focus-panel tilt-card">
          <div className="player-identity">
            <img src={assetPath(selectedScore.player.portrait)} alt="" />
            <div>
              <p className="eyebrow">
                <img src={assetPath(selectedScore.player.flag)} alt="" />
                <img src={assetPath(selectedScore.player.crest)} alt="" />#{selectedScore.player.number} · {selectedScore.player.role} ·{" "}
                {selectedScore.player.team}
              </p>
              <h3>{selectedScore.player.name}</h3>
              <div className="trait-strip">
                {selectedScore.player.traits.map((trait) => (
                  <span key={trait}>{trait}</span>
                ))}
              </div>
            </div>
            <div className="grade-badge">
              <strong>{selectedScore.grade}</strong>
              <span>{selectedScore.score.toFixed(2)}</span>
            </div>
          </div>
          <StarCard score={selectedScore} />
          <div className="player-kpis">
            <Metric label="Live impact" value={selectedScore.liveImpact.toFixed(0)} />
            <Metric label="Ability index" value={selectedScore.abilityIndex.toFixed(0)} />
            <Metric label="Form index" value={selectedScore.formIndex.toFixed(0)} />
            <Metric label="Risk" value={selectedScore.risk.toFixed(0)} />
          </div>
          <div className="focus-body">
            <Radar score={selectedScore} />
            <AbilityCompare score={selectedScore} />
          </div>
          <div className="watch-item">
            <Sparkles size={17} />
            <span>{selectedScore.watchItem}</span>
          </div>
        </section>

        <section className="panel player-detail-panel tilt-card">
          <div className="panel-title">
            <LineChart size={18} />
            <span>Events & Form</span>
          </div>
          <Trend values={selectedScore.player.form.trend} />
          <div className="form-note">
            <strong>{selectedScore.player.form.condition}</strong>
            <span>{selectedScore.player.form.note}</span>
          </div>
          <div className="event-list">
            {selectedScore.player.events.map((event) => (
              <div key={`${event.minute}-${event.type}`}>
                <time>{event.minute}'</time>
                <span>
                  <strong>{event.type}</strong>
                  {event.detail}
                </span>
                <b className={event.impact >= 0 ? "positive" : "negative"}>{event.impact > 0 ? "+" : ""}{event.impact.toFixed(2)}</b>
              </div>
            ))}
          </div>
          <StatGrid score={selectedScore} />
        </section>
      </div>
      <div className="player-insight-strip">
        <Gauge size={18} />
        <span>
          Current leader: {top.player.displayName} at {top.score.toFixed(2)}. Difference from normal ability:{" "}
          {selectedScore.delta > 0 ? "+" : ""}
          {selectedScore.delta.toFixed(1)} pts for selected player.
        </span>
      </div>
    </section>
  );
}

function StarCard({ score }: { score: PlayerScore }) {
  const ability = score.player.current;
  const statPairs = [
    ["PAC", ability.pace],
    ["SHO", Math.round((ability.finishing + score.player.live.xg * 10) / 1.1)],
    ["PAS", ability.passing],
    ["DRI", ability.ballCarry],
    ["DEF", ability.defending],
    ["PHY", Math.round((ability.stamina + ability.aerial + ability.pressing) / 3)],
  ];
  const overall = Math.round(Math.min(99, Math.max(55, score.score * 10.6)));
  const tier = overall >= 90 ? "icon" : overall >= 85 ? "toty" : overall >= 75 ? "gold" : "silver";
  return (
    <div className={`star-card ${tier}`} aria-label={`${score.player.displayName} star card`}>
      <div className="star-card-top">
        <strong>{overall}</strong>
        <span>{score.player.role}</span>
        <img src={assetPath(score.player.flag)} alt="" />
        <img src={assetPath(score.player.crest)} alt="" />
      </div>
      <img className="star-card-player" src={assetPath(score.player.portrait)} alt="" />
      <div className="star-card-name">{score.player.displayName.toUpperCase()}</div>
      <div className="star-card-stats">
        {statPairs.map(([label, value]) => (
          <span key={label}>
            <b>{value}</b>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function WorldCupMotionPanel({ lang, scores, selected }: { lang: Lang; scores: PlayerScore[]; selected: Prediction }) {
  const leaders = scores.slice(0, 4);
  return (
    <section className="shell motion-panel reveal-block tilt-card" aria-label="World Cup motion layer">
      <div className="motion-copy">
        <p className="eyebrow">Motion Layer</p>
        <h2>{copy[lang].motionTitle}</h2>
        <p>{copy[lang].motionBody}</p>
      </div>
      <div className="motion-stage">
        <img className="route-map" src={assetPath("/worldcup/pitch-routes.svg")} alt="" />
        <img className="motion-trophy" src={assetPath("/worldcup/trophy-line.svg")} alt="" />
        <img className="motion-ball" src={assetPath("/worldcup/football-line.svg")} alt="" />
        <div className="pulse-node node-a" />
        <div className="pulse-node node-b" />
        <div className="pulse-node node-c" />
        <div className="leader-ribbon">
          {leaders.map((score) => (
            <div key={score.player.id}>
              <img src={assetPath(score.player.portrait)} alt="" />
              <img src={assetPath(score.player.flag)} alt="" />
              <span>{score.player.displayName}</span>
              <strong>{score.score.toFixed(2)}</strong>
            </div>
          ))}
        </div>
        <div className="match-chip">
          <span>{selected.match.round}</span>
          <strong>
            {selected.home.code} / {selected.away.code}
          </strong>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Radar({ score }: { score: PlayerScore }) {
  const picked = abilityLabels.slice(0, 8);
  const points = picked
    .map((item, index) => {
      const angle = -Math.PI / 2 + (index / picked.length) * Math.PI * 2;
      const radius = 21 + score.player.current[item.key] * 0.47;
      const x = 82 + Math.cos(angle) * radius;
      const y = 82 + Math.sin(angle) * radius;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="radar-card">
      <svg viewBox="0 0 164 164" role="img" aria-label="Current ability radar">
        {[32, 54, 76].map((radius) => (
          <circle key={radius} cx="82" cy="82" r={radius} />
        ))}
        {picked.map((item, index) => {
          const angle = -Math.PI / 2 + (index / picked.length) * Math.PI * 2;
          return (
            <g key={item.key}>
              <line x1="82" y1="82" x2={82 + Math.cos(angle) * 76} y2={82 + Math.sin(angle) * 76} />
              <text x={82 + Math.cos(angle) * 68} y={82 + Math.sin(angle) * 68}>
                {item.short}
              </text>
            </g>
          );
        })}
        <polygon points={points} />
      </svg>
      <div>
        <strong>{score.strengths.join(" / ")}</strong>
        <span>Top live strengths under selected mode</span>
      </div>
    </div>
  );
}

function AbilityCompare({ score }: { score: PlayerScore }) {
  return (
    <div className="ability-compare">
      {abilityLabels.map((item) => {
        const current = score.player.current[item.key];
        const base = score.player.baseline[item.key];
        const delta = current - base;
        return (
          <div key={item.key} className="ability-line">
            <span>{item.label}</span>
            <div className="dual-track">
              <i className="base" style={{ width: `${base}%` }} />
              <i className={delta >= 0 ? "current up" : "current down"} style={{ width: `${current}%` }} />
            </div>
            <b className={delta >= 0 ? "positive" : "negative"}>
              {delta > 0 ? "+" : ""}
              {delta}
            </b>
          </div>
        );
      })}
    </div>
  );
}

function Trend({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values
    .map((value, index) => {
      const x = 10 + index * (180 / (values.length - 1));
      const y = 76 - ((value - min) / Math.max(0.1, max - min)) * 56;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg className="trend-line" viewBox="0 0 200 90" aria-label="recent rating trend">
      <polyline points={points} />
      {values.map((value, index) => (
        <circle
          key={`${value}-${index}`}
          cx={10 + index * (180 / (values.length - 1))}
          cy={76 - ((value - min) / Math.max(0.1, max - min)) * 56}
          r="3.5"
        />
      ))}
    </svg>
  );
}

function StatGrid({ score }: { score: PlayerScore }) {
  const stats = score.player.live;
  const rows = [
    ["xG", stats.xg.toFixed(2)],
    ["xA", stats.xa.toFixed(2)],
    ["Shots", `${stats.shots}/${stats.shotsOnTarget}`],
    ["Key passes", stats.keyPasses],
    ["Prog passes", stats.progressivePasses],
    ["Carries", stats.progressiveCarries],
    ["Duels won", stats.duelsWon],
    ["Recoveries", stats.ballRecoveries],
    ["Pressures", stats.pressures],
    ["Distance", `${stats.distanceKm.toFixed(1)}km`],
  ];
  return (
    <div className="stat-grid">
      {rows.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function Hero({
  selected,
  lang,
  refreshState,
  refreshMessage,
  onRefresh,
}: {
  selected: Prediction;
  lang: Lang;
  refreshState: RefreshState;
  refreshMessage: string;
  onRefresh: () => void;
}) {
  return (
    <header className="hero">
      <div className="spotlight-layer" aria-hidden="true" />
      <div className="hero-prompt-cloud" aria-hidden="true">
        <span>forecast_match()</span>
        <span>x402 402</span>
        <span>rank_match_players()</span>
        <span>USDC CCTP memo</span>
      </div>
      <div className="hero-symbols" aria-hidden="true">
        <img className="hero-trophy" src={assetPath("/worldcup/trophy-line.svg")} alt="" />
        <img className="hero-football" src={assetPath("/worldcup/football-line.svg")} alt="" />
      </div>
      <div className="hero-media" aria-hidden="true">
        <div className="pitch">
          <div className="pitch-line center-line" />
          <div className="pitch-line box-left" />
          <div className="pitch-line box-right" />
          <div className="ball-track">
            <span />
          </div>
        </div>
      </div>
      <nav className="topbar shell" aria-label="Project navigation">
        <div className="brand">
          <Crosshair size={20} />
          <span>Cup Signal</span>
        </div>
        <div className="nav-actions">
          <div className="nav-pills">
            <span>x402</span>
            <span>CCTP</span>
            <span>MCP</span>
            <span>Agent Skill</span>
          </div>
          <button className={`live-refresh-button ${refreshState}`} onClick={onRefresh} disabled={refreshState === "loading"}>
            <Activity size={15} />
            {refreshState === "loading" ? copy[lang].refreshLoading : copy[lang].refreshIdle}
          </button>
        </div>
      </nav>
      {refreshMessage ? <div className={`hero-refresh-note shell ${refreshState}`}>{refreshMessage}</div> : null}
      <div className="shell hero-content reveal-block">
        <div>
          <p className="eyebrow">Injective Global Cup Matchday AI</p>
          <h1>Turn World Cup noise into one usable watch-party signal.</h1>
          <p className="hero-copy">
            Cup Signal reads fixture context, live pressure, team profiles, and fan utility needs, then packages a paid
            premium brief through an x402 flow and an Injective-oriented USDC CCTP settlement note.
          </p>
          <div className="hero-actions">
            <a href="#signal">Open Signal</a>
            <a href="#injective">Inspect Injective Flow</a>
          </div>
        </div>
        <aside className="live-card tilt-card" aria-label="Selected live match">
          <div className="live-card-header">
            <span className="pulse-dot" />
            <span>{selected.match.status.toUpperCase()}</span>
            <span>{selected.match.minute ? `${selected.match.minute}'` : selected.match.kickoffLocal}</span>
          </div>
          <h2>
            {selected.home.name} <span>vs</span> {selected.away.name}
          </h2>
          <div className="scoreline">
            <strong>{selected.projectedScore[0]}</strong>
            <span>projected</span>
            <strong>{selected.projectedScore[1]}</strong>
          </div>
          <div className="prob-row">
            <span>{formatPercent(selected.homeWin)} home</span>
            <span>{formatPercent(selected.draw)} draw</span>
            <span>{formatPercent(selected.awayWin)} away</span>
          </div>
        </aside>
      </div>
    </header>
  );
}

function MatchRail({
  predictions,
  selectedId,
  onSelect,
}: {
  predictions: Prediction[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="panel match-rail tilt-card" aria-label="Match list">
      <div className="panel-title">
        <Radio size={18} />
        <span>Fixtures</span>
      </div>
      <div className="match-list">
        {predictions.map((prediction) => (
          <button
            key={prediction.match.id}
            className={prediction.match.id === selectedId ? "match-item active" : "match-item"}
            onClick={() => onSelect(prediction.match.id)}
          >
            <span>{prediction.match.round}</span>
            <strong>
              {prediction.home.code} / {prediction.away.code}
            </strong>
            <small>
              {prediction.match.status === "live"
                ? `${prediction.match.minute}' live`
                : prediction.match.kickoffLocal.split(" ").slice(0, 2).join(" ")}
            </small>
          </button>
        ))}
      </div>
    </section>
  );
}

function SignalPanel({ selected }: { selected: Prediction }) {
  const bars = [
    { label: selected.home.name, value: selected.homeWin, className: "home" },
    { label: "Draw", value: selected.draw, className: "draw" },
    { label: selected.away.name, value: selected.awayWin, className: "away" },
  ];

  return (
    <section id="signal" className="panel signal-panel tilt-card" aria-label="AI signal panel">
      <div className="panel-title">
        <BarChart3 size={18} />
        <span>AI Match Signal</span>
      </div>
      <div className="signal-head">
        <div>
          <p>{selected.match.venue}</p>
          <h2>
            {selected.home.name} vs {selected.away.name}
          </h2>
        </div>
        <div className="confidence">
          <span>{Math.round(selected.confidence * 100)}%</span>
          <small>confidence</small>
        </div>
      </div>
      <div className="prob-bars">
        {bars.map((bar) => (
          <div className="bar-row" key={bar.label}>
            <span>{bar.label}</span>
            <div className="bar-track">
              <i className={bar.className} style={{ width: `${Math.round(bar.value * 100)}%` }} />
            </div>
            <strong>{formatPercent(bar.value)}</strong>
          </div>
        ))}
      </div>
      <div className="readout">
        <div>
          <span>Projected score</span>
          <strong>
            {selected.projectedScore[0]} - {selected.projectedScore[1]}
          </strong>
        </div>
        <div>
          <span>Volatility</span>
          <strong>{Math.round(selected.volatility)}</strong>
        </div>
        <div>
          <span>xG</span>
          <strong>
            {selected.match.xgHome.toFixed(2)} / {selected.match.xgAway.toFixed(2)}
          </strong>
        </div>
      </div>
      <div className="analysis-list">
        {selected.tacticalRead.map((line) => (
          <p key={line}>
            <CheckCircle2 size={16} />
            {line}
          </p>
        ))}
      </div>
      <div className="action-note">
        <ShieldCheck size={18} />
        <span>{selected.recommendedAction}</span>
      </div>
    </section>
  );
}

function ControlPanel({
  weights,
  setWeights,
}: {
  weights: Weights;
  setWeights: React.Dispatch<React.SetStateAction<Weights>>;
}) {
  return (
    <section className="panel controls tilt-card" aria-label="Model controls">
      <div className="panel-title">
        <SlidersHorizontal size={18} />
        <span>Model Weights</span>
      </div>
      <p className="muted">
        Tune the agent before kickoff. Hosts can make it favor live form, defensive structure, or local travel comfort.
      </p>
      <div className="sliders">
        {(Object.keys(weights) as WeightKey[]).map((key) => (
          <label key={key}>
            <span>
              {weightLabels[key]}
              <strong>{weights[key]}</strong>
            </span>
            <input
              type="range"
              min="0"
              max="60"
              value={weights[key]}
              onChange={(event) =>
                setWeights((current) => ({
                  ...current,
                  [key]: Number(event.target.value),
                }))
              }
            />
          </label>
        ))}
      </div>
      <button className="reset-button" onClick={() => setWeights(defaultWeights)}>
        Reset Scout Model
      </button>
    </section>
  );
}

function InjectivePanel({
  paid,
  loading,
  onUnlock,
  brief,
}: {
  paid: boolean;
  loading: boolean;
  onUnlock: () => void;
  brief: ReturnType<typeof buildWatchBrief>;
}) {
  return (
    <section id="injective" className="panel injective-panel tilt-card" aria-label="Injective integration panel">
      <div className="panel-title">
        <CircleDollarSign size={18} />
        <span>Injective Flow</span>
      </div>
      <div className="flow-grid">
        <FlowStep icon={<WalletCards size={20} />} title="x402 unlock" text={`${brief.payment.price} premium report gate`} />
        <FlowStep icon={<GitBranch size={20} />} title="USDC CCTP memo" text={`${brief.cctp.source} to ${brief.cctp.destination}`} />
        <FlowStep icon={<FileJson size={20} />} title="MCP tool" text="forecast_match and build_watch_brief" />
        <FlowStep icon={<Bot size={20} />} title="Agent Skill" text="watch-party analyst handoff" />
      </div>
      <div className="paywall">
        <div>
          <span className="eyebrow">Premium x402 Resource</span>
          <h3>{brief.headline}</h3>
          <p>{brief.freeSummary}</p>
        </div>
        {!paid ? (
          <button onClick={onUnlock} disabled={loading}>
            {loading ? "Checking payment header" : "Simulate x402 Unlock"}
          </button>
        ) : (
          <span className="paid-badge">Unlocked</span>
        )}
      </div>
      {paid ? (
        <div className="premium-report">
          {brief.premiumReport.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      ) : (
        <div className="locked-report">
          <div />
          <div />
          <div />
        </div>
      )}
    </section>
  );
}

function FlowStep({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flow-step">
      {icon}
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

function AgentPanel({ selected }: { selected: Prediction }) {
  return (
    <section className="panel agent-panel tilt-card" aria-label="Agent skills panel">
      <div className="panel-title">
        <Bot size={18} />
        <span>Agent Output</span>
      </div>
      <div className="agent-terminal">
        <p>
          <span>tool</span> forecast_match --match {selected.match.id}
        </p>
        <p>
          <span>result</span> {selected.home.code} {formatPercent(selected.homeWin)} / draw {formatPercent(selected.draw)} /{" "}
          {selected.away.code} {formatPercent(selected.awayWin)}
        </p>
        <p>
          <span>skill</span> generate_watch_party_brief
        </p>
        <p>
          <span>next</span> publish screenshot in X reply during live match for Global Cup score.
        </p>
      </div>
      <div className="fan-actions">
        {selected.fanUtility.map((item) => (
          <div key={item}>
            <Trophy size={16} />
            <span>{item}</span>
          </div>
        ))}
      </div>
      <div className="status-strip">
        <Activity size={16} />
        <span>Local model, deterministic output, no hidden API key required for demo.</span>
      </div>
    </section>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
