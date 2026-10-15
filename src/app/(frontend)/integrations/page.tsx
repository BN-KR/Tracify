import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";
import { Reveal } from "@/components/marketing/landing/reveal";
import { ClosingBand, DarkBand, CreamBand, Eyebrow, HeaderAction, SectionTitle , StatStrip } from "@/components/marketing/company/blocks";
import { IntegrationGrid, type Integration } from "@/components/marketing/company/integration-grid";

export const metadata: Metadata = {
  title: "AI agent integrations",
  description: "Connect Tracify with OpenTelemetry, OpenAI, Anthropic, LangChain, CrewAI, Vercel AI SDK, Slack, and more.",
  alternates: { canonical: "/integrations" },
};

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

const steps = [
  ["Point", "Set the OTLP endpoint and your project key. Nothing else is required."],
  ["Run", "Use any OTel-instrumented library, or wrap your agent with the TypeScript or Python SDK."],
  ["Read", "Spans arrive as one trace per run, with cost, tokens and failures attached."],
] as const;

export default function IntegrationsPage() {
  return (
    <div className="overflow-x-clip bg-[#090909]">
      <PageHeader
        eyebrow={`Connection map / ${integrations.length} adapters`}
        title="Bring your stack. Keep the standard."
        lede="Providers, frameworks, runtimes and alert channels all converge on one OpenTelemetry ingest surface."
        image="/images/company/integrations-hub.png"
      >
        <HeaderAction href="/docs/api">Open the ingest reference</HeaderAction>
        <HeaderAction href="/docs" kind="secondary">Read the docs</HeaderAction>
      </PageHeader>
      <StatStrip stats={[[String(integrations.length),"Adapters"],["OTLP","HTTP JSON ingest"],["2","SDKs: TypeScript, Python"],["~10","Lines to wrap an agent"]]} />

      <DarkBand>
        <Eyebrow>Adapters</Eyebrow>
        <SectionTitle>Filter by what you run.</SectionTitle>
        <div className="mt-12"><IntegrationGrid integrations={integrations} /></div>
      </DarkBand>

      <CreamBand>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <Eyebrow dark={false}>Three steps</Eyebrow>
            <SectionTitle>No proprietary agent.</SectionTitle>
            <ol className="mt-10 border-t border-black">
              {steps.map(([title, body], i) => (
                <Reveal key={title} delay={i * 0.07}>
                  <li className="grid grid-cols-[64px_1fr] gap-4 border-b border-black py-6">
                    <span className="font-pixel text-4xl leading-none text-black/25">0{i + 1}</span>
                    <div>
                      <h3 className="font-pixel text-2xl leading-none tracking-[-0.05em]">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-black/65">{body}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
          <Reveal>
            <div className="border border-black bg-[#090909] text-[#eceae3] shadow-[8px_8px_0_#f4d44d]">
              <div className="flex items-center justify-between border-b border-white/15 px-4 py-3 font-mono text-[9px] uppercase tracking-[0.14em] text-white/45">
                <span>.env</span>
                <span className="text-[#f4d44d]">OTLP / HTTP JSON</span>
              </div>
              <pre className="overflow-x-auto p-6 font-mono text-[12px] leading-7 md:p-8"><code><span className="text-[#f4d44d]">TRACIFY_OTLP_ENDPOINT</span>={"\n"}https://tracify.tech/api/otel{"\n\n"}<span className="text-[#f4d44d]">TRACIFY_API_KEY</span>={"\n"}tracify_sk_live_...</code></pre>
            </div>
          </Reveal>
        </div>
      </CreamBand>

      <ClosingBand
        title="Missing your stack?"
        body="If it speaks OpenTelemetry it already works. If it does not, tell us and we will look."
        actions={[{ href: "/contact", label: "Request an adapter", primary: true }, { href: "/docs/api", label: "Ingest reference" }]}
      />
    </div>
  );
}
