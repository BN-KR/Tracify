import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, PlugZap } from "lucide-react";
import { getThirdPartyBrand, ThirdPartyLogo } from "@/components/third-party-logo";

export const metadata: Metadata = {
  title: "AI agent integrations",
  description: "Connect Tracify with OpenTelemetry, OpenAI, Anthropic, LangChain, CrewAI, Vercel AI SDK, Slack, and more.",
  alternates: { canonical: "/integrations" },
};

type Integration = { name: string; description: string; badge?: string; category: string };

const integrations: Integration[] = [
  { name: "OpenTelemetry (OTLP)", description: "Ingest spans through the standard OTLP HTTP JSON protocol. Any OTel-instrumented library or exporter works out of the box.", badge: "Native", category: "Tracing" },
  { name: "OpenLLMetry", description: "Drop-in LLM observability instrumentation for OpenAI, Anthropic, Cohere, and more.", badge: "Compatible", category: "Tracing" },
  { name: "LangChain", description: "Trace LangChain agents, chains, and tool calls through the built-in OTel callback handler.", category: "Frameworks" },
  { name: "CrewAI", description: "Monitor CrewAI multi-agent workflows through Python SDK instrumentation.", category: "Frameworks" },
  { name: "AutoGen", description: "Trace AutoGen conversations and tool execution through OTel instrumentation or the Python decorator.", category: "Frameworks" },
  { name: "OpenAI SDK", description: "Capture model, latency, tokens, and cost for every OpenAI API call automatically.", category: "Providers" },
  { name: "Anthropic SDK", description: "Trace Claude model calls, tool use, streaming, and extended-thinking spans.", category: "Providers" },
  { name: "Vercel AI SDK", description: "Trace streaming calls, tool use, and multi-step generations from the Vercel AI SDK.", category: "Providers" },
  { name: "Next.js", description: "Server-side tracing for route handlers, Server Actions, and middleware through the TypeScript SDK.", category: "Runtimes" },
  { name: "Python", description: "Wrap FastAPI, Flask, or ordinary Python functions for automatic span collection.", category: "Runtimes" },
  { name: "Redis", description: "Track cache hits, misses, and rate-limiter state as spans in the agent pipeline.", category: "Infrastructure" },
  { name: "Slack", description: "Route alerts and failed-trace notifications into Slack channels through webhooks.", category: "Alerts" },
  { name: "Microsoft Teams", description: "Route alerts and failed-trace notifications into a Teams channel through an incoming webhook or Power Automate flow.", category: "Alerts" },
  { name: "PagerDuty", description: "Escalate high-severity agent failures into the on-call workflow.", category: "Alerts" },
  { name: "Webhooks", description: "Send spans, alerts, cost thresholds, and orchestration events to any HTTP endpoint.", category: "Alerts" },
  { name: "Docs MCP Server", description: "Give AI agents and MCP-compatible clients read access to Tracify's documentation as structured resources.", badge: "Native", category: "Agent tooling" },
];

const categories = [...new Set(integrations.map((integration) => integration.category))];

