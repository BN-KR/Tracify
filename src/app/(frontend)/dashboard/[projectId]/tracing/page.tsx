import { LiveCapturedTracing } from "@/components/dashboard/live-captured-tracing";

export default async function TracingPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <LiveCapturedTracing projectId={projectId} />;
}
