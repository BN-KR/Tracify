import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { EvaluationEngineDashboard } from "@/components/dashboard/evaluation-engine-dashboard";
export default async function EvaluationSettingsPage({ params }: { params: Promise<{ projectId: string }> }) { const { projectId } = await params; return <div><DashboardTopbar title="Evaluation Settings" description="Configure sampling, privacy, providers, and reviewer defaults." /><div className="p-6"><EvaluationEngineDashboard projectId={projectId} section="settings" /></div></div>; }
