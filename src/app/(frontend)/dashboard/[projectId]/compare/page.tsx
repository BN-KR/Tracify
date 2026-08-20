import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { TraceCompare } from "@/components/dashboard/trace-compare";

export default async function ComparePage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <div className="flex flex-col gap-6"><DashboardTopbar title="Trace Compare" description="Find the meaningful difference between two agent runs." /><div className="px-6 pb-10"><TraceCompare projectId={projectId} /></div></div>;
}
