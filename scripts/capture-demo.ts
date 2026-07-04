import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const errors: string[] = [];
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});

await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
await page.screenshot({ path: "outputs/cup-signal-desktop.png", fullPage: true });
if (!(await page.getByText("本场球员评分").isVisible())) {
  throw new Error("Player dashboard heading not visible");
}
await page.getByRole("button", { name: "defense" }).click();
if (!(await page.getByText("Edson Alvarez").isVisible())) {
  throw new Error("Defense mode did not focus Edson Alvarez");
}
await page.screenshot({ path: "outputs/cup-signal-player-board.png", fullPage: true });

await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
await page.screenshot({ path: "outputs/cup-signal-mobile.png", fullPage: true });

await page.getByRole("button", { name: /Simulate x402 Unlock/i }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: "outputs/cup-signal-unlocked.png", fullPage: false });

await browser.close();

console.log(
  JSON.stringify(
    {
      screenshots: [
        "outputs/cup-signal-desktop.png",
        "outputs/cup-signal-player-board.png",
        "outputs/cup-signal-mobile.png",
        "outputs/cup-signal-unlocked.png",
      ],
      consoleErrors: errors,
    },
    null,
    2,
  ),
);
