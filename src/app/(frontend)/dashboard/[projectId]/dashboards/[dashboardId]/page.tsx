import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { TracifyEmptyOverview } from "@/components/dashboard/tracify-empty-overview";

export default async function DashboardDetailPage({ params }: { params: Promise<{ projectId: string; dashboardId: string }> }) {
  const { projectId, dashboardId } = await params;
  return <div className="flex flex-col gap-6"><DashboardTopbar title="Dashboard" description="Saved view for project telemetry." /><div className="px-6 pb-10"><TracifyEmptyOverview projectId={projectId} dashboardId={dashboardId} dashboardMode liveData /></div></div>;
}
