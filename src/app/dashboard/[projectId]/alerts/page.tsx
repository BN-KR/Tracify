import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { AlertsList } from "@/components/dashboard/alerts-list";

export default async function AlertsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <div className="flex flex-col gap-6">
      <DashboardTopbar title="Alerts" description="Review active failures, cost thresholds, and operational signals." />
      <div className="px-6 pb-10">
        <AlertsList projectId={projectId} />
      </div>
    </div>
  );
}
