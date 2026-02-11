import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/auth/get-session";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

function getStripeConfig(): { priceId: string; baseUrl: string } {
    const priceId = process.env.PRICE_ID;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!priceId || !baseUrl) {
        throw new Error("Stripe is not configured.");
    }

    return { priceId, baseUrl };
}

async function createCheckoutSession(
    userId: string,
    email: string | undefined,
    priceId: string,
    baseUrl: string,
): Promise<string> {
    const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${baseUrl}/billing?success=true`,
        cancel_url: `${baseUrl}/billing?canceled=true`,
        customer_email: email,
        metadata: { userId, priceId },
    });

    if (!checkoutSession.url) {
        throw new Error("Failed to create checkout session.");
    }

    return checkoutSession.url;
}

export async function POST(): Promise<NextResponse> {
    const session = await getServerSession();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { priceId, baseUrl } = getStripeConfig();
        const url = await createCheckoutSession(
            session.user.id,
            session.user.email,
            priceId,
            baseUrl,
        );
        return NextResponse.json({ url });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Checkout failed.";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
