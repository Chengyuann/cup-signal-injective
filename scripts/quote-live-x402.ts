import { parsePaymentRequired } from "@injectivelabs/x402/client";
import { formatUnits } from "viem";

const url = process.argv[2] ?? "http://127.0.0.1:4021/api/premium-report/cup-001";
const response = await fetch(url);
if (response.status !== 402) throw new Error(`Expected 402, received ${response.status}`);

const header = response.headers.get("payment-required");
if (!header) throw new Error("PAYMENT-REQUIRED header is missing");
const required = parsePaymentRequired(header);
const option = required.accepts[0];

console.log(
  JSON.stringify(
    {
      status: response.status,
      resource: required.resource,
      network: option.network,
      asset: option.asset,
      amountBaseUnits: option.amount,
      amountUsdc: formatUnits(BigInt(option.amount), 6),
      payTo: option.payTo,
      maxTimeoutSeconds: option.maxTimeoutSeconds,
      error: required.error,
    },
    null,
    2,
  ),
);
