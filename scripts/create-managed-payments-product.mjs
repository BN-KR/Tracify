import Stripe from "stripe";

const apiKey = process.env.STRIPE_SECRET_KEY;

if (!apiKey) {
  throw new Error("Set STRIPE_SECRET_KEY to a Stripe secret or restricted key before creating the product.");
}

const stripe = new Stripe(apiKey);

const product = await stripe.products.create({
  name: "Basic subscription",
  description: "A basic subscription to our service",
  tax_code: "txcd_10103100",
  default_price_data: {
    unit_amount: 1000,
    currency: "usd",
    recurring: { interval: "month" },
  },
}, { apiVersion: "2026-02-25.preview" });

console.log(JSON.stringify({ productId: product.id, priceId: product.default_price }, null, 2));
