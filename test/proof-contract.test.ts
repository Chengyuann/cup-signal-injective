import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import solc from "solc";

test("proof registry compiles with the expected immutable write surface", async () => {
  const path = "contracts/CupSignalProofRegistry.sol";
  const source = await readFile(path, "utf8");
  const output = JSON.parse(
    solc.compile(
      JSON.stringify({
        language: "Solidity",
        sources: { [path]: { content: source } },
        settings: {
          outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
        },
      }),
    ),
  );
  const errors = (output.errors ?? []).filter((entry: { severity: string }) => entry.severity === "error");
  assert.deepEqual(errors, []);

  const contract = output.contracts[path].CupSignalProofRegistry;
  const functions = contract.abi
    .filter((entry: { type: string }) => entry.type === "function")
    .map((entry: { name: string; stateMutability: string }) => `${entry.name}:${entry.stateMutability}`)
    .sort();

  assert.deepEqual(functions, ["anchorProof:nonpayable", "latestProof:view", "owner:view"]);
  assert.ok(contract.evm.bytecode.object.length > 0);
});
