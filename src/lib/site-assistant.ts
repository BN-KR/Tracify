export type AssistantCitation = { title: string; href: string };

export const ASSISTANT_KNOWLEDGE = [
  { title: "Tracify documentation", href: "/docs", text: "Tracify helps teams trace, evaluate, and improve AI agents with runs, spans, model calls, tool calls, cost, quality, and release evidence." },
  { title: "Quickstart", href: "/docs/quickstart", text: "Start by installing the TypeScript or Python SDK, configuring a Tracify API key, wrapping an agent, and sending a first trace to the selected regional ingest endpoint." },
  { title: "Trace viewer", href: "/product/trace-viewer", text: "The trace viewer connects a run to nested spans, prompts, model calls, tool calls, latency, cost, retries, and failures." },
  { title: "Evaluation engine", href: "/product/evaluation-engine", text: "Evaluation supports datasets, evaluators, experiments, scores, and monitors for checking quality before and after release." },
  { title: "Pricing", href: "/pricing", text: "Tracify has public Free, Pro, Team, and Enterprise pricing information." },
  { title: "Security", href: "/security", text: "Read the public security and data-handling overview, including regional cloud boundaries and ingestion behavior." },
  { title: "Contact Tracify", href: "/contact", text: "Contact Tracify when documentation does not answer a deployment or support question." },
] as const;

export function getAssistantContext(message: string) {
  const terms = message.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const ranked = ASSISTANT_KNOWLEDGE.map((entry) => ({ entry, score: terms.filter((term) => entry.text.toLowerCase().includes(term) || entry.title.toLowerCase().includes(term)).length }))
    .sort((a, b) => b.score - a.score);
  return ranked.slice(0, 4).map(({ entry }) => entry);
}

export function redactAssistantText(value: string) {
  return value
    .replace(/tracify_sk_[a-z0-9_]+/gi, "[redacted-api-key]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[redacted-email]")
    .slice(0, 4000);
}

export function fallbackAssistantAnswer(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("playground") || lower.includes("demo")) return { answer: "Use Explore to open a private simulated workspace with populated runs, costs, alerts, and trace examples. It does not create a real project or require a region.", citations: [{ title: "Open the playground", href: "/sign-in?redirect=/playground" }, { title: "Documentation", href: "/docs" }] };
  if (lower.includes("price") || lower.includes("cost")) return { answer: "You can compare the current plans and included usage on the pricing page. The playground is simulated and does not consume project telemetry.", citations: [{ title: "View pricing", href: "/pricing" }] };
  if (lower.includes("install") || lower.includes("sdk") || lower.includes("api key")) return { answer: "Start with the quickstart: install the SDK, configure the regional API key, wrap your agent, and send one trace. If you already have an account, choose Build and select its region first.", citations: [{ title: "Open the quickstart", href: "/docs/quickstart" }, { title: "Choose a cloud region", href: "/cloud?next=/onboarding" }] };
  return { answer: "I can explain Tracify, point you to the right documentation, or help you choose between the simulated playground and a real regional project. Try asking about traces, evaluations, costs, SDK setup, pricing, or regions.", citations: [{ title: "Browse the docs", href: "/docs" }, { title: "Explore the product", href: "/demo" }, { title: "Contact Tracify", href: "/contact" }] };
}
