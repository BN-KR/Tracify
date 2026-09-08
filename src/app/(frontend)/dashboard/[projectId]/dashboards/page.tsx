import { LiveCapturedDashboards } from "@/components/dashboard/live-captured-dashboards";

export default async function DashboardsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <LiveCapturedDashboards projectId={projectId} />;
}
