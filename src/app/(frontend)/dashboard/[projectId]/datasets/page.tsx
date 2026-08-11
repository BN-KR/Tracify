import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { EvaluationEngineDashboard } from "@/components/dashboard/evaluation-engine-dashboard";
import { ImproveLifecycleNav } from "@/components/dashboard/improve-lifecycle-nav";

export default async function DatasetsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return (
    <div>
      <DashboardTopbar title="Datasets" description="Build versioned test sets from production traces and expected outputs." />
      <ImproveLifecycleNav projectId={projectId} active="collect" /><div className="p-6"><EvaluationEngineDashboard projectId={projectId} section="datasets" /></div>
    </div>
  );
}
