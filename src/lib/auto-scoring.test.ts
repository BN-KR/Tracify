import assert from "node:assert/strict";
import test from "node:test";
import { checkTrigger, estimatedGradeCost, judgeModel, startOfUtcDay, stepMatches } from "../../convex/autoScoring.ts";

test("no rule grades every step", () => {
  assert.equal(stepMatches(undefined, { spanType: "llm_call" }), true);
  assert.equal(stepMatches({ when: "every" }, {}), true);
});

test("failed and end-of-run rules pick only those steps", () => {
  assert.equal(stepMatches({ when: "failed" }, { spanType: "error" }), true);
  assert.equal(stepMatches({ when: "failed" }, { spanType: "llm_call" }), false);
  assert.equal(stepMatches({ when: "run_end" }, { spanType: "run_end" }), true);
  assert.equal(stepMatches({ when: "run_end" }, { spanType: "tool_call" }), false);
});

test("the model filter ignores case and needs a model", () => {
  assert.equal(stepMatches({ when: "every", modelContains: "GPT-4o" }, { modelId: "gpt-4o-mini" }), true);
  assert.equal(stepMatches({ when: "every", modelContains: "claude" }, { modelId: "gpt-4o-mini" }), false);
  assert.equal(stepMatches({ when: "every", modelContains: "claude" }, {}), false);
});

test("triggers are checked before saving", () => {
  assert.equal(checkTrigger({ when: "failed", dailyLimit: 50 }), null);
  assert.match(checkTrigger({ when: "failed", dailyLimit: 0 }) ?? "", /daily cap/);
  assert.match(checkTrigger({ when: "failed", dailyLimit: 1.5 }) ?? "", /daily cap/);
  assert.match(checkTrigger({ when: "failed", dailyLimit: 1_000_000 }) ?? "", /daily cap/);
});

test("only approved judge models are known, with a cost estimate", () => {
  assert.ok(judgeModel("gpt-4o-mini"));
  assert.equal(judgeModel("some-other-model"), undefined);
  assert.ok(estimatedGradeCost("gpt-4o-mini") > 0 && estimatedGradeCost("gpt-4o-mini") < 0.01);
});

test("the daily window starts at midnight UTC", () => {
  assert.equal(startOfUtcDay(Date.UTC(2026, 9, 21, 22, 13)), Date.UTC(2026, 9, 21));
});
