# Submission Pack

## Typeform Fields

Project name:

```text
Cup Signal for Injective Global Cup
```

Short description:

```text
Cup Signal is a World Cup matchday intelligence market on Injective. It turns fixture context, live pressure, player form, and fan discussion into one paid, agent-readable signal. The build includes a public x402 paid-report API with native testnet USDC receipts, a budget-gated agent payment, a completed Base Sepolia -> Injective CCTP transfer, a verified proof contract, MCP tools, and an Agent Skill for match commentary.
```

GitHub repository:

```text
https://github.com/Chengyuann/cup-signal-injective
```

Product / demo link:

```text
https://chengyuann.github.io/cup-signal-injective/
```

Demo video:

```text
https://chengyuann.github.io/cup-signal-injective/media/cup-signal-demo-v2.mp4
```

X tweet link:

```text
https://x.com/macy200201/status/2084941358951972900
```

## X Main Post Draft

```text
Built Cup Signal for #InjectiveGlobalCupHackathon.

It helps World Cup fans turn match noise into one usable watch-party signal: forecast, projected score, volatility, tactical read, and a group-chat prompt.

New layer: player ratings.
- live score for each key player
- current form vs normal ability deltas
- radar chart, trend line, event timeline
- original GPT Image 2 chibi player avatars

Injective hooks:
- x402 Paid Scout Intel: real testnet USDC receipt
- USDC CCTP Fan Pool: Base Sepolia -> Injective Testnet transfer
- MCP Match Analyst Server: fixture, forecast, player, and World Cup tools
- Agent Skill Live Posting Coach: repeatable live-post workflow

Demo/GitHub:
https://chengyuann.github.io/cup-signal-injective/
https://github.com/Chengyuann/cup-signal-injective

@injective @NinjaLabsHQ @NinjaLabsCN
```

## X Live Reply Template

```text
Live Cup Signal update:

<Team A> vs <Team B>
Projection: <score>
Confidence: <percent>
Volatility: <number>

Screenshot from the live panel attached.

#InjectiveGlobalCupHackathon
```

## Demo Checklist

- Open the web demo.
- Select the default real-result fixture, `Argentina / Egypt`.
- Move one model slider and show probabilities changing.
- Open the player board, switch `attack / defense / pressing`, and select Messi, Enzo, Salah, or Elneny.
- Click `Preview paid report`.
- Show the premium report lines.
- Run `npm run check:mcp` in terminal.
- Show the public x402 and agent receipt proof files.
- Show the completed CCTP proof: burn, attestation, mint, and balance delta.

## Visual Assets

- `docs/assets/cup-signal-studio-hero.png`: GPT Image 2 horizontal key visual for X card, README cover, or submission thumbnail. It uses only universal football World Cup elements, with no country/team visual identity.
- `docs/assets/cup-signal-video-keyframe.png`: GPT Image 2 vertical keyframe for video-generation reference. It uses only universal football World Cup elements, with no country/team visual identity.
- `public/media/cup-signal-loop.mp4`: 6-second H.264/AAC motion loop used by the web experience.
- `public/media/cup-signal-teaser.mp4`: backwards-compatible URL for the full narrated submission video.
- `public/media/cup-signal-demo-v2.mp4`: canonical full narrated submission video.
- `docs/assets/cup-signal-teaser-cover.jpg`: extracted cover frame for the teaser.
- `docs/VIDEO_PROMPTS.md`: video prompts and shot sequence.
