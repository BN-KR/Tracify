import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { EvaluationEngineDashboard } from "@/components/dashboard/evaluation-engine-dashboard";

export default async function ScoresPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <div><DashboardTopbar title="Scores" description="Review quality signals attached to your traces and generations." /><div className="p-6"><EvaluationEngineDashboard projectId={projectId} section="overview" /></div></div>;
}
