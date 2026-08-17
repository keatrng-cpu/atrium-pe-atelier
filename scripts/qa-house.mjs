import { chromium } from "playwright";

const base = "http://127.0.0.1:8080";
const email = `house.${Date.now()}@atrium.test`;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("pageerror", (err) => console.error("PAGEERROR", err.message));
page.on("console", (msg) => {
  if (msg.type() === "error") console.error("CONSOLE", msg.text());
});

await page.goto(`${base}/signup`, { waitUntil: "networkidle" });
await page.getByLabel("Name").first().fill("Helena Voss");
await page.getByLabel("Email").fill(email);
await page.getByLabel("Password").fill("atelier-house-2026");
await page.getByRole("button", { name: /open the account/i }).click();
await page.waitForTimeout(2500);

await page.goto(`${base}/house`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const heading = await page.locator("h1").first().textContent();
console.log("house heading", heading);

if (await page.getByLabel("House name").count()) {
  await page.getByLabel("House name").fill("Northbridge Partners");
  await page.getByLabel("Investment thesis").fill("Control buyouts in essential services where we already have an operator.");
  await page.getByRole("button", { name: /open the house/i }).click();
  await page.waitForTimeout(2000);
}

await page.screenshot({ path: "/workspace/screenshots/house-floor.png", fullPage: false });
await page.goto(`${base}/house/pipeline`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.screenshot({ path: "/workspace/screenshots/house-pipeline.png", fullPage: false });
await page.goto(`${base}/house/rooms`, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await page.screenshot({ path: "/workspace/screenshots/house-rooms.png", fullPage: false });
console.log("ok", await page.locator("h2").first().textContent());
await browser.close();
