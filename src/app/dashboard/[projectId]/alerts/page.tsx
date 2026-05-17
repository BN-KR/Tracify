import { AlertsList } from "@/components/dashboard/alerts-list";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";

export default async function AlertsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <DashboardTopbar
        title="Alerts"
        description="Operational notifications triggered by cost or failure thresholds."
      />

      <div className="px-6 pb-20">
        <AlertsList projectId={projectId} />
      </div>
    </div>
  );
}
