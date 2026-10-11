import { Suspense } from "react";

import { RunsTable } from "@/components/dashboard/runs-table";
import { CapturedWorkspace } from "@/features/dashboard-workspace/components/captured-workspace";
import { createLiveWorkspace } from "@/features/dashboard-workspace/live-workspace";

export default async function RunsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const workspace = createLiveWorkspace({
    id: projectId,
    name: "Project",
    organizationName: "Workspace",
  });

  return (
    <CapturedWorkspace workspace={workspace} toolbarTitle="Runs" childrenOnly segments={["sessions"]}>
      <div className="min-h-full bg-[#f3f2ed] p-4 text-black sm:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="mb-6 border-b border-black/15 pb-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/50">
              Observability / execution ledger
            </p>
            <h1 className="mt-2 font-pixel text-4xl tracking-[-0.05em]">Runs</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/60">
              Filter live run summaries, save operational views, and open the complete trace timeline.
            </p>
          </div>
          <Suspense fallback={<RunsFallback />}>
            <RunsTable projectId={projectId} />
          </Suspense>
        </div>
      </div>
    </CapturedWorkspace>
  );
}

function RunsFallback() {
  return (
    <div role="status" className="border border-black/15 bg-white p-6 font-mono text-xs uppercase tracking-widest text-black/55">
      Loading runs…
    </div>
  );
}
