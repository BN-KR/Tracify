import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { SessionsList } from "@/components/dashboard/sessions-list";

export default async function SessionsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <div className="flex flex-col gap-6"><DashboardTopbar title="Sessions" description="Group multi-turn and multi-step agent activity into a single operational view." /><div className="px-6 pb-10"><SessionsList projectId={projectId} /></div></div>;
}
