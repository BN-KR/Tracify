import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import path from "node:path";

const dashboardRoot = path.resolve("src/app/(frontend)/dashboard");

async function collectRoutes(directory, segments = []) {
  const entries = (await readdir(directory, { withFileTypes: true }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const routes = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      const nextSegments = entry.name.startsWith("(") ? segments : [...segments, entry.name];
      routes.push(...await collectRoutes(entryPath, nextSegments));
    } else if (entry.isFile() && entry.name === "page.tsx") {
      routes.push(`/${segments.map((segment) =>
        segment.startsWith("[") && segment.endsWith("]")
          ? `:${segment.slice(1, -1)}`
          : segment
      ).join("/")}`);
    }
  }

  return routes;
}

const routes = (await collectRoutes(dashboardRoot, ["dashboard"])).sort();
assert.ok(routes.length > 0, "No authenticated dashboard pages were found");
assert.ok(routes.includes("/dashboard"), "The dashboard index route is missing");
assert.ok(routes.includes("/dashboard/:projectId"), "The project dashboard route is missing");

console.log(`Authenticated dashboard routes: ${routes.length}`);
console.log("Live probe: skipped (filesystem contract only)");
for (const route of routes) console.log(route);
