"use client";

import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";

export const CONVEX_AUTH_TIMEOUT_MS = 10_000;

export type ConvexAuthReadiness = {
  status: "loading" | "authenticated" | "unauthenticated" | "error";
  isAuthenticated: boolean;
  isLoading: boolean;
  timedOut: boolean;
};

export function useConvexAuthReadiness(): ConvexAuthReadiness {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading || timedOut) return;
    const timeout = window.setTimeout(() => setTimedOut(true), CONVEX_AUTH_TIMEOUT_MS);
    return () => window.clearTimeout(timeout);
  }, [isLoading, timedOut]);

  const status = timedOut
    ? "error"
    : isLoading
      ? "loading"
      : isAuthenticated
        ? "authenticated"
        : "unauthenticated";

  return { status, isAuthenticated, isLoading, timedOut };
}
