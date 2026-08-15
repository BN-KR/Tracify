import { parseTracifyRegion, TRACIFY_REGIONS } from "@/lib/regions";

export function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const deploymentKind = process.env.NEXT_PUBLIC_TRACIFY_DEPLOYMENT_KIND ?? "marketing";
  if (deploymentKind !== "cloud") return;

  const required = [
    "NEXT_PUBLIC_TRACIFY_REGION",
    "TRACIFY_REGION",
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_CONVEX_URL",
    "NEXT_PUBLIC_CONVEX_SITE_URL",
    "TRACIFY_API_KEY_HASH_SECRET",
    "TINYBIRD_HOST",
    "TINYBIRD_TOKEN",
    "REDIS_URL",
    "INNGEST_EVENT_KEY",
  ] as const;
  const missing = required.filter((name) => !process.env[name]?.trim());
  if (missing.length) {
    throw new Error(`Regional cloud deployment is missing required environment variables: ${missing.join(", ")}`);
  }

  const publicRegion = parseTracifyRegion(process.env.NEXT_PUBLIC_TRACIFY_REGION);
  const serverRegion = parseTracifyRegion(process.env.TRACIFY_REGION);
  if (!publicRegion || publicRegion !== serverRegion) {
    throw new Error("NEXT_PUBLIC_TRACIFY_REGION and TRACIFY_REGION must identify the same supported region");
  }

  const expectedOrigin = TRACIFY_REGIONS[publicRegion].origin;
  if (process.env.NEXT_PUBLIC_SITE_URL !== expectedOrigin) {
    throw new Error(`NEXT_PUBLIC_SITE_URL must be ${expectedOrigin} for the ${publicRegion.toUpperCase()} deployment`);
  }
}
