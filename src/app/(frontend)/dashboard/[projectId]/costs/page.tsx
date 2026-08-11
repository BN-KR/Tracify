import { CostDashboard } from "@/components/dashboard/cost-dashboard";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";

export default async function CostsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <DashboardTopbar title="Costs" />
      <div className="px-6 pb-20">
        <CostDashboard projectId={projectId} />
      </div>
    </div>
  );
}
