import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { PromptPlayground } from "@/components/dashboard/prompt-playground";
import { ImproveLifecycleNav } from "@/components/dashboard/improve-lifecycle-nav";

export default async function PlaygroundPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <div><DashboardTopbar title="Prompt Playground" description="Compile variables and test prompt changes against your configured model provider." /><ImproveLifecycleNav projectId={projectId} active="compare" /><div className="p-6"><PromptPlayground projectId={projectId} /></div></div>;
}
