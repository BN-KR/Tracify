import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getThirdPartyBrand,
  ThirdPartyLogo,
} from "@/components/third-party-logo";

export const metadata: Metadata = {
  title: "AI agent integrations",
  description: "Connect Tracify with OpenTelemetry, OpenAI, Anthropic, LangChain, CrewAI, Vercel AI SDK, Slack, and more.",
  alternates: { canonical: "/integrations" },
};

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
    <div className="min-h-screen overflow-x-hidden bg-[#eceae3] pt-[54px] text-black selection:bg-yellow-300/40">
      <main className="mx-auto max-w-[1240px] border-x border-black">
        <header className="border-b border-black px-6 py-10 md:px-10 md:py-12">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#666666] mb-4">
            Platform / Integrations
          </div>
          <h1 className="max-w-3xl font-pixel text-5xl leading-[0.9] tracking-[-0.045em] md:text-7xl">
            Integrations
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-black/55">
            Connect Tracify to your existing tools, frameworks, and providers.
            Most integrations work via the OTLP endpoint — no vendor lock-in.
          </p>
        </header>

        <div className="grid border-b border-black bg-[#f4d44d] p-6 md:grid-cols-[0.6fr_1.4fr] md:gap-10 md:p-10">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#666666] mb-2">
            Quick Start
          </div>
          <p className="font-mono text-sm text-zinc-400 mb-4">
            Point any OTel exporter at the Tracify OTLP endpoint to start
            collecting spans immediately:
          </p>
          <div className="overflow-x-auto border border-black bg-black p-5 font-mono text-xs leading-6 text-white/55">
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
          <section key={category} className="border-b border-black">
            <h2 className="border-b border-black px-6 py-3 font-mono text-[9px] uppercase tracking-[0.16em] md:px-10">
              {category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {INTEGRATIONS.filter((i) => i.category === category).map(
                (integration) => {
                  const brand = getThirdPartyBrand(integration.name);
                  return (
                  <div
                    key={integration.name}
                    className="min-h-52 border-b border-r border-black p-6 transition-colors hover:bg-white/55"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {brand ? (
                        <ThirdPartyLogo
                          brand={brand}
                          className="size-5 shrink-0 object-contain"
                        />
                      ) : null}
                      <span className="font-pixel text-3xl leading-none tracking-[-0.04em]">
                        {integration.name}
                      </span>
                      {integration.badge && (
                        <span className="border border-black px-2 py-0.5 font-mono text-[8px] uppercase tracking-widest">
                          {integration.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-12 text-sm leading-6 text-black/55">
                      {integration.description}
                    </p>
                  </div>
                  );
                },
              )}
            </div>
          </section>
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
