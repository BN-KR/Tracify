import { Suspense } from "react";

import { LiveCapturedTracing } from "@/components/dashboard/live-captured-tracing";

export default async function TracingDetailPage({ params }: { params: Promise<{ projectId: string; runId: string }> }) {
  const { projectId, runId } = await params;
  return (
    <Suspense fallback={<TracingDetailFallback />}>
      <LiveCapturedTracing projectId={projectId} runId={decodeURIComponent(runId)} />
    </Suspense>
  );
}

function TracingDetailFallback() {
  return <div role="status" className="grid min-h-[50vh] place-items-center bg-black p-6 font-mono text-xs uppercase tracking-[0.12em] text-white/70">Loading trace detail…</div>;
}
