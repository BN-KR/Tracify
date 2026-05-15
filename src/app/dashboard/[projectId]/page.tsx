import { DashboardStartState } from "@/components/dashboard/dashboard-start-state";

export default async function ProjectDashboardPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return <DashboardStartState projectId={projectId} />;
}
