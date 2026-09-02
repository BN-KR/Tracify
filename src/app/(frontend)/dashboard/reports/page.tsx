import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { ProjectReport } from "@/components/dashboard/project-report";
export default function Page() { return <div className="flex flex-col gap-6"><DashboardTopbar title="Project Report" /><div className="px-6 pb-10"><ProjectReport projectId="" /></div></div>; }
