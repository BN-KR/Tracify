import { LiveCapturedSessions } from "@/components/dashboard/live-captured-sessions";

export default async function SessionsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <LiveCapturedSessions projectId={projectId} />;
}
