/**
 * One shared list of model prices and limits for every free tool, so the
 * token counter, price table, context checker and rate limit calculator agree.
 *
 * Prices are US dollars per million tokens. They were read from the public
 * LiteLLM price list (github.com/BerriAI/litellm) on PRICES_CHECKED and are
 * list prices only: batch, priority and regional pricing are not included.
 * Always confirm against the provider before you commit to a budget.
 */

export const PRICES_CHECKED = "2026-10-17";
export const PRICES_CHECKED_LABEL = "17 October 2026";
export const PRICE_SOURCE_NOTE =
  "Prices are public list prices in US dollars per million tokens, last checked on 17 October 2026. Providers change them often, so confirm on the provider page before you plan a budget.";

export type Provider = "OpenAI" | "Anthropic" | "Google" | "Meta" | "Mistral" | "DeepSeek" | "xAI";

/** How tokens are counted: a real tokenizer where one is bundled, otherwise an estimate. */
export type TokenizerFamily = "openai" | "claude" | "gemini" | "llama" | "mistral" | "deepseek" | "grok";

export type Model = {
  id: string;
  name: string;
  provider: Provider;
  family: TokenizerFamily;
  /** USD per million input tokens. */
  input: number;
  /** USD per million output tokens. */
  output: number;
  /** USD per million cached input tokens (a cache read), when the provider offers one. */
  cached?: number;
  /** Largest prompt the model accepts, in tokens. */
  context: number;
  /** Largest reply the model can write, in tokens, when published. */
  maxOutput?: number;
  /** Short note shown in tables, for example who hosts an open model. */
  note?: string;
};

