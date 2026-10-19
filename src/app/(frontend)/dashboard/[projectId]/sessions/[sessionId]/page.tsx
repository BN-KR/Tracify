import { redirect } from "next/navigation";

/** Old session links keep working: the session opens in the list's detail panel. */
export default async function SessionDetailPage({ params }: { params: Promise<{ projectId: string; sessionId: string }> }) {
  const { projectId, sessionId } = await params;
  redirect(`/dashboard/${projectId}/sessions?id=${encodeURIComponent(decodeURIComponent(sessionId))}`);
}
