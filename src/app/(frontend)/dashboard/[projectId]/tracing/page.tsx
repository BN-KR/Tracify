import { Suspense } from "react";

import { LiveCapturedTracing } from "@/components/dashboard/live-captured-tracing";

export default async function TracingPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return (
    <Suspense fallback={<TracingFallback />}>
      <LiveCapturedTracing projectId={projectId} />
    </Suspense>
  );
}

function TracingFallback() {
  return <div role="status" className="grid min-h-[50vh] place-items-center bg-black p-6 font-mono text-xs uppercase tracking-[0.12em] text-white/70">Loading tracing…</div>;
}
