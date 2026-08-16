"use client";

import { useState } from "react";
import { Mail, Shield, UserPlus } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProjectMembers() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { data: organization, isPending: organizationPending } = authClient.useActiveOrganization();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "admin">("member");
  const [status, setStatus] = useState("");
  const [inviting, setInviting] = useState(false);

  async function invite() {
    if (!organization || !inviteEmail.trim()) return;
    setInviting(true);
    setStatus("");
    const result = await authClient.organization.inviteMember({
      email: inviteEmail.trim(),
      role: inviteRole,
      organizationId: organization.id,
    });
    setInviting(false);
    if (result.error) return setStatus(result.error.message || "Could not send invitation.");
    setInviteEmail("");
    setStatus(`Invitation link: ${window.location.origin}/accept-invitation?id=${result.data.id}`);
  }

  if (sessionPending || organizationPending) return <div className="space-y-4">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-12 w-full rounded-none" />)}</div>;
  if (!organization) return <PersonalMember name={session?.user.name || "You"} email={session?.user.email || ""} />;

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><h3 className="font-mono text-[14px] uppercase tracking-widest text-black">{organization.name} members</h3><p className="mt-1 text-[11px] text-black/55">Manage who has access to this workspace.</p></div>
      <div className="flex flex-wrap gap-2">
        <input value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="teammate@example.com" type="email" className="h-9 w-52 border border-black/15 bg-white px-3 font-mono text-[10px] text-black/70 outline-none focus:border-black/30" />
        <select value={inviteRole} onChange={(event) => setInviteRole(event.target.value as "member" | "admin")} className="h-9 border border-black/15 bg-white px-2 font-mono text-[10px] uppercase text-black/70"><option value="member">Developer</option><option value="admin">Admin</option></select>
        <Button onClick={() => void invite()} disabled={inviting || !inviteEmail.trim()} className="rounded-none font-mono text-[10px] uppercase"><UserPlus className="size-4" />{inviting ? "Sending..." : "Invite"}</Button>
      </div>
    </div>
    <Card className="divide-y divide-black/15 rounded-none border-border bg-white shadow-none">
      {organization.members?.map((membership) => <MemberRow key={membership.id} name={membership.user.name} email={membership.user.email} role={formatRole(membership.role)} isMe={membership.userId === session?.user.id} />)}
    </Card>
    {status ? <p className="border border-black/15 p-3 font-mono text-[10px] text-black/60">{status}</p> : null}
    <div className="flex items-start gap-4 border border-black/10 bg-black/5 p-4"><Shield className="mt-0.5 size-5 shrink-0 text-black/55" /><p className="font-mono text-[10px] leading-relaxed text-black/55">Owners and admins manage workspace access. Project authorization is enforced by Convex.</p></div>
  </div>;
}

function PersonalMember({ name, email }: { name: string; email: string }) {
  const [organizationName, setOrganizationName] = useState("");
  const [message, setMessage] = useState("");
  async function createOrganization() {
    const slug = organizationName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const result = await authClient.organization.create({ name: organizationName.trim(), slug });
    if (result.error) return setMessage(result.error.message || "Could not create workspace.");
    if (result.data) await authClient.organization.setActive({ organizationId: result.data.id });
    setMessage("Workspace created.");
  }
  return <div className="space-y-4"><div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="font-mono text-[14px] uppercase tracking-widest text-black">Personal project</h3><p className="mt-1 text-[11px] text-black/55">This project is only visible to you.</p></div><div className="flex gap-2"><input value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} placeholder="Workspace name" className="h-9 border border-black/15 bg-white px-3 font-mono text-[10px] text-black/70 outline-none focus:border-black/30" /><Button onClick={() => void createOrganization()} disabled={!organizationName.trim()} className="rounded-none font-mono text-[10px] uppercase">Create workspace</Button></div></div><Card className="rounded-none border-border bg-white shadow-none"><MemberRow name={name} email={email} role="Owner" isMe /></Card>{message ? <p className="font-mono text-[10px] text-black/55">{message}</p> : null}</div>;
}

function formatRole(role: string) { return role === "owner" ? "Owner" : role === "admin" ? "Admin" : role === "member" ? "Developer" : role === "viewer" ? "Viewer" : role; }

function MemberRow({ name, email, role, isMe }: { name: string; email: string; role: string; isMe?: boolean }) {
  return <div className="flex items-center justify-between p-4"><div className="flex items-center gap-3"><div className="flex size-8 items-center justify-center border border-black/15 bg-[#f3f2ed] font-mono text-xs uppercase text-black">{name.slice(0, 1)}</div><div><p className="font-mono text-[13px] text-black">{name}{isMe ? <span className="ml-1 text-black/55">(me)</span> : null}</p><p className="flex items-center gap-2 font-mono text-[11px] text-black/55"><Mail className="size-3" />{email}</p></div></div><span className="bg-[#f3f2ed] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-black/60">{role}</span></div>;
}
