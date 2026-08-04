import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import test from "node:test";

const port = 4400 + (process.pid % 200);
const baseUrl = `http://127.0.0.1:${port}`;
let server: ChildProcess;

test.before(async () => {
  server = spawn(process.execPath, ["./node_modules/tsx/dist/cli.mjs", "server/x402-report-server.ts"], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port), X402_LIVE: "false" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  await waitForServer();
});

test.after(() => {
  server?.kill("SIGTERM");
});

test("health endpoint reports dry-run mode", async () => {
  const response = await fetch(`${baseUrl}/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.mode, "dry-run");
});

test("premium endpoint returns a valid 402 challenge", async () => {
  const response = await fetch(`${baseUrl}/api/premium-report/cup-001`);
  const body = await response.json();

  assert.equal(response.status, 402);
  assert.equal(body.x402Version, 2);
  assert.equal(body.accepts[0].asset, "USDC");
  assert.match(body.accepts[0].resource, /^\/api\/premium-report\//);
});

test("demo payment header unlocks the report", async () => {
  const response = await fetch(`${baseUrl}/api/premium-report/cup-001`, {
    headers: { "X-PAYMENT": "demo-paid" },
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.payment.protocol, "x402");
  assert.equal(body.cctp.token, "USDC");
  assert.match(response.headers.get("x-payment-response") ?? "", /dry-run-header-accepted/);
});

async function waitForServer(): Promise<void> {
  const deadline = Date.now() + 10_000;

  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`x402 server exited with code ${server.exitCode}`);
    }

    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch {
      // The process is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error("Timed out waiting for x402 server");
}
