import { isAuthenticated } from "@/lib/auth-server";
import { NextRequest, NextResponse } from "next/server";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { getAuthedConvexClient } from "@/lib/convex-server";
import {
  getJsonCache,
  isFreshCache,
  setJsonCache,
  withCacheReason,
} from "@/lib/redis-cache";
import { analyticsBackend, getSpansForRun, type SpanRow } from "@/lib/tinybird";

type SpansCachePayload = {
  spans: SpanRow[];
  unavailable?: boolean;
  meta: {
    source: string;
    cacheStatus: string;
    reason?: string | null;
    updatedAt: number | null;
    ageMs: number | null;
  };
};

const RUNNING_SPANS_FRESH_MS = 30 * 1000;
const TERMINAL_SPANS_FRESH_MS = 24 * 60 * 60 * 1000;
const REDIS_STALE_TTL_SECONDS = 24 * 60 * 60;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; runId: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, runId } = await params;
  const refresh = req.nextUrl.searchParams.get("refresh") === "manual"
    ? "manual"
    : "normal";
  const convex = await getAuthedConvexClient();
  const convexProjectId = projectId as Id<"projects">;
  const redisKey = `analytics:spans:${projectId}:${runId}`;

  try {
    const run = await convex.query(api.agentRuns.getByRunId, {
      projectId: convexProjectId,
      runId,
    });

    if (!run) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    const redisCache = await getJsonCache<SpansCachePayload>(redisKey);
    if (refresh === "normal" && redisCache) {
      const ttl =
        run.status === "running"
          ? RUNNING_SPANS_FRESH_MS
          : TERMINAL_SPANS_FRESH_MS;
      if (isFreshCache(redisCache, ttl)) {
        return NextResponse.json(
          withCacheReason(redisCache, "cache_fresh", "fresh"),
        );
      }

      if (run.status === "running") {
        return NextResponse.json(
          withCacheReason(redisCache, "running_manual_only", "stale"),
        );
      }
    }

    // The daily read budget protects Tinybird's free-plan request limit; self-hosted ClickHouse has none.
    const reservation = analyticsBackend() === "clickhouse" ? { allowed: true as const } : await convex.mutation(
      api.analyticsCache.reserveRunSpanRefresh,
      {
        projectId: convexProjectId,
        runId,
        runStatus: run.status,
        refresh,
      },
    );

    if (!reservation.allowed) {
      if (reservation.cache) {
        const fallback = {
          ...reservation.cache,
          meta: {
            ...reservation.cache.meta,
            reason: reservation.reason,
          },
        };
        await setJsonCache(redisKey, fallback, REDIS_STALE_TTL_SECONDS);
        return NextResponse.json(fallback);
      }

      if (redisCache) {
        return NextResponse.json(
          withCacheReason(redisCache, reservation.reason, "stale"),
        );
      }

      return NextResponse.json({
        spans: [],
        unavailable: true,
        meta: {
          source: "none",
          cacheStatus: "unavailable",
          reason: reservation.reason,
          updatedAt: null,
          ageMs: null,
        },
      });
    }

    const spans = (await getSpansForRun(runId, projectId)).map((span) => ({
      ...span,
      attachments: span.attachments ?? "[]",
      inputTokens: span.inputTokens ?? 0,
      outputTokens: span.outputTokens ?? 0,
      ttftMs: span.ttftMs ?? 0,
      retryCount: span.retryCount ?? 0,
      errorType: span.errorType ?? "",
      errorMessage: span.errorMessage ?? "",
      isStreamChunk: span.isStreamChunk ?? false,
      streamSequence: span.streamSequence ?? 0,
      streamFinal: span.streamFinal ?? true,
      payloadFormat: span.payloadFormat ?? "json",
      stackTrace: span.stackTrace ?? "",
      timedOut: span.timedOut ?? false,
      timeoutMs: span.timeoutMs ?? 0,
    }));
    // The Convex cache validates a fixed span shape; newer analytics columns (session, user, tags...)
    // are returned to the client but not stored in the cache document.
    const cached = await convex.mutation(api.analyticsCache.upsertRunSpanCache, {
      projectId: convexProjectId,
      runId,
      runStatus: run.status,
      spans: spans.map(cacheableSpan),
      refresh,
    });

    const response = {
      ...cached,
      spans,
      meta: {
        ...cached.meta,
        reason: refresh === "manual" ? "manual_refresh" : "cache_miss",
      },
    };
    await setJsonCache(redisKey, response, REDIS_STALE_TTL_SECONDS);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch spans:", error);
    try {
      const cache = await convex.query(api.analyticsCache.getRunSpanCache, {
        projectId: convexProjectId,
        runId,
      });

      if (cache) {
        const fallback = {
          ...cache,
          unavailable: true,
          meta: {
            ...cache.meta,
            cacheStatus: "stale",
            reason: "tinybird_error",
          },
        };
        await setJsonCache(redisKey, fallback, REDIS_STALE_TTL_SECONDS);
        return NextResponse.json(fallback);
      }
    } catch (cacheError) {
      console.error("Failed to read span cache from Convex:", cacheError);
    }

    const redisCache = await getJsonCache<SpansCachePayload>(redisKey);
    if (redisCache) {
      return NextResponse.json(
        withCacheReason(redisCache, "tinybird_error", "stale"),
      );
    }

    return NextResponse.json({
      spans: [],
      unavailable: true,
      meta: {
        source: "none",
        cacheStatus: "unavailable",
        reason: "tinybird_error",
        updatedAt: null,
        ageMs: null,
      },
    });
  }
}

const CACHE_FIELDS = [
  "spanId", "runId", "projectId", "spanType", "input", "output", "attachments", "latencyMs", "costUsd",
  "modelId", "toolName", "parentSpanId", "metadata", "inputTokens", "outputTokens", "ttftMs", "retryCount",
  "errorType", "errorMessage", "isStreamChunk", "streamSequence", "streamFinal", "payloadFormat",
  "stackTrace", "timedOut", "timeoutMs", "createdAt",
] as const;

function cacheableSpan<T extends object>(span: T): T {
  const source = span as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of CACHE_FIELDS) if (source[key] !== undefined) out[key] = source[key];
  // ClickHouse/Tinybird JSON can return 64-bit or Bool columns as strings or 0/1; Convex validates strictly.
  for (const key of ["latencyMs", "costUsd", "inputTokens", "outputTokens", "ttftMs", "retryCount", "streamSequence", "timeoutMs"]) {
    if (out[key] !== undefined) out[key] = Number(out[key]);
  }
  for (const key of ["isStreamChunk", "streamFinal", "timedOut"]) {
    if (out[key] !== undefined) out[key] = out[key] === true || out[key] === 1 || out[key] === "1" || out[key] === "true";
  }
  return out as T;
}
