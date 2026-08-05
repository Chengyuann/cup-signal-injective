import { createPublicClient, defineChain, formatEther, formatUnits, http } from "viem";

const address =
  (process.env.CCTP_ADDRESS as `0x${string}` | undefined) ??
  "0x36090AA807e6B13bdD162F7852cB0793b0d87c1a";

const baseSepolia = defineChain({
  id: 84532,
  name: "Base Sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://sepolia.base.org"] } },
});
const injective = defineChain({
  id: 1439,
  name: "Injective EVM Testnet",
  nativeCurrency: { name: "Injective", symbol: "INJ", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet.evm.archival.chain.virtual.json-rpc.injective.network/"] },
  },
});
const baseClient = createPublicClient({ chain: baseSepolia, transport: http() });
const injectiveClient = createPublicClient({ chain: injective, transport: http() });
const erc20Abi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
const baseUsdc = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const injUsdc = "0x0C382e685bbeeFE5d3d9C29e29E341fEE8E84C5d";

const [baseEth, baseUsdcBalance, injInj, injUsdcBalance] = await Promise.all([
  baseClient.getBalance({ address }),
  baseClient.readContract({ address: baseUsdc, abi: erc20Abi, functionName: "balanceOf", args: [address] }),
  injectiveClient.getBalance({ address }),
  injectiveClient.readContract({ address: injUsdc, abi: erc20Abi, functionName: "balanceOf", args: [address] }),
]);

console.log(
  JSON.stringify(
    {
      status: "preflight",
      route: "Base Sepolia -> Injective Testnet",
      sourceDomain: 6,
      destinationDomain: 29,
      token: "USDC",
      amount: "1",
      address,
      contracts: {
        tokenMessengerV2: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
        messageTransmitterV2: "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275",
        baseUsdc,
        injUsdc,
      },
      balances: {
        baseEth: formatEther(baseEth),
        baseUsdc: formatUnits(baseUsdcBalance, 6),
        injectiveInj: formatEther(injInj),
        injectiveUsdc: formatUnits(injUsdcBalance, 6),
      },
      completedProof: "public/proofs/cctp-transfer.json",
      resumeCommand: "npm run cctp:resume",
    },
    null,
    2,
  ),
);
