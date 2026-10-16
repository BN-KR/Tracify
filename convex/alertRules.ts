import { v } from "convex/values";
import { mutation, query, internalAction, internalMutation, internalQuery } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { canAccessProject } from "./alerts";
import { describeBreach, metricAt, metricSeries } from "./alertMetrics";

const metricValidator = v.union(
  v.literal("failed_runs"),
  v.literal("cost_usd"),
  v.literal("slow_p95_seconds"),
  v.literal("minutes_without_runs"),
);

const MAX_RULES_PER_PROJECT = 25;
const MAX_RUNS_SCANNED = 2000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function requireProject(ctx: QueryCtx, projectId: Id<"projects">) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Authentication required");
  const project = await ctx.db.get(projectId);
  if (!project || !canAccessProject(project, identity)) throw new Error("Project not found");
  return { identity, project };
}

/** Newest runs first, capped so one noisy project cannot blow the read limit. */
async function recentRuns(ctx: QueryCtx, projectId: Id<"projects">, sinceMs: number) {
  const runs = await ctx.db.query("agentRuns").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).order("desc").take(MAX_RUNS_SCANNED);
  return runs.filter((run) => Date.parse(run.startedAt) >= sinceMs);
}

export const overview = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const project = await ctx.db.get(projectId);
    if (!project || !canAccessProject(project, identity)) return null;
    const now = Date.now();
    const rules = await ctx.db.query("alertRules").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).take(MAX_RULES_PER_PROJECT);
    const runs = await recentRuns(ctx, projectId, now - 2 * 24 * 60 * 60_000 - 24 * 60 * 60_000);
    const history = await ctx.db.query("alerts").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).order("desc").take(30);
    return {
      now,
      rules: rules.map((rule) => ({
        ...rule,
        value: metricAt(runs, rule.metric, rule.windowMinutes, now, rule.environment),
        series: metricSeries(runs, rule.metric, rule.windowMinutes, now, rule.environment),
      })),
      history: history.map((alert) => ({ _id: alert._id, message: alert.message, triggeredAt: alert.triggeredAt, state: alert.state ?? "active", ruleId: alert.ruleId })),
    };
  },
});

