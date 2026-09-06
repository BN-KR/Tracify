"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { Building2, FolderKanban, Plus } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { api } from "../../../convex/_generated/api";

export function OrganizationWorkspace() {
  const [organizationName, setOrganizationName] = useState("");
  const [organizationNotice, setOrganizationNotice] = useState("");
  const { data: organizations, isPending } = authClient.useListOrganizations();
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const projects = useQuery(api.projects.getProjectsByUserOrOrg, {});

  async function createOrganization() {
    const name = organizationName.trim();
    if (!name) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const result = await authClient.organization.create({ name, slug });
    if (result.error) return setOrganizationNotice(result.error.message || "Could not create workspace.");
    if (result.data) await authClient.organization.setActive({ organizationId: result.data.id });
    setOrganizationName("");
    setOrganizationNotice("Workspace created and selected.");
  }

  if (isPending) return <div className="tracify-workspace-panel">Loading workspaces…</div>;

  return <section className="tracify-workspace-panel">
    <div className="tracify-workspace-heading"><div><span className="tracify-eyebrow">TRACIFY / WORKSPACES</span><h1>Organizations</h1><p>Choose a workspace, manage projects, and open your observability dashboard.</p></div><div className="tracify-workspace-actions"><label className="tracify-workspace-create"><input value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} placeholder="Workspace name" aria-label="Workspace name" /><button type="button" onClick={() => void createOrganization()} disabled={!organizationName.trim()}><Plus /> New organization</button></label><Link href="/onboarding/project" className="tracify-workspace-action"><Plus /> New project</Link></div></div>
    {organizationNotice ? <p className="tracify-dashboard-notice" role="status">{organizationNotice}</p> : null}
    <div className="tracify-org-list">{(organizations ?? []).map((organization) => <button type="button" key={organization.id} className={`tracify-org-card${activeOrganization?.id === organization.id ? " is-active" : ""}`} onClick={() => void authClient.organization.setActive({ organizationId: organization.id })}><Building2 /><span><strong>{organization.name}</strong><small>{activeOrganization?.id === organization.id ? "Active workspace" : "Switch workspace"}</small></span></button>)}{!organizations?.length ? <div className="tracify-empty-workspace">Personal workspace is active.</div> : null}</div>
    <div className="tracify-project-heading"><span>PROJECTS</span><span>{projects?.length ?? "…"}</span></div>
    {activeOrganization ? <Link href="/dashboard/organization-settings" className="mb-4 inline-flex border border-black/15 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-black/55 hover:border-black hover:text-black">Organization settings</Link> : null}
    <div className="tracify-project-grid">{(projects ?? []).map((project) => <Link href={`/dashboard/${project._id}`} key={project._id} className="tracify-project-card"><FolderKanban /><span><strong>{project.name}</strong><small>{project.planTier} · Open dashboard</small></span></Link>)}{projects?.length === 0 ? <Link href="/onboarding/project" className="tracify-empty-workspace">Create the first project <Plus /></Link> : null}</div>
  </section>;
}
