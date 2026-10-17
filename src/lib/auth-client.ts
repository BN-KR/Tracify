import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { sentinelClient } from "@better-auth/infra/client";
import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";
import { ac, roles } from "convex/betterAuth/roles";

export const authClient = createAuthClient({
  plugins: [
    organizationClient({ ac, roles }),
    sentinelClient({
      identifyUrl: process.env.NEXT_PUBLIC_BETTER_AUTH_IDENTIFY_URL,
      autoSolveChallenge: true,
    }),
    convexClient(),
  ],
});
