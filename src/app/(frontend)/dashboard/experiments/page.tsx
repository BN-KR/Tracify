import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { ExperimentLab } from "@/components/dashboard/experiment-lab";
export default function Page() { return <div><DashboardTopbar title="Experiments" /><div className="p-6"><ExperimentLab projectId="" /></div></div>; }
