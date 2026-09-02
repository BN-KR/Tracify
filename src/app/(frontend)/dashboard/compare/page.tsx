import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { TraceCompare } from "@/components/dashboard/trace-compare";
export default function Page() { return <div className="flex flex-col gap-6"><DashboardTopbar title="Trace Compare" /><div className="px-6 pb-10"><TraceCompare projectId="" /></div></div>; }
