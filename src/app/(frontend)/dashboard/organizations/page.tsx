import Link from "next/link";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { OrganizationWorkspace } from "@/components/dashboard/organization-workspace";

export default function OrganizationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardTopbar title="Organizations" description="Manage workspaces and projects." />
      <div className="flex flex-col gap-6 px-6 pb-10">
        <nav aria-label="Organization sections" className="flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-widest">
          <Link href="/dashboard/organizations" aria-current="page" className="border border-black bg-black px-3 py-2 text-white">Organizations</Link>
          <Link href="/dashboard/organization-settings" className="border border-black/15 px-3 py-2 text-black/60 hover:border-black hover:text-black">Organization settings</Link>
          <Link href="/dashboard/members" className="border border-black/15 px-3 py-2 text-black/60 hover:border-black hover:text-black">Members</Link>
        </nav>
        <OrganizationWorkspace />
      </div>
    </div>
  );
}
