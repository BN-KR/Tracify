import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { TraceSearch } from "@/components/dashboard/trace-search";

export default async function SearchPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <div className="flex flex-col gap-6"><DashboardTopbar title="Trace search" description="Find runs across sessions, users, environments, releases, cost, latency, and errors." /><div className="px-6 pb-10"><TraceSearch projectId={projectId} /></div></div>;
}
