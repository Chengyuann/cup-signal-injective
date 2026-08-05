# Cup Signal Proof Registry

`CupSignalProofRegistry.sol` anchors the stable SHA-256 claim hash from
`public/proofs/judge-proof.json` on Injective EVM Testnet.

The contract stores:

- judge proof SHA-256,
- CCTP memo SHA-256,
- public proof URI,
- timestamp,
- submitter address.

It does not custody funds, verify x402 payments, or claim that CCTP settlement
occurred. Its purpose is to make the submitted proof snapshot independently
timestamped and readable on Injective EVM.

## Network

- Chain: Injective EVM Testnet
- Chain ID: `1439`
- CAIP-2: `eip155:1439`
- RPC: `https://k8s.testnet.json-rpc.injective.network/`
- Explorer: `https://testnet.blockscout.injective.network/`

## Commands

```bash
npm run contract:compile
npm run wallet:testnet:create
npm run wallet:testnet:balance -- 0xYOUR_ADDRESS
set -a; source .agent/secrets/injective-testnet-deployer.env; set +a
npm run contract:deploy:testnet
npm run contract:verify:testnet
```

The private key is stored only under `.agent/secrets/`, which is ignored by Git.
