import assert from "node:assert/strict";
import { chromium } from "playwright";

const base = process.env.CUP_SIGNAL_BASE_URL ?? "https://chengyuann.github.io/cup-signal-injective/";
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.platform === "darwin"
      ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      : undefined,
});

try {
  for (const viewport of [
    { name: "desktop", width: 1440, height: 900 },
    { name: "mobile", width: 320, height: 700 },
  ]) {
    const page = await browser.newPage({ viewport });
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));

    const response = await page.goto(base, { waitUntil: "networkidle", timeout: 60_000 });
    assert.equal(response?.status(), 200);
    assert.equal((await page.locator("h1").innerText()).toLowerCase(), "cup signal");
    assert.equal(await page.locator(".onchain-proof.live").count(), 2);
    assert.match(await page.locator(".onchain-proof.live").nth(0).innerText(), /ON-CHAIN PROOF LIVE/);
    assert.match(await page.locator(".onchain-proof.live").nth(1).innerText(), /REAL x402 SETTLEMENT LIVE/);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), viewport.width);
    assert.deepEqual(errors, []);
    await page.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify({ ok: true, base, viewports: ["desktop", "mobile"] }, null, 2));
