import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { CostDashboard } from "@/components/dashboard/cost-dashboard";
export default function Page() { return <div className="flex flex-col gap-6"><DashboardTopbar title="Costs" /><div className="px-6 pb-10"><CostDashboard projectId="" /></div></div>; }
