import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { InvestigationMode } from "@/components/dashboard/investigation-mode";

export default async function InvestigatePage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <div className="flex flex-col gap-6"><DashboardTopbar title="Investigation Mode" description="Turn a surprising trace into a reviewable evidence record." /><div className="px-6 pb-10"><InvestigationMode projectId={projectId} /></div></div>;
}
