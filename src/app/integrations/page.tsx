import React from "react";
import Link from "next/link";

type Integration = {
  name: string;
  description: string;
  badge?: string;
  category: string;
};

const INTEGRATIONS: Integration[] = [
  {
    name: "OpenTelemetry (OTLP)",
    description:
      "Ingest spans via the standard OTLP HTTP JSON protocol. Any OTel-instrumented library or exporter works out of the box.",
    badge: "Native",
    category: "Tracing",
  },
  {
    name: "OpenLLMetry",
    description:
      "Drop-in LLM observability instrumentation for OpenAI, Anthropic, Cohere, and more. Sends directly to the Tracify OTLP endpoint.",
    badge: "Compatible",
    category: "Tracing",
  },
  {
    name: "LangChain",
    description:
      "Trace LangChain agents, chains, and tool calls via the built-in OTel callback handler.",
    category: "Frameworks",
  },
  {
    name: "CrewAI",
    description:
      "Monitor CrewAI multi-agent workflows with zero-config tracing through our Python SDK.",
    category: "Frameworks",
  },
  {
    name: "AutoGen",
    description:
      "Trace AutoGen conversations and tool executions via OTel instrumentation or the Python decorator.",
    category: "Frameworks",
  },
  {
    name: "OpenAI SDK",
    description:
      "Capture model, latency, tokens, and cost for every OpenAI API call automatically.",
    category: "Providers",
  },
  {
    name: "Anthropic SDK",
    description:
      "Full trace support for Claude models — tool calls, streaming, and extended thinking.",
    category: "Providers",
  },
  {
    name: "Vercel AI SDK",
    description:
      "Trace Vercel AI SDK streaming calls, tool use, and multi-step generations.",
    category: "Providers",
  },
  {
    name: "Next.js",
    description:
      "Server-side tracing for Next.js route handlers, server actions, and middleware. Works with our TypeScript SDK.",
    category: "Runtimes",
  },
  {
    name: "Python (FastAPI / Flask)",
    description:
      "Wrap any Python endpoint with the Tracify decorator for automatic span collection.",
    category: "Runtimes",
  },
  {
    name: "Redis",
    description:
      "Track cache hits/misses and rate limiter state as spans in your agent pipeline.",
    category: "Infrastructure",
  },
  {
    name: "Slack",
    description:
      "Route alerts and failed-trace notifications to Slack channels via webhook.",
    category: "Alerts",
  },
  {
    name: "PagerDuty",
    description:
      "Escalate high-severity alerts to PagerDuty for on-call coverage.",
    category: "Alerts",
  },
  {
    name: "Webhooks",
    description:
      "Custom HTTP webhooks for any event — spans, alerts, cost thresholds, or orchestration actions.",
    category: "Alerts",
  },
];

const CATEGORIES = [...new Set(INTEGRATIONS.map((i) => i.category))];

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-yellow-300/40">
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        <div className="mb-12">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#666666] mb-4">
            Platform / Integrations
          </div>
          <h1 className="text-4xl md:text-5xl font-mono tracking-tight text-white">
            Integrations
          </h1>
          <p className="mt-4 text-zinc-500 font-mono text-sm max-w-xl">
            Connect Tracify to your existing tools, frameworks, and providers.
            Most integrations work via the OTLP endpoint — no vendor lock-in.
          </p>
        </div>

        <div className="mb-12 border border-[#1A1A1A] bg-[#0A0A0A] p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#666666] mb-2">
            Quick Start
          </div>
          <p className="font-mono text-sm text-zinc-400 mb-4">
            Point any OTel exporter at the Tracify OTLP endpoint to start
            collecting spans immediately:
          </p>
          <div className="bg-[#050505] border border-[#1A1A1A] p-4 font-mono text-xs text-zinc-500 overflow-x-auto">
            <span className="text-zinc-600"># .env</span>
            {"\n"}
            <span className="text-white">TRACIFY_OTLP_ENDPOINT</span>
            =https://tracify.tech/api/otel
            {"\n"}
            <span className="text-white">TRACIFY_API_KEY</span>
            =tracify_sk_live_...
            {"\n\n"}
            <span className="text-zinc-600"># Or with curl</span>
            {"\n"}
            <span className="text-zinc-400">
              curl -X POST https://tracify.tech/api/otel \
            </span>
            {"\n"}
            <span className="text-zinc-400">
              {" "}
              -H &quot;Authorization: Bearer tracify_sk_live_...&quot; \
            </span>
            {"\n"}
            <span className="text-zinc-400">
              {" "}
              -H &quot;Content-Type: application/json&quot; \
            </span>
            {"\n"}
            <span className="text-zinc-400"> -d @trace.json</span>
          </div>
        </div>

        {CATEGORIES.map((category) => (
          <div key={category} className="mb-12">
            <h2 className="text-white font-mono text-xs uppercase tracking-[0.3em] mb-6">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INTEGRATIONS.filter((i) => i.category === category).map(
                (integration) => (
                  <div
                    key={integration.name}
                    className="border border-[#1A1A1A] bg-[#0A0A0A] p-5 hover:border-[#333333] transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-white font-mono text-sm">
                        {integration.name}
                      </span>
                      {integration.badge && (
                        <span className="text-[9px] font-mono uppercase tracking-widest text-[#666666] border border-[#333333] px-2 py-0.5">
                          {integration.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-500 font-mono text-xs leading-relaxed">
                      {integration.description}
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>
        ))}

        <div className="mt-24 pt-8 border-t border-zinc-900">
          <Link
            href="/"
            className="text-white font-mono text-xs uppercase tracking-widest hover:opacity-70 transition-opacity"
          >
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