export const models: readonly Model[] = [
  // OpenAI
  { id: "gpt-5.6", name: "GPT-5.6", provider: "OpenAI", family: "openai", input: 4, output: 20, cached: 0.4, context: 922000, maxOutput: 128000 },
  { id: "gpt-5.5", name: "GPT-5.5", provider: "OpenAI", family: "openai", input: 5, output: 30, cached: 0.5, context: 1050000, maxOutput: 128000 },
  { id: "gpt-5.4", name: "GPT-5.4", provider: "OpenAI", family: "openai", input: 2.5, output: 15, cached: 0.25, context: 1050000, maxOutput: 128000 },
  { id: "gpt-5.4-mini", name: "GPT-5.4 mini", provider: "OpenAI", family: "openai", input: 0.75, output: 4.5, cached: 0.075, context: 272000, maxOutput: 128000 },
  { id: "gpt-5.4-nano", name: "GPT-5.4 nano", provider: "OpenAI", family: "openai", input: 0.2, output: 1.25, cached: 0.02, context: 272000, maxOutput: 128000 },
  { id: "gpt-5", name: "GPT-5", provider: "OpenAI", family: "openai", input: 1.25, output: 10, cached: 0.125, context: 272000, maxOutput: 128000 },
  { id: "gpt-5-mini", name: "GPT-5 mini", provider: "OpenAI", family: "openai", input: 0.25, output: 2, cached: 0.025, context: 272000, maxOutput: 128000 },
  { id: "gpt-5-nano", name: "GPT-5 nano", provider: "OpenAI", family: "openai", input: 0.05, output: 0.4, cached: 0.005, context: 272000, maxOutput: 128000 },
  { id: "gpt-4.1", name: "GPT-4.1", provider: "OpenAI", family: "openai", input: 2, output: 8, cached: 0.5, context: 1047576, maxOutput: 32768 },
  { id: "gpt-4.1-mini", name: "GPT-4.1 mini", provider: "OpenAI", family: "openai", input: 0.4, output: 1.6, cached: 0.1, context: 1047576, maxOutput: 32768 },
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", family: "openai", input: 2.5, output: 10, cached: 1.25, context: 128000, maxOutput: 16384 },
  { id: "gpt-4o-mini", name: "GPT-4o mini", provider: "OpenAI", family: "openai", input: 0.15, output: 0.6, cached: 0.075, context: 128000, maxOutput: 16384 },
  { id: "o3", name: "o3", provider: "OpenAI", family: "openai", input: 2, output: 8, cached: 0.5, context: 200000, maxOutput: 100000 },
  { id: "o4-mini", name: "o4-mini", provider: "OpenAI", family: "openai", input: 1.1, output: 4.4, cached: 0.275, context: 200000, maxOutput: 100000 },
  // Anthropic
  { id: "claude-fable-5-1", name: "Claude Fable 5.1", provider: "Anthropic", family: "claude", input: 10, output: 50, cached: 0.25, context: 1000000, maxOutput: 128000 },
  { id: "claude-opus-5-5", name: "Claude Opus 5.5", provider: "Anthropic", family: "claude", input: 4, output: 20, cached: 0.2, context: 1000000, maxOutput: 128000 },
  { id: "claude-sonnet-5-5", name: "Claude Sonnet 5.5", provider: "Anthropic", family: "claude", input: 2, output: 10, cached: 0.1, context: 1000000, maxOutput: 128000 },
  { id: "claude-haiku-5-5", name: "Claude Haiku 5.5", provider: "Anthropic", family: "claude", input: 0.1, output: 0.5, cached: 0.01, context: 1000000, maxOutput: 128000 },
  { id: "claude-opus-4-7", name: "Claude Opus 4.7", provider: "Anthropic", family: "claude", input: 5, output: 25, cached: 0.5, context: 1000000, maxOutput: 128000 },
  { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", provider: "Anthropic", family: "claude", input: 3, output: 15, cached: 0.3, context: 1000000, maxOutput: 128000 },
  { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", provider: "Anthropic", family: "claude", input: 1, output: 5, cached: 0.1, context: 200000, maxOutput: 64000 },
  // Google
  { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", provider: "Google", family: "gemini", input: 1.5, output: 9, cached: 0.15, context: 1048576, maxOutput: 65535 },
  { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash", provider: "Google", family: "gemini", input: 0.75, output: 3.75, cached: 0.075, context: 1048576, maxOutput: 65536 },
  { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash-Lite", provider: "Google", family: "gemini", input: 0.25, output: 1.5, cached: 0.025, context: 1048576, maxOutput: 65536 },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "Google", family: "gemini", input: 1.25, output: 10, cached: 0.125, context: 1048576, maxOutput: 65535, note: "Prompts over 200K tokens cost more" },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "Google", family: "gemini", input: 0.3, output: 2.5, cached: 0.03, context: 1048576, maxOutput: 65535 },
  { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash-Lite", provider: "Google", family: "gemini", input: 0.1, output: 0.4, cached: 0.01, context: 1048576, maxOutput: 65535 },
  // Meta (open weights, priced here at DeepInfra because Meta sells no API)
  { id: "llama-4-maverick", name: "Llama 4 Maverick", provider: "Meta", family: "llama", input: 0.2, output: 0.8, context: 1048576, note: "Priced at DeepInfra" },
  { id: "llama-4-scout", name: "Llama 4 Scout", provider: "Meta", family: "llama", input: 0.1, output: 0.3, context: 327680, note: "Priced at DeepInfra" },
  { id: "llama-3.3-70b", name: "Llama 3.3 70B", provider: "Meta", family: "llama", input: 0.23, output: 0.4, context: 131072, note: "Priced at DeepInfra" },
  // Mistral
  { id: "mistral-medium", name: "Mistral Medium", provider: "Mistral", family: "mistral", input: 1.5, output: 7.5, cached: 0.15, context: 262144, maxOutput: 262144 },
  { id: "mistral-large", name: "Mistral Large", provider: "Mistral", family: "mistral", input: 0.5, output: 1.5, cached: 0.05, context: 262144, maxOutput: 262144 },
  { id: "mistral-small", name: "Mistral Small", provider: "Mistral", family: "mistral", input: 0.15, output: 0.6, cached: 0.015, context: 262144, maxOutput: 262144 },
  // DeepSeek
  { id: "deepseek-v4-pro", name: "DeepSeek V4 Pro", provider: "DeepSeek", family: "deepseek", input: 1.32, output: 3.96, cached: 0.044, context: 1000000, maxOutput: 393216 },
  { id: "deepseek-v4-flash", name: "DeepSeek V4 Flash", provider: "DeepSeek", family: "deepseek", input: 0.3, output: 1.2, cached: 0.006, context: 1000000, maxOutput: 393216 },
  { id: "deepseek-chat", name: "DeepSeek Chat", provider: "DeepSeek", family: "deepseek", input: 0.28, output: 0.42, cached: 0.028, context: 131072, maxOutput: 8192 },
  // xAI
  { id: "grok-4.5", name: "Grok 4.5", provider: "xAI", family: "grok", input: 2, output: 6, cached: 0.3, context: 500000, maxOutput: 500000 },
  { id: "grok-4.3", name: "Grok 4.3", provider: "xAI", family: "grok", input: 1.25, output: 2.5, cached: 0.2, context: 1000000, maxOutput: 1000000 },
];

export const providers: readonly Provider[] = ["OpenAI", "Anthropic", "Google", "Meta", "Mistral", "DeepSeek", "xAI"];

export function getModel(id: string): Model | undefined {
  return models.find((m) => m.id === id);
}

/** Dollar cost of one call. Cached input tokens use the cached rate when the model has one. */
export function callCost(model: Model, inputTokens: number, outputTokens: number, cachedInputTokens = 0): number {
  const input = Math.max(0, Number.isFinite(inputTokens) ? inputTokens : 0);
  const output = Math.max(0, Number.isFinite(outputTokens) ? outputTokens : 0);
  const cachedTokens = model.cached === undefined ? 0 : Math.min(input, Math.max(0, cachedInputTokens || 0));
  const fresh = input - cachedTokens;
  return (fresh * model.input + cachedTokens * (model.cached ?? model.input) + output * model.output) / 1e6;
}

export function formatTokens(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value >= 1e6) return `${trim(value / 1e6)}M`;
  if (value >= 1e4) return `${Math.round(value / 1e3)}K`;
  if (value >= 1e3) return `${trim(value / 1e3)}K`;
  return String(Math.round(value));
}

function trim(n: number) {
  return Number(n.toFixed(2)).toString();
}

/** Money formatting shared by every tool. Tiny amounts keep enough digits to read. */
export function money(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs === 0) return "$0";
  if (abs < 0.0001) return "<$0.0001";
  const digits = abs < 0.01 ? 5 : abs < 1 ? 4 : abs < 100 ? 2 : 0;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: Math.min(digits, 2), maximumFractionDigits: digits }).format(value);
}
