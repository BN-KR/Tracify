import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { EvaluationEngineDashboard } from "@/components/dashboard/evaluation-engine-dashboard";
export default function Page() { return <div><DashboardTopbar title="Evaluation Engine" /><div className="p-6"><EvaluationEngineDashboard projectId="" /></div></div>; }
