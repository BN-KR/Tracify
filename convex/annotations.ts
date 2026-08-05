import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

function orgId(identity: unknown) {
  const value = (identity as { orgId?: unknown; org_id?: unknown }).orgId ?? (identity as { org_id?: unknown }).org_id;
  return typeof value === "string" && value ? value : undefined;
}
function canAccess(project: Doc<"projects">, identity: { subject: string; tokenIdentifier: string }) {
  const id = orgId(identity);
  return Boolean(id && project.clerkOrgId === id) || project.clerkUserId === identity.subject;
}
// Convex's generated context types are shared with the legacy annotation functions.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function requireProject(ctx: any, projectId: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  const project = await ctx.db.get(projectId);
  if (!project || !canAccess(project, identity)) throw new Error("Project not found or access denied");
  return { identity };
}

export const list = query({
  args: { projectId: v.id("projects"), status: v.optional(v.union(v.literal("queued"), v.literal("in_review"), v.literal("completed"))) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const project = await ctx.db.get(args.projectId);
    if (!project || !canAccess(project, identity)) return [];
    if (args.status) {
      const status = args.status;
      return ctx.db.query("annotations").withIndex("by_projectId_and_status", (q) => q.eq("projectId", args.projectId).eq("status", status)).order("desc").take(200);
    }
    return ctx.db.query("annotations").withIndex("by_projectId", (q) => q.eq("projectId", args.projectId)).order("desc").take(200);
  },
});

export const create = mutation({
  args: { projectId: v.id("projects"), traceId: v.string(), spanId: v.optional(v.string()), label: v.optional(v.string()), labels: v.optional(v.array(v.string())), notes: v.optional(v.string()), confidence: v.optional(v.number()), agreementGroupId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { identity } = await requireProject(ctx, args.projectId);
    if (!args.traceId.trim()) throw new Error("Trace ID is required");
    if (args.confidence !== undefined && (args.confidence < 0 || args.confidence > 1)) throw new Error("Confidence must be between 0 and 1");
    return ctx.db.insert("annotations", { projectId: args.projectId, traceId: args.traceId.trim(), spanId: args.spanId?.trim() || undefined, status: "queued", label: args.label?.trim() || undefined, labels: args.labels, notes: args.notes?.trim() || undefined, confidence: args.confidence, agreementGroupId: args.agreementGroupId?.trim() || undefined, createdBy: identity.subject, createdAt: Date.now() });
  },
});

export const update = mutation({
  args: { projectId: v.id("projects"), annotationId: v.id("annotations"), status: v.union(v.literal("queued"), v.literal("in_review"), v.literal("completed")), label: v.optional(v.string()), labels: v.optional(v.array(v.string())), notes: v.optional(v.string()), confidence: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireProject(ctx, args.projectId);
    const annotation = await ctx.db.get(args.annotationId);
    if (!annotation || annotation.projectId !== args.projectId) throw new Error("Annotation not found");
    if (args.confidence !== undefined && (args.confidence < 0 || args.confidence > 1)) throw new Error("Confidence must be between 0 and 1");
    await ctx.db.patch(args.annotationId, { status: args.status, label: args.label?.trim() || annotation.label, labels: args.labels ?? annotation.labels, notes: args.notes?.trim() || annotation.notes, confidence: args.confidence ?? annotation.confidence, completedAt: args.status === "completed" ? Date.now() : undefined });
  },
});

export const assign = mutation({
  args: { projectId: v.id("projects"), annotationId: v.id("annotations"), assignee: v.string(), method: v.union(v.literal("manual"), v.literal("round_robin"), v.literal("least_loaded")) },
  handler: async (ctx, args) => {
    await requireProject(ctx, args.projectId);
    const annotation = await ctx.db.get(args.annotationId);
    if (!annotation || annotation.projectId !== args.projectId) throw new Error("Annotation not found");
    const assignee = args.assignee.trim();
    if (!assignee) throw new Error("Reviewer is required");
    await ctx.db.patch(args.annotationId, { assignee, assignedAt: Date.now(), assignmentMethod: args.method, status: annotation.status === "queued" ? "in_review" : annotation.status });
  },
});

export const assignNext = mutation({
  args: { projectId: v.id("projects"), reviewerIds: v.array(v.string()), strategy: v.union(v.literal("round_robin"), v.literal("least_loaded")) },
  handler: async (ctx, args) => {
    await requireProject(ctx, args.projectId);
    const reviewers = args.reviewerIds.map((reviewer) => reviewer.trim()).filter(Boolean);
    if (!reviewers.length) throw new Error("At least one reviewer is required");
    const next = await ctx.db.query("annotations").withIndex("by_projectId_and_status", (q) => q.eq("projectId", args.projectId).eq("status", "queued")).order("asc").first();
    if (!next) return null;
    let assignee = reviewers[next.createdAt % reviewers.length];
    if (args.strategy === "least_loaded") {
      const assigned = await ctx.db.query("annotations").withIndex("by_projectId", (q) => q.eq("projectId", args.projectId)).take(500);
      const loads = reviewers.map((reviewer) => ({ reviewer, count: assigned.filter((annotation) => annotation.assignee === reviewer && annotation.status !== "completed").length }));
      assignee = loads.sort((a, b) => a.count - b.count)[0]?.reviewer ?? assignee;
    }
    await ctx.db.patch(next._id, { assignee, assignedAt: Date.now(), assignmentMethod: args.strategy, status: "in_review" });
    return { annotationId: next._id, assignee };
  },
});

