import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { RunsTable } from "@/components/dashboard/runs-table";

export default async function ExportsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <div className="flex flex-col gap-6"><DashboardTopbar title="Exports" description="Filter project traces and export the visible records as CSV." /><div className="px-6 pb-10"><RunsTable projectId={projectId} /></div></div>;
}
