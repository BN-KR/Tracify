import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { ImproveLifecycleNav } from "@/components/dashboard/improve-lifecycle-nav";
import { PromptManagement } from "@/components/dashboard/prompt-management";

export default async function PromptManagementPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <div><DashboardTopbar title="Prompt Management" description="Version, compare, and publish the prompts your agents use." /><ImproveLifecycleNav projectId={projectId} active="promote" /><div className="p-6"><PromptManagement projectId={projectId} /></div></div>;
}
