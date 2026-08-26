"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { authClient } from "@/lib/auth-client";

function safeRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();
  const { isAuthenticated: convexAuthenticated, isLoading: convexLoading } = useConvexAuth();
  const redirectPath = safeRedirect(searchParams.get("redirect_url"));

  useEffect(() => {
    if (!isPending && !convexLoading) router.replace(session && convexAuthenticated ? redirectPath : "/sign-in");
  }, [convexAuthenticated, convexLoading, isPending, redirectPath, router, session]);

  return (
    <main className="flex min-h-svh items-center justify-center bg-[#eceae3] px-5 text-black">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em]">Finishing sign-in…</p>
    </main>
  );
}
