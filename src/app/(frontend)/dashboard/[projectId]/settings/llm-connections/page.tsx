import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { TracifyLlmConnections } from "@/components/dashboard/tracify-llm-connections";

export default async function LlmConnectionsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <div className="flex flex-col gap-6"><DashboardTopbar title="LLM Connections" description="Configure providers for evaluations and playground workflows." /><div className="px-6 pb-10"><TracifyLlmConnections projectId={projectId} /></div></div>;
}
