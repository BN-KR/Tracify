import { PromptPlayground } from "@/components/dashboard/prompt-playground";
import { ImproveLifecycleNav } from "@/components/dashboard/improve-lifecycle-nav";
import { CapturedWorkspace } from "@/features/dashboard-workspace/components/captured-workspace";
import { createLiveWorkspace } from "@/features/dashboard-workspace/live-workspace";

export default async function PlaygroundPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const workspace = createLiveWorkspace({ id: projectId, name: "Project", organizationName: "Workspace" });
  return <CapturedWorkspace workspace={workspace} childrenOnly segments={["playground"]}><ImproveLifecycleNav projectId={projectId} active="compare" /><PromptPlayground projectId={projectId} /></CapturedWorkspace>;
}
