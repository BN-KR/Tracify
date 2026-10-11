import { LiveCapturedOperations } from "@/components/dashboard/live-captured-operations";

export default async function OperationsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <LiveCapturedOperations projectId={projectId} />;
}
