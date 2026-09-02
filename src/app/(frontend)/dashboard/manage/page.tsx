import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { ProjectManagement } from "@/components/dashboard/project-management";
export default function Page() { return <div className="flex flex-col gap-6"><DashboardTopbar title="Project Management" /><div className="px-6 pb-10"><ProjectManagement projectId="" /></div></div>; }
