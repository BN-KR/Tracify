import { Suspense } from "react";

import { LiveCapturedSessions } from "@/components/dashboard/live-captured-sessions";

export default async function SessionDetailPage({ params }: { params: Promise<{ projectId: string; sessionId: string }> }) {
  const { projectId, sessionId } = await params;
  const decodedSessionId = decodeURIComponent(sessionId);
  return (
    <Suspense fallback={<SessionDetailFallback />}>
      <LiveCapturedSessions projectId={projectId} sessionId={decodedSessionId} />
    </Suspense>
  );
}

function SessionDetailFallback() {
  return <div role="status" className="grid min-h-[50vh] place-items-center bg-black p-6 font-mono text-xs uppercase tracking-[0.12em] text-white/70">Loading session detail…</div>;
}
