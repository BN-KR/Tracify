/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agentRuns from "../agentRuns.js";
import type * as alerts from "../alerts.js";
import type * as analyticsCache from "../analyticsCache.js";
import type * as annotations from "../annotations.js";
import type * as auth from "../auth.js";
import type * as billing from "../billing.js";
import type * as comments from "../comments.js";
import type * as costCounters from "../costCounters.js";
import type * as evaluation from "../evaluation.js";
import type * as evaluationEngine from "../evaluationEngine.js";
import type * as evaluators from "../evaluators.js";
import type * as experiments from "../experiments.js";
import type * as http from "../http.js";
import type * as projects from "../projects.js";
import type * as prompts from "../prompts.js";
import type * as resilience from "../resilience.js";
import type * as retention from "../retention.js";
import type * as sessions from "../sessions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agentRuns: typeof agentRuns;
  alerts: typeof alerts;
  analyticsCache: typeof analyticsCache;
  annotations: typeof annotations;
  auth: typeof auth;
  billing: typeof billing;
  comments: typeof comments;
  costCounters: typeof costCounters;
  evaluation: typeof evaluation;
  evaluationEngine: typeof evaluationEngine;
  evaluators: typeof evaluators;
  experiments: typeof experiments;
  http: typeof http;
  projects: typeof projects;
  prompts: typeof prompts;
  resilience: typeof resilience;
  retention: typeof retention;
  sessions: typeof sessions;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("../betterAuth/_generated/component.js").ComponentApi<"betterAuth">;
};
