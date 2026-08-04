import { type NextRequest } from "next/server";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

import { getConvexClient } from "@/lib/convex";
import { inngest } from "@/lib/inngest";
import { hashApiKey } from "@/lib/api-keys";

const MAX_BODY_BYTES = 1024 * 1024;

type SpanPayload = {
  spanId: string;
  runId: string;
  spanType: string;
  createdAt: string;
  latencyMs: number;
  input?: unknown;
  output?: unknown;
  costUsd?: number;
  modelId?: string;
  toolName?: string;
  metadata?: Record<string, unknown>;
  parentSpanId?: string;
  sessionId?: string;
  endUserId?: string;
  environment?: string;
  release?: string;
  tags?: string[];
  traceName?: string;
};

function jsonString(value: unknown) {
  if (value === undefined || value === null) return "";
  return typeof value === "string" ? value : JSON.stringify(value);
}

function isIsoString(value: string) {
  return !Number.isNaN(Date.parse(value));
}

function validatePayload(body: Record<string, unknown>):
  | { ok: true; payload: SpanPayload }
  | { ok: false; error: string } {
  const hasInputOrOutput = body.input !== undefined || body.output !== undefined;

  if (typeof body.spanId !== "string") {
    return { ok: false, error: "spanId must be a string" };
  }
  if (typeof body.runId !== "string") {
    return { ok: false, error: "runId must be a string" };
  }
  if (typeof body.spanType !== "string") {
    return { ok: false, error: "spanType must be a string" };
  }
  if (typeof body.createdAt !== "string" || !isIsoString(body.createdAt)) {
    return { ok: false, error: "createdAt must be an ISO string" };
  }
  if (typeof body.latencyMs !== "number" || body.latencyMs < 0) {
    return { ok: false, error: "latencyMs must be a non-negative number" };
  }
  if (!hasInputOrOutput) {
    return { ok: false, error: "input or output is required" };
  }

  if (body.costUsd !== undefined && typeof body.costUsd !== "number") {
    return { ok: false, error: "costUsd must be a number" };
  }
  if (body.modelId !== undefined && typeof body.modelId !== "string") {
    return { ok: false, error: "modelId must be a string" };
  }
  if (body.toolName !== undefined && typeof body.toolName !== "string") {
    return { ok: false, error: "toolName must be a string" };
  }
  if (body.parentSpanId !== undefined && typeof body.parentSpanId !== "string") {
    return { ok: false, error: "parentSpanId must be a string" };
  }
  for (const key of ["sessionId", "endUserId", "environment", "release", "traceName"] as const) {
    if (body[key] !== undefined && typeof body[key] !== "string") {
      return { ok: false, error: `${key} must be a string` };
    }
  }
  if (body.tags !== undefined && (!Array.isArray(body.tags) || body.tags.some((tag) => typeof tag !== "string"))) {
    return { ok: false, error: "tags must be an array of strings" };
  }
  if (
    body.metadata !== undefined &&
    (typeof body.metadata !== "object" || body.metadata === null || Array.isArray(body.metadata))
  ) {
    return { ok: false, error: "metadata must be an object" };
  }

  return { ok: true, payload: body as SpanPayload };
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return Response.json({ error: "Payload too large" }, { status: 413 });
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json({ error: "Invalid API key" }, { status: 401 });
  }

  const apiKey = authHeader.slice(7).trim();
  if (!apiKey.startsWith("tracify_sk_live_")) {
    return Response.json({ error: "Invalid API key" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return Response.json({ error: "Payload too large" }, { status: 413 });
    }
    body = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 422 });
  }

  const validation = validatePayload(body);
  if (!validation.ok) {
    return Response.json({ error: validation.error }, { status: 422 });
  }
  const payload = validation.payload;

  const convex = getConvexClient();
  const project = await convex.query(api.projects.getProjectByApiKey, {
    apiKeyHash: hashApiKey(apiKey),
  });

  if (!project) {
    return Response.json({ error: "Invalid API key" }, { status: 401 });
  }

  const projectDocId = project._id as Id<"projects">;
  const now = Date.now();

  await convex.mutation(api.projects.markApiKeyUsed, {
    projectId: projectDocId,
    lastUsedAt: now,
  });

  try {
    await inngest.send({
      name: "5to1r/span.received",
      data: {
        spanId: payload.spanId,
        runId: payload.runId,
        projectId: projectDocId,
        projectDocId,
        spanType: payload.spanType,
        input: jsonString(payload.input),
        output: jsonString(payload.output),
        latencyMs: payload.latencyMs,
        costUsd: payload.costUsd ?? 0,
        modelId: payload.modelId ?? "",
        toolName: payload.toolName ?? "",
        metadata: payload.metadata ?? {},
        parentSpanId: payload.parentSpanId ?? "",
        sessionId: payload.sessionId ?? "",
        endUserId: payload.endUserId ?? "",
        environment: payload.environment ?? "",
        release: payload.release ?? "",
        tags: payload.tags ?? [],
        traceName: payload.traceName ?? "",
        createdAt: payload.createdAt,
      },
    });
  } catch (err) {
    console.error("Inngest send failed (span accepted but not queued):", err);
  }

  return Response.json({ ok: true, spanId: payload.spanId }, { status: 202 });
}
