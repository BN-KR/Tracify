import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function key(identity: { tokenIdentifier: string }) { return identity.tokenIdentifier; }
export const get = query({ args: {}, handler: async (ctx) => { const identity = await ctx.auth.getUserIdentity(); if (!identity) return null; return ctx.db.query("notificationPreferences").withIndex("by_userKey", (q) => q.eq("userKey", key(identity))).unique(); } });
export const set = mutation({ args: { operational: v.boolean(), product: v.boolean() }, handler: async (ctx, args) => { const identity = await ctx.auth.getUserIdentity(); if (!identity) throw new Error("Authentication required"); const existing = await ctx.db.query("notificationPreferences").withIndex("by_userKey", (q) => q.eq("userKey", key(identity))).unique(); const value = { userKey: key(identity), operational: args.operational, product: args.product, updatedAt: Date.now() }; if (existing) await ctx.db.patch(existing._id, value); else await ctx.db.insert("notificationPreferences", value); } });
