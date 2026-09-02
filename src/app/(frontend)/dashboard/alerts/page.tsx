import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { AlertsList } from "@/components/dashboard/alerts-list";
export default function Page() { return <div className="flex flex-col gap-6"><DashboardTopbar title="Alerts" /><div className="px-6 pb-10"><AlertsList projectId="" /></div></div>; }
