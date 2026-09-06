import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { TracifyOperationsPreview } from "@/components/dashboard/tracify-operations-preview";

export default async function OperationsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <div><DashboardTopbar title="Operations" description="Monitor sessions, users, and actionable alerts for this project." /><div className="p-0"><TracifyOperationsPreview projectId={projectId} /></div></div>;
}
