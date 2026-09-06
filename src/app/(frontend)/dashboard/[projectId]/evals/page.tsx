import { EvaluationEngineDashboard } from "@/components/dashboard/evaluation-engine-dashboard";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
export default async function EvalsPage({ params }: { params: Promise<{ projectId: string }> }) { const { projectId } = await params; return <div><DashboardTopbar title="Evaluators" description="Define checks, judges, and quality rules for your agents." /><div className="p-6"><EvaluationEngineDashboard projectId={projectId} section="evaluators" /></div></div>; }
