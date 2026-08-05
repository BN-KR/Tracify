import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { PromptPlayground } from "@/components/dashboard/prompt-playground";

export default async function PlaygroundPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <div><DashboardTopbar title="Prompt Playground" description="Compile variables and test prompt changes against your configured model provider." /><div className="p-6"><PromptPlayground projectId={projectId} /></div></div>;
}
