import { createClient } from "@convex-dev/better-auth";
import { dash, sendEmail, sentinel } from "@better-auth/infra";
import { convex } from "@convex-dev/better-auth/plugins";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { organization } from "better-auth/plugins";
import { components } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import authConfig from "../auth.config";
import schema from "./schema";

export const authComponent = createClient<DataModel, typeof schema>(
  components.betterAuth,
  { local: { schema }, verbose: false },
);

export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
  const database = authComponent.adapter(ctx);
  const siteUrl = process.env.SITE_URL ?? "https://eu.cloud.tracify.tech";
  return {
  appName: "tracify",
  // Auth requests are proxied through the regional Next.js deployment. Resolve
  // the public host per request so OAuth callbacks and host-only session cookies
  // stay on the cloud origin the user selected instead of falling back to the
  // marketing host stored in older Convex environments.
  baseURL: {
    allowedHosts: [
      "eu.cloud.tracify.tech",
      "www.tracify.tech",
      "tracify.tech",
      "tracifytech.vercel.app",
      "*.tracify-tech.vercel.app",
      "localhost:*",
      "127.0.0.1:*",
    ],
    protocol: "auto",
    fallback: siteUrl,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  database,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        template: "reset-password",
        to: user.email,
        variables: {
          resetLink: url,
          userEmail: user.email,
          userName: user.name,
          appName: "tracify",
          expirationMinutes: "60",
        },
      });
    },
  },
  trustedOrigins: [
    siteUrl,
    "https://eu.cloud.tracify.tech",
    "https://www.tracify.tech",
    "https://tracify.tech",
    "https://*.tracify-tech.vercel.app",
    "http://localhost:3000",
    "http://localhost:4000",
    "https://tracifytech.vercel.app",
  ].filter((origin): origin is string => Boolean(origin)),
  advanced: {
    // The Next.js auth handler overwrites these headers from the actual request
    // URL before proxying to Convex, and allowedHosts rejects every unknown host.
    trustedProxyHeaders: true,
  },
  rateLimit: {
    enabled: true,
    storage: "database",
  },
  account: {
    encryptOAuthTokens: true,
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? { google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          } }
      : {}),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? { github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          } }
      : {}),
  },
  plugins: [
    organization({
      organizationLimit: 10,
      membershipLimit: 100,
      invitationExpiresIn: 60 * 60 * 24 * 7,
      disableOrganizationDeletion: true,
    }),
    dash({ apiKey: process.env.BETTER_AUTH_API_KEY }),
    sentinel({ apiKey: process.env.BETTER_AUTH_API_KEY }),
    convex({
      authConfig,
      jwt: {
        definePayload: async ({ user, session }) => {
          const organizationId = "activeOrganizationId" in session
            ? session.activeOrganizationId ?? undefined
            : undefined;
          const membership = organizationId
            ? await ctx.runQuery(components.betterAuth.adapter.findOne, {
                model: "member",
                where: [
                  { field: "userId", value: user.id },
                  { field: "organizationId", value: organizationId },
                ],
              })
            : null as { role?: string } | null;
          return {
            name: user.name,
            email: user.email,
            org_id: organizationId,
            org_role: typeof membership?.role === "string" ? membership.role : undefined,
          };
        },
      },
    }),
  ],
  } satisfies BetterAuthOptions;
};

export const options = createAuthOptions({} as GenericCtx<DataModel>);
export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth(createAuthOptions(ctx));
