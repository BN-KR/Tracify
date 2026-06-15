import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";

export async function getAuthedConvexClient() {
  const { getToken } = await auth();
  const token = await getToken({ template: "convex" });
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
