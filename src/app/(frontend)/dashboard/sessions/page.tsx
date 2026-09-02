import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { SessionsList } from "@/components/dashboard/sessions-list";
export default function Page() { return <div className="flex flex-col gap-6"><DashboardTopbar title="Sessions" description="Group multi-turn and multi-step agent activity." /><div className="px-6 pb-10"><SessionsList projectId="" /></div></div>; }
