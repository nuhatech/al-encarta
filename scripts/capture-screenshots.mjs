// Capture polished screenshots of Al-Encarta states for the README.
// Run with: pnpm capture-screenshots
// Requires: dev server up at http://localhost:3000

import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const BASE = "http://localhost:3000";
const OUT = resolve("public/screenshots");
const VIEWPORT = { width: 1280, height: 800, deviceScaleFactor: 2 };
const CHROME =
  process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";

mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: false,
  defaultViewport: VIEWPORT,
  args: [`--window-size=${VIEWPORT.width},${VIEWPORT.height}`],
});

const page = await browser.newPage();
await page.setViewport(VIEWPORT);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function shoot(name) {
  const file = `${OUT}/${name}.png`;
  await page.screenshot({ path: file, type: "png" });
  console.log(`  → ${file}`);
}

async function go(url, settle = 800) {
  await page.goto(`${BASE}${url}`, { waitUntil: "networkidle0" });
  await sleep(settle);
}

async function clickByText(text) {
  const handle = await page.evaluateHandle((t) => {
    const all = Array.from(document.querySelectorAll("button, a, [role='button']"));
    return all.find((el) => el.textContent?.trim().includes(t)) ?? null;
  }, text);
  const el = handle.asElement();
  if (!el) throw new Error(`No element with text: ${text}`);
  await el.click();
  await sleep(400);
}

async function clickSelector(sel) {
  await page.click(sel);
  await sleep(400);
}

async function dblClickSelector(sel) {
  await page.click(sel, { count: 2 });
  await sleep(600);
}

console.log("📸 Al-Encarta screenshot capture\n");

// 1. Desktop propre
console.log("1. Desktop");
await go("/?skip=desktop");
await shoot("01-desktop");

// 2. Start menu ouvert
console.log("2. Start menu");
await page.click("[data-start-button]");
await sleep(300);
await shoot("02-start-menu");
await page.keyboard.press("Escape");
await sleep(200);

// 3. Encarta home (skip=encarta auto-opens)
console.log("3. Encarta home");
await go("/?skip=encarta", 1500);
await shoot("03-encarta-home");

// 4. Article — cliquer Al-Khawarizmi dans la sidebar
console.log("4. Article view (Al-Khawarizmi)");
try {
  await clickByText("Al-Khawarizmi");
  await sleep(600);
  await shoot("04-article-khawarizmi");
} catch (e) {
  console.warn("  skipped: " + e.message);
}

// 5. Conversation tab
console.log("5. Conversation view");
try {
  await clickByText("Conversation");
  await sleep(600);
  await shoot("05-conversation");
} catch (e) {
  console.warn("  skipped: " + e.message);
}

// 6. Démineur (via Start menu, plus fiable que double-click icône)
console.log("6. Démineur Hormuz");
await go("/?skip=desktop");
await page.click("[data-start-button]");
await sleep(300);
await clickByText("Démineur");
await sleep(800);
await shoot("06-minesweeper");

// 7. About dialog (start menu → Tour Windows XP)
console.log("7. About dialog");
await go("/?skip=desktop");
await page.click("[data-start-button]");
await sleep(300);
await clickByText("Tour Windows XP");
await sleep(600);
await shoot("07-about");

// 8. Run dialog
console.log("8. Run dialog");
await go("/?skip=desktop");
await page.click("[data-start-button]");
await sleep(300);
await clickByText("Exécuter");
await sleep(500);
await page.keyboard.type("defendhack", { delay: 50 });
await sleep(300);
await shoot("08-run");

console.log("\n✅ Done. Screenshots in public/screenshots/");

await browser.close();
