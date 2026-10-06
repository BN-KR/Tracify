import { PromptManagement } from "@/components/dashboard/prompt-management";
import { CapturedWorkspace } from "@/features/dashboard-workspace/components/captured-workspace";
import { createLiveWorkspace } from "@/features/dashboard-workspace/live-workspace";
export default async function NewPromptPage({ params }: { params: Promise<{ projectId: string }> }) { const { projectId } = await params; const workspace = createLiveWorkspace({ id: projectId, name: "Project", organizationName: "Workspace" }); return <CapturedWorkspace workspace={workspace} childrenOnly segments={["prompts", "create"]}><PromptManagement projectId={projectId} /></CapturedWorkspace>; }
