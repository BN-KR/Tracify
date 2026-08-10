import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { SessionDetail } from "@/components/dashboard/session-detail";

export default async function SessionDetailPage({ params }: { params: Promise<{ projectId: string; sessionId: string }> }) {
  const { projectId, sessionId } = await params;
  const decodedSessionId = decodeURIComponent(sessionId);
  return <div className="flex flex-col gap-6"><DashboardTopbar title="Session detail" description={decodedSessionId} /><div className="px-6 pb-10"><SessionDetail projectId={projectId} sessionId={decodedSessionId} /></div></div>;
}
