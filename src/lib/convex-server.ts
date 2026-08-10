import { getToken } from "@/lib/auth-server";
import { ConvexHttpClient } from "convex/browser";

export async function getAuthedConvexClient() {
  const token = await getToken();
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!url) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  }

  const client = new ConvexHttpClient(url);
  if (token) {
    client.setAuth(token);
  }

  return client;
}
