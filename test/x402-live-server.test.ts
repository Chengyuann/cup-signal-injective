import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PaymentRequiredSchema } from "@injectivelabs/x402/schemas";

test("live x402 server uses official Injective testnet USDC requirements", async () => {
  const source = await readFile("server/x402-live-server.ts", "utf8");

  assert.match(source, /injectivePaymentMiddleware/);
  assert.match(source, /INJECTIVE_TESTNET_CAIP2/);
  assert.match(source, /TOKENS\[INJECTIVE_TESTNET_CAIP2\]\.USDC/);
  assert.match(source, /settlementPolicy:\s*"before"/);
});

test("official payment-required schema accepts the intended route offer", () => {
  const parsed = PaymentRequiredSchema.parse({
    x402Version: 2,
    error: "PAYMENT-SIGNATURE header is required",
    resource: {
      url: "https://api.example.com/api/premium-report/cup-001",
      description: "Cup Signal premium report",
      mimeType: "application/json",
    },
    accepts: [
      {
        scheme: "exact",
        network: "eip155:1439",
        amount: "10000",
        asset: "0x0C382e685bbeeFE5d3d9C29e29E341fEE8E84C5d",
        payTo: "0x0C69f390Da3e0B35570F031c0878e9F000cf5D84",
        maxTimeoutSeconds: 180,
        extra: {
          name: "USDC",
          version: "2",
          assetTransferMethod: "eip3009",
        },
      },
    ],
  });

  assert.equal(parsed.accepts[0].network, "eip155:1439");
  assert.equal(parsed.accepts[0].amount, "10000");
});
