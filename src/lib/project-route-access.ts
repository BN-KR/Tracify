import { NextResponse, type NextRequest } from "next/server";
import type { Id } from "convex/_generated/dataModel";
import { api } from "convex/_generated/api";
import { accessKey, hasRecentAccess, rememberAccess } from "@/lib/access-cache";
import { isAuthenticated } from "@/lib/auth-server";
import { getAuthedConvexClient } from "@/lib/convex-server";

/**
 * Project-level access check for polled analytics routes. Returns an error response, or null when the viewer
 * may read the project. After a success the session skips the Convex round trips for a minute (access-cache).
 */
export async function denyProjectAccess(request: NextRequest, projectId: string) {
  const key = accessKey(request, "project", projectId);
  if (hasRecentAccess(key)) return null;
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const convex = await getAuthedConvexClient();
  const project = await convex.query(api.projects.getProjectById, { projectId: projectId as Id<"projects"> });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  rememberAccess(key);
  return null;
}
