import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { ProjectManagement } from "@/components/dashboard/project-management";

export default async function ProjectManagePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <DashboardTopbar title="Project Management" />
      <div className="px-6 pb-20">
        <ProjectManagement projectId={projectId} />
      </div>
    </div>
  );
}
