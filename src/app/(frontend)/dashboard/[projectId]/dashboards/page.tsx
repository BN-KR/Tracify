import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { TracifyEmptyOverview } from "@/components/dashboard/tracify-empty-overview";

export default async function DashboardsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <div className="flex flex-col gap-6"><DashboardTopbar title="Dashboards" description="Saved views for the signals your team monitors." /><div className="px-6 pb-10"><TracifyEmptyOverview projectId={projectId} dashboardMode liveData /></div></div>;
}
