import { redirect } from "next/navigation";

export default async function RunsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  redirect(`/dashboard/${projectId}/tracing`);
}
