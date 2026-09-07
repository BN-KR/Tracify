"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";

export function ConvexAuthState({
  mode,
  redirectPath = "/dashboard",
}: {
  mode: "loading" | "error";
  redirectPath?: string;
}) {
  if (mode === "loading") {
    return <div className="px-6 py-6 font-mono text-sm text-black/55" role="status" aria-live="polite">Preparing secure workspace access…</div>;
  }

  return (
    <div className="mx-6 my-6 max-w-2xl border border-black bg-white p-6" role="alert">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/50">Cloud authentication did not finish</p>
      <h2 className="mt-3 font-pixel text-3xl tracking-[-0.05em]">The workspace is still waiting for Convex.</h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-black/60">Your session may be valid, but the regional data connection did not become ready. Retry once, or return to sign in with this destination preserved.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={() => window.location.reload()} className="inline-flex items-center gap-2 bg-black px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-white hover:bg-[#f4d44d] hover:text-black"><RefreshCw className="size-3.5" /> Retry connection</button>
        <Link href={`/sign-in?redirect_url=${encodeURIComponent(redirectPath)}`} className="inline-flex items-center border border-black px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-black hover:bg-[#f4d44d]">Return to sign in</Link>
      </div>
    </div>
  );
}
