import { mkdir, readFile, writeFile } from "node:fs/promises";
import solc from "solc";

const sourcePath = "contracts/CupSignalProofRegistry.sol";
const source = await readFile(sourcePath, "utf8");
const input = {
  language: "Solidity",
  sources: {
    [sourcePath]: { content: source },
  },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object"],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const errors = (output.errors ?? []).filter((entry: { severity: string }) => entry.severity === "error");
if (errors.length > 0) {
  throw new Error(errors.map((entry: { formattedMessage: string }) => entry.formattedMessage).join("\n"));
}

const compiled = output.contracts[sourcePath].CupSignalProofRegistry;
const artifact = {
  contractName: "CupSignalProofRegistry",
  compilerVersion: solc.version(),
  sourcePath,
  abi: compiled.abi,
  bytecode: `0x${compiled.evm.bytecode.object}`,
  deployedBytecode: `0x${compiled.evm.deployedBytecode.object}`,
};

await mkdir("artifacts", { recursive: true });
await writeFile("artifacts/CupSignalProofRegistry.json", `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`Compiled ${artifact.contractName} with ${artifact.compilerVersion}`);
