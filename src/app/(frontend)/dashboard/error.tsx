"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Dashboard route error", error);
  }, [error]);

  return (
    <div className="mx-6 my-10 border border-red-400/30 bg-red-400/5 p-8" role="alert">
      <p className="font-mono text-xs uppercase tracking-widest text-red-200">Dashboard unavailable</p>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-black/60">The workspace could not load this view. Retry the request or return to the project overview.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => reset()} className="border border-red-300/50 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-red-100 hover:border-black hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black">Retry</button>
        <Link href="/dashboard" className="border border-black/25 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-black/70 hover:border-black hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black">Project selector</Link>
      </div>
    </div>
  );
}
