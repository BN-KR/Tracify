const required = ["NEXT_PUBLIC_CONVEX_URL", "NEXT_PUBLIC_CONVEX_SITE_URL"];
const missing = required.filter((name) => !process.env[name]?.trim());

if (missing.length) {
  console.error(`E2E preflight failed: missing ${missing.join(", ")}. Copy .env.local.example to .env.local and provide the active Convex deployment endpoints before starting Playwright.`);
  process.exit(1);
}

console.log(`E2E preflight passed for ${process.env.PLAYWRIGHT_DEPLOYMENT === "cloud" ? "cloud" : "marketing/local"} host.`);
