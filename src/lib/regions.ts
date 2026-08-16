export type TracifyRegionId = "eu" | "us";

export type TracifyRegion = {
  id: TracifyRegionId;
  name: string;
  shortName: string;
  flag: string;
  origin: string;
  hostname: string;
  location: string;
  infrastructure: string;
};

export const DEFAULT_TRACIFY_REGION: TracifyRegionId = "eu";
export const TRACIFY_REGION_COOKIE = "tracify_region";

export const TRACIFY_REGIONS: Record<TracifyRegionId, TracifyRegion> = {
  eu: {
    id: "eu",
    name: "Europe",
    shortName: "EU",
    flag: "🇪🇺",
    origin: "https://eu.cloud.tracify.tech",
    hostname: "eu.cloud.tracify.tech",
    location: "Ireland",
    infrastructure: "EU West",
  },
  us: {
    id: "us",
    name: "United States",
    shortName: "US",
    flag: "🇺🇸",
    origin: "https://us.cloud.tracify.tech",
    hostname: "us.cloud.tracify.tech",
    location: "Virginia",
    infrastructure: "US East",
  },
};

export function parseTracifyRegion(value: string | null | undefined): TracifyRegionId | null {
  const normalized = value?.trim().toLowerCase();
  return normalized === "eu" || normalized === "us" ? normalized : null;
}

export function getDeploymentRegion(): TracifyRegionId {
  return (
    parseTracifyRegion(process.env.NEXT_PUBLIC_TRACIFY_REGION) ??
    parseTracifyRegion(process.env.TRACIFY_REGION) ??
    DEFAULT_TRACIFY_REGION
  );
}

export function getTracifyRegion(id: TracifyRegionId = getDeploymentRegion()) {
  return TRACIFY_REGIONS[id];
}

export function getRegionForHostname(hostname: string | null | undefined): TracifyRegionId | null {
  const normalized = hostname?.split(":")[0].toLowerCase();
  if (!normalized) return null;
  return (Object.values(TRACIFY_REGIONS).find((region) => region.hostname === normalized)?.id ?? null);
}

export function getRegionalApiKeyPrefix(region: TracifyRegionId = getDeploymentRegion()) {
  return `tracify_sk_live_${region}_`;
}

export function getApiKeyRegion(apiKey: string): TracifyRegionId | null {
  if (apiKey.startsWith(getRegionalApiKeyPrefix("eu"))) return "eu";
  if (apiKey.startsWith(getRegionalApiKeyPrefix("us"))) return "us";
  // Keys issued before regional cloud are assigned to the original EU deployment.
  if (apiKey.startsWith("tracify_sk_live_") || apiKey.startsWith("5t1r_sk_live_")) return "eu";
  return null;
}

export function getWrongRegion(apiKey: string, deploymentRegion = getDeploymentRegion()) {
  const keyRegion = getApiKeyRegion(apiKey);
  return keyRegion && keyRegion !== deploymentRegion ? TRACIFY_REGIONS[keyRegion] : null;
}
