import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    x402?: {
      payer: `0x${string}`;
      network: string;
      amount: string;
      asset: `0x${string}`;
      txHash?: `0x${string}`;
    };
  }
}
