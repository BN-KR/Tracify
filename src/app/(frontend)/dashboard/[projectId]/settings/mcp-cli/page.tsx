import { redirect } from "next/navigation";

export default async function McpCliPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  redirect(`/dashboard/${projectId}/settings?tab=MCP%20%26%20CLI`);
}
