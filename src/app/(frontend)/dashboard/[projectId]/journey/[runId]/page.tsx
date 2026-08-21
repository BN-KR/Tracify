import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { AgentJourney } from "@/components/dashboard/agent-journey";

export default async function AgentJourneyPage({ params }: { params: Promise<{ projectId: string; runId: string }> }) {
  const { projectId, runId } = await params;
  return <div className="flex flex-col gap-6"><DashboardTopbar title="Agent Journey" description="Join model, browser, tool, failure, evaluation, and cost evidence for one run." /><div className="px-6 pb-10"><AgentJourney projectId={projectId} runId={decodeURIComponent(runId)} /></div></div>;
}
