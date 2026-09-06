import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { TracifyIntegrations } from "@/components/dashboard/tracify-integrations";

export default async function IntegrationsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <div className="flex flex-col gap-6"><DashboardTopbar title="Integrations" description="Connect Tracify to your runtime and alert destinations." /><div className="px-6 pb-20"><div className="mb-6"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/50">Project connections</p><h1 className="mt-2 font-pixel text-4xl tracking-[-0.05em]">Integrations</h1></div><TracifyIntegrations projectId={projectId} /></div></div>;
}
