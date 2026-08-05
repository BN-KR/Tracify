import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { EvaluationEngineDashboard } from "@/components/dashboard/evaluation-engine-dashboard";

export default async function DatasetsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return (
    <div>
      <DashboardTopbar title="Datasets" description="Build versioned test sets from production traces and expected outputs." />
      <div className="p-6"><EvaluationEngineDashboard projectId={projectId} section="datasets" /></div>
    </div>
  );
}
