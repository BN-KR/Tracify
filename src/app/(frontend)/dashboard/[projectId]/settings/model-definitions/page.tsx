import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { TracifyModelDefinitions } from "@/components/dashboard/tracify-model-definitions";

export default async function ModelDefinitionsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <div className="flex flex-col gap-6"><DashboardTopbar title="Model Definitions" description="Configure model pricing for project cost views." /><div className="px-6 pb-10"><TracifyModelDefinitions projectId={projectId} /></div></div>;
}
