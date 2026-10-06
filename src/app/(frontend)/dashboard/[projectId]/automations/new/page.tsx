import { CapturedWorkspace } from "@/features/dashboard-workspace/components/captured-workspace";
import { createLiveWorkspace } from "@/features/dashboard-workspace/live-workspace";
import { AutomationsWorkspace } from "@/components/dashboard/automations-workspace";

export default async function NewAutomationPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const workspace = createLiveWorkspace({ id: projectId, name: "Project", organizationName: "Workspace" });
  return <CapturedWorkspace workspace={workspace} toolbarTitle="Create automation" childrenOnly segments={["settings"]}><AutomationsWorkspace projectId={projectId} /></CapturedWorkspace>;
}
