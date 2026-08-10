/**
 * Dashboard screenshot capture script.
 *
 * Usage:
 *   node scripts/screenshot.mjs [--base-url=http://localhost:3000]
 *
 * Requires the dev server to be running. Takes full-page screenshots
 * of key dashboard views and saves them to public/screenshots/.
 */

import puppeteer from "puppeteer";
import { mkdirSync } from "fs";
import { join } from "path";

const args = process.argv.slice(2);
const baseUrl = args
  .find((a) => a.startsWith("--base-url="))
  ?.split("=")[1] ?? "http://localhost:3000";

const OUT_DIR = join(process.cwd(), "public", "screenshots");

const PAGES = [
  {
    name: "landing-hero",
    path: "/",
    width: 1440,
    height: 900,
    fullPage: false,
  },
  {
    name: "landing-full",
    path: "/",
    width: 1440,
    height: 900,
    fullPage: true,
  },
  {
    name: "pricing",
    path: "/pricing",
    width: 1440,
    height: 900,
    fullPage: true,
  },
  {
    name: "security",
    path: "/security",
    width: 1440,
    height: 900,
    fullPage: true,
  },
  {
    name: "integrations",
    path: "/integrations",
    width: 1440,
    height: 900,
    fullPage: true,
  },
];

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  for (const { name, path, width, height, fullPage } of PAGES) {
    console.log(`Capturing ${name} (${baseUrl}${path})...`);

    await page.setViewport({ width, height });

    try {
      await page.goto(`${baseUrl}${path}`, {
        waitUntil: "networkidle2",
        timeout: 30_000,
      });
    } catch (err) {
      console.error(`  Failed to load ${path}: ${err.message}`);
      continue;
    }

    // Wait a beat for animations to settle
    await new Promise((r) => setTimeout(r, 1500));

    const outPath = join(OUT_DIR, `${name}.png`);
    await page.screenshot({
      path: outPath,
      fullPage,
    });

    console.log(`  Saved: ${outPath}`);
  }

  await browser.close();
  console.log(`\nDone. ${PAGES.length} screenshots saved to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