export default function IntegrationsPage() {
  return <main className="min-h-screen overflow-x-hidden bg-[#eceae3] pt-[54px] text-black">
    <header className="border-b border-black">
      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[minmax(0,0.72fr)_minmax(520px,1.28fr)]">
        <div className="flex min-h-[520px] flex-col justify-between border-black bg-[#f4d44d] p-6 sm:p-8 md:p-10 lg:border-r">
          <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em]"><span>Connection map</span><span>{integrations.length} adapters</span></div>
          <div><PlugZap className="mb-8 size-10" strokeWidth={1.25} aria-hidden="true" /><h1 className="font-pixel text-[clamp(3.3rem,7vw,7rem)] leading-[0.82] tracking-[-0.075em]">Bring your stack. Keep the standard.</h1><p className="mt-7 max-w-xl text-base leading-7 text-black/65">Providers, frameworks, runtimes, and alert channels converge on one OpenTelemetry ingest surface.</p></div>
        </div>
        <div className="flex flex-col justify-between border-t border-black bg-black text-white lg:border-t-0">
          <div className="grid grid-cols-3 border-b border-white/20 font-mono text-[8px] uppercase tracking-[0.13em] text-white/45"><span className="p-4">Input / OTLP</span><span className="border-l border-white/20 p-4">Format / JSON</span><span className="border-l border-white/20 p-4">Auth / Bearer</span></div>
          <pre className="overflow-x-auto p-6 font-mono text-[11px] leading-7 sm:p-10"><code><span className="text-white/35"># .env</span>{"\n"}<span className="text-[#f4d44d]">TRACIFY_OTLP_ENDPOINT</span>={"\n"}https://tracify.tech/api/otel{"\n\n"}<span className="text-[#f4d44d]">TRACIFY_API_KEY</span>={"\n"}tracify_sk_live_...</code></pre>
          <div className="grid border-t border-white/20 sm:grid-cols-2"><p className="p-6 text-sm leading-6 text-white/58">Any OTel-compatible exporter can send traces without a proprietary agent.</p><Link href="/docs/api" className="flex min-h-20 items-center justify-between border-t border-white/20 px-6 font-mono text-[9px] uppercase tracking-[0.14em] text-[#f4d44d] hover:bg-[#f4d44d] hover:text-black sm:border-l sm:border-t-0">Open ingest reference <ArrowUpRight className="size-4" /></Link></div>
        </div>
      </div>
    </header>

    <section className="border-b border-black">
      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[260px_1fr]">
        <aside className="border-black bg-black text-white lg:border-r"><div className="sticky top-[54px] p-6 md:p-8"><p className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/45">Signal routes</p><ol className="mt-8 divide-y divide-white/20 border-y border-white/20">{categories.map((category, index) => <li key={category}><a href={`#${category.toLowerCase()}`} className="flex min-h-14 items-center justify-between font-mono text-[9px] uppercase tracking-[0.12em] text-white/65 hover:text-[#f4d44d]"><span>0{index + 1} / {category}</span><span>→</span></a></li>)}</ol></div></aside>
        <div>{categories.map((category, categoryIndex) => <section id={category.toLowerCase()} key={category} className="scroll-mt-16 border-b border-black last:border-b-0">
          <div className="grid min-h-24 grid-cols-[80px_1fr] border-b border-black bg-white/30"><span className="flex items-center justify-center border-r border-black font-pixel text-4xl text-black/22">0{categoryIndex + 1}</span><h2 className="flex items-center px-5 font-pixel text-4xl tracking-[-0.055em] sm:px-8">{category}</h2></div>
          <div className="divide-y divide-black">{integrations.filter((integration) => integration.category === category).map((integration, index) => {
            const brand = getThirdPartyBrand(integration.name);
            return <article key={integration.name} className="group grid min-h-36 transition-colors hover:bg-[#f4d44d] sm:grid-cols-[72px_minmax(190px,0.75fr)_1.25fr_auto]">
              <div className="hidden items-center justify-center border-r border-black font-mono text-[9px] text-black/35 sm:flex">{String(index + 1).padStart(2, "0")}</div>
              <div className="flex items-center gap-3 border-black p-5 sm:border-r sm:p-6">{brand ? <ThirdPartyLogo brand={brand} className="size-7 shrink-0 object-contain" /> : <PlugZap className="size-6" strokeWidth={1.25} aria-hidden="true" />}<h3 className="font-pixel text-3xl leading-none tracking-[-0.045em]">{integration.name}</h3></div>
              <p className="border-t border-black px-5 py-5 text-sm leading-6 text-black/60 group-hover:text-black/72 sm:border-t-0 sm:px-6">{integration.description}</p>
              <div className="flex items-center justify-between gap-4 border-t border-black px-5 py-4 sm:border-l sm:border-t-0"><span className="font-mono text-[8px] uppercase tracking-[0.12em]">{integration.badge ?? "Supported"}</span><ArrowUpRight className="size-4" aria-hidden="true" /></div>
            </article>;
          })}</div>
        </section>)}</div>
      </div>
    </section>
  </main>;
}
