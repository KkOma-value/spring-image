import { headers } from "next/headers";
import Stripe from "stripe";
import { randomUUID } from "crypto";
import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { creditBalance, creditTransaction, paymentHistory } from "@/db/schema/billing";
import { CREDIT_PACK_AMOUNT } from "@/lib/billing/constants";
import { stripe } from "@/lib/stripe";
import { logger } from "@/lib/logger";
import { createError, ApplicationError } from "@/lib/error-handler";

export const runtime = "nodejs";

const HANDLED_EVENTS = new Set([
  "checkout.session.completed",
  "checkout.session.expired",
]);

interface StripeSessionMetadata {
  userId?: string;
  priceId?: string;
  quantity?: string;
}

type StripeSession = Stripe.Checkout.Session & {
  metadata?: StripeSessionMetadata;
};

async function isSessionProcessed(stripeSessionId: string): Promise<boolean> {
  const existing = await db
    .select({ stripeSessionId: paymentHistory.stripeSessionId })
    .from(paymentHistory)
    .where(eq(paymentHistory.stripeSessionId, stripeSessionId));

  return existing.length > 0;
}

async function processPayment(session: StripeSession): Promise<void> {
  const userId = session.metadata?.userId;
  if (!userId) {
    logger.error("Missing user metadata in session", { sessionId: session.id });
    throw createError("INVALID_INPUT", "Missing user metadata");
  }

  const quantity = parseInt(session.metadata?.quantity ?? "1", 10);
  const stripeSessionId = session.id;
  const amountTotal = session.amount_total ?? 0;
  const currency = session.currency ?? "usd";
  const priceId = session.metadata?.priceId ?? process.env.PRICE_ID ?? "";

  let paymentIntentId: string | null = null;
  if (typeof session.payment_intent === "string") {
    paymentIntentId = session.payment_intent;
  } else if (session.payment_intent?.id) {
    paymentIntentId = session.payment_intent.id;
  }

  if (await isSessionProcessed(stripeSessionId)) {
    logger.info("Session already processed, skipping", { sessionId: session.id });
    return;
  }

  const creditsGranted = CREDIT_PACK_AMOUNT * quantity;

  await db.transaction(async (tx) => {
    await tx
      .insert(creditBalance)
      .values({ userId, balance: 0 })
      .onConflictDoNothing();

    await tx
      .update(creditBalance)
      .set({
        balance: sql`${creditBalance.balance} + ${creditsGranted}`,
        updatedAt: new Date(),
      })
      .where(eq(creditBalance.userId, userId));

    await tx.insert(creditTransaction).values({
      id: randomUUID(),
      userId,
      amount: creditsGranted,
      reason: "checkout_session_completed",
      stripeSessionId,
    });

    await tx.insert(paymentHistory).values({
      id: randomUUID(),
      userId,
      stripeSessionId,
      stripePaymentIntentId: paymentIntentId,
      priceId,
      amount: amountTotal,
      currency,
      status: session.payment_status ?? "paid",
      creditsGranted,
    });
  });

  logger.stripe("checkout.session.completed", true, {
    sessionId: session.id,
    userId,
    amount: amountTotal,
    creditsGranted,
  });
}

async function constructStripeEvent(payload: string, signature: string): Promise<Stripe.Event> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.error("STRIPE_WEBHOOK_SECRET not configured");
    throw createError("CONFIGURATION_ERROR", "Webhook secret not configured");
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature";
    logger.error("Webhook signature verification failed", error, { signature: signature.substring(0, 20) });
    throw createError("INVALID_INPUT", `Webhook verification failed: ${message}`);
  }
}

export async function POST(request: Request): Promise<Response> {
  const startTime = Date.now();

  try {
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      logger.warn("Missing Stripe signature");
      throw createError("INVALID_INPUT", "Missing Stripe signature");
    }

    const payload = await request.text();
    const event = await constructStripeEvent(payload, signature);

    logger.info("Webhook received", { eventType: event.type, eventId: event.id });

    if (!HANDLED_EVENTS.has(event.type)) {
      logger.debug("Unhandled event type, ignoring", { eventType: event.type });
      return new Response("ok", { status: 200 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as StripeSession;

      try {
        await processPayment(session);
      } catch (error) {
        logger.error("Payment processing failed", error, {
          sessionId: session.id,
          userId: session.metadata?.userId,
        });
        return new Response("Payment processing failed", { status: 500 });
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as StripeSession;
      logger.stripe("checkout.session.expired", true, {
        sessionId: session.id,
        userId: session.metadata?.userId,
      });
    }

    const duration = Date.now() - startTime;
    logger.api("POST", "/api/webhook", 200, duration);

    return new Response("ok", { status: 200 });
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error instanceof ApplicationError) {
      logger.api("POST", "/api/webhook", error.statusCode, duration);
      logger.error("Webhook processing failed", error);
      return new Response(error.message, { status: error.statusCode });
    }

    logger.api("POST", "/api/webhook", 500, duration);
    logger.error("Webhook processing failed with unexpected error", error);
    return new Response("Internal server error", { status: 500 });
  }
}
