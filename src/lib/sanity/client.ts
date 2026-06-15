import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const client = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-06-01",
      useCdn: true,
      perspective: "published",
    })
  : null;

const builder = client ? createImageUrlBuilder(client) : null;

export function urlFor(source: any) {
  if (!builder) return null;
  return builder.image(source);
}

export function getClient(preview?: { token: string }) {
  if (!client) return null;
  if (preview?.token) {
    return client.withConfig({
      token: preview.token,
      useCdn: false,
      ignoreBrowserTokenWarning: true,
      perspective: "previewDrafts",
    });
  }
  return client;
}
