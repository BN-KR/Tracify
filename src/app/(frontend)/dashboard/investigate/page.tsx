import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { InvestigationMode } from "@/components/dashboard/investigation-mode";
export default function Page() { return <div className="flex flex-col gap-6"><DashboardTopbar title="Investigation Mode" /><div className="px-6 pb-10"><InvestigationMode projectId="" /></div></div>; }
