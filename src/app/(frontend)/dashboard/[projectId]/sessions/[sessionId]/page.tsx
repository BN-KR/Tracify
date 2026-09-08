import { LiveCapturedSessions } from "@/components/dashboard/live-captured-sessions";

export default async function SessionDetailPage({ params }: { params: Promise<{ projectId: string; sessionId: string }> }) {
  const { projectId, sessionId } = await params;
  const decodedSessionId = decodeURIComponent(sessionId);
  return <LiveCapturedSessions projectId={projectId} sessionId={decodedSessionId} />;
}
