/** Auto-scoring rules: which incoming steps an evaluator grades, and what an AI grade costs. Pure, so it is easy to test. */

export const JUDGE_MODELS = [
  { id: "gpt-4o-mini", label: "GPT-4o mini", inputPerToken: 0.00000015, outputPerToken: 0.0000006 },
  { id: "gpt-4.1-mini", label: "GPT-4.1 mini", inputPerToken: 0.0000004, outputPerToken: 0.0000016 },
] as const;

export const DEFAULT_JUDGE_MODEL = JUDGE_MODELS[0].id;
export const MAX_DAILY_LIMIT = 100_000;
/** A judge call reads about this many tokens in and writes about this many out; used only for the cost estimate. */
export const TYPICAL_JUDGE_TOKENS = { input: 1200, output: 120 } as const;

export type RuleWhen = "every" | "failed" | "run_end";
export type RuleTrigger = { when: RuleWhen; modelContains?: string; dailyLimit?: number };
export type RuleStep = { spanType?: string; modelId?: string };

export const WHEN_LABELS: Record<RuleWhen, string> = {
  every: "Every step",
  failed: "Only failed steps",
  run_end: "Only the end of a run",
};

export function judgeModel(id: string | undefined) {
  return JUDGE_MODELS.find((model) => model.id === id?.trim());
}

export function judgeCost(modelId: string, inputTokens: number, outputTokens: number) {
  const model = judgeModel(modelId);
  return model ? inputTokens * model.inputPerToken + outputTokens * model.outputPerToken : 0;
}

export function estimatedGradeCost(modelId: string | undefined) {
  return judgeCost(modelId ?? DEFAULT_JUDGE_MODEL, TYPICAL_JUDGE_TOKENS.input, TYPICAL_JUDGE_TOKENS.output);
}

/** Whether a step is one this rule should grade. A missing trigger means every step, as before rules existed. */
export function stepMatches(trigger: RuleTrigger | undefined, step: RuleStep) {
  if (!trigger) return true;
  if (trigger.when === "failed" && step.spanType !== "error") return false;
  if (trigger.when === "run_end" && step.spanType !== "run_end") return false;
  const needle = trigger.modelContains?.trim().toLowerCase();
  if (needle && !(step.modelId ?? "").toLowerCase().includes(needle)) return false;
  return true;
}

/** Returns a plain-language problem with a trigger, or null when it can be saved. */
export function checkTrigger(trigger: RuleTrigger | undefined): string | null {
  if (!trigger) return null;
  if (!["every", "failed", "run_end"].includes(trigger.when)) return "Pick which steps to grade.";
  if ((trigger.modelContains?.length ?? 0) > 80) return "The model filter can be at most 80 characters.";
  if (trigger.dailyLimit !== undefined && (!Number.isInteger(trigger.dailyLimit) || trigger.dailyLimit < 1 || trigger.dailyLimit > MAX_DAILY_LIMIT)) return `The daily cap must be a whole number from 1 to ${MAX_DAILY_LIMIT.toLocaleString("en-US")}.`;
  return null;
}

export function startOfUtcDay(now: number) {
  return now - (now % 86_400_000);
}
