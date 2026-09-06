import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { EvaluationEngineDashboard } from "@/components/dashboard/evaluation-engine-dashboard";
export default async function EvaluationRulesPage({ params }: { params: Promise<{ projectId: string }> }) { const { projectId } = await params; return <div><DashboardTopbar title="Evaluation rules" description="Define the checks that turn traces into reliable quality signals." /><div className="p-6"><EvaluationEngineDashboard projectId={projectId} section="evaluators" /></div></div>; }
