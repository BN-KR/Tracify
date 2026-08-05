import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { EvaluationEngineDashboard } from "@/components/dashboard/evaluation-engine-dashboard";
export default async function EvaluationRunsPage({ params }: { params: Promise<{ projectId: string }> }) { const { projectId } = await params; return <div><DashboardTopbar title="Evaluation Runs" description="Track online evaluation jobs and offline regression runs." /><div className="p-6"><EvaluationEngineDashboard projectId={projectId} section="runs" /></div></div>; }
