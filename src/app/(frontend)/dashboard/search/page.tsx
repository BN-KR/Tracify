import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { TraceSearch } from "@/components/dashboard/trace-search";
export default function Page() { return <div className="flex flex-col gap-6"><DashboardTopbar title="Trace Search" description="Find runs across sessions, environments, releases, cost, latency, and errors." /><div className="px-6 pb-10"><TraceSearch projectId="" /></div></div>; }
