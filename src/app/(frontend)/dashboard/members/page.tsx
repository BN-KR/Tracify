import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { ProjectMembers } from "@/components/dashboard/project-members";
export default function Page() { return <div className="flex flex-col gap-6"><DashboardTopbar title="Members" /><div className="px-6 pb-10"><ProjectMembers projectId="" /></div></div>; }
