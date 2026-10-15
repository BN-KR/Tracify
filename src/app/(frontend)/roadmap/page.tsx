import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";
import { ClosingBand, DarkBand, Eyebrow, HeaderAction, SectionTitle } from "@/components/marketing/company/blocks";
import { RoadmapTrack } from "@/components/marketing/company/roadmap-track";

export const metadata: Metadata = { title: "Roadmap", description: "A transparent view of Tracify product delivery.", alternates: { canonical: "/roadmap" } };

const sections = [
  { status: "Shipped", code: "NOW", title: "Observe and control the runs you have today", items: ["Trace and run inspection", "Cost, model, and tool analytics", "Project reports and Slack alerts", "Runtime retry, fallback, latency, and cost policies", "Python and TypeScript instrumentation", "OpenTelemetry ingestion"] },
  { status: "In progress", code: "NEXT", title: "Complete the operational foundation", items: ["Sessions and multi-agent trace views", "Search and saved filters", "Payload redaction and retention controls", "Expanded provider and framework adapters", "Public service status and supported-limit reporting"] },
  { status: "Planned", code: "LATER", title: "Evaluate and improve every release", items: ["Datasets, experiments, and CI regression checks", "Rule, LLM-judge, and human-review evaluators", "Prompt versions, playgrounds, and safe rollback", "Feedback capture and score-driven alerts", "Provider health, routing, and policy templates"] },
  { status: "Enterprise phase", code: "SCALE", title: "Deploy and govern at scale", items: ["Organization roles and audit logs", "SAML/SSO and granular RBAC", "EU/US data residency", "Self-hosted Docker, Helm, and air-gapped guidance", "Migration tooling for existing observability stacks"] },
] as const;

export default function RoadmapPage() {
  return (
    <div className="overflow-x-clip bg-[#090909]">
      <PageHeader
        eyebrow="Trajectory / 2026 onward"
        title="The work, with its uncertainty intact."
        lede="What works now, what is moving, and what still depends on evidence from real agent teams. Direction is public. Dates stay evidence-led."
        image="/images/company/roadmap-steps.png"
      >
        <HeaderAction href="/changelog">See what shipped</HeaderAction>
        <HeaderAction href="/contact" kind="secondary">Tell us what you need</HeaderAction>
      </PageHeader>

      <DarkBand>
        <Eyebrow>Four stages</Eyebrow>
        <SectionTitle>Now, next, later, at scale.</SectionTitle>
        <div className="mt-14"><RoadmapTrack stages={sections} /></div>
      </DarkBand>

      <ClosingBand
        title="Missing something you need?"
        body="The roadmap follows real agent teams. Tell us what is blocking yours and it moves up."
        actions={[{ href: "/contact", label: "Talk to us", primary: true }, { href: "/changelog", label: "Read the changelog" }]}
      />
    </div>
  );
}
