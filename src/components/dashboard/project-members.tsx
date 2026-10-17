"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Mail, Shield, Trash2, UserPlus, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Role = "admin" | "member" | "viewer";
type Invitation = { id: string; email: string; role: string; status: string; expiresAt: string | Date };

const ROLE_HELP: Record<string, string> = {
  owner: "Full control, including billing.",
  admin: "Manage the team and project settings.",
  member: "Open traces, add notes, share traces.",
  viewer: "Open traces and read notes. Can't change or share anything.",
};
const selectClass = "h-9 border border-black/15 bg-white px-2 font-mono text-[10px] uppercase text-black/70";

export function ProjectMembers({ readOnly = false }: { readOnly?: boolean }) {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { data: organization, isPending: organizationPending, refetch } = authClient.useActiveOrganization();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("member");
  const [status, setStatus] = useState("");
  const [inviting, setInviting] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  const organizationId = organization?.id;
  const myRole = organization?.members?.find((member) => member.userId === session?.user.id)?.role;
  const canManage = !readOnly && (myRole === "owner" || myRole === "admin");

  const loadInvitations = useCallback(async () => {
    if (!organizationId) return;
    const result = await authClient.organization.listInvitations({ query: { organizationId } });
    setInvitations(((result.data ?? []) as Invitation[]).filter((invitation) => invitation.status === "pending"));
  }, [organizationId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (canManage) void loadInvitations(); }, [canManage, loadInvitations]);

  const inviteLink = (id: string) => `${window.location.origin}/accept-invitation?id=${id}`;

  async function invite() {
    if (!canManage || !organization || !inviteEmail.trim()) return;
    setInviting(true);
    setStatus("");
    const result = await authClient.organization.inviteMember({
      email: inviteEmail.trim(),
      role: inviteRole,
      organizationId: organization.id,
    });
    setInviting(false);
    if (result.error) return setStatus(result.error.message || "Could not create the invitation.");
    setInviteEmail("");
    await loadInvitations();
    setStatus("Invitation created. Copy its link below and send it to them. It works for 7 days.");
  }

  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); setStatus("Link copied."); } catch { setStatus(text); }
  }

  async function revoke(invitationId: string) {
    const result = await authClient.organization.cancelInvitation({ invitationId });
    if (result.error) return setStatus(result.error.message || "Could not cancel the invitation.");
    await loadInvitations();
  }

  async function changeRole(memberId: string, role: Role) {
    if (!organization) return;
    const result = await authClient.organization.updateMemberRole({ memberId, role, organizationId: organization.id });
    setStatus(result.error ? result.error.message || "Could not change the role." : "Role updated.");
    await refetch();
  }

  async function removeMember(memberId: string, name: string) {
    if (!organization || !window.confirm(`Remove ${name} from ${organization.name}? They lose access right away.`)) return;
    const result = await authClient.organization.removeMember({ memberIdOrEmail: memberId, organizationId: organization.id });
    setStatus(result.error ? result.error.message || "Could not remove them." : `${name} was removed.`);
    await refetch();
  }

  if (sessionPending || organizationPending) return <div className="space-y-4">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-12 w-full rounded-none" />)}</div>;
  if (!organization) return <PersonalMember name={session?.user.name || "You"} email={session?.user.email || ""} />;

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><h3 className="font-mono text-[14px] uppercase tracking-widest text-black">{organization.name} members</h3><p className="mt-1 text-[11px] text-black/55">Manage who has access to this workspace.</p></div>
      {canManage ? <div className="flex flex-wrap gap-2">
        <input value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="teammate@example.com" type="email" aria-label="Teammate email" className="h-9 w-52 border border-black/15 bg-white px-3 font-mono text-[10px] text-black/70 outline-none focus:border-black/30" />
        <select value={inviteRole} onChange={(event) => setInviteRole(event.target.value as Role)} aria-label="Role" className={selectClass}><option value="member">Developer</option><option value="viewer">Viewer</option><option value="admin">Admin</option></select>
        <Button onClick={() => void invite()} disabled={inviting || !inviteEmail.trim()} className="rounded-none font-mono text-[10px] uppercase"><UserPlus className="size-4" />{inviting ? "Creating..." : "Invite"}</Button>
      </div> : <span className="font-mono text-[10px] uppercase tracking-widest text-black/45">{readOnly ? "Read only" : "Only owners and admins can change the team"}</span>}
    </div>
    <Card className="divide-y divide-black/15 rounded-none border-border bg-white shadow-none">
      {organization.members?.map((membership) => {
        const isMe = membership.userId === session?.user.id;
        const editable = canManage && !isMe && membership.role !== "owner";
        return <MemberRow key={membership.id} name={membership.user.name} email={membership.user.email} isMe={isMe} role={membership.role}>
          {editable ? <>
            <select value={membership.role} onChange={(event) => void changeRole(membership.id, event.target.value as Role)} aria-label={`Role for ${membership.user.name}`} className={selectClass}><option value="admin">Admin</option><option value="member">Developer</option><option value="viewer">Viewer</option></select>
            <button type="button" onClick={() => void removeMember(membership.id, membership.user.name)} aria-label={`Remove ${membership.user.name}`} title="Remove from team" className="flex size-9 items-center justify-center border border-black/15 text-black/55 hover:border-red-700 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"><Trash2 className="size-4" /></button>
          </> : <span className="bg-[#f3f2ed] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-black/60">{formatRole(membership.role)}</span>}
        </MemberRow>;
      })}
    </Card>
    {canManage && invitations.length > 0 ? <div className="space-y-2">
      <h4 className="font-mono text-[10px] uppercase tracking-widest text-black/55">Waiting to join</h4>
      <Card className="divide-y divide-black/15 rounded-none border-border bg-white shadow-none">
        {invitations.map((invitation) => <div key={invitation.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div><p className="font-mono text-[13px] text-black">{invitation.email}</p><p className="font-mono text-[11px] text-black/55">{formatRole(invitation.role)} · expires {new Date(invitation.expiresAt).toLocaleDateString()}</p></div>
          <div className="flex gap-2">
            <button type="button" onClick={() => void copy(inviteLink(invitation.id))} className="flex h-9 items-center gap-2 border border-black/15 px-3 font-mono text-[10px] uppercase text-black/70 hover:border-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"><Copy className="size-3" />Copy link</button>
            <button type="button" onClick={() => void revoke(invitation.id)} className="flex h-9 items-center gap-2 border border-black/15 px-3 font-mono text-[10px] uppercase text-black/70 hover:border-red-700 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"><X className="size-3" />Cancel</button>
          </div>
        </div>)}
      </Card>
    </div> : null}
    {status ? <p role="status" className="border border-black/15 p-3 font-mono text-[10px] text-black/60">{status}</p> : null}
    <div className="grid gap-px border border-black/10 bg-black/10 sm:grid-cols-2">
      {(["admin", "member", "viewer"] as const).map((role) => <p key={role} className="bg-[#f7f6f1] p-3 font-mono text-[10px] leading-relaxed text-black/60"><span className="uppercase text-black">{formatRole(role)}</span> · {ROLE_HELP[role]}</p>)}
    </div>
    <div className="flex items-start gap-4 border border-black/10 bg-black/5 p-4"><Shield className="mt-0.5 size-5 shrink-0 text-black/55" /><p className="font-mono text-[10px] leading-relaxed text-black/55">Access is checked on the server for every request. Removing someone ends their access right away.</p></div>
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

function MemberRow({ name, email, isMe, children }: { name: string; email: string; role: string; isMe?: boolean; children?: React.ReactNode }) {
  return <div className="flex flex-wrap items-center justify-between gap-3 p-4"><div className="flex items-center gap-3"><div className="flex size-8 items-center justify-center border border-black/15 bg-[#f3f2ed] font-mono text-xs uppercase text-black">{name.slice(0, 1)}</div><div><p className="font-mono text-[13px] text-black">{name}{isMe ? <span className="ml-1 text-black/55">(me)</span> : null}</p><p className="flex items-center gap-2 font-mono text-[11px] text-black/55"><Mail className="size-3" />{email}</p></div></div><div className="flex items-center gap-2">{children}</div></div>;
}
