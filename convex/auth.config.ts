export default {
  providers: [
    {
      domain:
        process.env.CLERK_JWT_ISSUER_DOMAIN ??
        "https://many-crab-79.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
