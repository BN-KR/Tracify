import { AlertsBoundary } from "@/components/dashboard/alerts/alerts-boundary";
import { AlertsSections } from "@/components/dashboard/alerts/alerts-sections";

export default async function AlertsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <AlertsBoundary><AlertsSections projectId={projectId} /></AlertsBoundary>;
}
