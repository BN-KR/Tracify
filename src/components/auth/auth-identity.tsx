"use client";

import { createContext, useContext, type ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import { initialIdentity } from "@/lib/project-gate-state";

const AuthIdentityContext = createContext<string | null>(null);

export function AuthIdentityProvider({ children, initialToken }: { children: ReactNode; initialToken?: string | null }) {
  const { data, isPending } = authClient.useSession();
  const identity = data?.user ? `${data.user.id}:${data.session.activeOrganizationId ?? ""}` : isPending ? initialIdentity(initialToken) : null;
  return <AuthIdentityContext.Provider key={identity ?? "signed-out"} value={identity}>{children}</AuthIdentityContext.Provider>;
}

export function useAuthIdentity() { return useContext(AuthIdentityContext); }
