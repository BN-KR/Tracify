import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { RunsTable } from "@/components/dashboard/runs-table";

export default async function BatchActionsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <DashboardTopbar title="Batch Actions" description="Select runs to export or manage together." />
      <div className="px-6 pb-20">
        <div className="mb-6 border border-black/15 bg-white p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/50">Batch workspace</p>
          <h1 className="mt-2 font-pixel text-4xl tracking-[-0.05em]">Select runs, then act.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-black/60">
            Use the run checkboxes to select a visible batch. The selection toolbar supports exporting the selected runs, while row actions remain available for individual run management.
          </p>
        </div>
        <RunsTable projectId={projectId} />
      </div>
    </div>
  );
}
