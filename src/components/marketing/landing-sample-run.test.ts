import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync(
  new URL("./landing-sample-run.tsx", import.meta.url),
  "utf8",
);

test("sample run keeps its local, keyboard-accessible decision contract", () => {
  assert.match(source, /useState/);
  assert.match(source, /type="button"/);
  assert.match(source, /aria-pressed=\{isSelected\}/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /setSelectedId\(step\.id\)/);

  for (const stepId of ["model", "tool", "retry", "eval"]) {
    assert.match(source, new RegExp(`id: "${stepId}"`));
  }

  for (const decision of ["Hold", "Reject"]) {
    assert.match(source, new RegExp(`decision: "${decision}"`));
  }

  assert.match(source, /useState[^\n]*\("tool"\)/);
  assert.match(source, /Sample run \/ illustrative evidence/);
});
