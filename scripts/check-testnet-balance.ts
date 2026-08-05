import { createPublicClient, defineChain, formatEther, http } from "viem";

const address = process.argv[2] as `0x${string}` | undefined;
if (!address) throw new Error("Usage: npm run wallet:testnet:balance -- 0x...");

const chain = defineChain({
  id: 1439,
  name: "Injective EVM Testnet",
  nativeCurrency: { name: "Injective", symbol: "INJ", decimals: 18 },
  rpcUrls: { default: { http: ["https://k8s.testnet.json-rpc.injective.network/"] } },
});
const client = createPublicClient({ chain, transport: http() });
const balance = await client.getBalance({ address });

console.log(JSON.stringify({ address, balanceWei: balance.toString(), balanceInj: formatEther(balance) }, null, 2));