export const agreement = query({
  args: { projectId: v.id("projects"), traceId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const project = await ctx.db.get(args.projectId);
    if (!project || !canAccess(project, identity)) return null;
    const annotations = args.traceId ? await ctx.db.query("annotations").withIndex("by_projectId_and_traceId", (q) => q.eq("projectId", args.projectId).eq("traceId", args.traceId!)).take(100) : await ctx.db.query("annotations").withIndex("by_projectId", (q) => q.eq("projectId", args.projectId)).take(500);
    const completed = annotations.filter((annotation) => annotation.status === "completed" && annotation.label);
    const groups = new Map<string, typeof completed>();
    for (const annotation of completed) {
      const key = annotation.agreementGroupId || annotation.traceId;
      const group = groups.get(key) || [];
      group.push(annotation);
      groups.set(key, group);
    }
    let pairs = 0;
    let matches = 0;
    for (const group of groups.values()) for (let index = 0; index < group.length; index += 1) for (let other = index + 1; other < group.length; other += 1) { pairs += 1; if (group[index].label === group[other].label) matches += 1; }
    return { groups: groups.size, completed: completed.length, pairs, agreement: pairs ? matches / pairs : null };
  },
});

export const claim = mutation({
  args: { projectId: v.id("projects"), annotationId: v.id("annotations") },
  handler: async (ctx, args) => {
    const { identity } = await requireProject(ctx, args.projectId);
    const annotation = await ctx.db.get(args.annotationId);
    if (!annotation || annotation.projectId !== args.projectId) throw new Error("Annotation not found");
    const existing = await ctx.db.query("annotationReviews").withIndex("by_annotationId_and_reviewerId", (q) => q.eq("annotationId", args.annotationId).eq("reviewerId", identity.subject)).first();
    if (!existing) {
      await ctx.db.insert("annotationReviews", { projectId: args.projectId, annotationId: args.annotationId, reviewerId: identity.subject, reviewerName: identity.name || "Reviewer", status: "assigned", createdAt: Date.now(), updatedAt: Date.now() });
    }
    if (annotation.status === "queued") await ctx.db.patch(args.annotationId, { status: "in_review", assignee: identity.subject });
    return existing?._id;
  },
});

export const submitReview = mutation({
  args: { projectId: v.id("projects"), annotationId: v.id("annotations"), label: v.optional(v.string()), score: v.optional(v.number()), notes: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { identity } = await requireProject(ctx, args.projectId);
    const annotation = await ctx.db.get(args.annotationId);
    if (!annotation || annotation.projectId !== args.projectId) throw new Error("Annotation not found");
    if (args.score !== undefined && (args.score < 0 || args.score > 1)) throw new Error("Review score must be between 0 and 1");
    const existing = await ctx.db.query("annotationReviews").withIndex("by_annotationId_and_reviewerId", (q) => q.eq("annotationId", args.annotationId).eq("reviewerId", identity.subject)).first();
    const values = { label: args.label?.trim() || undefined, score: args.score, notes: args.notes?.trim() || undefined, status: "submitted" as const, updatedAt: Date.now() };
    if (existing) await ctx.db.patch(existing._id, values);
    else await ctx.db.insert("annotationReviews", { projectId: args.projectId, annotationId: args.annotationId, reviewerId: identity.subject, reviewerName: identity.name || "Reviewer", ...values, createdAt: Date.now() });
    await ctx.db.patch(args.annotationId, { status: "completed", completedAt: Date.now() });
  },
});

export const listReviews = query({
  args: { projectId: v.id("projects"), annotationId: v.id("annotations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const project = await ctx.db.get(args.projectId);
    const annotation = await ctx.db.get(args.annotationId);
    if (!project || !annotation || annotation.projectId !== args.projectId || !canAccess(project, identity)) return [];
    return ctx.db.query("annotationReviews").withIndex("by_annotationId", (q) => q.eq("annotationId", args.annotationId)).order("asc").take(20);
  },
});

export const listReviewsForProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const project = await ctx.db.get(args.projectId);
    if (!project || !canAccess(project, identity)) return [];
    return ctx.db.query("annotationReviews").withIndex("by_projectId", (q) => q.eq("projectId", args.projectId)).order("desc").take(300);
  },
});

export const annotationAgreement = query({
  args: { projectId: v.id("projects"), annotationId: v.id("annotations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const project = await ctx.db.get(args.projectId);
    const annotation = await ctx.db.get(args.annotationId);
    if (!project || !annotation || annotation.projectId !== args.projectId || !canAccess(project, identity)) return null;
    const reviews = await ctx.db.query("annotationReviews").withIndex("by_annotationId", (q) => q.eq("annotationId", args.annotationId)).collect();
    const submitted = reviews.filter((review) => review.status === "submitted");
    const labels = submitted.map((review) => review.label).filter((label): label is string => Boolean(label));
    const majority = labels.length ? labels.sort((a, b) => labels.filter((label) => label === b).length - labels.filter((label) => label === a).length)[0] : undefined;
    return { reviewerCount: reviews.length, submittedCount: submitted.length, agreementRate: labels.length && majority ? labels.filter((label) => label === majority).length / labels.length : null, majorityLabel: majority };
  },
});
