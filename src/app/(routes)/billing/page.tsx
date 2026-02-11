"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Header } from "@/components/Header";
import { Icons } from "@/components/ui/Icons";
import {
    CREDIT_COST_PER_IMAGE,
    CREDIT_PACK_AMOUNT,
    CREDIT_PACK_PRICE_USD,
} from "@/lib/billing/constants";

type CheckoutStatus = "success" | "canceled" | null;

function getCheckoutStatus(searchParams: URLSearchParams): CheckoutStatus {
    if (searchParams.get("success") === "true") {
        return "success";
    }
    if (searchParams.get("canceled") === "true") {
        return "canceled";
    }
    return null;
}

function getStatusMessage(status: CheckoutStatus): string {
    switch (status) {
        case "success":
            return "Payment successful. Credits have been added.";
        case "canceled":
            return "Payment canceled. You can try again anytime.";
        default:
            return "";
    }
}

const IMAGE_GENERATIONS_COUNT = CREDIT_PACK_AMOUNT / CREDIT_COST_PER_IMAGE;

function PlanFeatures() {
    const features = [
        `${CREDIT_PACK_AMOUNT} credits added instantly`,
        `Enough for ${IMAGE_GENERATIONS_COUNT} image generations`,
        "Credits never expire",
    ];

    return (
        <div className="mt-8 space-y-4 text-sm text-slate-600">
            {features.map((feature) => (
                <FeatureItem key={feature} text={feature} />
            ))}
        </div>
    );
}

function FeatureItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                <Icons.ChevronDown className="h-4 w-4 rotate-90" />
            </span>
            <span>{text}</span>
        </div>
    );
}

function CheckoutButton({ isLoading, onClick }: { isLoading: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            className="mt-10 w-full rounded-2xl bg-slate-900 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-60"
        >
            {isLoading ? "Redirecting..." : "Pay with Stripe"}
        </button>
    );
}

function BillingContent() {
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);

    const status = getCheckoutStatus(searchParams);
    const statusMessage = getStatusMessage(status);

    const handleCheckout = async () => {
        setIsLoading(true);

        try {
            const response = await fetch("/api/checkout", { method: "POST" });
            const data = (await response.json()) as { url?: string; error?: string };

            if (!response.ok || !data.url) {
                throw new Error(data.error || "Checkout failed.");
            }

            window.location.href = data.url;
        } catch (error) {
            console.error(error);
            alert("Unable to start checkout. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen cny-background text-white pt-28 pb-24">
            <Header />
            <div className="container mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-14">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-cny-gold shadow-sm backdrop-blur">
                        <Icons.Star className="h-4 w-4 text-cny-gold" />
                        Billing & Credits
                    </div>
                    <h1 className="mt-6 text-4xl md:text-5xl font-serif font-semibold tracking-tight text-white">
                        Recharge Your Creative Power
                    </h1>
                    <p className="mt-4 text-base text-gray-200">
                        Each image generation costs {CREDIT_COST_PER_IMAGE} credits. Add a pack
                        to keep creating.
                    </p>

                    {statusMessage && (
                        <div className="mt-6 rounded-2xl border border-white/20 bg-white/15 px-4 py-3 text-sm text-white/90 backdrop-blur">
                            {statusMessage}
                        </div>
                    )}
                </div>

                <div className="flex justify-center">
                    <div className="relative w-full max-w-lg">
                        <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-r from-cny-gold/20 via-white/10 to-cny-red/20 opacity-70 blur-2xl" />
                        <div className="relative rounded-3xl border border-white/70 bg-white p-10 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
                            <div className="flex items-start justify-between gap-6">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                                        Moderato Plan
                                    </p>
                                    <h2 className="mt-3 text-4xl font-semibold text-slate-900">
                                        ${CREDIT_PACK_PRICE_USD}
                                        <span className="text-base font-normal text-slate-500">
                                            {" "}/ one-time
                                        </span>
                                    </h2>
                                    <p className="mt-2 text-sm text-slate-500">
                                        Instant top-up for your next creative run.
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
                                    <Icons.Sparkles className="h-5 w-5" />
                                </div>
                            </div>

                            <PlanFeatures />

                            <CheckoutButton isLoading={isLoading} onClick={handleCheckout} />

                            <p className="mt-4 text-center text-xs text-slate-500">
                                Secure checkout powered by Stripe
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function BillingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen cny-background" />}>
            <BillingContent />
        </Suspense>
    );
}
