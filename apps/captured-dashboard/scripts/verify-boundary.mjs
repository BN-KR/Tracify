import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const sourceDirectories = ["app", "components", "features", "tests"];
const forbiddenPatterns = [
  /from\s+["']@\//,
  /from\s+["']convex\//,
  /better-auth|clerk|tinybird|redis/i,
  /NEXT_PUBLIC_CONVEX|CONVEX_DEPLOYMENT|BETTER_AUTH|TINYBIRD|REDIS/i,
];

async function filesUnder(directory) {
  const entries = await readdir(join(root, directory), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesUnder(path));
    else if (/\.(mjs|ts|tsx)$/.test(entry.name)) files.push(path);
  }
  return files;
}

const violations = [];
for (const directory of sourceDirectories) {
  for (const file of await filesUnder(directory)) {
    const content = await readFile(join(root, file), "utf8");
    for (const pattern of forbiddenPatterns) {
      if (pattern.test(content)) violations.push(`${relative(root, file)} matches ${pattern}`);
    }
  }
}

if (violations.length) {
  console.error("Standalone deployment boundary violations:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exitCode = 1;
} else {
  console.log("Standalone deployment boundary is root-app/backend independent.");
}
