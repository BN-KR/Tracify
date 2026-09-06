"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { authClient } from "@/lib/auth-client";

export default function AcceptInvitationPage() {
  const invitationId = useSearchParams().get("id");
  const { data: session, isPending } = authClient.useSession();
  const [message, setMessage] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [pending, setPending] = useState(false);

  async function accept() {
    if (!invitationId) return;
    setPending(true);
    const invitation = await authClient.organization.getInvitation({ query: { id: invitationId } });
    if (invitation.error) {
      const raw = invitation.error.message || "This invitation is unavailable.";
      setMessage(raw.toLowerCase().includes("expired") ? "This invitation has expired." : "This invitation is missing or no longer available.");
      setPending(false);
      return;
    }
    const result = await authClient.organization.acceptInvitation({ invitationId });
    setPending(false);
    if (result.error) {
      const raw = result.error.message || "Could not accept invitation.";
      const lower = raw.toLowerCase();
      setAccepted(false);
      setMessage(lower.includes("expired") ? "This invitation has expired." : lower.includes("already") ? "This invitation has already been accepted." : lower.includes("email") || lower.includes("member") ? "This invitation belongs to a different account. Sign out and use the invited email address." : raw);
      return;
    }
    setAccepted(true);
    setMessage("Invitation accepted. Your workspace is ready.");
    const organizationId = invitation.data?.organizationId;
    if (organizationId) await authClient.organization.setActive({ organizationId });
  }

  const signInUrl = `/sign-in?redirect=${encodeURIComponent(`/accept-invitation?id=${invitationId || ""}`)}`;
  return <AuthShell mode="invitation"><div><h2 className="font-pixel text-4xl tracking-[-0.06em]">Workspace invitation</h2><p className="mt-3 text-sm leading-6 text-black/55">Join the team and share traces, evaluations, and release evidence.</p>{!invitationId ? <Notice>This invitation link is incomplete.</Notice> : isPending ? <Notice>Checking your account…</Notice> : !session ? <><Notice>Sign in with the invited email address, then return here to accept.</Notice><ActionLink href={signInUrl}>Sign in to continue</ActionLink></> : accepted ? null : <button disabled={pending} onClick={() => void accept()} className="active-press mt-7 flex h-12 w-full items-center justify-between bg-black px-4 font-mono text-[10px] uppercase tracking-[0.13em] text-white hover:bg-[#f4d44d] hover:text-black disabled:opacity-50"><span>{pending ? "Accepting…" : "Accept invitation"}</span><ArrowRight className="size-4" /></button>}{message ? <Notice>{message}</Notice> : null}{session && accepted ? <ActionLink href="/dashboard">Open dashboard</ActionLink> : null}</div></AuthShell>;
}

function Notice({ children }: { children: React.ReactNode }) { return <p role="status" className="mt-6 border border-black/25 bg-[#f7f6f1] p-4 text-sm leading-6 text-black/60">{children}</p>; }
function ActionLink({ href, children }: { href: string; children: React.ReactNode }) { return <Link href={href} className="active-press mt-4 flex h-12 items-center justify-between bg-black px-4 font-mono text-[10px] uppercase tracking-[0.13em] text-white hover:bg-[#f4d44d] hover:text-black">{children}<ArrowRight className="size-4" /></Link>; }
