import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { ProjectOrchestration } from "@/components/dashboard/project-orchestration";
export default function Page() { return <div><DashboardTopbar title="Runtime Policy" /><div className="p-6"><ProjectOrchestration projectId="" /></div></div>; }
