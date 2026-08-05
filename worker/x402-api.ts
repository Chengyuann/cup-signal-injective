import { decodePaymentSignatureHeader } from "@injectivelabs/x402/client";
import { InjectiveFacilitator } from "@injectivelabs/x402/facilitator";
import { INJECTIVE_TESTNET_CAIP2, TOKENS } from "@injectivelabs/x402/networks";
import { buildWatchBrief } from "../src/forecast";

interface Env {
  INJECTIVE_PRIVATE_KEY: `0x${string}`;
  RECEIVER_ADDRESS: `0x${string}`;
  PUBLIC_BASE_URL: string;
  INJECTIVE_RPC_URL: string;
}

const usdc = TOKENS[INJECTIVE_TESTNET_CAIP2].USDC.address;
const amount = "10000";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return cors(new Response(null, { status: 204 }));
    if (url.pathname === "/health") {
      return cors(
        json({
          ok: true,
          service: "cup-signal-public-x402",
          network: INJECTIVE_TESTNET_CAIP2,
          asset: usdc,
          amount,
        }),
      );
    }

    const match = url.pathname.match(/^\/api\/premium-report\/([^/]+)$/);
    if (!match || request.method !== "GET") return cors(json({ error: "not_found" }, 404));

    const matchId = match[1];
    const brief = buildWatchBrief(matchId);
    const resource = {
      url: `${env.PUBLIC_BASE_URL}/api/premium-report/${matchId}`,
      description: "Cup Signal premium World Cup tactical and player report",
      mimeType: "application/json",
      serviceName: "Cup Signal",
      tags: ["world-cup", "injective", "match-intelligence"],
    };
    const requirements = {
      scheme: "exact" as const,
      network: INJECTIVE_TESTNET_CAIP2,
      amount,
      asset: usdc,
      payTo: env.RECEIVER_ADDRESS,
      maxTimeoutSeconds: 180,
      extra: {
        name: "USDC",
        version: "2",
        assetTransferMethod: "eip3009",
      },
    };
    const paymentRequired = {
      x402Version: 2 as const,
      error: "PAYMENT-SIGNATURE header is required",
      resource,
      accepts: [requirements],
    };
    const paymentHeader =
      request.headers.get("PAYMENT-SIGNATURE") ?? request.headers.get("X-PAYMENT");

    if (!paymentHeader) return paymentRequiredResponse(paymentRequired);

    let payload;
    try {
      payload = decodePaymentSignatureHeader(paymentHeader);
    } catch {
      return paymentRequiredResponse({
        ...paymentRequired,
        error: "Invalid PAYMENT-SIGNATURE header encoding",
      });
    }

    const facilitator = new InjectiveFacilitator({
      privateKey: env.INJECTIVE_PRIVATE_KEY,
      rpcUrl: env.INJECTIVE_RPC_URL,
      confirmations: 1,
      allowedAssets: [usdc],
      minPaymentPerAsset: { [usdc.toLowerCase()]: "1000" },
    });
    const verifyResult = await facilitator.verify({
      paymentPayload: payload,
      paymentRequirements: requirements,
    });
    if (!verifyResult.isValid) {
      return paymentRequiredResponse({
        ...paymentRequired,
        error: verifyResult.invalidReason ?? "Payment verification failed",
      });
    }

    const settlement = await facilitator.settle({
      paymentPayload: payload,
      paymentRequirements: requirements,
    });
    const receipt = btoa(JSON.stringify(settlement));
    if (!settlement.success) {
      return cors(
        json(
          {
            error: "payment_settlement_failed",
            message: settlement.errorMessage ?? settlement.errorReason,
            settlement,
          },
          402,
          { "PAYMENT-RESPONSE": receipt, "X-PAYMENT-RESPONSE": receipt },
        ),
      );
    }

    return cors(
      json(
        {
          ...brief,
          settlement: {
            payer: settlement.payer,
            network: settlement.network,
            amount: requirements.amount,
            asset: requirements.asset,
            txHash: settlement.transaction,
          },
          note: "Paid with native testnet USDC through Injective x402 EIP-3009.",
        },
        200,
        { "PAYMENT-RESPONSE": receipt, "X-PAYMENT-RESPONSE": receipt },
      ),
    );
  },
};

function paymentRequiredResponse(body: object): Response {
  const encoded = btoa(JSON.stringify(body));
  return cors(json(body, 402, { "PAYMENT-REQUIRED": encoded }));
}

function json(body: object, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });
}

function cors(response: Response): Response {
  const next = new Response(response.body, response);
  next.headers.set("access-control-allow-origin", "*");
  next.headers.set("access-control-allow-headers", "content-type,payment-signature,x-payment");
  next.headers.set("access-control-expose-headers", "payment-required,payment-response,x-payment-response");
  return next;
}
