import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const files = [
  "content/docs/quickstart.mdoc",
  "content/docs/typescript.mdoc",
  "content/docs/python.mdoc",
  "content/docs/data-regions.mdoc",
  "src/components/onboarding/install-step.tsx",
  "src/components/marketing/command-center-story.tsx",
  "src/components/marketing/navigation-system-explorations.tsx",
  "src/components/dashboard/docs-viewer.tsx",
];

const source = files
  .map((file) => fs.readFileSync(path.join(root, file), "utf8"))
  .join("\n");

assert.doesNotMatch(source, /npm install tracify(?:\s|["'`]|$)/, "legacy npm install command remains");
assert.doesNotMatch(source, /pip install tracify(?:\s|\n|$)/, "legacy pip install command remains");
assert.doesNotMatch(source, /import\s*\{\s*Tracify\s*\}/, "removed Tracify class remains in public examples");
assert.doesNotMatch(source, /from\s+tracify\s+import\s+Tracify/, "removed Python Tracify class remains in public examples");
assert.match(source, /npm install tracify-sdk/, "canonical npm package is missing");
assert.match(source, /pip install tracify-sdk/, "canonical Python package is missing");
assert.match(source, /traceAgent/, "canonical TypeScript wrapper is missing");
assert.match(source, /trace_agent/, "canonical Python wrapper is missing");

console.log(`Activation contract passed for ${files.length} user-facing sources.`);
