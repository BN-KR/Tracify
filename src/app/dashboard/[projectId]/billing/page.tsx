import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { BillingPlan } from "@/components/dashboard/billing-plan";

export default async function BillingPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <DashboardTopbar
        title="Billing & Plan"
        description="Real usage, current plan, and beta plan access."
      />

      <div className="px-6 pb-20">
        <BillingPlan projectId={projectId} />
      </div>
    </div>
  );
}
