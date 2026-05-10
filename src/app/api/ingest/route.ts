import { type NextRequest } from "next/server";
import { inngest } from "@/lib/inngest";
import { getConvexClient } from "@/lib/convex";
import { api } from "../../../../convex/_generated/api";
import { randomUUID } from "crypto";

/**
 * POST /api/ingest
 *
 * SDK endpoint for receiving spans. Authentication via Bearer API key.
 * API key is validated against the Convex projects table.
 *
 * Body:
 * {
 *   runId: string;
 *   spanType: 'llm_call' | 'tool_call' | 'decision' | 'error';
 *   input: string;     // JSON string
 *   output: string;    // JSON string
 *   latencyMs: number;
 *   costUsd: number;
 *   modelId: string;
 *   toolName: string;
 * }
 */
export async function POST(request: NextRequest) {
  // ── 1. Extract and validate API key ───────────────────────────────────
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json({ error: "Missing Bearer token" }, { status: 401 });
  }

  const apiKey = authHeader.slice(7).trim();
  if (!apiKey.startsWith("5t1r_")) {
    return Response.json({ error: "Invalid API key format" }, { status: 401 });
  }

  // ── 2. Look up project in Convex ──────────────────────────────────────
  const convex = getConvexClient();
  const project = await convex.query(api.projects.getByApiKey, { apiKey });
  if (!project) {
    return Response.json({ error: "Invalid API key" }, { status: 401 });
  }

  // ── 3. Parse and validate body ────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { runId, spanType, input, output, latencyMs, costUsd, modelId, toolName } = body;

  if (
    typeof runId !== "string" ||
    typeof spanType !== "string" ||
    !["llm_call", "tool_call", "decision", "error"].includes(spanType) ||
    typeof input !== "string" ||
    typeof output !== "string" ||
    typeof latencyMs !== "number" ||
    typeof costUsd !== "number"
  ) {
    return Response.json({ error: "Invalid span payload" }, { status: 400 });
  }

  const spanId = randomUUID();
  const createdAt = new Date().toISOString();

  // ── 4. Fire Inngest event (non-blocking) ──────────────────────────────
  await inngest.send({
    name: "span/ingested",
    data: {
      spanId,
      runId: runId as string,
      projectId: project.apiKey, // logical project ID for Tinybird scoping
      projectDocId: project._id,
      spanType: spanType as "llm_call" | "tool_call" | "decision" | "error",
      input: input as string,
      output: output as string,
      latencyMs: latencyMs as number,
      costUsd: costUsd as number,
      modelId: (modelId as string) ?? "",
      toolName: (toolName as string) ?? "",
      createdAt,
    },
  });

  return Response.json({ ok: true, spanId }, { status: 202 });
}
