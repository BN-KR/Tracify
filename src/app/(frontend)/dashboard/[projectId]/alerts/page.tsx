import { AlertsBoundary } from "@/components/dashboard/alerts/alerts-boundary";
import { AlertsWorkspace } from "@/components/dashboard/alerts/alerts-workspace";

export default async function AlertsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <AlertsBoundary><AlertsWorkspace projectId={projectId} /></AlertsBoundary>;
}
