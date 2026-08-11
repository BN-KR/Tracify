import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/cms/", "/cms-api/", "/dashboard/", "/onboarding/", "/api/", "/sign-in", "/sign-up", "/forgot-password", "/reset-password", "/accept-invitation", "/auth/", "/alternative", "/library"] },
    sitemap: "https://www.tracify.tech/sitemap.xml",
    host: "https://www.tracify.tech",
  };
}
