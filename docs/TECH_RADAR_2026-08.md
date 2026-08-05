# Cup Signal Technology Radar

Reviewed: 2026-08-05.

## Adopted now

### x402 v2 response schema

- Status: adopted.
- Evidence: the dry-run 402 body is parsed by `PaymentRequiredV2Schema`.
- Network: Injective EVM Testnet, CAIP-2 `eip155:1439`.
- Reason: protocol correctness is valuable even before funded settlement.

### MCP TypeScript SDK 1.30

- Status: adopted.
- Evidence: 7 tools, 1 resource, and 1 prompt pass the MCP verification script.
- Reason: this is a small compatible update and removes known dependency issues.

### Generated judge proof

- Status: adopted.
- Evidence: `public/proofs/judge-proof.json`.
- Reason: judges can inspect HTTP, CCTP, MCP, and model output without trusting screenshots.

### Injective EVM proof registry

- Status: contract compiled and tested; testnet deployment pending faucet funding.
- Scope: anchor proof SHA-256, CCTP memo SHA-256, and public URI.
- Boundary: timestamped evidence only; no custody or payment-settlement claim.

### Agent Skill progressive disclosure

- Status: adopted.
- The main `SKILL.md` keeps the workflow concise.
- Detailed protocol boundaries live in `agent-skill/references/payment-boundaries.md`.

## Ready after judging

### Official Injective x402 settlement

- Candidate package: `@injectivelabs/x402`.
- Required work: receiver wallet, facilitator setup, settlement transaction persistence,
  idempotency, and receipt display.
- Decision: do not add funded signing during judging.

### Circle CCTP V2 on Injective

- Current state: Circle announced USDC and CCTP V2 support on Injective.
- Required work: source burn, attestation retrieval, destination message submission,
  transaction reconciliation, and failure recovery.
- Decision: keep the deterministic memo now; implement funded transfers after judging.

### MCP 2026-07-28 stateless core

- Current state: the new specification introduces a stateless core and breaking changes.
- Required work: update capability declarations, protocol metadata, and compatibility tests.
- Decision: retain the tested stdio integration during judging.

### Injective AI SDK / ERC-8004 identity

- Potential use: register Cup Signal as a discoverable agent and attach reputation or
  service metadata.
- Decision: useful post-competition, but not required for the submitted fan workflow.

## Avoid during judging

- adding private keys to repository or CI,
- claiming CCTP settlement without source and destination transaction proofs,
- fabricating x402 receipts,
- migrating to breaking protocol versions without interoperability tests,
- adding a smart contract only to increase technology count.
