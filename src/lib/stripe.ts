import Stripe from "stripe";
import { logger } from "./logger";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  } else {
    logger.warn("STRIPE_SECRET_KEY is not configured. Stripe features will not work.");
  }
}

export const stripe = new Stripe(stripeSecretKey || "sk_test_placeholder", {
  apiVersion: "2024-06-20",
  typescript: true,
  maxNetworkRetries: 3,
  timeout: 30000,
});

export function isStripeConfigured(): boolean {
  return !!stripeSecretKey && !stripeSecretKey.includes("placeholder");
}

export function assertStripeConfigured(): void {
  if (!isStripeConfigured()) {
    throw new Error("Stripe is not properly configured");
  }
}
