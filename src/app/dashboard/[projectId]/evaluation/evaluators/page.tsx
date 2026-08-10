import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { EvaluationEngineDashboard } from "@/components/dashboard/evaluation-engine-dashboard";

export default async function EvaluatorsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <div><DashboardTopbar title="Evaluators" description="Define versioned deterministic checks, LLM judges, and guardrail detectors." /><div className="p-6"><EvaluationEngineDashboard projectId={projectId} section="evaluators" /></div></div>;
}
