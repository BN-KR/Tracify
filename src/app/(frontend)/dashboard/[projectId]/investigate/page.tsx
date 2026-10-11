import { Suspense } from "react";

import { InvestigationMode } from "@/components/dashboard/investigation-mode";
import { CapturedWorkspace } from "@/features/dashboard-workspace/components/captured-workspace";
import { createLiveWorkspace } from "@/features/dashboard-workspace/live-workspace";

export default async function InvestigatePage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const workspace = createLiveWorkspace({ id: projectId, name: "Project", organizationName: "Workspace" });
  return (
    <CapturedWorkspace workspace={workspace} toolbarTitle="Investigation" childrenOnly segments={["tracing"]}>
      <div className="min-h-full bg-[#f3f2ed] p-4 text-black sm:p-6 lg:p-8">
        <Suspense fallback={<InvestigationFallback />}>
          <InvestigationMode projectId={projectId} />
        </Suspense>
      </div>
    </CapturedWorkspace>
  );
}

function InvestigationFallback() {
  return <div role="status" className="border border-black/15 bg-white p-6 font-mono text-xs uppercase tracking-widest text-black/55">Loading investigation…</div>;
}
