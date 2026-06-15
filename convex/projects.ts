import { v } from "convex/values";
import { api } from "./_generated/api";
import { action, mutation, query } from "./_generated/server";
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
  const orgId = (identity as { orgId?: unknown; org_id?: unknown }).orgId ??
    (identity as { org_id?: unknown }).org_id;
  return typeof orgId === "string" && orgId.length > 0
    ? orgId
    : undefined;
}

function getOrgRole(identity: unknown) {
  const role = (identity as { orgRole?: unknown; org_role?: unknown }).orgRole ??
    (identity as { org_role?: unknown }).org_role;
  return typeof role === "string" ? role : undefined;
}

function isAdmin(identity: { subject: string; tokenIdentifier: string }) {
  const adminIds = (process.env.FIVETOONE_ADMIN_CLERK_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  return adminIds.includes(identity.subject);
}

function canAccessProject(
  project: Doc<"projects">,
  identity: { subject: string; tokenIdentifier: string },
) {
  const clerkOrgId = getOrgId(identity);
  if (clerkOrgId && project.clerkOrgId === clerkOrgId) return true;
  return project.clerkUserId === identity.subject;
}

function canAdminProject(
  project: Doc<"projects">,
  identity: { subject: string; tokenIdentifier: string },
) {
  if (isAdmin(identity)) return true;
  if (project.clerkUserId === identity.subject) return true;

  const clerkOrgId = getOrgId(identity);
  const orgRole = getOrgRole(identity);
  return (
    Boolean(clerkOrgId && project.clerkOrgId === clerkOrgId) &&
    (orgRole === "admin" || orgRole === "org:admin")
  );
}

function validateSlackWebhookUrl(value: string | undefined) {
  if (!value) return undefined;

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("Slack webhook must be a valid Slack webhook URL");
  }

  if (
    parsed.protocol !== "https:" ||
    parsed.hostname !== "hooks.slack.com" ||
    !parsed.pathname.startsWith("/services/")
  ) {
    throw new Error("Slack webhook must be a valid Slack webhook URL");
  }

  return value;
}

function validateProjectSettings(args: {
  name?: string;
  clientName?: string;
  reportNotes?: string;
  costThresholdUsd?: number;
  maxDurationSeconds?: number;
  maxStallMinutes?: number;
  slackWebhookUrl?: string;
}) {
  if (args.name !== undefined && args.name.trim().length === 0) {
    throw new Error("Project name is required");
  }
  if (
    args.costThresholdUsd !== undefined &&
    (!Number.isFinite(args.costThresholdUsd) || args.costThresholdUsd < 0)
  ) {
    throw new Error("Cost threshold must be a non-negative number");
  }
  if (
    args.maxDurationSeconds !== undefined &&
    (!Number.isInteger(args.maxDurationSeconds) || args.maxDurationSeconds <= 0)
  ) {
    throw new Error("Duration threshold must be a positive integer");
  }
  if (
    args.maxStallMinutes !== undefined &&
    (!Number.isInteger(args.maxStallMinutes) || args.maxStallMinutes <= 0)
  ) {
    throw new Error("Stall threshold must be a positive integer");
  }

  return {
    name: args.name?.trim(),
    clientName: args.clientName?.trim() || undefined,
    reportNotes: args.reportNotes?.trim() || undefined,
    costThresholdUsd: args.costThresholdUsd,
    maxDurationSeconds: args.maxDurationSeconds,
    maxStallMinutes: args.maxStallMinutes,
    slackWebhookUrl: validateSlackWebhookUrl(args.slackWebhookUrl),
  };
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
    clientName: project.clientName ?? null,
    reportNotes: project.reportNotes ?? null,
    apiKeyPrefix: project.apiKeyPrefix,
    apiKeyLast4: project.apiKeyLast4,
    apiKeyStatus: project.apiKeyStatus,
    apiKeyCreatedAt: project.apiKeyCreatedAt,
    apiKeyLastUsedAt: project.apiKeyLastUsedAt ?? null,
    costThresholdUsd: project.costThresholdUsd,
    maxDurationSeconds: project.maxDurationSeconds,
    maxStallMinutes: project.maxStallMinutes,
    slackWebhookUrl: project.slackWebhookUrl ?? null,
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

export const createProjectForUser = mutation({
  args: {
    clerkUserId: v.string(),
    name: v.string(),
    clerkOrgId: v.optional(v.string()),
  },
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
    if (!identity || !isAdmin(identity)) {
      throw new Error("Admin access required");
    }

    const name = args.name.trim();
    if (!name) {
      throw new Error("Project name is required");
    }

    const slug = `${slugify(name)}-${randomHex(3)}`;
    const plaintextApiKey = `${API_KEY_PREFIX}${randomHex(16)}`;
    const apiKeyHash = await hmacSha256(plaintextApiKey);
    const now = Date.now();

    const projectId = await ctx.db.insert("projects", {
      name,
      slug,
      clerkUserId: args.clerkUserId,
      clerkOrgId: args.clerkOrgId,
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

export const getProjectForAdmin = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const project = await ctx.db.get(projectId);
    if (!project || !canAccessProject(project, identity)) return null;
    if (!canAdminProject(project, identity)) return null;

    return publicProject(project);
  },
});

export const getProjectRouteState = query({
  args: { projectId: v.string() },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { status: "unauthenticated" as const, projectId: null };
    }

    const normalizedProjectId = ctx.db.normalizeId("projects", projectId);
    const existingProjects = await getProjectsForIdentity(ctx, identity);

    if (!normalizedProjectId) {
      return {
        status: existingProjects.length
          ? ("not_found" as const)
          : ("no_projects" as const),
        projectId: null,
      };
    }

    const project = await ctx.db.get(normalizedProjectId);
    if (!project || !canAccessProject(project, identity)) {
      return {
        status: existingProjects.length
          ? ("not_found" as const)
          : ("no_projects" as const),
        projectId: null,
      };
    }

    return {
      status: "ready" as const,
      projectId: project._id,
      projectName: project.name,
    };
  },
});

