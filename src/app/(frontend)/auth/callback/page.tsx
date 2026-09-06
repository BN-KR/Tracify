"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { safeRelativePath } from "@/lib/navigation-context";

function safeRedirect(value: string | null) {
  return safeRelativePath(value, "/dashboard");
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();
  const { isAuthenticated: convexAuthenticated, isLoading: convexLoading } = useConvexAuth();
  const redirectPath = safeRedirect(searchParams.get("redirect_url"));
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setTimedOut(true), 15_000);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!isPending && !convexLoading) router.replace(session && convexAuthenticated ? redirectPath : `/sign-in?redirect_url=${encodeURIComponent(redirectPath)}`);
  }, [convexAuthenticated, convexLoading, isPending, redirectPath, router, session]);

  return (
    <main className="flex min-h-svh items-center justify-center bg-[#eceae3] px-5 text-black">
      {timedOut ? <div className="border border-black bg-white p-6 text-center"><p className="font-mono text-[10px] uppercase tracking-[0.14em]">Sign-in is taking longer than expected.</p><button type="button" onClick={() => router.replace(`/sign-in?redirect_url=${encodeURIComponent(redirectPath)}`)} className="mt-5 bg-black px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-white">Return to sign in</button></div> : <p className="font-mono text-[10px] uppercase tracking-[0.14em]">Finishing sign-in…</p>}
    </main>
  );
}
