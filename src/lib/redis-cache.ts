import { createClient } from "redis";

type CacheMeta = {
  source?: string;
  cacheStatus?: string;
  reason?: string | null;
  updatedAt?: number | null;
  ageMs?: number | null;
};

type CachedPayload = {
  meta?: CacheMeta;
};

const DEFAULT_STALE_TTL_SECONDS = 24 * 60 * 60;

declare global {
  // eslint-disable-next-line no-var
  var __fivetooneRedisClient:
    | ReturnType<typeof createClient>
    | undefined;
  // eslint-disable-next-line no-var
  var __fivetooneRedisConnectPromise: Promise<unknown> | undefined;
}

function getRedisClient() {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  if (!globalThis.__fivetooneRedisClient) {
    const client = createClient({ url });
    client.on("error", (error) => {
      console.error("Redis cache error:", error);
    });
    globalThis.__fivetooneRedisClient = client;
  }

  return globalThis.__fivetooneRedisClient;
}

async function connectRedis() {
  const client = getRedisClient();
  if (!client) return null;

  if (!client.isOpen) {
    globalThis.__fivetooneRedisConnectPromise ??= client.connect();
    await globalThis.__fivetooneRedisConnectPromise;
  }

  return client;
}

export async function getJsonCache<T extends CachedPayload>(
  key: string,
): Promise<T | null> {
  try {
    const client = await connectRedis();
    if (!client) return null;

    const raw = await client.get(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as T;
    const updatedAt = parsed.meta?.updatedAt;
    return {
      ...parsed,
      meta: {
        ...parsed.meta,
        source: "cache",
        ageMs: typeof updatedAt === "number" ? Date.now() - updatedAt : null,
      },
    };
  } catch (error) {
    console.error("Failed to read Redis cache:", error);
    return null;
  }
}

export async function setJsonCache<T extends CachedPayload>(
  key: string,
  value: T,
  ttlSeconds = DEFAULT_STALE_TTL_SECONDS,
) {
  try {
    const client = await connectRedis();
    if (!client) return;

    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (error) {
    console.error("Failed to write Redis cache:", error);
  }
}

export function isFreshCache(
  payload: CachedPayload | null,
  ttlMs: number,
) {
  const updatedAt = payload?.meta?.updatedAt;
  return typeof updatedAt === "number" && Date.now() - updatedAt <= ttlMs;
}

export function withCacheReason<T extends CachedPayload>(
  payload: T,
  reason: string | null,
  cacheStatus: "fresh" | "stale",
): T {
  return {
    ...payload,
    meta: {
      ...payload.meta,
      source: "cache",
      cacheStatus,
      reason,
      ageMs:
        typeof payload.meta?.updatedAt === "number"
          ? Date.now() - payload.meta.updatedAt
          : null,
    },
  };
}

