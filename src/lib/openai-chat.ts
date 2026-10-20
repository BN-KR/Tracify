/** Shared OpenAI chat helpers for Ask AI and the Playground. Default is the cheapest model on the free tier. */
export const DEFAULT_OPENAI_MODEL = "gpt-5-nano";

/** gpt-5 and o-series models reason first: no custom temperature, and the token cap counts the hidden thinking. */
export function isReasoningModel(model: string) {
  return /^(gpt-5|gpt-6|o\d)/i.test(model);
}

export function buildOpenAiBody(model: string, messages: Array<{ role: "system" | "user"; content: string }>, options: { temperature?: number; maxOutputTokens: number }) {
  const body: Record<string, unknown> = { model, messages };
  if (isReasoningModel(model)) {
    body.max_completion_tokens = options.maxOutputTokens;
    // Only the original gpt-5 family accepts "minimal"; keeps answers fast and cheap.
    if (/^gpt-5(-|$)/i.test(model)) body.reasoning_effort = "minimal";
  } else {
    body.max_tokens = options.maxOutputTokens;
    if (options.temperature !== undefined) body.temperature = options.temperature;
  }
  return body;
}

/** Plain-language message for a failed OpenAI call. */
export function friendlyOpenAiError(status: number, providerMessage?: string) {
  if (status === 429) {
    if (providerMessage && /quota|billing|credit/i.test(providerMessage)) return "The OpenAI account is out of credit. Add credit in OpenAI billing and try again.";
    return "OpenAI is busy: the free plan allows only a few requests per minute and 50 per day. Wait a minute and try again.";
  }
  if (status === 401) return "The OpenAI key was rejected. Check the key saved on the server.";
  if (status === 404 || status === 400) return providerMessage || "OpenAI could not run this model.";
  if (status >= 500) return "OpenAI had a problem on its side. Try again in a moment.";
  return providerMessage || "The model provider rejected the request.";
}

/** Which provider a stored key belongs to. */
export function providerForKey(key: string): "anthropic" | "openai" {
  return key.startsWith("sk-ant-") ? "anthropic" : "openai";
}
