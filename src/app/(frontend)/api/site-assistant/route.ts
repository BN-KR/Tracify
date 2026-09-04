import { NextRequest, NextResponse } from "next/server";
import { fallbackAssistantAnswer, getAssistantContext, redactAssistantText, type AssistantCitation } from "@/lib/site-assistant";
import { consumeRateLimit } from "@/lib/redis-cache";

const recentRequests = new Map<string, number[]>();
const localDailyUsage = new Map<string, number>();

function configuredLimit(name: string, fallback: number, minimum: number, maximum: number) {
  const value = Number(process.env[name] ?? fallback);
  return Number.isFinite(value) ? Math.min(maximum, Math.max(minimum, Math.floor(value))) : fallback;
}

function allowedCitation(href: string) {
  return href.startsWith("/") && !href.startsWith("//") && !href.includes("javascript:");
}

async function traceAssistant(payload: Record<string, unknown>) {
  const endpoint = process.env.TRACIFY_INTERNAL_INGEST_URL;
  const apiKey = process.env.TRACIFY_INTERNAL_API_KEY;
  if (!endpoint || !apiKey) return;
  try {
    await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ ...payload, input: redactAssistantText(String(payload.input ?? "")), output: redactAssistantText(String(payload.output ?? "")), spanType: "llm", createdAt: new Date().toISOString() }), signal: AbortSignal.timeout(1500) });
  } catch {
    // Observability must never make the public assistant unavailable.
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { message?: unknown; conversationId?: unknown; pagePath?: unknown } | null;
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message || message.length > 2000) return NextResponse.json({ error: "Message must be between 1 and 2,000 characters." }, { status: 422 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const now = Date.now();
  const perMinuteLimit = configuredLimit("TRACIFY_ASSISTANT_REQUESTS_PER_MINUTE", 5, 1, 60);
  const dailyLimit = configuredLimit("TRACIFY_ASSISTANT_REQUESTS_PER_DAY", 100, 1, 10_000);
  const recent = (recentRequests.get(ip) ?? []).filter((timestamp) => now - timestamp < 60_000);
  if (recent.length >= perMinuteLimit) return NextResponse.json({ error: "Please wait a moment before sending another question." }, { status: 429 });
  recentRequests.set(ip, [...recent, now]);
  const dayKey = new Date(now).toISOString().slice(0, 10);
  const localKey = `${dayKey}:global`;
  const localCount = localDailyUsage.get(localKey) ?? 0;
  if (localCount >= dailyLimit) return NextResponse.json({ error: "The assistant has reached today's usage limit. Please try again tomorrow." }, { status: 429 });
  localDailyUsage.set(localKey, localCount + 1);
  try {
    const ipQuota = await consumeRateLimit(`tracify:assistant:ip:${ip}`, 1, perMinuteLimit, 60);
    if (!ipQuota.allowed) return NextResponse.json({ error: "Please wait a moment before sending another question." }, { status: 429 });
    const dailyQuota = await consumeRateLimit(`tracify:assistant:global:${dayKey}`, 1, dailyLimit, 86_400);
    if (!dailyQuota.allowed) return NextResponse.json({ error: "The assistant has reached today's usage limit. Please try again tomorrow." }, { status: 429 });
  } catch {
    // Redis is optional in local development; the in-memory guard remains active.
  }

  const context = getAssistantContext(message);
  const fallback = fallbackAssistantAnswer(message);
  const startedAt = performance.now();
  let answer = fallback.answer;
  let citations: AssistantCitation[] = fallback.citations;
  const apiKey = process.env.TRACIFY_ASSISTANT_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  const maxCompletionTokens = configuredLimit("TRACIFY_ASSISTANT_MAX_COMPLETION_TOKENS", 300, 100, 500);

  if (apiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model: process.env.TRACIFY_ASSISTANT_MODEL || "gpt-5.6-luna", reasoning_effort: "low", max_completion_tokens: maxCompletionTokens, messages: [{ role: "system", content: "You are Tracify's public product assistant. Answer only from the supplied public context. Be concise, honest, and practical. Never claim to access an account, trace, API key, or deployment. If context is insufficient, say so and recommend the docs or contact page. Do not output markdown links; citations are added separately." }, { role: "user", content: `Public context:\n${context.map((entry) => `${entry.title}: ${entry.text}`).join("\n")}\n\nQuestion: ${message}` }] }), signal: AbortSignal.timeout(8000) });
      if (response.ok) {
        const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
        const generated = data.choices?.[0]?.message?.content?.trim();
        if (generated) { answer = generated; citations = context.map((entry) => ({ title: entry.title, href: entry.href })); }
      }
    } catch {
      // Use the deterministic answer when the provider is unavailable.
    }
  }

  const safeCitations = citations.filter((citation) => allowedCitation(citation.href)).slice(0, 4);
  const conversationId = typeof body?.conversationId === "string" && body.conversationId.length < 100 ? body.conversationId : crypto.randomUUID();
  void traceAssistant({ input: message, output: answer, pagePath: typeof body?.pagePath === "string" ? body.pagePath : "/", conversationId, latencyMs: Math.round(performance.now() - startedAt), provider: apiKey ? "openai" : "fallback" });
  return NextResponse.json({ answer, citations: safeCitations, conversationId });
}
