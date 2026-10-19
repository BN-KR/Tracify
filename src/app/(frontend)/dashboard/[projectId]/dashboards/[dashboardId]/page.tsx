import { DashboardsWorkspace } from "@/components/dashboard/widgets/dashboards-workspace";

export default async function DashboardDetailPage({ params }: { params: Promise<{ projectId: string; dashboardId: string }> }) {
  const { projectId, dashboardId } = await params;
  return <DashboardsWorkspace projectId={projectId} initialDashboard={dashboardId.slice(0, 100)} />;
}
