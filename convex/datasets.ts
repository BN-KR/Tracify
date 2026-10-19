import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

const MAX_ITEMS_SHOWN = 500;
const MAX_TEXT = 20_000;

function orgId(identity: unknown) {
  const value = (identity as { orgId?: unknown; org_id?: unknown }).orgId ?? (identity as { org_id?: unknown }).org_id;
  return typeof value === "string" && value ? value : undefined;
}
function canAccess(project: Doc<"projects">, identity: { subject: string; tokenIdentifier: string }) {
  const id = orgId(identity);
  return Boolean(id && project.clerkOrgId === id) || project.clerkUserId === identity.subject;
}
function canAccessDataset(dataset: Doc<"datasets">, identity: { subject: string }) {
  return dataset.access !== "restricted" || dataset.createdBy === identity.subject || Boolean(dataset.allowedUserIds?.includes(identity.subject));
}
// Convex's generated context types are shared with the legacy dataset functions.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function requireDatasetItem(ctx: any, projectId: any, itemId: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  const project = await ctx.db.get(projectId);
  if (!project || !canAccess(project, identity)) throw new Error("Project not found or access denied");
  const item = await ctx.db.get(itemId);
  const dataset = item ? await ctx.db.get(item.datasetId) : null;
  if (!item || item.projectId !== projectId || !dataset || !canAccessDataset(dataset, identity)) throw new Error("Dataset item not found");
  return { item, dataset };
}

/** Every dataset the caller may open, with how many items it holds (counted up to 1,000) and how many experiments used it. */
export const overview = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const project = await ctx.db.get(projectId);
    if (!project || !canAccess(project, identity)) return [];
    const datasets = await ctx.db.query("datasets").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).order("desc").take(100);
    const visible = datasets.filter((dataset) => canAccessDataset(dataset, identity));
    return Promise.all(visible.map(async (dataset) => {
      const items = await ctx.db.query("datasetItems").withIndex("by_datasetId", (q) => q.eq("datasetId", dataset._id)).take(1001);
      const experiments = await ctx.db.query("experiments").withIndex("by_datasetId", (q) => q.eq("datasetId", dataset._id)).take(101);
      return { dataset, itemCount: Math.min(items.length, 1000), countCapped: items.length > 1000, withExpected: items.slice(0, 1000).filter((item) => item.expectedOutput).length, fromTraces: items.slice(0, 1000).filter((item) => item.traceId).length, experimentCount: Math.min(experiments.length, 100) };
    }));
  },
});

/** The rows of one dataset, oldest first, up to 500. */
export const items = query({
  args: { projectId: v.id("projects"), datasetId: v.id("datasets") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const project = await ctx.db.get(args.projectId);
    if (!project || !canAccess(project, identity)) return null;
    const dataset = await ctx.db.get(args.datasetId);
    if (!dataset || dataset.projectId !== args.projectId || !canAccessDataset(dataset, identity)) return null;
    const rows = await ctx.db.query("datasetItems").withIndex("by_datasetId", (q) => q.eq("datasetId", args.datasetId)).order("asc").take(MAX_ITEMS_SHOWN + 1);
    return { rows: rows.slice(0, MAX_ITEMS_SHOWN), more: rows.length > MAX_ITEMS_SHOWN };
  },
});

/** Edits one row. Every change counts as a new dataset version, so experiments can tell which rows they saw. */
export const updateItem = mutation({
  args: { projectId: v.id("projects"), itemId: v.id("datasetItems"), input: v.string(), expectedOutput: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { item, dataset } = await requireDatasetItem(ctx, args.projectId, args.itemId);
    const input = args.input.trim();
    const expectedOutput = args.expectedOutput?.trim() || undefined;
    if (!input) throw new Error("A row needs an input");
    if (input.length > MAX_TEXT || (expectedOutput?.length ?? 0) > MAX_TEXT) throw new Error("A row can hold up to 20,000 characters per column");
    if (input === item.input && expectedOutput === item.expectedOutput) return;
    await ctx.db.patch(args.itemId, { input, expectedOutput });
    await ctx.db.patch(dataset._id, { updatedAt: Date.now(), version: (dataset.version ?? 1) + 1 });
  },
});

export const deleteItem = mutation({
  args: { projectId: v.id("projects"), itemId: v.id("datasetItems") },
  handler: async (ctx, args) => {
    const { item, dataset } = await requireDatasetItem(ctx, args.projectId, args.itemId);
    await ctx.db.delete(item._id);
    await ctx.db.patch(dataset._id, { updatedAt: Date.now(), version: (dataset.version ?? 1) + 1 });
  },
});
