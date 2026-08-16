import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { ResilienceTestingDashboard } from "@/components/dashboard/resilience-testing-dashboard";

export default async function ResiliencePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <DashboardTopbar
        title="Resilience Testing"
        description="Replay your runtime policy against synthetic timeouts, rate limits, server errors, and cost overruns."
      />

      <div className="px-6 pb-20">
        <ResilienceTestingDashboard projectId={projectId} />
      </div>
    </div>
  );
}
