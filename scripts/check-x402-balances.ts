import { createPublicClient, defineChain, formatEther, formatUnits, http } from "viem";

const addresses = process.argv.slice(2) as `0x${string}`[];
if (addresses.length === 0) throw new Error("Usage: npm run x402:balances -- 0x...");

const chain = defineChain({
  id: 1439,
  name: "Injective EVM Testnet",
  nativeCurrency: { name: "Injective", symbol: "INJ", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet.evm.archival.chain.virtual.json-rpc.injective.network/"] },
  },
});
const client = createPublicClient({ chain, transport: http() });
const usdc = "0x0C382e685bbeeFE5d3d9C29e29E341fEE8E84C5d";
const abi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const rows = [];
for (const address of addresses) {
  const [inj, usdcBalance] = await Promise.all([
    client.getBalance({ address }),
    client.readContract({ address: usdc, abi, functionName: "balanceOf", args: [address] }),
  ]);
  rows.push({
    address,
    inj: formatEther(inj),
    usdc: formatUnits(usdcBalance, 6),
  });
}

console.log(JSON.stringify({ network: "eip155:1439", token: usdc, balances: rows }, null, 2));
