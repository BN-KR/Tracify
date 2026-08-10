import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { EvaluationEngineDashboard } from "@/components/dashboard/evaluation-engine-dashboard";
export default async function EvaluationMonitorsPage({ params }: { params: Promise<{ projectId: string }> }) { const { projectId } = await params; return <div><DashboardTopbar title="Evaluation Monitors" description="Alert when quality, policy, or user feedback rates cross a threshold." /><div className="p-6"><EvaluationEngineDashboard projectId={projectId} section="monitors" /></div></div>; }
