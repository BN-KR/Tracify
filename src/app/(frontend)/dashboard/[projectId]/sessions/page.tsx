import { Suspense } from "react";

import { LiveCapturedSessions } from "@/components/dashboard/live-captured-sessions";

type SessionsPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ session?: string | string[] }>;
};

export default async function SessionsPage({ params, searchParams }: SessionsPageProps) {
  const [{ projectId }, query] = await Promise.all([params, searchParams]);
  const requestedSession = Array.isArray(query.session) ? query.session[0] : query.session;

  return (
    <Suspense fallback={<SessionsFallback />}>
      <LiveCapturedSessions projectId={projectId} sessionId={requestedSession?.trim() || undefined} />
    </Suspense>
  );
}

function SessionsFallback() {
  return (
    <div role="status" className="grid min-h-[50vh] place-items-center bg-black p-6 font-mono text-xs uppercase tracking-[0.12em] text-white/70">
      Loading sessions…
    </div>
  );
}
