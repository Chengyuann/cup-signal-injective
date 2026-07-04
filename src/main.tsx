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
import "./styles.css";

const weightLabels: Record<WeightKey, string> = {
  form: "Form",
  attack: "Attack",
  defense: "Defense",
  pressure: "Pressure",
  travel: "Travel",
};

function App() {
  const [weights, setWeights] = useState<Weights>(defaultWeights);
  const [selectedId, setSelectedId] = useState(matches[0].id);
  const [ratingMode, setRatingMode] = useState<RatingMode>("balanced");
  const [windowKey, setWindowKey] = useState<WindowKey>("live");
  const [selectedPlayerId, setSelectedPlayerId] = useState("arg-10");
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const predictions = useMemo(() => buildPredictions(weights), [weights]);
  const selected = predictions.find((prediction) => prediction.match.id === selectedId) ?? predictions[0];
  const brief = useMemo(() => buildWatchBrief(selected.match.id, weights), [selected.match.id, weights]);
  const playerScores = useMemo(() => scorePlayers(ratingMode, windowKey), [ratingMode, windowKey]);
  const selectedPlayer = playerScores.find((score) => score.player.id === selectedPlayerId) ?? playerScores[0];

  useEffect(() => {
    setSelectedPlayerId(playerScores[0].player.id);
  }, [playerScores]);

  function unlockReport() {
    setLoading(true);
    window.setTimeout(() => {
      setPaid(true);
      setLoading(false);
    }, 650);
  }

  return (
    <main>
      <Hero selected={selected} />
      <section className="shell app-grid" aria-label="Cup Signal cockpit">
        <MatchRail predictions={predictions} selectedId={selectedId} onSelect={setSelectedId} />
        <SignalPanel selected={selected} />
        <ControlPanel weights={weights} setWeights={setWeights} />
      </section>
      <PlayerDashboard
        scores={playerScores}
        selectedScore={selectedPlayer}
        selectedPlayerId={selectedPlayer.player.id}
        onSelect={setSelectedPlayerId}
        ratingMode={ratingMode}
        onMode={setRatingMode}
        windowKey={windowKey}
        onWindow={setWindowKey}
      />
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

function PlayerDashboard({
  scores,
  selectedScore,
  selectedPlayerId,
  onSelect,
  ratingMode,
  onMode,
  windowKey,
  onWindow,
}: {
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
    <section id="players" className="shell player-dashboard" aria-label="Player data dashboard">
      <div className="player-head">
        <div>
          <p className="eyebrow">Player Data Board</p>
          <h2>本场球员评分、实时状态和能力差值</h2>
          <p>
            面板把本场事件、xG/xA、压迫、防守动作、跑动负荷和赛前能力值合成评分；切换评分口径时，雷达图、排名和风险提示都会同步变化。
          </p>
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
        <section className="panel player-list-panel">
          <div className="panel-title">
            <Medal size={18} />
            <span>Live Rating Table</span>
          </div>
          <div className="team-edge">
            <div>
              <span>Mexico avg</span>
              <strong>{homeAvg.toFixed(2)}</strong>
            </div>
            <div>
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
                <img src={score.player.portrait} alt="" />
                <span>
                  <strong>{score.player.displayName}</strong>
                  <small>
                    {score.player.team} · #{score.player.number} · {score.player.role}
                  </small>
                </span>
                <b>{score.score.toFixed(2)}</b>
              </button>
            ))}
          </div>
        </section>

        <section className="panel player-focus-panel">
          <div className="player-identity">
            <img src={selectedScore.player.portrait} alt="" />
            <div>
              <p className="eyebrow">
                #{selectedScore.player.number} · {selectedScore.player.role} · {selectedScore.player.team}
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

        <section className="panel player-detail-panel">
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

function Hero({ selected }: { selected: Prediction }) {
  return (
    <header className="hero">
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
        <div className="nav-pills">
          <span>x402</span>
          <span>CCTP</span>
          <span>MCP</span>
          <span>Agent Skill</span>
        </div>
      </nav>
      <div className="shell hero-content">
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
        <aside className="live-card" aria-label="Selected live match">
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
    <section className="panel match-rail" aria-label="Match list">
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
    <section id="signal" className="panel signal-panel" aria-label="AI signal panel">
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
    <section className="panel controls" aria-label="Model controls">
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
    <section id="injective" className="panel injective-panel" aria-label="Injective integration panel">
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
    <section className="panel agent-panel" aria-label="Agent skills panel">
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
