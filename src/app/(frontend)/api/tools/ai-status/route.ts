import { NextResponse } from "next/server";
import { fetchAllProviders } from "@/lib/tools/provider-status";

// Public, read-only and cached at the edge, so a busy page cannot hammer the providers.
export const revalidate = 60;

export async function GET() {
  const providers = await fetchAllProviders();
  return NextResponse.json(
    { checkedAt: new Date().toISOString(), providers },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } },
  );
}
