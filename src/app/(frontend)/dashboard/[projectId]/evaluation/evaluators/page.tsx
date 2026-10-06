import { EvaluationEngineDashboard } from "@/components/dashboard/evaluation-engine-dashboard";
import { CapturedWorkspace } from "@/features/dashboard-workspace/components/captured-workspace";
import { createLiveWorkspace } from "@/features/dashboard-workspace/live-workspace";

export default async function EvaluatorsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const workspace = createLiveWorkspace({ id: projectId, name: "Project", organizationName: "Workspace" });
  return <CapturedWorkspace workspace={workspace} childrenOnly segments={["evaluators"]}><EvaluationEngineDashboard projectId={projectId} section="evaluators" /></CapturedWorkspace>;
}
