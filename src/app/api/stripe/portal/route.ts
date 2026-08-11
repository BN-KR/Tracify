import { NextResponse } from "next/server";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { getAuthedConvexClient } from "@/lib/convex-server";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const { projectId } = await request.json() as { projectId?: string };
  if (!projectId) return NextResponse.json({ error: "Project is required" }, { status: 400 });
  const client = await getAuthedConvexClient();
  const project = await client.query(api.projects.getProjectForAdmin, { projectId: projectId as Id<"projects"> });
  if (!project?.stripeCustomerId) return NextResponse.json({ error: "No Stripe customer exists for this project" }, { status: 404 });
  const origin = new URL(request.url).origin;
  const session = await stripe.billingPortal.sessions.create({ customer: project.stripeCustomerId, return_url: `${origin}/dashboard/${projectId}/billing` });
  return NextResponse.json({ url: session.url });
}
