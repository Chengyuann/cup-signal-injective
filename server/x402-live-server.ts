import express from "express";
import { injectivePaymentMiddleware } from "@injectivelabs/x402/middleware";
import { INJECTIVE_TESTNET_CAIP2, TOKENS } from "@injectivelabs/x402/networks";
import { buildWatchBrief } from "../src/forecast";

const facilitatorPrivateKey = process.env.INJECTIVE_PRIVATE_KEY as `0x${string}` | undefined;
if (!facilitatorPrivateKey) throw new Error("INJECTIVE_PRIVATE_KEY is required");

const port = Number(process.env.PORT ?? 4021);
const rpcUrl =
  process.env.INJECTIVE_RPC_URL ??
  "https://testnet.evm.archival.chain.virtual.json-rpc.injective.network/";
const usdc = TOKENS[INJECTIVE_TESTNET_CAIP2].USDC.address;
const price = process.env.X402_PRICE_BASE_UNITS ?? "10000";
const app = express();

app.use(express.json());
app.use(
  injectivePaymentMiddleware(
    {
      "GET /api/premium-report/:matchId": {
        description: "Cup Signal premium World Cup tactical and player report",
        mimeType: "application/json",
        accepts: [
          {
            network: INJECTIVE_TESTNET_CAIP2,
            asset: usdc,
            amount: price,
            maxTimeoutSeconds: 180,
          },
        ],
      },
    },
    {
      facilitator: {
        privateKey: facilitatorPrivateKey,
        rpcUrl,
        confirmations: 1,
        allowedAssets: [usdc],
        minPaymentPerAsset: { [usdc.toLowerCase()]: "1000" },
      },
      settlementPolicy: "before",
      baseUrl: process.env.PUBLIC_X402_BASE_URL,
    },
  ),
);

app.get("/health", (_request, response) => {
  response.json({
    ok: true,
    service: "cup-signal-live-x402",
    mode: "injective-eip3009",
    network: INJECTIVE_TESTNET_CAIP2,
    asset: usdc,
    amount: price,
  });
});

app.get("/api/premium-report/:matchId", (request, response) => {
  const brief = buildWatchBrief(request.params.matchId);
  response.json({
    ...brief,
    settlement: request.x402 ?? null,
    note: "Paid with native testnet USDC through Injective x402 EIP-3009.",
  });
});

app.listen(port, "127.0.0.1", () => {
  console.log(`Cup Signal live x402 server listening on http://127.0.0.1:${port}`);
});
