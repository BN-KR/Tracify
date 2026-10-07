import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow a second dev server to run alongside the first. Next refuses to start
  // two dev instances that share a build directory, which otherwise makes it
  // impossible to run the marketing host and a regional cloud host side by side
  // the way they exist in production.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  allowedDevOrigins: ["localhost", "127.0.0.1"],
  typescript: {
    tsconfigPath: process.env.NODE_ENV === "production" ? "tsconfig.build.json" : "tsconfig.json",
  },
  // The docs loader discovers Markdoc files through fs at build/render time.
  // Include them in Vercel's traced server functions so deployed docs pages
  // have the same content repository available as local builds.
  outputFileTracingIncludes: {
    "/*": ["./content/docs/**/*.mdoc"],
  },
  // Create-form aliases resolve at the request layer so client navigation never
  // renders a page whose only job is to call redirect(). Query values on the
  // incoming request are passed through and merged with `view=create`.
  async redirects() {
    return [
      {
        source: "/dashboard/:projectId/alerts/new",
        destination: "/dashboard/:projectId/alerts?view=create",
        permanent: false,
      },
      {
        source: "/dashboard/:projectId/dashboards/new",
        destination: "/dashboard/:projectId/dashboards?view=create",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
