import Link from "next/link";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { ProjectMembers } from "@/components/dashboard/project-members";

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardTopbar title="Members" description="Workspace members and their roles." />
      <div className="flex flex-col gap-6 px-6 pb-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/50">Read-only roster</p>
          <Link
            href="/dashboard/organization-settings"
            className="border border-black/15 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-black/60 hover:border-black hover:text-black"
          >
            Invite or manage members
          </Link>
        </div>
        <ProjectMembers readOnly />
      </div>
    </div>
  );
}
