import { ProjectDashboardContent } from "@/components/dashboard/project-dashboard-content";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";

export default async function ProjectDashboardPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <DashboardTopbar title="Overview" />
      <div className="px-6 pb-10">
        <ProjectDashboardContent projectId={projectId} />
      </div>
    </div>
  );
}
