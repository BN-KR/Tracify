import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { sentinelClient } from "@better-auth/infra/client";
import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    organizationClient(),
    sentinelClient({
      identifyUrl: process.env.NEXT_PUBLIC_BETTER_AUTH_IDENTIFY_URL,
      autoSolveChallenge: true,
    }),
    convexClient(),
  ],
});
