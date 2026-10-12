import { TracingExplorer } from "@/components/dashboard/tracing/tracing-explorer";

export default async function TracingDetailPage({ params }: { params: Promise<{ projectId: string; runId: string }> }) {
  const { projectId, runId } = await params;
  // A shared trace link opens the trace list with that trace's panel open, over the last 30 days.
  return <TracingExplorer projectId={projectId} initialQuery={{ range: "30d", trace: decodeURIComponent(runId).slice(0, 200) }} />;
}
