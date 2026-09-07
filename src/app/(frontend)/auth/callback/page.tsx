"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { safeRelativePath } from "@/lib/navigation-context";
import { ConvexAuthState } from "@/components/auth/convex-auth-state";
import { useConvexAuthReadiness } from "@/hooks/use-convex-auth-readiness";

function safeRedirect(value: string | null) {
  return safeRelativePath(value, "/dashboard");
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();
  const convexAuth = useConvexAuthReadiness();
  const convexAuthenticated = convexAuth.isAuthenticated;
  const convexLoading = convexAuth.status === "loading";
  const redirectPath = safeRedirect(searchParams.get("redirect_url"));
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setTimedOut(true), 15_000);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!isPending && convexAuth.status === "unauthenticated") router.replace(`/sign-in?redirect_url=${encodeURIComponent(redirectPath)}`);
    if (!isPending && convexAuth.status === "authenticated" && session) router.replace(redirectPath);
  }, [convexAuth.status, convexAuthenticated, convexLoading, isPending, redirectPath, router, session]);

  return (
    <main className="flex min-h-svh items-center justify-center bg-[#eceae3] px-5 text-black">
      {timedOut || convexAuth.status === "error" ? <ConvexAuthState mode="error" redirectPath={redirectPath} /> : <p className="font-mono text-[10px] uppercase tracking-[0.14em]">Finishing sign-in…</p>}
    </main>
  );
}
