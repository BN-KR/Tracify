import { LiveCapturedDashboards } from "@/components/dashboard/live-captured-dashboards";

export default async function DashboardDetailPage({ params }: { params: Promise<{ projectId: string; dashboardId: string }> }) {
  const { projectId, dashboardId } = await params;
  return <LiveCapturedDashboards projectId={projectId} dashboardId={dashboardId} />;
}
