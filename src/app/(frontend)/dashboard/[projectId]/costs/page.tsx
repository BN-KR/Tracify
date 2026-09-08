import { LiveCapturedHome } from "@/components/dashboard/live-captured-home";

export default async function CostsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return <LiveCapturedHome projectId={projectId} surface="costs" />;
}
