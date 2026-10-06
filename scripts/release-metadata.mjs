import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const readJson = (file) => JSON.parse(readFileSync(resolve(root, file), "utf8"));
const git = (args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
const app = readJson("package.json");
const ts = readJson("packages/ts-sdk/package.json");
const py = readFileSync(resolve(root, "packages/python-sdk/pyproject.toml"), "utf8");

const metadata = {
  applicationVersion: app.version,
  typescriptSdkVersion: ts.version,
  pythonSdkVersion: py.match(/^version\s*=\s*"([^"]+)"/m)?.[1] ?? "unknown",
  commit: git(["rev-parse", "HEAD"]),
  branch: git(["branch", "--show-current"]),
  dirty: git(["status", "--porcelain"]).length > 0,
  schemaPath: "convex/schema.ts",
  generatedBindingsTracked: true,
  buildTimestamp: new Date().toISOString(),
};

writeFileSync(resolve(root, "release-metadata.json"), `${JSON.stringify(metadata, null, 2)}\n`);
console.log(JSON.stringify(metadata, null, 2));
