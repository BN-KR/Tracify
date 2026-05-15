import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";

const API_KEY_PREFIX = "5t1r_sk_live_";

function getHmacSecret() {
  const secret = process.env.FIVETOONE_API_KEY_HASH_SECRET;
  if (!secret) {
    throw new Error(
      "FIVETOONE_API_KEY_HASH_SECRET is not set. Set it in Convex before creating API keys.",
    );
  }
  return secret;
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacSha256(value: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getHmacSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toHex(signature);
}

function randomHex(bytes = 16) {
  const values = new Uint8Array(bytes);
  crypto.getRandomValues(values);
  return toHex(values.buffer);
}

function slugify(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return slug || "project";
}

function getOrgId(identity: unknown) {
  const orgId = (identity as { orgId?: unknown }).orgId;
  return typeof orgId === "string" && orgId.length > 0
    ? orgId
    : undefined;
}

function canAccessProject(
  project: Doc<"projects">,
  identity: { subject: string; tokenIdentifier: string },
) {
  const clerkOrgId = getOrgId(identity);
  if (clerkOrgId && project.clerkOrgId === clerkOrgId) return true;
  return project.clerkUserId === identity.subject;
}

function publicProject(project: Doc<"projects">) {
  return {
    _id: project._id,
    name: project.name,
    slug: project.slug,
    clerkUserId: project.clerkUserId,
    clerkOrgId: project.clerkOrgId ?? null,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    planTier: project.planTier,
    apiKeyPrefix: project.apiKeyPrefix,
    apiKeyLast4: project.apiKeyLast4,
    apiKeyStatus: project.apiKeyStatus,
    apiKeyCreatedAt: project.apiKeyCreatedAt,
    apiKeyLastUsedAt: project.apiKeyLastUsedAt ?? null,
    costThresholdUsd: project.costThresholdUsd,
    maxDurationSeconds: project.maxDurationSeconds,
    maxStallMinutes: project.maxStallMinutes,
  };
}

export const createProject = mutation({
  args: { name: v.string() },
  handler: async (ctx, args): Promise<{
    projectId: Id<"projects">;
    name: string;
    slug: string;
    plaintextApiKey: string;
    apiKey: string;
    apiKeyPrefix: string;
    apiKeyLast4: string;
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const name = args.name.trim();
    if (!name) {
      throw new Error("Project name is required");
    }

    const clerkOrgId = getOrgId(identity);
    const slug = `${slugify(name)}-${randomHex(3)}`;
    const plaintextApiKey = `${API_KEY_PREFIX}${randomHex(16)}`;
    const apiKeyHash = await hmacSha256(plaintextApiKey);
    const now = Date.now();

    const projectId = await ctx.db.insert("projects", {
      name,
      slug,
      clerkUserId: identity.subject,
      clerkOrgId,
      createdAt: now,
      updatedAt: now,
      planTier: "free",
      apiKeyPrefix: API_KEY_PREFIX,
      apiKeyLast4: plaintextApiKey.slice(-4),
      apiKeyHash,
      apiKeyStatus: "active",
      apiKeyCreatedAt: now,
      costThresholdUsd: 1,
      maxDurationSeconds: 300,
      maxStallMinutes: 5,
    });

    return {
      projectId,
      name,
      slug,
      plaintextApiKey,
      apiKey: plaintextApiKey,
      apiKeyPrefix: API_KEY_PREFIX,
      apiKeyLast4: plaintextApiKey.slice(-4),
    };
  },
});

export const getProjectByApiKey = query({
  args: { apiKeyHash: v.string() },
  handler: async (ctx, { apiKeyHash }) => {
    const project = await ctx.db
      .query("projects")
      .withIndex("by_apiKeyHash", (q) => q.eq("apiKeyHash", apiKeyHash))
      .unique();

    if (!project || project.apiKeyStatus !== "active") {
      return null;
    }

    return {
      _id: project._id,
      name: project.name,
      apiKeyPrefix: project.apiKeyPrefix,
      apiKeyLast4: project.apiKeyLast4,
    };
  },
});

export const markApiKeyUsed = mutation({
  args: { projectId: v.id("projects"), lastUsedAt: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.projectId, {
      apiKeyLastUsedAt: args.lastUsedAt,
      updatedAt: args.lastUsedAt,
    });
    return null;
  },
});

export const getProjectsByUserOrOrg = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const clerkOrgId = getOrgId(identity);
    const projects = clerkOrgId
      ? await ctx.db
          .query("projects")
          .withIndex("by_clerkOrgId", (q) => q.eq("clerkOrgId", clerkOrgId))
          .order("desc")
          .take(50)
      : await ctx.db
          .query("projects")
          .withIndex("by_clerkUserId", (q) =>
            q.eq("clerkUserId", identity.subject),
          )
          .order("desc")
          .take(50);

    return projects.map(publicProject);
  },
});

export const getProjectById = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const project = await ctx.db.get(projectId);
    if (!project || !canAccessProject(project, identity)) return null;

    return publicProject(project);
  },
});

export const getProjectOnboardingState = query({
  args: { projectId: v.optional(v.id("projects")) },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const project = projectId
      ? await ctx.db.get(projectId)
      : (await getProjectsForIdentity(ctx, identity))[0];

    if (!project || !canAccessProject(project, identity)) {
      return {
        hasProject: false,
        projectId: null,
        projectName: null,
        apiKeyCopied: false,
        hasReceivedFirstSpan: false,
      };
    }

    return {
      hasProject: true,
      projectId: project._id,
      projectName: project.name,
      apiKeyCopied: false,
      hasReceivedFirstSpan: false,
    };
  },
});

export const getProjectsByOrg = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const projects = await getProjectsForIdentity(ctx, identity);
    return projects.map(publicProject);
  },
});

export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const project = await ctx.db.get(args.projectId);
    if (!project || !canAccessProject(project, identity)) return null;

    return publicProject(project);
  },
});

export const listByOrg = query({
  args: { clerkOrgId: v.string() },
  handler: async (ctx, { clerkOrgId }) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_clerkOrgId", (q) => q.eq("clerkOrgId", clerkOrgId))
      .order("desc")
      .take(50);

    return projects.map(publicProject);
  },
});

async function getProjectsForIdentity(
  ctx: QueryCtx,
  identity: { subject: string; tokenIdentifier: string },
) {
  const clerkOrgId = getOrgId(identity);
  return clerkOrgId
    ? await ctx.db
        .query("projects")
        .withIndex("by_clerkOrgId", (q) => q.eq("clerkOrgId", clerkOrgId))
        .order("desc")
        .take(50)
    : await ctx.db
        .query("projects")
        .withIndex("by_clerkUserId", (q) =>
          q.eq("clerkUserId", identity.subject),
        )
        .order("desc")
        .take(50);
}
