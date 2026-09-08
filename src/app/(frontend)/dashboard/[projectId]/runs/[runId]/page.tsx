import { redirect } from "next/navigation";

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; runId: string }>;
}) {
  const { projectId, runId } = await params;

  redirect(`/dashboard/${projectId}/tracing/${encodeURIComponent(runId)}`);
}