/** What a rule would have done over the last 7 days, for the new-rule preview. */
export const preview = query({
  args: { projectId: v.id("projects"), metric: metricValidator, threshold: v.number(), windowMinutes: v.number(), environment: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const project = await ctx.db.get(args.projectId);
    if (!project || !canAccessProject(project, identity)) return null;
    const now = Date.now();
    const windowMinutes = Math.min(Math.max(Math.round(args.windowMinutes), 5), 1440);
    const runs = await recentRuns(ctx, args.projectId, now - 8 * 24 * 60 * 60_000);
    const series = metricSeries(runs, args.metric, windowMinutes, now, args.environment || undefined, 70, 7 * 24 * 60);
    let fires = 0;
    let previous = false;
    for (const value of series) {
      const over = value > args.threshold;
      if (over && !previous) fires += 1;
      previous = over;
    }
    return { series, fires, truncated: runs.length >= MAX_RUNS_SCANNED };
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    metric: metricValidator,
    threshold: v.number(),
    windowMinutes: v.number(),
    environment: v.optional(v.string()),
    emailTo: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { identity } = await requireProject(ctx, args.projectId);
    const name = args.name.trim().slice(0, 80);
    if (!name) throw new Error("Give the rule a name");
    if (!Number.isFinite(args.threshold) || args.threshold < 0) throw new Error("Limit must be zero or more");
    const emailTo = [...new Set(args.emailTo.map((email) => email.trim().toLowerCase()).filter(Boolean))].slice(0, 10);
    if (emailTo.length === 0 || emailTo.some((email) => !EMAIL_PATTERN.test(email))) throw new Error("Add at least one valid email");
    const existing = await ctx.db.query("alertRules").withIndex("by_projectId", (q) => q.eq("projectId", args.projectId)).take(MAX_RULES_PER_PROJECT + 1);
    if (existing.length >= MAX_RULES_PER_PROJECT) throw new Error(`A project can have up to ${MAX_RULES_PER_PROJECT} rules`);
    const now = Date.now();
    return await ctx.db.insert("alertRules", {
      projectId: args.projectId,
      name,
      metric: args.metric,
      threshold: args.threshold,
      windowMinutes: Math.min(Math.max(Math.round(args.windowMinutes), 5), 1440),
      environment: args.environment?.trim().slice(0, 80) || undefined,
      emailTo,
      enabled: true,
      state: "ok",
      createdBy: identity.subject,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const setEnabled = mutation({
  args: { ruleId: v.id("alertRules"), enabled: v.boolean() },
  handler: async (ctx, { ruleId, enabled }) => {
    const rule = await ctx.db.get(ruleId);
    if (!rule) throw new Error("Rule not found");
    await requireProject(ctx, rule.projectId);
    await ctx.db.patch(ruleId, { enabled, ...(enabled ? {} : { state: "ok" as const }), updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { ruleId: v.id("alertRules") },
  handler: async (ctx, { ruleId }) => {
    const rule = await ctx.db.get(ruleId);
    if (!rule) return;
    await requireProject(ctx, rule.projectId);
    await ctx.db.delete(ruleId);
  },
});

export const enabledRuleIds = internalQuery({
  args: {},
  handler: async (ctx) => (await ctx.db.query("alertRules").withIndex("by_enabled", (q) => q.eq("enabled", true)).take(500)).map((rule) => rule._id),
});

/** Checks one rule. Opens an alert when it first goes over its limit and closes it when it recovers. */
export const evaluate = internalMutation({
  args: { ruleId: v.id("alertRules") },
  handler: async (ctx, { ruleId }): Promise<{ fired: true; message: string; emailTo: string[]; name: string } | { fired: false }> => {
    const rule = await ctx.db.get(ruleId);
    if (!rule || !rule.enabled) return { fired: false };
    const now = Date.now();
    const runs = await recentRuns(ctx, rule.projectId, now - rule.windowMinutes * 60_000 - 60_000);
    const value = metricAt(runs, rule.metric, rule.windowMinutes, now, rule.environment);
    const over = value > rule.threshold;
    await ctx.db.patch(ruleId, { lastValue: value, lastCheckedAt: now });
    if (over && rule.state === "ok") {
      const message = describeBreach(rule, value);
      await ctx.db.patch(ruleId, { state: "firing", lastFiredAt: now });
      await ctx.db.insert("alerts", { projectId: rule.projectId, ruleId, runId: `rule:${ruleId}:${now}`, type: rule.metric, message, triggeredAt: new Date(now).toISOString(), state: "active" });
      return { fired: true, message, emailTo: rule.emailTo, name: rule.name };
    }
    if (!over && rule.state === "firing") {
      await ctx.db.patch(ruleId, { state: "ok" });
      const open = await ctx.db.query("alerts").withIndex("by_ruleId", (q) => q.eq("ruleId", ruleId)).order("desc").take(20);
      for (const alert of open) if ((alert.state ?? "active") === "active") await ctx.db.patch(alert._id, { state: "resolved" });
    }
    return { fired: false };
  },
});

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] as string);
}

export const checkAll = internalAction({
  args: {},
  handler: async (ctx) => {
    const ids: Id<"alertRules">[] = await ctx.runQuery(internal.alertRules.enabledRuleIds, {});
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM || "Tracify <alerts@tracify.tech>";
    for (const ruleId of ids) {
      try {
        const result = await ctx.runMutation(internal.alertRules.evaluate, { ruleId });
        if (!result.fired) continue;
        if (!apiKey) { console.info("[alerts] rule fired, no RESEND_API_KEY set, email skipped", result.name); continue; }
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": `alert-${ruleId}-${Date.now()}` },
          body: JSON.stringify({
            from,
            to: result.emailTo,
            subject: `Tracify alert: ${result.name}`,
            text: `${result.message}\n\nOpen your Tracify dashboard to see what happened.`,
            html: `<p>${escapeHtml(result.message)}</p><p>Open your Tracify dashboard to see what happened.</p>`,
          }),
        });
        if (!response.ok) console.error("[alerts] email provider returned", response.status);
      } catch (error) {
        console.error("[alerts] rule check failed", ruleId, error);
      }
    }
  },
});

export type AlertRuleDoc = Doc<"alertRules">;
