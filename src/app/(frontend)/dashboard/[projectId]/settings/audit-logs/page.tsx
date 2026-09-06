import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { TracifyAuditLogs } from "@/components/dashboard/tracify-audit-logs";

export default async function AuditLogsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <div className="flex flex-col gap-6"><DashboardTopbar title="Audit Logs" description="Review administrative activity for this project." /><div className="px-6 pb-20"><div className="mb-6"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/50">Project activity</p><h1 className="mt-2 font-pixel text-4xl tracking-[-0.05em]">Audit trail</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-black/60">Configuration and access changes are recorded here with their actor and timestamp.</p></div><TracifyAuditLogs projectId={projectId} /></div></div>;
}
