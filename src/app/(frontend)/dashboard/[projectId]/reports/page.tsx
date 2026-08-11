import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { ProjectReport } from "@/components/dashboard/project-report";

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <DashboardTopbar
        title="Reports"
        description="Print-friendly proof of agent activity, cost, reliability, and alerts."
      />
      <div className="px-6 pb-20">
        <ProjectReport projectId={projectId} />
      </div>
    </div>
  );
}
