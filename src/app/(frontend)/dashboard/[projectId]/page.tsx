import { ProjectDashboardContent } from "@/components/dashboard/project-dashboard-content";

export default async function ProjectDashboardPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return <ProjectDashboardContent projectId={projectId} />;
}
