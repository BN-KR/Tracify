import { LiveCapturedAdmin } from "@/components/dashboard/live-captured-admin";

export default async function AlertsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <LiveCapturedAdmin projectId={projectId} section="alerts" />
  );
}
