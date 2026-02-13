import { NextResponse } from "next/server";
import { z } from "zod";

import { getServerSession } from "@/lib/auth/get-session";
import { getStripe, isStripeConfigured, STRIPE_SECRET_KEY_NOT_CONFIGURED_MESSAGE } from "@/lib/stripe";
import { logger } from "@/lib/logger";
import { createError, ApplicationError } from "@/lib/error-handler";

export const runtime = "nodejs";

const checkoutSchema = z.object({
  quantity: z.number().int().min(1).max(10).default(1),
});

function getStripeConfig(): { priceId: string; baseUrl: string } {
  const priceId = process.env.PRICE_ID;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!priceId) {
    logger.error("PRICE_ID not configured");
    throw createError("CONFIGURATION_ERROR", "Stripe price ID is not configured");
  }

  if (!baseUrl) {
    logger.error("NEXT_PUBLIC_BASE_URL not configured");
    throw createError("CONFIGURATION_ERROR", "Base URL is not configured");
  }

  return { priceId, baseUrl };
}

async function createCheckoutSession(
  userId: string,
  email: string | undefined,
  priceId: string,
  baseUrl: string,
  quantity: number
): Promise<string> {
  try {
    const stripe = getStripe();

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity }],
      success_url: `${baseUrl}/billing?success=true`,
      cancel_url: `${baseUrl}/billing?canceled=true`,
      customer_email: email,
      metadata: { userId, priceId, quantity: String(quantity) },
    });

    if (!checkoutSession.url) {
      throw createError("EXTERNAL_API_ERROR", "Failed to create checkout session URL");
    }

    logger.stripe("checkout.session.create", true, { sessionId: checkoutSession.id, userId, quantity });

    return checkoutSession.url;
  } catch (error) {
    logger.stripe("checkout.session.create", false, { userId, error: String(error) });
    throw createError("EXTERNAL_API_ERROR", "Failed to create checkout session", error);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      logger.warn("Unauthorized checkout attempt");
      throw createError("UNAUTHORIZED");
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw createError("INVALID_INPUT", "Invalid JSON body");
    }

    const validationResult = checkoutSchema.safeParse(body);
    if (!validationResult.success) {
      const issues = validationResult.error.issues.map(i => i.message).join(", ");
      throw createError("INVALID_INPUT", `Invalid request: ${issues}`);
    }

    const { quantity } = validationResult.data;
    if (!isStripeConfigured()) {
      logger.error(STRIPE_SECRET_KEY_NOT_CONFIGURED_MESSAGE);
      throw createError("CONFIGURATION_ERROR", STRIPE_SECRET_KEY_NOT_CONFIGURED_MESSAGE);
    }

    const { priceId, baseUrl } = getStripeConfig();

    const url = await createCheckoutSession(
      session.user.id,
      session.user.email,
      priceId,
      baseUrl,
      quantity
    );

    const duration = Date.now() - startTime;
    logger.api("POST", "/api/checkout", 200, duration);

    return NextResponse.json({ success: true, url });
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error instanceof ApplicationError) {
      logger.api("POST", "/api/checkout", error.statusCode, duration);
      logger.error("Checkout failed", error);

      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      );
    }

    logger.api("POST", "/api/checkout", 500, duration);
    logger.error("Checkout failed with unexpected error", error);

    return NextResponse.json(
      { error: { code: "UNKNOWN_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