export const getById = query({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const project = await ctx.db.get(id);
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

export const getProjectManagementSummary = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const project = await ctx.db.get(projectId);
    if (!project || !canAccessProject(project, identity)) return null;

    const runs = await ctx.db
      .query("agentRuns")
      .withIndex("by_projectId_createdAt", (q) => q.eq("projectId", projectId))
      .order("desc")
      .take(250);

    const alerts = await ctx.db
      .query("alerts")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .take(250);

    const totalRuns = runs.length;
    const activeRuns = runs.filter((run) => run.status === "running").length;
    const failedRuns = runs.filter((run) => run.status === "failed").length;
    const completedRuns = runs.filter((run) => run.status === "completed").length;
    const totalSpans = runs.reduce((sum, run) => sum + run.spanCount, 0);
    const totalCostUsd = runs.reduce((sum, run) => sum + run.totalCostUsd, 0);
    const lastRun = runs[0] ?? null;

    return {
      project: publicProject(project),
      totals: {
        totalRuns,
        activeRuns,
        completedRuns,
        failedRuns,
        totalSpans,
        totalCostUsd,
        alertCount: alerts.length,
      },
      latestActivityAt:
        lastRun?.lastSpanAt ?? lastRun?.createdAt ?? lastRun?.startedAt ?? null,
      recentRuns: runs.slice(0, 8).map((run) => ({
        _id: run._id,
        runId: run.runId,
        status: run.status,
        spanCount: run.spanCount,
        totalCostUsd: run.totalCostUsd,
        startedAt: run.startedAt,
        lastSpanAt: run.lastSpanAt ?? null,
        primaryModel: run.primaryModel ?? null,
      })),
    };
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

export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    clientName: v.optional(v.string()),
    reportNotes: v.optional(v.string()),
    costThresholdUsd: v.optional(v.number()),
    maxDurationSeconds: v.optional(v.number()),
    maxStallMinutes: v.optional(v.number()),
    slackWebhookUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project || !canAccessProject(project, identity)) {
      throw new Error("Project not found or access denied");
    }
    if (!canAdminProject(project, identity)) {
      throw new Error("Admin access required");
    }

    const { projectId, ...rawUpdates } = args;
    const updates = validateProjectSettings(rawUpdates);
    await ctx.db.patch(projectId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteProject = mutation({
  args: {
    projectId: v.id("projects"),
    confirmationName: v.string(),
    confirmationWord: v.string(),
  },
  handler: async (ctx, { projectId, confirmationName, confirmationWord }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const project = await ctx.db.get(projectId);
    if (!project || !canAccessProject(project, identity)) {
      throw new Error("Project not found or access denied");
    }
    if (!canAdminProject(project, identity)) {
      throw new Error("Admin access required");
    }

    if (confirmationName !== project.name || confirmationWord !== "DELETE") {
      throw new Error("Project deletion confirmation did not match");
    }

    const runs = await ctx.db
      .query("agentRuns")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .take(1000);
    for (const run of runs) {
      await ctx.db.delete(run._id);
    }

    const alerts = await ctx.db
      .query("alerts")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .take(1000);
    for (const alert of alerts) {
      await ctx.db.delete(alert._id);
    }

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .take(1000);
    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    await ctx.db.delete(projectId);
  },
});

export const rotateApiKey = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args): Promise<{
    plaintextApiKey: string;
    apiKeyPrefix: string;
    apiKeyLast4: string;
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project || !canAccessProject(project, identity)) {
      throw new Error("Project not found or access denied");
    }
    if (!canAdminProject(project, identity)) {
      throw new Error("Admin access required");
    }

    const plaintextApiKey = `${API_KEY_PREFIX}${randomHex(16)}`;
    const apiKeyHash = await hmacSha256(plaintextApiKey);
    const now = Date.now();

    await ctx.db.patch(args.projectId, {
      apiKeyHash,
      apiKeyPrefix: API_KEY_PREFIX,
      apiKeyLast4: plaintextApiKey.slice(-4),
      apiKeyStatus: "active",
      apiKeyCreatedAt: now,
      apiKeyLastUsedAt: undefined,
      updatedAt: now,
    });

    return {
      plaintextApiKey,
      apiKeyPrefix: API_KEY_PREFIX,
      apiKeyLast4: plaintextApiKey.slice(-4),
    };
  },
});

export const sendTestAlert = action({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const project = await ctx.runQuery(api.projects.getProjectForAdmin, {
      projectId,
    });

    if (!project) {
      throw new Error("Project not found or access denied");
    }
    if (!project.slackWebhookUrl) {
      throw new Error("Add a Slack webhook URL before sending a test alert");
    }

    const response = await fetch(project.slackWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "tracify test alert",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*tracify test alert*",
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `Project ${project.name} is connected to this Slack channel.`,
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Slack test alert failed", {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error("Slack test alert failed");
    }

    return { ok: true };
  },
});
