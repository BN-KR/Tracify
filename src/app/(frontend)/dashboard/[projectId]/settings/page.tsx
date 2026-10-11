import Link from "next/link";

type SettingsPageProps = { params: Promise<{ projectId: string }> };

const sections = [
  ["API keys", "Create, rotate, and revoke project ingestion keys.", "api-keys"],
  ["Integrations", "Connect telemetry destinations and delivery providers.", "integrations"],
  ["LLM connections", "Manage provider connection settings and model access.", "llm-connections"],
  ["Models", "Define model aliases and pricing metadata.", "model-definitions"],
  ["Notifications", "Choose where project alerts and digest events are sent.", "notifications"],
  ["Scores", "Configure evaluation score definitions and thresholds.", "scores-configs"],
  ["Audit logs", "Review authenticated changes made to this project.", "audit-logs"],
  ["Exports", "Prepare project data exports for approved collaborators.", "exports"],
  ["Batch actions", "Run controlled maintenance actions across project records.", "batch-actions"],
] as const;

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { projectId } = await params;
  return (
    <main className="mx-auto w-full max-w-6xl p-6 text-white">
      <div className="mb-8 flex items-end justify-between gap-4 border-b border-white/15 pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/45">Project control plane</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/60">Manage access, providers, evaluation policy, and data operations for this project.</p>
        </div>
        <Link className="border border-white/25 px-3 py-2 font-mono text-xs uppercase tracking-wider hover:bg-white hover:text-black" href={`/dashboard/${projectId}`}>Overview</Link>
      </div>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Project settings sections">
        {sections.map(([title, description, slug]) => (
          <Link key={slug} href={`/dashboard/${projectId}/settings/${slug}`} className="group min-h-36 border border-white/15 bg-white/[0.03] p-5 transition-colors hover:border-white/50 hover:bg-white/[0.07]">
            <div className="flex items-start justify-between gap-3"><h2 className="font-medium">{title}</h2><span aria-hidden className="text-white/40 transition-transform group-hover:translate-x-1">→</span></div>
            <p className="mt-8 text-sm leading-6 text-white/55">{description}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
