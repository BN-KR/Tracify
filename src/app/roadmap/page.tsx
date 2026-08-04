import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/marketing/footer";
import { Navbar } from "@/components/marketing/navbar";

export const metadata: Metadata = {
  title: "Roadmap | tracify",
  description: "A transparent view of tracify product delivery.",
};

const sections = [
  {
    status: "Shipped",
    title: "Observe and control the runs you have today",
    items: ["Trace and run inspection", "Cost, model, and tool analytics", "Project reports and Slack alerts", "Runtime retry, fallback, latency, and cost policies", "Python and TypeScript instrumentation", "OpenTelemetry ingestion"],
  },
  {
    status: "In progress",
    title: "A complete operational foundation",
    items: ["Sessions and multi-agent trace views", "Search and saved filters", "Payload redaction and retention controls", "Expanded provider and framework adapters", "Public service status and supported-limit reporting"],
  },
  {
    status: "Planned",
    title: "Evaluate and improve every release",
    items: ["Datasets, experiments, and CI regression checks", "Rule, LLM-judge, and human-review evaluators", "Prompt versions, playgrounds, and safe rollback", "Feedback capture and score-driven alerts", "Provider health, routing, and policy templates"],
  },
  {
    status: "Enterprise phase",
    title: "Deploy and govern at scale",
    items: ["Organization roles and audit logs", "SAML/SSO and granular RBAC", "EU/US data residency", "Self-hosted Docker, Helm, and air-gapped guidance", "Langfuse, LangSmith, and OTel migration tooling"],
  },
];

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        <div className="max-w-3xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">Product / Roadmap</p>
          <h1 className="mt-5 font-pixel text-4xl leading-tight md:text-6xl">Build, observe, evaluate, control.</h1>
          <p className="mt-6 font-sans text-lg leading-relaxed text-zinc-400">Tracify combines agent observability with runtime cost and reliability control. This page separates what works today from work in progress and the larger competitive program ahead.</p>
        </div>
        <div className="mt-20 space-y-10">
          {sections.map((section) => (
            <section key={section.status} className="border border-zinc-800 bg-[#0a0a0a] p-6 md:p-8">
              <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">{section.status}</div>
              <h2 className="mt-3 font-mono text-xl text-white">{section.title}</h2>
              <ul className="mt-6 grid gap-3 border-t border-zinc-800 pt-6 md:grid-cols-2">
                {section.items.map((item) => <li key={item} className="font-mono text-sm leading-relaxed text-zinc-400">— {item}</li>)}
              </ul>
            </section>
          ))}
        </div>
        <div className="mt-14 border-t border-zinc-800 pt-8 font-mono text-sm text-zinc-400">
          Looking for a capability? <Link className="text-white underline underline-offset-4" href="/contact">Tell us what you need.</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
