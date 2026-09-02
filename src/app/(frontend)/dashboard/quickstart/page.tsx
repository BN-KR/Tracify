import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { QuickstartGuide } from "@/components/dashboard/quickstart-guide";
export default function Page() { return <div className="flex flex-col gap-6"><DashboardTopbar title="Quickstart" /><div className="px-6 pb-10"><QuickstartGuide projectId="" /></div></div>; }
