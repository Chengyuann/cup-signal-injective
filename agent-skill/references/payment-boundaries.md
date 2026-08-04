# Payment and Settlement Boundaries

Load this reference when an answer mentions x402, CCTP, a paid report, a wallet,
or an on-chain transaction.

## Current demo

- x402 uses a schema-validated v2 HTTP 402 response.
- The default network is Injective EVM Testnet (`eip155:1439`).
- `X-PAYMENT: demo-paid` is a dry-run unlock header.
- `X-PAYMENT-RESPONSE` confirms only the local dry-run response.
- The CCTP object is a Base Sepolia to Injective testnet settlement intent.

## Never claim

- that USDC moved,
- that a facilitator verified payment,
- that a CCTP burn or mint completed,
- that a transaction hash exists,
- that a smart contract was deployed.

## Production evidence required

- source-chain transaction,
- facilitator verification and settlement result,
- Circle attestation,
- destination-chain transaction,
- reconciliation against the Cup Signal memo.
