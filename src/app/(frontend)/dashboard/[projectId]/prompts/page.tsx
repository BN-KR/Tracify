import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { PromptManagement } from "@/components/dashboard/prompt-management";
import { ImproveLifecycleNav } from "@/components/dashboard/improve-lifecycle-nav";

export default async function PromptsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <div><DashboardTopbar title="Prompt Management" description="Version, test, and promote prompts without coupling every change to an application deploy." /><ImproveLifecycleNav projectId={projectId} active="promote" /><div className="p-6"><PromptManagement projectId={projectId} /></div></div>;
}
