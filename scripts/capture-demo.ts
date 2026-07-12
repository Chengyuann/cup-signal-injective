import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const baseUrl = process.env.CAPTURE_BASE_URL ?? "http://127.0.0.1:5173/";
const errors: string[] = [];
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});

await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1400);
await page.screenshot({ path: "outputs/cup-signal-desktop.png", fullPage: true });
const desktopText = await page.evaluate(() => document.body.innerText.toLowerCase());
if (!desktopText.includes("argentina vs egypt")) {
  throw new Error("Default hero fixture must use the latest real Argentina vs Egypt schedule entry");
}
if (!desktopText.includes("final") || (!desktopText.includes("3 - 2") && !desktopText.includes("arg 3-2 egy"))) {
  throw new Error("Argentina vs Egypt must show the verified final score 3-2");
}
for (const staleText of ["Mexico vs England", "Mexico vs Argentina", "ENG avg", "Kane", "Bellingham", "Saka"]) {
  if (await page.getByText(staleText).count()) {
    throw new Error(`Default page still contains stale non-Argentina-homepage text: ${staleText}`);
  }
}
for (const currentText of ["ARG avg", "EGY avg", "Messi", "Salah", "Enzo"]) {
  if (!(await page.getByText(currentText).first().isVisible())) {
    throw new Error(`Default Argentina vs Egypt player-board text missing: ${currentText}`);
  }
}
if (!(await page.getByText("Real World Cup 2026 data is wired in").isVisible())) {
  throw new Error("Real World Cup data panel not visible");
}
if (!(await page.getByText("Matches").first().isVisible())) {
  throw new Error("Tournament stats not visible");
}
if (!(await page.getByText("Live player ratings, form state, and ability deltas").isVisible())) {
  throw new Error("Player dashboard heading not visible");
}
if (!(await page.getByText("Player ratings below are simulated").isVisible())) {
  throw new Error("Simulated player layer disclaimer missing");
}
if (!(await page.getByText("Motion Layer").isVisible())) {
  throw new Error("Motion layer heading not visible");
}
if (!(await page.getByRole("button", { name: /Refresh Live Data/i }).isVisible())) {
  throw new Error("Live data refresh button not visible");
}
await page.getByRole("button", { name: /Refresh Live Data/i }).click();
await page.waitForTimeout(14000);
const refreshWorked = await page.evaluate(() => {
  const text = document.body.innerText;
  return text.includes("Live data updated") || text.includes("Live API unavailable");
});
if (!refreshWorked) {
  throw new Error("Live data refresh button did not report a result");
}
if (!(await page.getByText("Injective Playbook").isVisible())) {
  throw new Error("Injective playbook heading not visible");
}
for (const label of ["x402 Paid Scout Intel", "USDC CCTP Fan Pool", "MCP Match Analyst Server", "Agent Skill Live Posting Coach"]) {
  if (!(await page.getByText(label).isVisible())) {
    throw new Error(`Injective playbook card missing: ${label}`);
  }
}
await page.getByRole("button", { name: "Language" }).click();
if (!(await page.getByText("接入 2026 世界杯真实赛程数据").isVisible())) {
  throw new Error("Chinese language toggle did not work");
}
await page.getByRole("button", { name: "语言" }).click();
const worldCupImagesLoaded = await page.evaluate(() =>
  [...document.images]
    .filter((image) => image.src.includes("/worldcup/"))
    .every((image) => image.complete && image.naturalWidth > 0),
);
if (!worldCupImagesLoaded) {
  throw new Error("World Cup motion images did not load");
}
const teamAssetsLoaded = await page.evaluate(() =>
  [...document.images]
    .filter((image) => image.src.includes("/teams/"))
    .every((image) => image.complete && image.naturalWidth > 0),
);
if (!teamAssetsLoaded) {
  throw new Error("Team flag or crest images did not load");
}
await page.getByRole("button", { name: "defense" }).click();
if (!(await page.getByText("stop actions").first().isVisible())) {
  throw new Error("Defense mode did not expose defensive player strengths");
}
await page.screenshot({ path: "outputs/cup-signal-player-board.png", fullPage: true });

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1400);
const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
if (mobileOverflow > 2) {
  throw new Error(`Mobile layout overflows horizontally by ${mobileOverflow}px`);
}
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
