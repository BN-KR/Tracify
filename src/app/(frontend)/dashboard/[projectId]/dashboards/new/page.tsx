import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { DashboardCreateForm } from "@/components/dashboard/dashboard-create-form";

export default async function NewDashboardPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <div className="flex flex-col gap-6"><DashboardTopbar title="Create dashboard" description="Start a focused view of your Tracify telemetry." /><div className="px-6 pb-10"><DashboardCreateForm projectId={projectId} /></div></div>;
}
