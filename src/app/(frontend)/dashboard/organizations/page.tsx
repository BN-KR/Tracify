import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { OrganizationWorkspace } from "@/components/dashboard/organization-workspace";

export default function OrganizationsPage() {
  return <div className="flex flex-col gap-6"><DashboardTopbar title="Organizations" description="Manage workspaces and projects." /><div className="px-6 pb-10"><OrganizationWorkspace /></div></div>;
}
