"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { Building2, FolderKanban } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { api } from "../../../convex/_generated/api";
import { ProjectMembers } from "@/components/dashboard/project-members";

export function OrganizationSettings() {
  const { data: organization, isPending } = authClient.useActiveOrganization();
  const projects = useQuery(api.projects.getProjectsByUserOrOrg, {});

  if (isPending) return <div className="border border-black/15 bg-white p-6 font-mono text-[10px] uppercase tracking-widest text-black/45">Loading organization…</div>;
  if (!organization) return <div className="border border-black/15 bg-white p-6 text-sm text-black/55">Select an organization from the workspace switcher to manage its settings.</div>;

  return <div className="space-y-6">
    <section className="border border-black/15 bg-white p-6">
      <div className="flex items-start gap-4"><div className="flex size-12 items-center justify-center border border-black bg-[#f4d44d]"><Building2 className="size-5" /></div><div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/45">Active organization</p><h2 className="mt-2 font-pixel text-4xl tracking-[-0.05em]">{organization.name}</h2><p className="mt-2 font-mono text-[10px] text-black/50">{organization.slug}</p></div></div>
    </section>
    <section className="border border-black/15 bg-white p-6"><div className="mb-5 flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/45">Workspace projects</p><h2 className="mt-2 font-mono text-[14px] uppercase tracking-widest">Project access</h2></div><span className="font-mono text-[10px] text-black/45">{projects?.length ?? "…"} projects</span></div><div className="grid gap-2 md:grid-cols-2">{(projects ?? []).map((project) => <Link key={project._id} href={`/dashboard/${project._id}`} className="flex items-center gap-3 border border-black/10 p-3 transition-colors hover:border-black"><FolderKanban className="size-4 text-black/55" /><span><strong className="block font-mono text-[11px] uppercase tracking-widest">{project.name}</strong><small className="text-[10px] text-black/50">Open project dashboard</small></span></Link>)}</div></section>
    <section className="border border-black/15 bg-white p-6"><p className="mb-5 font-mono text-[10px] uppercase tracking-[0.14em] text-black/45">Organization members</p><ProjectMembers /></section>
  </div>;
}
