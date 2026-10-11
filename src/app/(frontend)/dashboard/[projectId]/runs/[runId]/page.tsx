import { Suspense } from "react";

import { TraceViewer } from "@/components/dashboard/trace-viewer";
import { CapturedWorkspace } from "@/features/dashboard-workspace/components/captured-workspace";
import { createLiveWorkspace } from "@/features/dashboard-workspace/live-workspace";

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; runId: string }>;
}) {
  const { projectId, runId } = await params;
  const workspace = createLiveWorkspace({
    id: projectId,
    name: "Project",
    organizationName: "Workspace",
  });

  return (
    <CapturedWorkspace workspace={workspace} toolbarTitle="Run detail" childrenOnly segments={["sessions"]}>
      <div className="min-h-full bg-[#f3f2ed] p-4 text-black sm:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-[1600px]">
          <Suspense fallback={<RunDetailFallback />}>
            <TraceViewer projectId={projectId} runId={runId} />
          </Suspense>
        </div>
      </div>
    </CapturedWorkspace>
  );
}

function RunDetailFallback() {
  return (
    <div role="status" className="border border-black/15 bg-white p-6 font-mono text-xs uppercase tracking-widest text-black/55">
      Loading run timeline…
    </div>
  );
}
