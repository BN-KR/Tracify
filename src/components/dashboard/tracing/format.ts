export function formatDuration(ms: number | null | undefined) {
  const value = Number(ms ?? 0);
  if (!Number.isFinite(value) || value <= 0) return "0 ms";
  if (value < 1000) return `${Math.round(value)} ms`;
  if (value < 60_000) return `${(value / 1000).toFixed(value < 10_000 ? 2 : 1)} s`;
  return `${Math.floor(value / 60_000)}m ${Math.round((value % 60_000) / 1000)}s`;
}

export function formatCost(usd: number | null | undefined) {
  const value = Number(usd ?? 0);
  if (!value) return "$0";
  if (value < 0.01) return `$${value.toFixed(5)}`;
  return `$${value.toFixed(value < 1 ? 4 : 2)}`;
}

export function compactNumber(value: number | null | undefined) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(Number(value ?? 0));
}

/** Tinybird returns "YYYY-MM-DD hh:mm:ss" in UTC; show it in the viewer's local time. */
export function formatTime(value: string) {
  const parsed = Date.parse(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  if (!Number.isFinite(parsed)) return value;
  return new Date(parsed).toLocaleString([], { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

/** One-line preview of a JSON or text payload: the last user/assistant message text when it is a chat. */
export function previewText(raw: string | null | undefined) {
  if (!raw) return "";
  const parsed = parsePayload(raw);
  const messages = chatMessages(parsed);
  const text = messages ? messages[messages.length - 1]?.content ?? "" : typeof parsed === "string" ? parsed : JSON.stringify(parsed);
  return text.replace(/\s+/g, " ").trim().slice(0, 160);
}

export function parsePayload(raw: string | null | undefined): unknown {
  if (raw === null || raw === undefined || raw === "") return "";
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "string" ? tryJson(parsed) : parsed;
  } catch {
    return raw;
  }
}

function tryJson(value: string): unknown {
  try { return JSON.parse(value); } catch { return value; }
}

export type ChatMessage = { role: string; content: string };

/** Recognises OpenAI/Anthropic-style message arrays (also nested under `messages`). */
export function chatMessages(value: unknown): ChatMessage[] | null {
  const list = Array.isArray(value) ? value : value && typeof value === "object" && Array.isArray((value as { messages?: unknown }).messages) ? (value as { messages: unknown[] }).messages : null;
  if (!list || !list.length) return null;
  const messages: ChatMessage[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object" || typeof (item as { role?: unknown }).role !== "string") return null;
    const content = (item as { content?: unknown }).content;
    const text = typeof content === "string" ? content
      : Array.isArray(content) ? content.map((part) => (part && typeof part === "object" && "text" in part ? String((part as { text: unknown }).text) : "")).join("\n")
      : content === undefined || content === null ? "" : JSON.stringify(content, null, 2);
    messages.push({ role: (item as { role: string }).role, content: text });
  }
  return messages;
}
