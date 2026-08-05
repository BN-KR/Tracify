import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { ExperimentLab } from "@/components/dashboard/experiment-lab";

export default async function ExperimentsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <div><DashboardTopbar title="Experiments" description="Run prompts and models against datasets, then compare quality, cost, latency, and failures." /><div className="p-6"><ExperimentLab projectId={projectId} /></div></div>;
}
