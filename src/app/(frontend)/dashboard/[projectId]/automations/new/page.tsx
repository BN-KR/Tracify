import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { AutomationsWorkspace } from "@/components/dashboard/automations-workspace";

export default async function NewAutomationPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return (
    <div className="flex flex-col gap-6">
      <DashboardTopbar title="Create automation" description="Define an event source, action, and destination." />
      <div className="p-6"><AutomationsWorkspace projectId={projectId} /></div>
    </div>
  );
}
