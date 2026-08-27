"use client";

import Link from "next/link";
import { useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { api } from "convex/_generated/api";
import type { BillingInterval, PaidPlan } from "@/lib/billing-links";

function isPaidPlan(value: string | null): value is PaidPlan {
  return value === "pro" || value === "team";
}

function isBillingInterval(value: string | null): value is BillingInterval {
  return value === "monthly" || value === "annual";
}

export default function PricingCheckoutPage() {
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const projects = useQuery(api.projects.getProjectsByUserOrOrg, isAuthenticated ? {} : "skip");
  const createProject = useMutation(api.projects.createProject);
  const plan = isPaidPlan(searchParams.get("plan")) ? searchParams.get("plan") as PaidPlan : "pro";
  const interval = isBillingInterval(searchParams.get("interval")) ? searchParams.get("interval") as BillingInterval : "monthly";
  const [projectId, setProjectId] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [projectName, setProjectName] = useState("");
  const selectedProjectId = projectId || projects?.[0]?._id || "";
  const returnPath = `/pricing/checkout?plan=${plan}&interval=${interval}`;

  async function openCheckout(targetProjectId: string) {
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ projectId: targetProjectId, plan, interval }),
    });
    const responseText = await response.text();
    let data: { url?: string; error?: string } = {};
    if (responseText.trim()) {
      try {
        data = JSON.parse(responseText) as { url?: string; error?: string };
      } catch {
        throw new Error(`Checkout failed (${response.status}). The billing service returned an invalid response.`);
      }
    }
    if (!response.ok || !data.url) throw new Error(data.error ?? "Checkout is unavailable right now.");
    window.location.assign(data.url);
  }

  async function startCheckout() {
    if (!selectedProjectId) return;
    setPending(true);
    setError("");
    try {
      await openCheckout(selectedProjectId);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Checkout is unavailable right now.");
      setPending(false);
    }
  }

  async function createProjectAndCheckout() {
    const name = projectName.trim();
    if (!name) return;
    setPending(true);
    setError("");
    try {
      const result = await createProject({ name });
      window.localStorage.setItem("tracify.lastProjectId", result.projectId);
      await openCheckout(result.projectId);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Checkout is unavailable right now.");
      setPending(false);
    }
  }

  return (
    <main className="min-h-svh bg-[#eceae3] px-5 pb-20 pt-32 text-black">
      <div className="mx-auto max-w-3xl border border-black bg-white p-6 shadow-[8px_8px_0_#000] md:p-10">
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-black/50">Secure subscription checkout</p>
        <h1 className="mt-5 font-pixel text-6xl leading-[0.88] tracking-[-0.07em] md:text-8xl">Start {plan}.</h1>
        <p className="mt-5 max-w-xl text-sm leading-6 text-black/60">
          {interval === "annual" ? "Annual billing with 20% savings." : "Flexible monthly billing."} Select the project this subscription should cover, then continue to Stripe.
        </p>

        {isLoading || (isAuthenticated && projects === undefined) ? (
          <p className="mt-10 border-t border-black/20 pt-6 font-mono text-[10px] uppercase">Loading your workspace…</p>
        ) : !isAuthenticated ? (
          <div className="mt-10 border-t border-black/20 pt-6">
            <p className="text-sm text-black/65">Sign in or create an account first. You’ll return here with your selected plan intact.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={`/sign-up?redirect_url=${encodeURIComponent(returnPath)}`} className="inline-flex min-h-11 items-center gap-6 bg-black px-4 font-mono text-[9px] uppercase tracking-[0.12em] text-white">Create account <ArrowRight className="size-3.5" /></Link>
              <Link href={`/sign-in?redirect_url=${encodeURIComponent(returnPath)}`} className="inline-flex min-h-11 items-center border border-black px-4 font-mono text-[9px] uppercase tracking-[0.12em]">Sign in</Link>
            </div>
          </div>
        ) : !projects?.length ? (
          <div className="mt-10 border-t border-black/20 pt-6">
            <p className="text-sm text-black/65">Name your first project. We’ll create it here and send you straight to Stripe—no onboarding detour.</p>
            <label htmlFor="new-checkout-project" className="mt-5 block font-mono text-[9px] uppercase tracking-[0.12em] text-black/55">Project name</label>
            <input id="new-checkout-project" value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="production-agents" className="mt-2 h-12 w-full border border-black bg-white px-3 font-mono text-sm" />
            {error ? <p role="alert" className="mt-4 border border-red-700 bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
            <button type="button" onClick={() => void createProjectAndCheckout()} disabled={pending || !projectName.trim()} className="mt-5 flex min-h-12 w-full items-center justify-between bg-black px-4 font-mono text-[9px] uppercase tracking-[0.12em] text-white disabled:opacity-50">
              {pending ? "Preparing checkout…" : "Create project and pay"}<ArrowRight className="size-3.5" />
            </button>
          </div>
        ) : (
          <div className="mt-10 border-t border-black/20 pt-6">
            <label htmlFor="checkout-project" className="font-mono text-[9px] uppercase tracking-[0.12em] text-black/55">Project</label>
            <select id="checkout-project" value={selectedProjectId} onChange={(event) => setProjectId(event.target.value)} className="mt-2 h-12 w-full border border-black bg-white px-3 font-mono text-sm">
              {projects.map((project) => <option key={project._id} value={project._id}>{project.name}</option>)}
            </select>
            {error ? <p role="alert" className="mt-4 border border-red-700 bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
            <button type="button" onClick={() => void startCheckout()} disabled={pending} className="mt-5 flex min-h-12 w-full items-center justify-between bg-black px-4 font-mono text-[9px] uppercase tracking-[0.12em] text-white disabled:opacity-50">
              {pending ? "Opening Stripe…" : "Continue to secure checkout"}<ArrowRight className="size-3.5" />
            </button>
          </div>
        )}
        <Link href="/pricing" className="mt-8 inline-block font-mono text-[9px] uppercase tracking-[0.12em] text-black/50 underline underline-offset-4">Back to pricing</Link>
      </div>
    </main>
  );
}
