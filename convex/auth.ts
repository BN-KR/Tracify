import { query } from "./_generated/server";

export const getCurrentIdentity = query({
  args: {},
  handler: async (ctx) => await ctx.auth.getUserIdentity(),
});
