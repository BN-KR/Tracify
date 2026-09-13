"use client";

import { useMemo } from "react";
import Link from "next/link";
import { generateDemoTraces } from "@/lib/demo/demo-data";
import { ExploreClient } from "@/components/dashboard/explore/explore-client";

export function DemoExploreClient() {
  // Generated once per mount; the generator itself is seeded/deterministic.
  const traces = useMemo(() => generateDemoTraces(120), []);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-neutral-800 px-4 py-2 flex items-center justify-between text-xs font-mono">
        <span className="text-neutral-400">
          Tracify · <span className="text-white">Demo mode</span> — seeded fixture data, no sign-in required
        </span>
        <Link href="/dashboard" className="border border-neutral-700 px-2 py-1 hover:border-white">
          Go to your dashboard →
        </Link>
      </div>
      <ExploreClient traces={traces} projectLabel="Demo project" isDemo />
    </div>
  );
}
