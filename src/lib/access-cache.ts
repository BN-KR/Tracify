import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";

/**
 * Remembers, per server instance, that a signed-in session was allowed to read a project resource.
 * Live pages poll every few seconds; without this every poll fetches a fresh Convex JWT and runs a
 * Convex access query, which trips Convex's JWKS rate limit (429). The key includes a hash of the
 * session cookie, so one viewer's access is never reused for another. A revoked session keeps read
 * access for at most ACCESS_TTL_MS.
 */
const ACCESS_TTL_MS = 60_000;
const MAX_ENTRIES = 5_000;
const granted = new Map<string, number>();

function sessionCookie(request: NextRequest) {
  return request.cookies.getAll().find((cookie) => cookie.name.endsWith("session_token"))?.value ?? null;
}

/** Null when the request has no session cookie; such requests are never cached. */
export function accessKey(request: NextRequest, ...scope: string[]) {
  const session = sessionCookie(request);
  if (!session) return null;
  return createHash("sha256").update([session, ...scope].join("\u0000")).digest("hex");
}

export function hasRecentAccess(key: string | null) {
  if (!key) return false;
  const until = granted.get(key);
  if (until === undefined) return false;
  if (until < Date.now()) {
    granted.delete(key);
    return false;
  }
  return true;
}

export function rememberAccess(key: string | null) {
  if (!key) return;
  if (granted.size >= MAX_ENTRIES) {
    const now = Date.now();
    for (const [entry, until] of granted) if (until < now) granted.delete(entry);
    if (granted.size >= MAX_ENTRIES) granted.delete(granted.keys().next().value!);
  }
  granted.set(key, Date.now() + ACCESS_TTL_MS);
}
