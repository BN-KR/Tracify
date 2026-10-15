import assert from "node:assert/strict";
import test from "node:test";
import { EU_PROJECT_ID, shouldBuild } from "./vercel-ignore-build.mjs";

const eu = (branch) => ({ VERCEL_PROJECT_ID: EU_PROJECT_ID, VERCEL_GIT_COMMIT_REF: branch });

test("EU project builds main and preview/ branches only", () => {
  assert.equal(shouldBuild(eu("main")), true);
  assert.equal(shouldBuild(eu("preview/steps")), true);
  assert.equal(shouldBuild(eu("codex/thing")), false);
  assert.equal(shouldBuild(eu("claude/thing")), false);
});

test("other projects always build", () => {
  assert.equal(shouldBuild({ VERCEL_PROJECT_ID: "prj_other", VERCEL_GIT_COMMIT_REF: "codex/x" }), true);
  assert.equal(shouldBuild({}), true);
});
