import Stripe from "stripe";
import { logger } from "./logger";

let stripeClient: Stripe | null = null;
let hasLoggedMissingKey = false;

export const STRIPE_SECRET_KEY_NOT_CONFIGURED_MESSAGE = "STRIPE_SECRET_KEY is not configured";

function getStripeSecretKey(): string | undefined {
  return process.env.STRIPE_SECRET_KEY;
}

export function getStripe(): Stripe {
  const stripeSecretKey = getStripeSecretKey();

  if (!stripeSecretKey || stripeSecretKey.includes("placeholder")) {
    if (!hasLoggedMissingKey) {
      logger.warn(`${STRIPE_SECRET_KEY_NOT_CONFIGURED_MESSAGE}. Stripe features will not work.`);
      hasLoggedMissingKey = true;
    }
    throw new Error(STRIPE_SECRET_KEY_NOT_CONFIGURED_MESSAGE);
  }

  if (!stripeClient) {
    stripeClient = new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20",
      typescript: true,
      maxNetworkRetries: 3,
      timeout: 30000,
    });
  }

  return stripeClient;
}

export function isStripeConfigured(): boolean {
  const stripeSecretKey = getStripeSecretKey();
  return !!stripeSecretKey && !stripeSecretKey.includes("placeholder");
}

export function assertStripeConfigured(): void {
  if (!isStripeConfigured()) {
    throw new Error(STRIPE_SECRET_KEY_NOT_CONFIGURED_MESSAGE);
  }
}
