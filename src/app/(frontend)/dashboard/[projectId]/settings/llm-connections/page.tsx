import { redirect } from "next/navigation";

export default async function LlmConnectionsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  redirect(`/dashboard/${projectId}/settings?tab=LLM%20Connections`);
}
