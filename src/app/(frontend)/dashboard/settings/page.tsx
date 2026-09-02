import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { ProjectSettings } from "@/components/dashboard/project-settings";
export default function Page() { return <div className="flex flex-col gap-6"><DashboardTopbar title="Settings" /><div className="px-6 pb-10"><ProjectSettings projectId="" /></div></div>; }
