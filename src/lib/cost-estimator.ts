/** Pure maths behind the public AI cost estimator. No network, no stored data. */

export type EstimatorInput = {
  runsPerDay: number;
  callsPerRun: number;
  inputTokens: number;
  outputTokens: number;
  /** Share of input tokens served from a prompt cache, 0-100. */
  cachedShare: number;
  inputPricePerM: number;
  outputPricePerM: number;
  /** Discount a provider gives on cached input tokens, 0-100. */
  cachedDiscount: number;
  /** Share of runs that are repeated once, 0-100. */
  retryRate: number;
  toolCostPerRun: number;
  /** Share of runs that actually finish the task, 1-100. */
  successRate: number;
};

export type EstimatorResult = {
  costPerAttempt: number;
  costPerRun: number;
  costPerSuccess: number;
  perDay: number;
  perMonth: number;
  retryOverheadPerMonth: number;
  failedSpendPerMonth: number;
};

export type Lever = { id: string; label: string; detail: string; monthlySaving: number };

export const DAYS_PER_MONTH = 30;

export const tierPresets = [
  { id: "small", label: "Small model", inputPricePerM: 0.15, outputPricePerM: 0.6 },
  { id: "mid", label: "Mid model", inputPricePerM: 1, outputPricePerM: 4 },
  { id: "frontier", label: "Frontier model", inputPricePerM: 5, outputPricePerM: 25 },
] as const;

export const defaultInput: EstimatorInput = {
  runsPerDay: 2000,
  callsPerRun: 6,
  inputTokens: 3000,
  outputTokens: 400,
  cachedShare: 0,
  inputPricePerM: 1,
  outputPricePerM: 4,
  cachedDiscount: 90,
  retryRate: 8,
  toolCostPerRun: 0,
  successRate: 92,
};

const clamp = (value: number, min: number, max: number) => (Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min);

export function sanitize(input: EstimatorInput): EstimatorInput {
  return {
    runsPerDay: clamp(input.runsPerDay, 0, 1e9),
    callsPerRun: clamp(input.callsPerRun, 0, 1000),
    inputTokens: clamp(input.inputTokens, 0, 5e6),
    outputTokens: clamp(input.outputTokens, 0, 5e5),
    cachedShare: clamp(input.cachedShare, 0, 100),
    inputPricePerM: clamp(input.inputPricePerM, 0, 1000),
    outputPricePerM: clamp(input.outputPricePerM, 0, 1000),
    cachedDiscount: clamp(input.cachedDiscount, 0, 100),
    retryRate: clamp(input.retryRate, 0, 100),
    toolCostPerRun: clamp(input.toolCostPerRun, 0, 1000),
    successRate: clamp(input.successRate, 1, 100),
  };
}

export function estimate(raw: EstimatorInput): EstimatorResult {
  const i = sanitize(raw);
  const cached = i.cachedShare / 100;
  const effectiveInputPrice = i.inputPricePerM * ((1 - cached) + cached * (1 - i.cachedDiscount / 100));
  const modelPerCall = (i.inputTokens * effectiveInputPrice + i.outputTokens * i.outputPricePerM) / 1e6;
  const costPerAttempt = modelPerCall * i.callsPerRun + i.toolCostPerRun;
  const attempts = 1 + i.retryRate / 100;
  const costPerRun = costPerAttempt * attempts;
  const costPerSuccess = costPerRun / (i.successRate / 100);
  const perDay = costPerRun * i.runsPerDay;
  const perMonth = perDay * DAYS_PER_MONTH;
  return {
    costPerAttempt,
    costPerRun,
    costPerSuccess,
    perDay,
    perMonth,
    retryOverheadPerMonth: costPerAttempt * (i.retryRate / 100) * i.runsPerDay * DAYS_PER_MONTH,
    failedSpendPerMonth: perMonth * (1 - i.successRate / 100),
  };
}

/** What-if levers, each measured against the current inputs on its own. */
export function levers(raw: EstimatorInput): Lever[] {
  const i = sanitize(raw);
  const base = estimate(i).perMonth;
  const saving = (changed: EstimatorInput) => Math.max(0, base - estimate(changed).perMonth);
  const smaller = tierPresets[0];
  return [
    {
      id: "trim-context",
      label: "Trim 25% of the input tokens",
      detail: "Shorter prompts, fewer retrieved chunks, summarised history.",
      monthlySaving: saving({ ...i, inputTokens: i.inputTokens * 0.75 }),
    },
    {
      id: "cache",
      label: "Cache 70% of the input",
      detail: "Keep the stable prefix of the prompt identical between calls.",
      monthlySaving: saving({ ...i, cachedShare: Math.max(i.cachedShare, 70) }),
    },
    {
      id: "halve-retries",
      label: "Halve the retry rate",
      detail: "Bounded retries and better tool error messages.",
      monthlySaving: saving({ ...i, retryRate: i.retryRate / 2 }),
    },
    {
      id: "route-small",
      label: `Send half the calls to a ${smaller.label.toLowerCase()}`,
      detail: "Only safe if quality holds on your own evals.",
      monthlySaving: saving({
        ...i,
        inputPricePerM: (i.inputPricePerM + smaller.inputPricePerM) / 2,
        outputPricePerM: (i.outputPricePerM + smaller.outputPricePerM) / 2,
      }),
    },
  ].sort((a, b) => b.monthlySaving - a.monthlySaving);
}

export const inputKeys: (keyof EstimatorInput)[] = [
  "runsPerDay", "callsPerRun", "inputTokens", "outputTokens", "cachedShare", "inputPricePerM",
  "outputPricePerM", "cachedDiscount", "retryRate", "toolCostPerRun", "successRate",
];

export function toSearch(input: EstimatorInput): string {
  const params = new URLSearchParams();
  for (const key of inputKeys) params.set(key, String(input[key]));
  return params.toString();
}

export function fromSearch(search: string): EstimatorInput {
  const params = new URLSearchParams(search);
  const next = { ...defaultInput };
  for (const key of inputKeys) {
    const raw = params.get(key);
    if (raw === null || raw.trim() === "") continue;
    const value = Number(raw);
    if (Number.isFinite(value)) next[key] = value;
  }
  return sanitize(next);
}

export function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const digits = Math.abs(value) < 1 ? 4 : Math.abs(value) < 100 ? 2 : 0;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: digits === 0 ? 0 : 2, maximumFractionDigits: digits }).format(value);
}
