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
  return {
  appName: "tracify",
  baseURL: process.env.SITE_URL,
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
    process.env.SITE_URL,
    "http://localhost:3000",
    "http://localhost:4000",
    "https://tracifytech.vercel.app",
  ].filter((origin): origin is string => Boolean(origin)),
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
