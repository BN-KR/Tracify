import { createHmac, randomBytes } from "crypto";

export const API_KEY_PREFIX = "tracify_sk_live_";

export function generateApiKey() {
  return `${API_KEY_PREFIX}${randomBytes(16).toString("hex")}`;
}

export function hashApiKey(apiKey: string) {
  const secret = process.env.FIVETOONE_API_KEY_HASH_SECRET;
  if (!secret) {
    throw new Error("FIVETOONE_API_KEY_HASH_SECRET is not set");
  }

  return createHmac("sha256", secret).update(apiKey).digest("hex");
}

export function getApiKeyDisplayParts(apiKey: string) {
  return {
    apiKeyPrefix: API_KEY_PREFIX,
    apiKeyLast4: apiKey.slice(-4),
  };
}
