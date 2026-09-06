import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { UserDetail } from "@/components/dashboard/user-detail";

export default async function UserDetailPage({ params }: { params: Promise<{ projectId: string; userId: string }> }) {
  const { projectId, userId } = await params;
  return <div className="flex flex-col gap-6"><DashboardTopbar title="User detail" description="Inspect traces and sessions for an end-user identity." /><div className="px-6 pb-20"><UserDetail projectId={projectId} userId={decodeURIComponent(userId)} /></div></div>;
}
