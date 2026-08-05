import assert from "node:assert/strict";
import test from "node:test";
import { PaymentRequiredSchema } from "@injectivelabs/x402/schemas";

const usdc = "0x0C382e685bbeeFE5d3d9C29e29E341fEE8E84C5d";
const payee = "0x0C69f390Da3e0B35570F031c0878e9F000cf5D84";

test("agent budget accepts exactly 0.01 USDC", () => {
  const requirement = requirementFor("10000");
  assert.ok(BigInt(requirement.amount) <= 10_000n);
});

test("agent budget rejects a price above 0.01 USDC", () => {
  const requirement = requirementFor("10001");
  assert.ok(BigInt(requirement.amount) > 10_000n);
});

test("agent policy rejects a non-USDC asset", () => {
  const requirement = requirementFor("10000", "0x0000000000000000000000000000000000000001");
  assert.notEqual(requirement.asset.toLowerCase(), usdc.toLowerCase());
});

function requirementFor(amount: string, asset = usdc) {
  return PaymentRequiredSchema.parse({
    x402Version: 2,
    resource: { url: "https://api.example.com/report" },
    accepts: [
      {
        scheme: "exact",
        network: "eip155:1439",
        amount,
        asset,
        payTo: payee,
        maxTimeoutSeconds: 180,
        extra: { name: "USDC", version: "2", assetTransferMethod: "eip3009" },
      },
    ],
  }).accepts[0];
}
