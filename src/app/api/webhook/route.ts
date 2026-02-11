import { headers } from "next/headers";
import Stripe from "stripe";
import { randomUUID } from "crypto";
import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { creditBalance, creditTransaction, paymentHistory } from "@/db/schema/billing";
import { CREDIT_PACK_AMOUNT } from "@/lib/billing/constants";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

type StripeSession = Stripe.Checkout.Session & {
    metadata?: { userId?: string; priceId?: string };
};

type PaymentIntentInfo = {
    stripeSessionId: string;
    amountTotal: number;
    currency: string;
    paymentIntentId: string | null;
    priceId: string;
};

function extractPaymentIntentInfo(session: StripeSession): PaymentIntentInfo {
    const stripeSessionId = session.id;
    const amountTotal = session.amount_total ?? 0;
    const currency = session.currency ?? "usd";

    let paymentIntentId: string | null = null;
    if (typeof session.payment_intent === "string") {
        paymentIntentId = session.payment_intent;
    } else if (session.payment_intent?.id) {
        paymentIntentId = session.payment_intent.id;
    }

    const priceId = session.metadata?.priceId ?? process.env.PRICE_ID ?? "";

    return { stripeSessionId, amountTotal, currency, paymentIntentId, priceId };
}

async function isSessionProcessed(stripeSessionId: string): Promise<boolean> {
    const existing = await db
        .select({ stripeSessionId: paymentHistory.stripeSessionId })
        .from(paymentHistory)
        .where(eq(paymentHistory.stripeSessionId, stripeSessionId));

    return existing.length > 0;
}

async function ensureCreditBalance(userId: string): Promise<void> {
    await db
        .insert(creditBalance)
        .values({ userId, balance: 0 })
        .onConflictDoNothing();
}

async function addCreditsToUser(userId: string): Promise<void> {
    await db
        .update(creditBalance)
        .set({
            balance: sql`${creditBalance.balance} + ${CREDIT_PACK_AMOUNT}`,
            updatedAt: new Date(),
        })
        .where(eq(creditBalance.userId, userId));
}

async function recordCreditTransaction(
    userId: string,
    stripeSessionId: string,
): Promise<void> {
    await db.insert(creditTransaction).values({
        id: randomUUID(),
        userId,
        amount: CREDIT_PACK_AMOUNT,
        reason: "checkout_session_completed",
        stripeSessionId,
    });
}

async function recordPaymentHistory(
    userId: string,
    info: PaymentIntentInfo,
    status: string,
): Promise<void> {
    await db.insert(paymentHistory).values({
        id: randomUUID(),
        userId,
        stripeSessionId: info.stripeSessionId,
        stripePaymentIntentId: info.paymentIntentId,
        priceId: info.priceId,
        amount: info.amountTotal,
        currency: info.currency,
        status,
        creditsGranted: CREDIT_PACK_AMOUNT,
    });
}

async function processPayment(session: StripeSession): Promise<void> {
    const userId = session.metadata?.userId;
    if (!userId) {
        throw new Error("Missing user metadata.");
    }

    const paymentInfo = extractPaymentIntentInfo(session);

    if (await isSessionProcessed(paymentInfo.stripeSessionId)) {
        return;
    }

    await db.transaction(async () => {
        await ensureCreditBalance(userId);
        await addCreditsToUser(userId);
        await recordCreditTransaction(userId, paymentInfo.stripeSessionId);
        await recordPaymentHistory(userId, paymentInfo, session.payment_status ?? "paid");
    });
}

async function constructStripeEvent(payload: string, signature: string): Promise<Stripe.Event> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        throw new Error("Webhook secret not configured.");
    }

    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

export async function POST(request: Request): Promise<Response> {
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
        return new Response("Missing Stripe signature.", { status: 400 });
    }

    const payload = await request.text();

    let event: Stripe.Event;

    try {
        event = await constructStripeEvent(payload, signature);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Invalid signature.";
        return new Response(`Webhook Error: ${message}`, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as StripeSession;

        try {
            await processPayment(session);
        } catch (error) {
            console.error("Payment processing error:", error);
            return new Response("Failed to process payment.", { status: 500 });
        }
    }

    return new Response("ok", { status: 200 });
}
