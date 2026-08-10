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
import { getCostByModel, getCostByTool, getCostByUser, getDailyCosts } from "@/lib/tinybird";

type StatsCachePayload = {
  dailyCosts: Array<{ day: string; totalCostUsd: number; spanCount: number }>;
  modelCosts: Array<{
    modelId: string;
    totalCostUsd: number;
    spanCount: number;
    avgLatencyMs?: number;
  }>;
  toolCosts: Array<{
    toolName: string;
    totalCostUsd: number;
    spanCount: number;
    avgLatencyMs?: number;
  }>;
  userCosts: Array<{
    endUserId: string;
    totalCostUsd: number;
    totalTokens: number;
    spanCount: number;
    avgLatencyMs?: number;
  }>;
  unavailable?: boolean;
  meta: {
    source: string;
    cacheStatus: string;
    reason?: string | null;
    updatedAt: number | null;
    ageMs: number | null;
  };
};

const STATS_FRESH_MS = 10 * 60 * 1000;
const STALE_FALLBACK_MS = 24 * 60 * 60 * 1000;
const REDIS_STALE_TTL_SECONDS = 24 * 60 * 60;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const daysParam = req.nextUrl.searchParams.get("days");
  const refreshParam = req.nextUrl.searchParams.get("refresh");
  const refresh = refreshParam === "manual" ? "manual" : "normal";
  const parsedDays = daysParam ? parseInt(daysParam, 10) : 30;
  const days = [1, 7, 30, 90].includes(parsedDays) ? parsedDays : 30;
  const convex = await getAuthedConvexClient();
  const convexProjectId = projectId as Id<"projects">;
  const redisKey = `analytics:stats:${projectId}:${days}`;

  try {
    const project = await convex.query(api.projects.getProjectById, {
      projectId: convexProjectId,
    });
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 },
      );
    }

    const redisCache = await getJsonCache<StatsCachePayload>(redisKey);
    if (
      refresh === "normal" &&
      redisCache &&
      isFreshCache(redisCache, STATS_FRESH_MS)
    ) {
      return NextResponse.json(
        withCacheReason(redisCache, "cache_fresh", "fresh"),
      );
    }

    const reservation = await convex.mutation(api.analyticsCache.reserveStatsRefresh, {
      projectId: convexProjectId,
      rangeDays: days,
      refresh,
    });

    if (!reservation.allowed) {
      if (reservation.cache) {
        await setJsonCache(
          redisKey,
          withReason(reservation.cache, reservation.reason),
          REDIS_STALE_TTL_SECONDS,
        );
        return NextResponse.json(withReason(reservation.cache, reservation.reason));
      }
      if (redisCache) {
        return NextResponse.json(
          withCacheReason(redisCache, reservation.reason, "stale"),
        );
      }
      return NextResponse.json(withReason(reservation.cache, reservation.reason));
    }

    const [dailyCosts, modelCosts, toolCosts, userCosts] = await Promise.all([
      getDailyCosts(projectId, days),
      getCostByModel(projectId, days),
      getCostByTool(projectId, days),
      getCostByUser(projectId, days),
    ]);

    const cached = await convex.mutation(api.analyticsCache.upsertStatsCache, {
      projectId: convexProjectId,
      rangeDays: days,
      dailyCosts,
      modelCosts,
      toolCosts,
      userCosts,
      refresh,
    });

    const response = {
      ...cached,
      meta: {
        ...cached.meta,
        source: "analytics",
        cacheStatus: "fresh",
        reason: refresh === "manual" ? "manual_refresh" : "cache_miss",
      },
    };
    await setJsonCache(redisKey, response, REDIS_STALE_TTL_SECONDS);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    try {
      const cache = await convex.query(api.analyticsCache.getStatsCache, {
        projectId: convexProjectId,
        rangeDays: days,
      });
      if (cache && cache.meta.ageMs <= STALE_FALLBACK_MS) {
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
      console.error("Failed to read stats cache from Convex:", cacheError);
    }

    const redisCache = await getJsonCache<StatsCachePayload>(redisKey);
    if (redisCache) {
      return NextResponse.json(
        withCacheReason(redisCache, "tinybird_error", "stale"),
      );
    }

    return NextResponse.json({
      dailyCosts: [],
      modelCosts: [],
      toolCosts: [],
      userCosts: [],
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

function withReason(
  cache:
    | StatsCachePayload
    | null,
  reason: string | null,
) {
  if (cache) {
    return {
      ...cache,
      meta: {
        ...cache.meta,
        reason,
      },
    };
  }

  return {
    dailyCosts: [],
    modelCosts: [],
    toolCosts: [],
    userCosts: [],
    unavailable: true,
    meta: {
      source: "none",
      cacheStatus: "unavailable",
      reason,
      updatedAt: null,
      ageMs: null,
    },
  };
}
