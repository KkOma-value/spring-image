"use server";

import { randomUUID } from "crypto";
import { and, eq, gte, sql } from "drizzle-orm";

import { db } from "@/db";
import { creditBalance, creditTransaction } from "@/db/schema/billing";
import { getServerSession } from "@/lib/auth/get-session";
import { CREDIT_COST_PER_IMAGE } from "@/lib/billing/constants";
import { STYLES } from "./constants";
import type { GenerationConfig } from "./types";

type GeminiInlineData = {
    data: string;
    mimeType: string;
};

type GeminiPart = {
    text?: string;
    inlineData?: GeminiInlineData;
};

type GeminiContent = {
    parts: GeminiPart[];
};

type GeminiRequestBody = {
    contents: GeminiContent[];
    generationConfig: {
        responseModalities: string[];
    };
};

type GeminiResponse = {
    candidates?: Array<{
        content?: {
            parts: GeminiPart[];
        };
    }>;
    error?: {
        message: string;
    };
};

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent";

async function deductCredits(userId: string): Promise<void> {
    await db.transaction(async (tx) => {
        await tx
            .insert(creditBalance)
            .values({ userId, balance: 0 })
            .onConflictDoNothing();

        const updated = await tx
            .update(creditBalance)
            .set({
                balance: sql`${creditBalance.balance} - ${CREDIT_COST_PER_IMAGE}`,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(creditBalance.userId, userId),
                    gte(creditBalance.balance, CREDIT_COST_PER_IMAGE),
                ),
            )
            .returning({ balance: creditBalance.balance });

        if (updated.length === 0) {
            throw new Error("INSUFFICIENT_CREDITS");
        }

        await tx.insert(creditTransaction).values({
            id: randomUUID(),
            userId,
            amount: -CREDIT_COST_PER_IMAGE,
            reason: "image_generation",
        });
    });
}

function buildPrompt(config: GenerationConfig): string {
    const style = STYLES.find((s) => s.id === config.styleId);
    if (!style) {
        return config.prompt;
    }
    return `${config.prompt}. Transform this into ${style.name} style: ${style.promptModifier}`;
}

function parseBase64Image(dataUrl: string): { data: string; mimeType: string } {
    const [mimePart, base64Part] = dataUrl.split(",");
    const mimeType = mimePart.split(";")[0].split(":")[1];
    return { data: base64Part, mimeType };
}

function buildParts(config: GenerationConfig, prompt: string): GeminiPart[] {
    const parts: GeminiPart[] = [];

    if (config.imageBase64) {
        const { data, mimeType } = parseBase64Image(config.imageBase64);
        parts.push({ inlineData: { data, mimeType } });
    }

    parts.push({ text: prompt });
    return parts;
}

async function callGeminiAPI(apiKey: string, parts: GeminiPart[]): Promise<string> {
    const requestBody: GeminiRequestBody = {
        contents: [{ parts }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorData = (await response.json()) as GeminiResponse;
        throw new Error(errorData.error?.message || "Failed to generate image");
    }

    const data = (await response.json()) as GeminiResponse;
    return extractImageFromResponse(data);
}

function extractImageFromResponse(response: GeminiResponse): string {
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
        throw new Error("No image data found in response");
    }

    const imagePart = parts.find((part) => part.inlineData?.data);
    if (!imagePart?.inlineData) {
        throw new Error("No image data found in response");
    }

    const { data, mimeType } = imagePart.inlineData;
    return `data:${mimeType || "image/png"};base64,${data}`;
}

export async function generateCNYImage(config: GenerationConfig): Promise<string> {
    const session = await getServerSession();
    const userId = session?.user?.id;

    if (!userId) {
        throw new Error("UNAUTHORIZED");
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY not found in environment variables");
    }

    await deductCredits(userId);

    const prompt = buildPrompt(config);
    const parts = buildParts(config, prompt);

    return callGeminiAPI(apiKey, parts);
}
