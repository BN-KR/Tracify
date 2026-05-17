import { TraceViewer } from "@/components/dashboard/trace-viewer";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; runId: string }>;
}) {
  const { projectId, runId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <DashboardTopbar
        title={`Run: ${runId}`}
        description="Detailed execution trace and span analysis."
      />

      <div className="px-6 pb-20">
        <TraceViewer projectId={projectId} runId={runId} />
      </div>
    </div>
  );
}
