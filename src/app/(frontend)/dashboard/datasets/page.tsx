import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { EvaluationEngineDashboard } from "@/components/dashboard/evaluation-engine-dashboard";
export default function Page() { return <div><DashboardTopbar title="Datasets" /><div className="p-6"><EvaluationEngineDashboard projectId="" section="datasets" /></div></div>; }
