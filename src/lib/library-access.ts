import { api } from "convex/_generated/api";
import { notFound, redirect } from "next/navigation";
import { fetchAuthQuery } from "@/lib/auth-server";

function values(name: string) {
  return new Set(
    (process.env[name] ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

export async function requireLibraryAccess(returnBackUrl = "/admin/library") {
  const identity = await fetchAuthQuery(api.auth.getCurrentIdentity, {});
  if (!identity) redirect(`/sign-in?redirect=${encodeURIComponent(returnBackUrl)}`);
  const userId = identity.subject;
  const orgId = typeof identity.org_id === "string" ? identity.org_id : undefined;
  const orgRole = typeof identity.org_role === "string" ? identity.org_role : undefined;

  const allowedOrganizations = values("TRACIFY_LIBRARY_ORG_IDS");
  const allowedUsers = new Set([
    ...values("TRACIFY_ADMIN_USER_IDS"),
    ...values("TRACIFY_LIBRARY_USER_IDS"),
  ]);
  const allowedEmails = values("TRACIFY_LIBRARY_ADMIN_EMAILS");
  const accessConfigured =
    allowedOrganizations.size > 0 ||
    allowedUsers.size > 0 ||
    allowedEmails.size > 0;
  const approvedOrganization = orgId ? allowedOrganizations.has(orgId) : false;
  const emailAuthorized = typeof identity.email === "string" && allowedEmails.has(identity.email.toLowerCase());
  const authorized =
    allowedUsers.has(userId) ||
    emailAuthorized ||
    (approvedOrganization && (orgRole === "owner" || orgRole === "admin"));

  if (!accessConfigured || !authorized) notFound();
}
