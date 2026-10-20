import { buildGeminiBody, DEFAULT_GEMINI_MODEL, geminiUrl, parseGemini } from "./gemini-chat.ts";
import { buildOpenAiBody, DEFAULT_OPENAI_MODEL } from "./openai-chat.ts";

export type LlmFailure = "quota" | "rate" | "auth" | "error";
export type LlmAttempt = { text: string; failure?: LlmFailure; status?: number };
type Prompt = { system: string; user: string; temperature?: number; maxOutputTokens: number; timeoutMs?: number };

/** Server logs only: what the provider said, trimmed, so "429" is never a mystery again. */
function logFailure(label: string, provider: string, status: number, message: string) {
  console.error(`${label} provider error:`, provider, status, status === 401 || status === 403 ? "(key rejected)" : message.slice(0, 200));
}

function classify(status: number, message: string): LlmFailure {
  if (status === 429) return /quota|billing|credit/i.test(message) ? "quota" : "rate";
  if (status === 401 || status === 403) return "auth";
  return "error";
}

/** OpenAI-compatible chat call, shared by OpenAI and the alternate provider. */
async function callChat(provider: "openai" | "alt", url: string, label: string, apiKey: string, model: string, prompt: Prompt): Promise<LlmAttempt> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(buildOpenAiBody(model, [{ role: "system", content: prompt.system }, { role: "user", content: prompt.user }], { temperature: prompt.temperature, maxOutputTokens: prompt.maxOutputTokens })),
      signal: AbortSignal.timeout(prompt.timeoutMs ?? 20_000),
    });
    const data = await response.json().catch(() => ({})) as { choices?: Array<{ message?: { content?: string | null } }>; error?: { message?: string } };
    if (!response.ok) {
      const message = data.error?.message ?? "";
      logFailure(label, provider, response.status, message);
      return { text: "", failure: classify(response.status, message), status: response.status };
    }
    return { text: data.choices?.[0]?.message?.content?.trim() ?? "" };
  } catch (error) {
    console.error(`${label} request failed:`, provider, error instanceof Error ? error.name : "unknown");
    return { text: "", failure: "error" };
  }
}

export function callOpenAi(label: string, apiKey: string, model: string | undefined, prompt: Prompt) {
  return callChat("openai", "https://api.openai.com/v1/chat/completions", label, apiKey, model || DEFAULT_OPENAI_MODEL, prompt);
}

/** The alternate provider is an OpenAI-compatible service set by env (base URL, key, model). A model is sent only if it is listed in ASK_AI_ALT_MODELS_ALLOWED. */
export function isAllowedModel(model: string, allowed = process.env.ASK_AI_ALT_MODELS_ALLOWED ?? "") {
  return allowed.split(",").map((entry) => entry.trim().toLowerCase()).filter(Boolean).includes(model);
}

export async function callAlt(label: string, apiKey: string, model: string | undefined, prompt: Prompt): Promise<LlmAttempt> {
  const baseUrl = (process.env.ASK_AI_ALT_BASE_URL ?? "").replace(/\/+$/, "");
  const chosen = (model ?? "").trim().toLowerCase();
  if (!baseUrl.startsWith("https://") || !chosen || !isAllowedModel(chosen)) {
    console.error(`${label} alternate provider skipped: missing address, or model not on the allowed list:`, chosen || "(none)");
    return { text: "", failure: "error" };
  }
  return callChat("alt", `${baseUrl}/chat/completions`, label, apiKey, chosen, prompt);
}

export async function callGemini(label: string, apiKey: string, model: string | undefined, prompt: Prompt): Promise<LlmAttempt> {
  try {
    const response = await fetch(geminiUrl(model || DEFAULT_GEMINI_MODEL), {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify(buildGeminiBody(prompt.user, { system: prompt.system, temperature: prompt.temperature, maxOutputTokens: prompt.maxOutputTokens })),
      signal: AbortSignal.timeout(prompt.timeoutMs ?? 20_000),
    });
    const data = await response.json().catch(() => ({})) as Parameters<typeof parseGemini>[0];
    if (!response.ok) {
      const message = data.error?.message ?? "";
      logFailure(label, "gemini", response.status, message);
      return { text: "", failure: classify(response.status, message), status: response.status };
    }
    return { text: parseGemini(data).text };
  } catch (error) {
    console.error(`${label} request failed:`, "gemini", error instanceof Error ? error.name : "unknown");
    return { text: "", failure: "error" };
  }
}

/** The alternate provider first when its key is set, then OpenAI, then Gemini; each is skipped when missing, busy, out of credit or empty. */
export async function completeWithFallback(label: string, keys: { alt?: string; openai?: string; gemini?: string }, models: { alt?: string; openai?: string; gemini?: string }, prompt: Prompt) {
  const failures: LlmFailure[] = [];
  if (keys.alt) {
    const first = await callAlt(label, keys.alt, models.alt, prompt);
    if (first.text) return { text: first.text, provider: "alt" as const, failures };
    failures.push(first.failure ?? "error");
  }
  if (keys.openai) {
    const first = await callOpenAi(label, keys.openai, models.openai, prompt);
    if (first.text) return { text: first.text, provider: "openai" as const, failures };
    failures.push(first.failure ?? "error");
  }
  if (keys.gemini) {
    const second = await callGemini(label, keys.gemini, models.gemini, prompt);
    if (second.text) return { text: second.text, provider: "gemini" as const, failures };
    failures.push(second.failure ?? "error");
  }
  return { text: "", provider: null, failures };
}
