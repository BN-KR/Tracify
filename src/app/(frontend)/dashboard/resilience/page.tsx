import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { ResilienceTestingDashboard } from "@/components/dashboard/resilience-testing-dashboard";
export default function Page() { return <div><DashboardTopbar title="Resilience Testing" /><div className="p-6"><ResilienceTestingDashboard projectId="" /></div></div>; }
