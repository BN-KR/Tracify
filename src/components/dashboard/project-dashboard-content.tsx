import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

export function ProjectDashboardContent({ projectId }: { projectId: string }) {
  return <DashboardOverview projectId={projectId} />;
}
