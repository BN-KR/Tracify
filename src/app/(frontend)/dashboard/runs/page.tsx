import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { RunsTable } from "@/components/dashboard/runs-table";
export default function Page() { return <div className="flex flex-col gap-6"><DashboardTopbar title="Agent Runs" description="View and trace all recent execution streams." /><div className="px-6 pb-10"><RunsTable projectId="" /></div></div>; }
