import { decodePaymentSignatureHeader } from "@injectivelabs/x402/client";
import { InjectiveFacilitator } from "@injectivelabs/x402/facilitator";
import { INJECTIVE_TESTNET_CAIP2, TOKENS } from "@injectivelabs/x402/networks";
import { DurableObject } from "cloudflare:workers";
import { buildWatchBrief } from "../src/forecast";

interface Env {
  INJECTIVE_PRIVATE_KEY: `0x${string}`;
  RECEIVER_ADDRESS: `0x${string}`;
  PUBLIC_BASE_URL: string;
  INJECTIVE_RPC_URL: string;
  RECEIPTS: DurableObjectNamespace<ReceiptStore>;
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

    const receiptKey = [
      payload.payload.authorization.from.toLowerCase(),
      requirements.asset.toLowerCase(),
      payload.payload.authorization.nonce.toLowerCase(),
    ].join(":");
    const receiptStore = env.RECEIPTS.getByName(receiptKey);
    const settlement = await receiptStore.settleOnce({
      paymentPayload: payload,
      paymentRequirements: requirements,
      facilitatorConfig: {
        privateKey: env.INJECTIVE_PRIVATE_KEY,
        rpcUrl: env.INJECTIVE_RPC_URL,
      },
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

type SettlementInput = {
  paymentPayload: ReturnType<typeof decodePaymentSignatureHeader>;
  paymentRequirements: {
    scheme: "exact";
    network: string;
    amount: string;
    asset: `0x${string}`;
    payTo: `0x${string}`;
    maxTimeoutSeconds: number;
    extra: Record<string, unknown>;
  };
  facilitatorConfig: {
    privateKey: `0x${string}`;
    rpcUrl: string;
  };
};

type StoredSettlement = {
  state: "pending" | "success" | "failed";
  result?: Awaited<ReturnType<InjectiveFacilitator["settle"]>>;
  updatedAt: number;
};

export class ReceiptStore extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => {
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS settlement (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          state TEXT NOT NULL,
          result_json TEXT,
          updated_at INTEGER NOT NULL
        )
      `);
    });
  }

  async settleOnce(input: SettlementInput): Promise<Awaited<ReturnType<InjectiveFacilitator["settle"]>>> {
    const currentRow = this.ctx.storage.sql
      .exec<{ state: StoredSettlement["state"]; result_json: string | null; updated_at: number }>(
        "SELECT state, result_json, updated_at FROM settlement WHERE id = 1",
      )
      .toArray()[0];
    const current: StoredSettlement | undefined = currentRow
      ? {
          state: currentRow.state,
          result: currentRow.result_json ? JSON.parse(currentRow.result_json) : undefined,
          updatedAt: currentRow.updated_at,
        }
      : undefined;
    if (current?.state === "success" && current.result) return current.result;
    if (current?.state === "pending" && Date.now() - current.updatedAt < 5 * 60_000) {
      return {
        success: false,
        errorReason: "settlement_pending",
        errorMessage: "Settlement for this EIP-3009 nonce is already in progress",
        payer: input.paymentPayload.payload.authorization.from,
        transaction: "",
        network: input.paymentRequirements.network,
      };
    }

    this.ctx.storage.sql.exec(
      `INSERT INTO settlement (id, state, result_json, updated_at)
       VALUES (1, 'pending', NULL, ?)
       ON CONFLICT(id) DO UPDATE SET
         state = 'pending',
         result_json = NULL,
         updated_at = excluded.updated_at`,
      Date.now(),
    );

    const facilitator = new InjectiveFacilitator({
      privateKey: input.facilitatorConfig.privateKey,
      rpcUrl: input.facilitatorConfig.rpcUrl,
      confirmations: 1,
      allowedAssets: [usdc],
      minPaymentPerAsset: { [usdc.toLowerCase()]: "1000" },
    });
    const result = await facilitator.settle({
      paymentPayload: input.paymentPayload,
      paymentRequirements: input.paymentRequirements,
    });

    this.ctx.storage.sql.exec(
      "UPDATE settlement SET state = ?, result_json = ?, updated_at = ? WHERE id = 1",
      result.success ? "success" : "failed",
      JSON.stringify(result),
      Date.now(),
    );
    return result;
  }
}

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
