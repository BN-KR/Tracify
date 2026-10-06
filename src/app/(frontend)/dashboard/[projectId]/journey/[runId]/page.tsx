import { AgentJourney } from "@/components/dashboard/agent-journey";
import { CapturedWorkspace } from "@/features/dashboard-workspace/components/captured-workspace";
import { createLiveWorkspace } from "@/features/dashboard-workspace/live-workspace";

export default async function AgentJourneyPage({ params }: { params: Promise<{ projectId: string; runId: string }> }) {
  const { projectId, runId } = await params;
  const workspace = createLiveWorkspace({ id: projectId, name: "Project", organizationName: "Workspace" });
  return <CapturedWorkspace workspace={workspace} childrenOnly segments={["tracing", decodeURIComponent(runId)]}><AgentJourney projectId={projectId} runId={decodeURIComponent(runId)} /></CapturedWorkspace>;
}
