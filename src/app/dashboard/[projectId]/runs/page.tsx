import { RunsTable } from "@/components/dashboard/runs-table";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";

export default async function RunsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <DashboardTopbar
        title="Agent Runs"
        description="View and trace all recent execution streams for this project."
      />

      <div className="px-6 pb-10">
        <RunsTable projectId={projectId} />
      </div>
    </div>
  );
}
