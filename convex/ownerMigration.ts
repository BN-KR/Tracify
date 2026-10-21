import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";

const BATCH = 100;

/** Copies the legacy clerkUserId onto ownerId. Re-schedules itself until every project is done. */
export const backfillOwnerId = internalMutation({
  args: { cursor: v.optional(v.union(v.string(), v.null())) },
  handler: async (ctx, args): Promise<null> => {
    const page = await ctx.db
      .query("projects")
      .paginate({ cursor: args.cursor ?? null, numItems: BATCH });
    for (const project of page.page) {
      if (project.ownerId === undefined && project.clerkUserId !== undefined) {
        await ctx.db.patch(project._id, { ownerId: project.clerkUserId });
      }
    }
    if (!page.isDone) {
      await ctx.scheduler.runAfter(0, internal.ownerMigration.backfillOwnerId, { cursor: page.continueCursor });
    }
    return null;
  },
});
