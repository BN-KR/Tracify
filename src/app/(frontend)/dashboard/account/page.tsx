"use client";

import { LogOut, UserRound } from "lucide-react";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { authClient } from "@/lib/auth-client";
import { NotificationPreferences } from "@/components/dashboard/notification-preferences";

export default function AccountPage() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  return <div className="flex flex-col gap-6"><DashboardTopbar title="Manage Account" description="Account identity and session controls." /><div className="px-6 pb-10"><section className="max-w-3xl border border-black/15 bg-white p-6"><div className="flex items-center gap-3 border-b border-black/15 pb-5"><UserRound className="size-5" /><div><h1 className="font-mono text-xl text-black">Account</h1><p className="mt-1 font-sans text-sm text-black/55">This account area is available with or without a project.</p></div></div>{isPending ? <p className="pt-5 font-mono text-sm text-black/55">Loading account…</p> : <div className="grid gap-4 pt-5 sm:grid-cols-2"><div className="border border-black/15 bg-[#f3f2ed] p-4"><div className="font-mono text-[10px] uppercase tracking-widest text-black/45">Name</div><div className="mt-2 font-sans text-sm text-black">{user?.name || "Not set"}</div></div><div className="border border-black/15 bg-[#f3f2ed] p-4"><div className="font-mono text-[10px] uppercase tracking-widest text-black/45">Email</div><div className="mt-2 break-all font-sans text-sm text-black">{user?.email || "Not available"}</div></div></div>}<button type="button" onClick={() => void authClient.signOut()} className="mt-6 inline-flex h-9 items-center gap-2 border border-black px-4 font-mono text-[10px] uppercase tracking-widest text-black hover:bg-[#f4d44d]"><LogOut className="size-3.5" /> Sign out</button></section><NotificationPreferences /></div></div>;
}
