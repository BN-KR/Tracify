import { Suspense } from "react";

import { AgentJourney } from "@/components/dashboard/agent-journey";
import { CapturedWorkspace } from "@/features/dashboard-workspace/components/captured-workspace";
import { createLiveWorkspace } from "@/features/dashboard-workspace/live-workspace";

export default async function AgentJourneyPage({ params }: { params: Promise<{ projectId: string; runId: string }> }) {
  const { projectId, runId } = await params;
  const workspace = createLiveWorkspace({ id: projectId, name: "Project", organizationName: "Workspace" });
  const decodedRunId = decodeURIComponent(runId);
  return (
    <CapturedWorkspace workspace={workspace} toolbarTitle="Agent journey" childrenOnly segments={["tracing", decodedRunId]}>
      <div className="min-h-full bg-[#f3f2ed] p-4 text-black sm:p-6 lg:p-8">
        <Suspense fallback={<JourneyFallback />}>
          <AgentJourney projectId={projectId} runId={decodedRunId} />
        </Suspense>
      </div>
    </CapturedWorkspace>
  );
}

function JourneyFallback() {
  return <div role="status" className="border border-black/15 bg-white p-6 font-mono text-xs uppercase tracking-widest text-black/55">Loading agent journey…</div>;
}
