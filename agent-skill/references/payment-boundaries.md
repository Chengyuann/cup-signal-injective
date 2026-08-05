# Payment and Settlement Boundaries

Load this reference when an answer mentions x402, CCTP, a paid report, a wallet,
or an on-chain transaction.

## Current x402 evidence

- The public API uses x402 v2 on Injective EVM Testnet (`eip155:1439`).
- Native testnet USDC settles through EIP-3009 and the Injective facilitator.
- `public/proofs/x402-payment.json` contains a real public settlement receipt.
- `public/proofs/agent-x402-run.json` contains a budget-gated agent settlement.
- `X-PAYMENT: demo-paid` remains available only in the local zero-funds harness.
- The CCTP object is a Base Sepolia to Injective testnet settlement intent.

## Never claim

- that a payment settled without linking one of the public receipt proofs,
- that a CCTP burn or mint completed,
- that a mainnet payment occurred,
- that the proof-registry anchor itself is the x402 payment.

## Current proof links

- x402 settlement: `public/proofs/x402-payment.json`
- agent settlement: `public/proofs/agent-x402-run.json`
- proof registry: `public/proofs/onchain-proof.json`

## CCTP evidence still required

- source-chain burn transaction,
- Circle attestation and message,
- destination-chain mint transaction,
- reconciliation against the Cup Signal memo.
