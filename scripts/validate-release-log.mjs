import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const file = resolve(import.meta.dirname, "../docs/releases.md");
const source = readFileSync(file, "utf8");
const entries = [...source.matchAll(/^## \[(.+?)\](?: — (\d{4}-\d{2}-\d{2}))?$/gm)];
const required = ["Features", "Fixes", "SDK changes", "Breaking changes", "Migrations", "Security and operations", "Known limitations", "Deployment and rollback"];
if (!entries.length) throw new Error("Release log has no entries");
for (const [i, entry] of entries.entries()) {
  const body = source.slice(entry.index + entry[0].length, entries[i + 1]?.index ?? source.length);
  if (entry[1] !== "Unreleased" && !entry[2]) throw new Error(`Release ${entry[1]} is missing an ISO date`);
  for (const heading of required) if (!new RegExp(`^### ${heading}$`, "m").test(body)) throw new Error(`Release ${entry[1]} is missing ${heading}`);
}
console.log(`Validated ${entries.length} release entries`);
