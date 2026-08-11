import { NextRequest, NextResponse } from "next/server";
import { api } from "convex/_generated/api";
import { getConvexClient } from "@/lib/convex";

/** Invoke from a daily scheduler with x-retention-secret. */
export async function POST(request: NextRequest) {
  const configured = process.env.TRACIFY_RETENTION_SECRET;
  const provided = request.headers.get("x-retention-secret") ?? request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!configured || !provided || provided !== configured) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const convex = getConvexClient();
  const projects = await convex.query(api.retention.listProjectsForRetention, { jobSecret: provided });
  const now = Date.now();
  const results = [];
  for (const project of projects) {
    const olderThan = now - project.retentionDays * 24 * 60 * 60 * 1000;
    results.push(await convex.mutation(api.retention.purgeProjectData, {
      projectId: project.projectId,
      olderThan,
      jobSecret: provided,
    }));
  }
  return NextResponse.json({ ok: true, projects: projects.length, deleted: results.reduce((sum, result) => sum + result.deleted, 0), hasMore: results.some((result) => result.hasMore) });
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "retention" });
}
