import { NextRequest, NextResponse } from "next/server";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { isAuthenticated } from "@/lib/auth-server";
import { getAuthedConvexClient } from "@/lib/convex-server";
import { deleteProjectAnalytics } from "@/lib/tinybird";

/** Permanently deletes a project and all of its data. Needs the exact project name and the word DELETE. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { confirmationName?: unknown; confirmationWord?: unknown } | null;
  if (typeof body?.confirmationName !== "string" || typeof body.confirmationWord !== "string") {
    return NextResponse.json({ error: "Type the project name and the word DELETE to confirm." }, { status: 400 });
  }
  const convex = await getAuthedConvexClient();
  const id = projectId as Id<"projects">;

  // Check the confirmation and admin rights before touching any analytics data.
  let project;
  try {
    project = await convex.query(api.projectData.exportProject, { projectId: id });
  } catch {
    return NextResponse.json({ error: "Only project admins can delete a project." }, { status: 403 });
  }
  if (body.confirmationName !== project.name || body.confirmationWord !== "DELETE") {
    return NextResponse.json({ error: "The name or the word DELETE does not match." }, { status: 400 });
  }

  try {
    await deleteProjectAnalytics(projectId);
  } catch (error) {
    console.error("Project analytics deletion failed:", error);
    return NextResponse.json({ error: "Trace storage could not be cleared, so nothing was deleted. Try again in a moment." }, { status: 503 });
  }
  try {
    await convex.mutation(api.projects.deleteProject, { projectId: id, confirmationName: body.confirmationName, confirmationWord: body.confirmationWord });
  } catch (error) {
    console.error("Project deletion failed:", error);
    return NextResponse.json({ error: "The project could not be deleted. Try again." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
