import { Suspense } from "react";

import { LiveCapturedTracing } from "@/components/dashboard/live-captured-tracing";

type TracesPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ run?: string | string[] }>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TracesPage({ params, searchParams }: TracesPageProps) {
  const [{ projectId }, query] = await Promise.all([params, searchParams]);
  const selectedRunId = firstValue(query.run)?.trim();

  return (
    <Suspense fallback={<TracingRouteFallback label="Loading traces…" />}>
      <LiveCapturedTracing projectId={projectId} runId={selectedRunId || undefined} />
    </Suspense>
  );
}

function TracingRouteFallback({ label }: { label: string }) {
  return (
    <div
      role="status"
      className="grid min-h-[50vh] place-items-center bg-black p-6 font-mono text-xs uppercase tracking-[0.12em] text-white/70"
    >
      {label}
    </div>
  );
}
