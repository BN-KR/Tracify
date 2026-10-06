import { QuickstartGuide } from "@/components/dashboard/quickstart-guide";
import { CapturedWorkspace } from "@/features/dashboard-workspace/components/captured-workspace";
import { createLiveWorkspace } from "@/features/dashboard-workspace/live-workspace";

export default async function TracingSetupPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const workspace = createLiveWorkspace({ id: projectId, name: "Project", organizationName: "Workspace" });
  return <CapturedWorkspace workspace={workspace} toolbarTitle="Configure tracing" childrenOnly segments={["settings"]}><QuickstartGuide projectId={projectId} /></CapturedWorkspace>;
}
