import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { EvaluationEngineDashboard } from "@/components/dashboard/evaluation-engine-dashboard";

export default async function EvaluationPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <div><DashboardTopbar title="Evaluation Engine" description="Turn production traces into scored examples, regression suites, and quality monitors." /><div className="p-6"><EvaluationEngineDashboard projectId={projectId} /></div></div>;
}
