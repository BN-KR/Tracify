import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { TracifyUsersDashboard } from "@/components/dashboard/tracify-users-dashboard";

export default async function UsersPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <div className="flex flex-col gap-6"><DashboardTopbar title="Users" description="Explore end-user activity across traces and sessions." /><div className="px-6 pb-10"><TracifyUsersDashboard projectId={projectId} /></div></div>;
}
