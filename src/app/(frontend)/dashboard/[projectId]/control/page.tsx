import { ProjectOrchestration } from "@/components/dashboard/project-orchestration";
import { CapturedWorkspace } from "@/features/dashboard-workspace/components/captured-workspace";
import { createLiveWorkspace } from "@/features/dashboard-workspace/live-workspace";

export default async function ControlPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const workspace = createLiveWorkspace({ id: projectId, name: "Project", organizationName: "Workspace" });
  return <CapturedWorkspace workspace={workspace} childrenOnly segments={["settings"]}><ProjectOrchestration projectId={projectId} /></CapturedWorkspace>;
}
