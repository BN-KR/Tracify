import type { ConvexAuthReadiness } from "@/hooks/use-convex-auth-readiness";

export type AuthCallbackAction = "continue" | "sign-in" | "wait";

export function getAuthCallbackAction({
  sessionPending,
  hasSession,
  convexStatus,
}: {
  sessionPending: boolean;
  hasSession: boolean;
  convexStatus: ConvexAuthReadiness["status"];
}): AuthCallbackAction {
  if (sessionPending) return "wait";
  if (!hasSession) return "sign-in";
  return convexStatus === "authenticated" ? "continue" : "wait";
}
