import { Suspense } from "react";

import { TraceSearch } from "@/components/dashboard/trace-search";
import { CapturedWorkspace } from "@/features/dashboard-workspace/components/captured-workspace";
import { createLiveWorkspace } from "@/features/dashboard-workspace/live-workspace";

export default async function SearchPage({ params }: { params: Promise<{ projectId: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { projectId } = await params;
  const workspace = createLiveWorkspace({ id: projectId, name: "Project", organizationName: "Workspace" });

  return (
    <CapturedWorkspace workspace={workspace} toolbarTitle="Trace search" childrenOnly segments={["sessions"]}>
      <div className="min-h-full bg-[#f3f2ed] p-4 text-black sm:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-[1400px]">
          <div className="mb-6 border-b border-black/15 pb-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/50">Observability / evidence retrieval</p>
            <h1 className="mt-2 font-pixel text-4xl tracking-[-0.05em]">Trace search</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/60">
              Search live telemetry by run, session, environment, release, status, and time window.
            </p>
          </div>
          <Suspense fallback={<SearchFallback />}>
            <TraceSearch projectId={projectId} />
          </Suspense>
        </div>
      </div>
    </CapturedWorkspace>
  );
}

function SearchFallback() {
  return (
    <div role="status" className="border border-black/15 bg-white p-6 font-mono text-xs uppercase tracking-widest text-black/55">
      Loading trace search…
    </div>
  );
}
