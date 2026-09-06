import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { OrganizationSettings } from "@/components/dashboard/organization-settings";

export default function OrganizationSettingsPage() {
  return <div className="flex flex-col gap-6"><DashboardTopbar title="Organization Settings" description="Manage workspace identity, projects, and members." /><div className="px-6 pb-20"><div className="mb-6"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/50">Workspace administration</p><h1 className="mt-2 font-pixel text-4xl tracking-[-0.05em]">Organization settings</h1></div><OrganizationSettings /></div></div>;
}
