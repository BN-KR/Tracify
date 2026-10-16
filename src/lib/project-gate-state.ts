export type GateAuth = "loading" | "authenticated" | "unauthenticated" | "error";
export type ProjectGateMemory = { projectId: string; identity: string } | null;
export type ProjectGateRoute = { status: "ready" | "unauthenticated" | "no_projects" | "not_found"; projectId: string | null } | undefined;

/** This claim only scopes retained UI; Convex still verifies access before anything is remembered. */
export function initialIdentity(token?: string | null): string | null {
  if (!token) return null;
  try {
    const claim = JSON.parse(atob(token.split(".")[1]!.replace(/-/g, "+").replace(/_/g, "/"))) as { sub?: unknown; orgId?: string; org_id?: string };
    return typeof claim.sub === "string" ? `${claim.sub}:${claim.orgId ?? claim.org_id ?? ""}` : null;
  } catch { return null; }
}

export function projectGateState(previous: ProjectGateMemory, input: { projectId: string; identity: string | null; auth: GateAuth; route: ProjectGateRoute }) {
  const { projectId, identity, auth, route } = input;
  if (!identity || auth === "error" || auth === "unauthenticated" || route && (route.status !== "ready" || route.projectId !== projectId)) return { memory: null, show: false };
  if (auth === "authenticated" && route?.status === "ready" && route.projectId === projectId) {
    const memory = previous?.projectId === projectId && previous.identity === identity ? previous : { projectId, identity };
    return { memory, show: true };
  }
  const matching = previous?.projectId === projectId && previous.identity === identity;
  return { memory: matching ? previous : null, show: Boolean(matching && (auth === "loading" || auth === "authenticated" && route === undefined)) };
}
