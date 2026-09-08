import { LiveCapturedTracing } from "@/components/dashboard/live-captured-tracing";

export default async function TracingDetailPage({ params }: { params: Promise<{ projectId: string; runId: string }> }) {
  const { projectId, runId } = await params;
  return <LiveCapturedTracing projectId={projectId} runId={decodeURIComponent(runId)} />;
}
