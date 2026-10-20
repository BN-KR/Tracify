import { isAuthenticated } from "@/lib/auth-server";
import { NextRequest, NextResponse } from "next/server";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { getAuthedConvexClient } from "@/lib/convex-server";
import { consumeRateLimit } from "@/lib/redis-cache";
import { getSpansForRun } from "@/lib/tinybird";
import { buildGeminiBody, DEFAULT_GEMINI_MODEL, geminiUrl, parseGemini } from "@/lib/gemini-chat";
import { buildOpenAiBody, DEFAULT_OPENAI_MODEL, providerForKey } from "@/lib/openai-chat";
import { buildUserMessage, MAX_QUESTION_LENGTH, quickAnswer, resolveCitations, SYSTEM_PROMPT, type AskAnswer, type AskSpan } from "@/lib/ask-ai";

export const maxDuration = 30;

const recent = new Map<string, number[]>();

function limit(name: string, fallback: number) {
  const value = Number(process.env[name] ?? fallback);
  return Number.isFinite(value) ? Math.min(1000, Math.max(1, Math.floor(value))) : fallback;
}

/** Key order: dedicated Ask AI key, then OpenAI, then Anthropic. The key's own prefix decides the provider. */
function askKey() {
  return process.env.TRACIFY_ASK_AI_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || "";
}

/** Gemini is the backup: used when the main provider is missing, busy or failing. */
function geminiKey() {
  return process.env.GEMINI_API_KEY || "";
}

type AskResult = { answer: AskAnswer | null; busy?: boolean };
type Attempt = { answer: AskAnswer | null; busy: boolean };

async function askPrimary(spans: AskSpan[], question: string): Promise<Attempt> {
  const apiKey = askKey();
  const provider = providerForKey(apiKey);
  const userMessage = buildUserMessage(spans, question);
  try {
    const response = provider === "anthropic"
      ? await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: process.env.TRACIFY_ASK_AI_MODEL || "claude-haiku-5-5", max_tokens: 600, system: SYSTEM_PROMPT, messages: [{ role: "user", content: userMessage }] }),
        signal: AbortSignal.timeout(20_000),
      })
      : await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(buildOpenAiBody(process.env.TRACIFY_ASK_AI_MODEL || DEFAULT_OPENAI_MODEL, [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userMessage }], { temperature: 0.2, maxOutputTokens: 1500 })),
        signal: AbortSignal.timeout(25_000),
      });
    if (!response.ok) {
      console.error("Ask AI provider error:", provider, response.status);
      return { answer: null, busy: response.status === 429 };
    }
    const data = await response.json() as { content?: Array<{ type: string; text?: string }>; choices?: Array<{ message?: { content?: string | null } }> };
    const text = provider === "anthropic"
      ? data.content?.filter((block) => block.type === "text").map((block) => block.text ?? "").join("").trim()
      : data.choices?.[0]?.message?.content?.trim();
    return { answer: text ? resolveCitations(text, spans) : null, busy: false };
  } catch (error) {
    console.error("Ask AI request failed:", error);
    return { answer: null, busy: false };
  }
}

async function askGemini(spans: AskSpan[], question: string): Promise<Attempt> {
  try {
    const response = await fetch(geminiUrl(process.env.TRACIFY_ASK_AI_GEMINI_MODEL || DEFAULT_GEMINI_MODEL), {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": geminiKey() },
      body: JSON.stringify(buildGeminiBody(buildUserMessage(spans, question), { system: SYSTEM_PROMPT, temperature: 0.2, maxOutputTokens: 800 })),
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) {
      console.error("Ask AI provider error: gemini", response.status);
      return { answer: null, busy: response.status === 429 };
    }
    const { text } = parseGemini(await response.json());
    return { answer: text ? resolveCitations(text, spans) : null, busy: false };
  } catch (error) {
    console.error("Ask AI request failed:", error);
    return { answer: null, busy: false };
  }
}

async function askModel(spans: AskSpan[], question: string): Promise<AskResult> {
  let busy = false;
  if (askKey()) {
    const first = await askPrimary(spans, question);
    if (first.answer) return first;
    busy = first.busy;
  }
  if (geminiKey()) {
    const second = await askGemini(spans, question);
    if (second.answer) return second;
    busy = busy || second.busy;
  }
  return { answer: null, busy };
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string; runId: string }> }) {
  const { projectId, runId } = await params;
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null) as { question?: unknown } | null;
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  if (!question || question.length > MAX_QUESTION_LENGTH) {
    return NextResponse.json({ error: `Questions must be between 1 and ${MAX_QUESTION_LENGTH} characters.` }, { status: 422 });
  }

  const convex = await getAuthedConvexClient();
  const run = await convex.query(api.agentRuns.getByRunIdForViewer, { projectId: projectId as Id<"projects">, runId }).catch(() => null);
  if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });

  // Each question can cost real money, so cap them per project: in memory per server, and shared through Redis when set.
  const perMinute = limit("TRACIFY_ASK_AI_PER_MINUTE", 12);
  const perDay = limit("TRACIFY_ASK_AI_PER_DAY", 300);
  const now = Date.now();
  const hits = (recent.get(projectId) ?? []).filter((time) => now - time < 60_000);
  if (hits.length >= perMinute) return NextResponse.json({ error: "Too many questions. Please wait a moment." }, { status: 429 });
  recent.set(projectId, [...hits, now]);
  try {
    const minute = await consumeRateLimit(`tracify:askai:min:${projectId}`, 1, perMinute, 60);
    const day = await consumeRateLimit(`tracify:askai:day:${projectId}:${new Date(now).toISOString().slice(0, 10)}`, 1, perDay, 86_400);
    if (!minute.allowed || !day.allowed) return NextResponse.json({ error: !day.allowed ? "This project has reached today's Ask AI limit." : "Too many questions. Please wait a moment." }, { status: 429 });
  } catch {
    // Redis is optional; the in-memory guard stays active.
  }

  let spans: AskSpan[];
  try {
    spans = (await getSpansForRun(runId, projectId)) as AskSpan[];
  } catch (error) {
    console.error("Ask AI could not read spans:", error);
    return NextResponse.json({ error: "Step data is temporarily unavailable." }, { status: 503 });
  }

  const { answer: ai, busy } = await askModel(spans, question);
  if (ai) return NextResponse.json({ ...ai, source: "ai" });
  const basic = quickAnswer(question, spans);
  if (basic) return NextResponse.json({ ...basic, source: "basic" });
  const configured = Boolean(askKey() || geminiKey());
  return NextResponse.json({
    answer: busy
      ? "The AI service is busy right now (the free plan only allows a few questions per minute). Wait a minute and try again, or ask one of the suggested questions."
      : configured
      ? "I couldn't reach the AI service just now. Try again in a moment, or ask one of the suggested questions."
      : "Free-form questions need AI switched on for this workspace. For now I can answer what went wrong, what was slowest, what cost the most, and a short summary.",
    stepIds: [],
    source: "basic",
  });
}
