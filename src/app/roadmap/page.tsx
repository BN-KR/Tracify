import type { Metadata } from "next";
import { FutureAction, FutureBand, FutureMasthead, FuturePage } from "@/components/marketing/future19-page";

export const metadata: Metadata = { title: "Roadmap", description: "A transparent view of Tracify product delivery.", alternates: { canonical: "/roadmap" } };

const sections = [
  { status: "Shipped", code: "NOW", title: "Observe and control the runs you have today", color: "bg-[#f4d44d]", items: ["Trace and run inspection", "Cost, model, and tool analytics", "Project reports and Slack alerts", "Runtime retry, fallback, latency, and cost policies", "Python and TypeScript instrumentation", "OpenTelemetry ingestion"] },
  { status: "In progress", code: "NEXT", title: "Complete the operational foundation", color: "bg-white", items: ["Sessions and multi-agent trace views", "Search and saved filters", "Payload redaction and retention controls", "Expanded provider and framework adapters", "Public service status and supported-limit reporting"] },
  { status: "Planned", code: "LATER", title: "Evaluate and improve every release", color: "bg-[#d9d5ca]", items: ["Datasets, experiments, and CI regression checks", "Rule, LLM-judge, and human-review evaluators", "Prompt versions, playgrounds, and safe rollback", "Feedback capture and score-driven alerts", "Provider health, routing, and policy templates"] },
  { status: "Enterprise phase", code: "SCALE", title: "Deploy and govern at scale", color: "bg-black text-white", items: ["Organization roles and audit logs", "SAML/SSO and granular RBAC", "EU/US data residency", "Self-hosted Docker, Helm, and air-gapped guidance", "Migration tooling for existing observability stacks"] },
] as const;

export default function RoadmapPage() {
  return <FuturePage><FutureMasthead eyebrow="Product / Roadmap" title={<>The work, with its uncertainty intact.</>} description="A transparent delivery register: what works now, what is actively moving, and what still depends on evidence from real agent teams." index="R01" />
    <FutureBand label="Delivery register"><div className="border-x border-black">
      {sections.map((section, index) => <article key={section.status} className={`grid border-b border-black last:border-b-0 lg:grid-cols-[160px_1fr] ${section.color}`}>
        <div className="flex min-h-40 flex-col justify-between border-b border-black p-6 lg:border-b-0 lg:border-r"><span className="font-mono text-[8px] uppercase tracking-[0.14em] opacity-55">Phase 0{index + 1}</span><span className="font-pixel text-5xl tracking-[-0.06em]">{section.code}</span></div>
        <div className="p-6 md:p-9"><div className="flex flex-col gap-4 border-b border-current/25 pb-6 sm:flex-row sm:items-start sm:justify-between"><h2 className="max-w-2xl font-pixel text-4xl leading-[0.92] tracking-[-0.05em] md:text-5xl">{section.title}</h2><span className="w-fit border border-current px-3 py-2 font-mono text-[8px] uppercase tracking-[0.13em]">{section.status}</span></div><ul className="grid gap-x-10 gap-y-4 pt-6 md:grid-cols-2">{section.items.map((item, itemIndex) => <li key={item} className="grid grid-cols-[30px_1fr] text-sm leading-6 opacity-65"><span className="font-mono text-[8px]">{itemIndex + 1}—</span>{item}</li>)}</ul></div>
      </article>)}
    </div></FutureBand>
    <FutureBand tone="signal"><div className="flex flex-col gap-7 px-5 py-12 md:flex-row md:items-end md:justify-between md:px-10"><p className="max-w-3xl font-pixel text-5xl leading-[0.9] tracking-[-0.06em] md:text-7xl">Your failure mode can change the order.</p><FutureAction href="/contact">Tell us what is missing</FutureAction></div></FutureBand>
  </FuturePage>;
}
