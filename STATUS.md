# Cup Signal Technical Status

Last reviewed: 2026-08-05.

## Verified

- Public MVP and both submitted video URLs return successfully.
- GitHub Pages builds with `/cup-signal-injective/` as the base path.
- Daily World Cup data refresh no longer deploys an incorrect root-path build.
- Forecast probabilities are normalized and covered by automated tests.
- x402 dry-run server returns a structured HTTP 402 challenge.
- The challenge is validated against the x402 v2 schema and targets Injective EVM Testnet (`eip155:1439`).
- A demo payment header returns the premium report and `X-PAYMENT-RESPONSE`.
- MCP server exposes 7 tools, 1 resource, and 1 prompt.
- Agent Skill references the actual MCP tool names.
- `public/proofs/judge-proof.json` is generated from live local HTTP and MCP calls.

## Honest boundaries

- The x402 route is a protocol-faithful dry-run, not a completed USDC payment.
- The CCTP object is a settlement intent, not a completed burn/attestation/mint flow.
- No Injective EVM smart contract deployment is claimed.
- Tournament schedule/team data is sourced from public repositories.
- Player ratings and player event data are simulated product analytics.
- The proof-registry contract is compiled and tested. Deployment remains pending
  until the dedicated testnet address receives faucet INJ.

## Current production path

### x402

The current dry-run preserves the premium resource contract. A production
deployment should use the official Injective x402 package or current x402
resource-server middleware with:

- a funded receiver,
- an Injective EVM network identifier,
- facilitator verification and settlement,
- a returned settlement transaction reference,
- idempotency and receipt persistence.

The repository intentionally does not install wallet/signing packages or accept
private keys during judging. This reduces supply-chain and secret-handling risk.

### CCTP

Circle CCTP now supports Injective. The production sequence is:

1. burn USDC on the source chain,
2. retrieve the Circle attestation,
3. submit the message on Injective,
4. persist the destination transaction and reconcile it with the Cup Signal memo.

### MCP and Agent Skills

The project uses the stable TypeScript SDK currently committed in the lockfile.
The MCP 2026-07-28 specification introduces a stateless core and breaking
changes; migration should happen after the competition rather than during the
judging window. The Agent Skill remains portable and references the current
tool inventory.

### On-chain proof registry

The minimal `CupSignalProofRegistry` contract is designed for Injective EVM
Testnet. It anchors the stable judge-proof SHA-256, CCTP memo SHA-256, and
public proof URI. It does not handle funds and does not convert the dry-run
x402 flow into a settlement claim.

Pending deployer address:

```text
0x0C69f390Da3e0B35570F031c0878e9F000cf5D84
```
