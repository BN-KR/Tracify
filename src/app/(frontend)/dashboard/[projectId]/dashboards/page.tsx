import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { TracifyEmptyOverview } from "@/components/dashboard/tracify-empty-overview";
import Link from "next/link";

export default async function DashboardsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <div className="flex flex-col gap-6"><DashboardTopbar title="Dashboards" description="Saved views for the signals your team monitors." /><div className="px-6 pb-10"><div className="mb-4 flex justify-end"><Link href={`/dashboard/${projectId}/dashboards/new`} className="border border-black bg-black px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-white hover:bg-[#f4d44d] hover:text-black">Create dashboard</Link></div><TracifyEmptyOverview projectId={projectId} dashboardMode liveData /></div></div>;
}
