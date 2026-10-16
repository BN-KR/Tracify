import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { test } from "node:test";

const app = "src/app/(frontend)";
const read = (path) => readFileSync(path, "utf8");

// Utility trees must carry noindex through a layout, not only robots.txt.
for (const dir of ["onboarding", "dashboard", "playground", "(auth)", "cloud", "forgot-password", "reset-password", "accept-invitation", "auth", "pricing/checkout", "admin"]) {
  test(`${dir} is noindex`, () => {
    const layout = `${app}/${dir}/layout.tsx`;
    assert.ok(existsSync(layout), `${layout} missing`);
    assert.match(read(layout), /noIndex/);
  });
}

// Public pages must use the shared helper so canonical, Open Graph and X card values stay complete.
for (const file of ["changelog/page.tsx", "roadmap/page.tsx", "status/page.tsx", "privacy/page.tsx", "terms/page.tsx", "cookie-policy/page.tsx", "security/page.tsx", "contact/page.tsx", "integrations/page.tsx", "glossary/page.tsx", "blog/page.tsx", "docs/page.tsx", "pricing/layout.tsx", "demo/layout.tsx", "product/[feature]/page.tsx", "use-cases/[slug]/page.tsx", "docs/[...slug]/page.tsx"]) {
  test(`${file} ships full social metadata`, () => assert.match(read(`${app}/${file}`), /pageMetadata\(/));
}

test("root layout does not force a homepage og:url on every page", () => {
  assert.doesNotMatch(read(`${app}/layout.tsx`), /url: "\/",\s*\n\s*locale/);
});

test("sitemap lists every public legal page", () => {
  const sitemap = read(`${app}/sitemap.ts`);
  for (const path of ["/privacy", "/terms", "/cookie-policy"]) assert.ok(sitemap.includes(path), path);
});

test("robots keeps utility routes out of the crawl", () => {
  const robots = read("src/app/robots.ts");
  for (const path of ["/dashboard/", "/onboarding/", "/api/", "/sign-in", "/sign-up"]) assert.ok(robots.includes(path), path);
});
