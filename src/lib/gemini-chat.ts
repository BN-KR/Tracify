/** Gemini chat helpers: the free-tier backup for Ask AI and a Playground provider. */
export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash-lite";

export function geminiUrl(model: string) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
}

export function buildGeminiBody(text: string, options: { system?: string; temperature?: number; maxOutputTokens: number }) {
  const generationConfig: Record<string, unknown> = { maxOutputTokens: options.maxOutputTokens };
  if (options.temperature !== undefined) generationConfig.temperature = Math.min(options.temperature, 2);
  return {
    ...(options.system ? { systemInstruction: { parts: [{ text: options.system }] } } : {}),
    contents: [{ role: "user", parts: [{ text }] }],
    generationConfig,
  };
}

type GeminiResponse = { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> }; finishReason?: string }>; usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number }; error?: { message?: string } };

export function parseGemini(data: GeminiResponse) {
  const text = (data.candidates?.[0]?.content?.parts ?? []).map((part) => part.text ?? "").join("").trim();
  return { text, inputTokens: data.usageMetadata?.promptTokenCount, outputTokens: data.usageMetadata?.candidatesTokenCount, blocked: !text && data.candidates?.[0]?.finishReason === "SAFETY" };
}

/** Plain-language message for a failed Gemini call. */
export function friendlyGeminiError(status: number, providerMessage?: string) {
  if (status === 429) return "Gemini is busy: the free plan allows only a limited number of requests per minute and per day. Wait a minute and try again.";
  if (status === 400 && providerMessage && /api key/i.test(providerMessage)) return "The Gemini key was rejected. Check the key saved on the server.";
  if (status === 401 || status === 403) return "The Gemini key was rejected. Check the key saved on the server.";
  if (status >= 500) return "Gemini had a problem on its side. Try again in a moment.";
  return providerMessage || "The model provider rejected the request.";
}
