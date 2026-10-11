"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Building2, Globe2, LogOut, UserRound } from "lucide-react";

import { api } from "convex/_generated/api";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { NotificationPreferences } from "@/components/dashboard/notification-preferences";
import { useConvexAuthReadiness } from "@/hooks/use-convex-auth-readiness";
import { authClient } from "@/lib/auth-client";
import { getTracifyRegion } from "@/lib/regions";

const LAST_PROJECT_STORAGE_KEY = "tracify.lastProjectId";

function formatDate(value: unknown) {
  if (!value) return "Not available";
  const date = value instanceof Date ? value : new Date(value as string | number);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function Field({ label, value, mono = false }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="bg-[#f3f2ed] p-4">
      <dt className="font-mono text-[10px] uppercase tracking-widest text-black/55">{label}</dt>
      <dd className={`mt-2 break-all text-sm text-black ${mono ? "font-mono" : "font-sans"}`}>{value}</dd>
    </div>
  );
}

/**
 * Account area. Available with or without a project: identity comes from the
 * auth session, organization context from the active organization, and the
 * project list from Convex once the Convex session is authenticated.
 */
export default function AccountPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const { data: organization } = authClient.useActiveOrganization();
  const auth = useConvexAuthReadiness();
  const projects = useQuery(
    api.projects.getProjectsByUserOrOrg,
    auth.isAuthenticated ? {} : "skip",
  );
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const region = getTracifyRegion();
  const user = session?.user;

  useEffect(() => {
    if (!isPending && !session) {
      router.replace(`/sign-in?redirect_url=${encodeURIComponent("/dashboard/account")}`);
    }
  }, [isPending, session, router]);

  async function handleSignOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    setSignOutError("");
    try {
      await authClient.signOut({ fetchOptions: { onSuccess: () => router.push("/") } });
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : "Sign out failed. Try again.");
      setIsSigningOut(false);
    }
  }

  function rememberProject(projectId: string) {
    try {
      window.localStorage.setItem(LAST_PROJECT_STORAGE_KEY, projectId);
    } catch {
      // Storage unavailable; navigation still works.
    }
  }

  const initials = (user?.name?.charAt(0) || user?.email?.charAt(0) || "U").toUpperCase();
  const emailVerified = (user as { emailVerified?: boolean } | undefined)?.emailVerified;

  return (
    <div className="flex flex-col gap-6" data-glass-grid-page="account">
      <DashboardTopbar title="Manage Account" description="Account identity, organization context, and session controls." />
      <div className="grid gap-6 px-4 pb-10 lg:px-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <section aria-labelledby="account-heading" className="border border-black/15 bg-white">
            <div className="flex items-center gap-4 border-b border-black/15 p-5">
              <div
                aria-hidden="true"
                className="flex size-11 shrink-0 items-center justify-center border border-black/15 bg-[#f3f2ed] font-mono text-sm text-black"
              >
                {isPending ? <UserRound className="size-5" /> : initials}
              </div>
              <div className="min-w-0">
                <h1 id="account-heading" className="font-mono text-xl text-black">Account</h1>
                <p className="mt-1 font-sans text-sm text-black/55">
                  This account area is available with or without a project.
                </p>
              </div>
            </div>
            {isPending ? (
              <p className="p-5 font-mono text-sm text-black/55" aria-busy="true">Loading account…</p>
            ) : (
              <dl className="grid gap-px bg-black/10 sm:grid-cols-2">
                <Field label="Name" value={user?.name || "Not set"} />
                <Field label="Email" value={user?.email || "Not available"} />
                <Field
                  label="Email status"
                  mono
                  value={emailVerified === undefined ? "Unknown" : emailVerified ? "Verified" : "Unverified"}
                />
                <Field label="Member since" mono value={formatDate((user as { createdAt?: unknown } | undefined)?.createdAt)} />
              </dl>
            )}
          </section>

          <section aria-labelledby="account-projects-heading" className="border border-black/15 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-black/15 p-5">
              <div>
                <h2 id="account-projects-heading" className="font-mono text-lg text-black">Projects</h2>
                <p className="mt-1 font-sans text-sm text-black/55">Projects you can open in this organization.</p>
              </div>
              <Link
                href="/onboarding/project"
                className="inline-flex h-9 shrink-0 items-center border border-black px-3 font-mono text-[10px] uppercase tracking-widest text-black hover:bg-black hover:text-white"
              >
                New project
              </Link>
            </div>
            {auth.status === "error" ? (
              <p className="p-5 font-mono text-sm text-red-600">Workspace access could not be verified. Reload to retry.</p>
            ) : projects === undefined ? (
              <p className="p-5 font-mono text-sm text-black/55" aria-busy="true">Loading projects…</p>
            ) : projects.length === 0 ? (
              <p className="p-5 font-sans text-sm text-black/55">No projects yet. Create one to start capturing agent traces.</p>
            ) : (
              <ul className="divide-y divide-black/10">
                {projects.map((project) => (
                  <li key={project._id}>
                    <Link
                      href={`/dashboard/${project._id}`}
                      onClick={() => rememberProject(project._id)}
                      className="flex items-center justify-between gap-3 px-5 py-3 font-mono text-sm text-black hover:bg-[#f3f2ed]"
                    >
                      <span className="truncate">{project.name}</span>
                      <ArrowUpRight className="size-3.5 shrink-0 text-black/55" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <NotificationPreferences />
        </div>

        <aside className="flex min-w-0 flex-col gap-6" aria-label="Workspace and session">
          <section className="border border-black/15 bg-white p-5">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-black/55">
              <Building2 className="size-3.5" aria-hidden="true" /> Organization
            </div>
            <p className="mt-3 font-mono text-sm text-black">{organization?.name || "Personal workspace"}</p>
            {organization?.slug ? <p className="mt-1 font-mono text-[11px] text-black/55">{organization.slug}</p> : null}
          </section>

          <section className="border border-black/15 bg-white p-5">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-black/55">
              <Globe2 className="size-3.5" aria-hidden="true" /> Data region
            </div>
            <p className="mt-3 font-mono text-sm text-black">
              <span aria-hidden="true">{region.flag}</span> {region.name} · {region.location}
            </p>
            <p className="mt-1 font-mono text-[11px] text-black/55">{region.hostname}</p>
            <Link
              href={`/cloud/region?next=${encodeURIComponent("/dashboard/account")}`}
              className="mt-4 inline-flex h-8 items-center border border-black/25 px-3 font-mono text-[10px] uppercase tracking-widest text-black/70 hover:border-black hover:text-black"
            >
              Switch regional cloud
            </Link>
          </section>

          <section className="border border-black/15 bg-white p-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-black/55">Session</div>
            <p className="mt-3 font-sans text-sm text-black/55">Sign out of Tracify on this device.</p>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              disabled={isSigningOut || isPending}
              className="mt-4 inline-flex h-9 items-center gap-2 border border-black px-4 font-mono text-[10px] uppercase tracking-widest text-black hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut className="size-3.5" aria-hidden="true" /> {isSigningOut ? "Signing out…" : "Sign out"}
            </button>
            {signOutError ? <p role="alert" className="mt-3 font-mono text-xs text-red-600">{signOutError}</p> : null}
          </section>
        </aside>
      </div>
    </div>
  );
}
