import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The docs loader discovers Markdoc files through fs at build/render time.
  // Include them in Vercel's traced server functions so deployed docs pages
  // have the same content repository available as local builds.
  outputFileTracingIncludes: {
    "/*": ["./content/docs/**/*.mdoc"],
  },
};

export default nextConfig;
