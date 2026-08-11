import { NextResponse } from "next/server";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { getAuthedConvexClient } from "@/lib/convex-server";
import { getStripe, stripePriceIds } from "@/lib/stripe";

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  const stripe = getStripe();
  const body = await request.json() as { projectId?: string; plan?: "pro" | "team"; interval?: "monthly" | "annual" };
  if (!body.projectId || !body.plan || !body.interval) return NextResponse.json({ error: "Invalid checkout request" }, { status: 400 });
  const client = await getAuthedConvexClient();
  const projectId = body.projectId as Id<"projects">;
  const project = await client.query(api.projects.getProjectForAdmin, { projectId });
  if (!project) return NextResponse.json({ error: "Project not found or admin access required" }, { status: 403 });
  if (project.stripeSubscriptionId && project.stripeSubscriptionStatus !== "canceled") {
    return NextResponse.json({ error: "Manage the existing subscription in the billing portal" }, { status: 409 });
  }
  const price = stripePriceIds[body.plan][body.interval];
  if (!price) return NextResponse.json({ error: "Stripe price is not configured" }, { status: 503 });

  let customer = project.stripeCustomerId ?? undefined;
  if (!customer) {
    const created = await stripe.customers.create({ name: project.name, metadata: { projectId } });
    customer = created.id;
    await client.mutation(api.billing.attachCustomer, { projectId, stripeCustomerId: customer });
  }
  const origin = new URL(request.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer,
    line_items: [{ price, quantity: 1 }],
    client_reference_id: projectId,
    metadata: { projectId, plan: body.plan },
    subscription_data: { metadata: { projectId, plan: body.plan }, billing_mode: { type: "flexible" } },
    success_url: `${origin}/dashboard/${projectId}/billing?checkout=success`,
    cancel_url: `${origin}/dashboard/${projectId}/billing?checkout=cancelled`,
    integration_identifier: "tracify_checkout_qplmzvka",
  });
  return NextResponse.json({ url: session.url });
}
