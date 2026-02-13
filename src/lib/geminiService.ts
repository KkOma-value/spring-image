"use server";

import { randomUUID } from "crypto";
import { and, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { creditBalance, creditTransaction } from "@/db/schema/billing";
import { getServerSession } from "@/lib/auth/get-session";
import { CREDIT_COST_PER_IMAGE } from "@/lib/billing/constants";
import { STYLES } from "./constants";
import { logger } from "./logger";
import { createError } from "./error-handler";

const generationConfigSchema = z.object({
  prompt: z.string().min(1).max(1000),
  styleId: z.string(),
  aspectRatio: z.enum(["1:1", "3:4", "4:3", "16:9", "9:16"]),
  imageBase64: z.string().regex(/^data:image\/(png|jpeg|jpg|gif|webp);base64,/).optional(),
});

export type GenerationConfig = z.infer<typeof generationConfigSchema>;

interface GeminiPart {
  text?: string;
  inlineData?: { data: string; mimeType: string };
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts: GeminiPart[] };
    finishReason?: string;
  }>;
  error?: { message: string; code?: string };
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent";

async function deductCredits(userId: string): Promise<void> {
  try {
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
            gte(creditBalance.balance, CREDIT_COST_PER_IMAGE)
          )
        )
        .returning({ balance: creditBalance.balance });

      if (updated.length === 0) {
        throw createError("INSUFFICIENT_CREDITS");
      }

      await tx.insert(creditTransaction).values({
        id: randomUUID(),
        userId,
        amount: -CREDIT_COST_PER_IMAGE,
        reason: "image_generation",
      });
    });

    logger.info("Credits deducted", { userId, cost: CREDIT_COST_PER_IMAGE });
  } catch (error) {
    if (error instanceof Error && "code" in error) {
      throw error;
    }
    logger.error("Failed to deduct credits", error, { userId });
    throw createError("DATABASE_ERROR", "Failed to process credits", error);
  }
}

function buildPrompt(config: GenerationConfig): string {
  const style = STYLES.find((s) => s.id === config.styleId);
  if (!style) return config.prompt;
  return `${config.prompt}. Transform this into ${style.name} style: ${style.promptModifier}`;
}

function parseBase64Image(dataUrl: string): { data: string; mimeType: string } {
  const parts = dataUrl.split(",");
  if (parts.length !== 2) {
    throw createError("INVALID_INPUT", "Invalid base64 image format");
  }

  const [mimePart, base64Part] = parts;
  const mimeMatch = mimePart.match(/^data:(image\/(png|jpeg|jpg|gif|webp));base64$/);

  if (!mimeMatch) {
    throw createError("INVALID_INPUT", "Invalid image mime type");
  }

  return { data: base64Part, mimeType: mimeMatch[1] };
}

function buildParts(config: GenerationConfig, prompt: string): GeminiPart[] {
  const parts: GeminiPart[] = [];

  if (config.imageBase64) {
    try {
      const { data, mimeType } = parseBase64Image(config.imageBase64);
      parts.push({ inlineData: { data, mimeType } });
    } catch (error) {
      logger.error("Failed to parse base64 image", error);
      throw createError("INVALID_INPUT", "Invalid uploaded image");
    }
  }

  parts.push({ text: prompt });
  return parts;
}

async function callGeminiAPI(
  apiKey: string,
  parts: GeminiPart[],
  aspectRatio?: string
): Promise<string> {
  const requestBody = {
    contents: [{ parts }],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
      ...(aspectRatio && { imageConfig: { aspectRatio } }),
    },
  };

  const startTime = Date.now();

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorData = (await response.json()) as GeminiResponse;
      logger.gemini("generateContent", false, {
        status: response.status,
        error: errorData.error?.message,
        duration,
      });
      throw createError(
        "EXTERNAL_API_ERROR",
        errorData.error?.message || `Gemini API error: ${response.status}`
      );
    }

    const data = (await response.json()) as GeminiResponse;

    const finishReason = data.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== "STOP") {
      logger.warn("Gemini generation finished unexpectedly", { finishReason });
    }

    logger.gemini("generateContent", true, {
      duration,
      tokenCount: data.usageMetadata?.totalTokenCount,
    });

    return extractImageFromResponse(data);
  } catch (error) {
    if (error instanceof Error && "code" in error) {
      throw error;
    }
    logger.error("Gemini API call failed", error, { duration: Date.now() - startTime });
    throw createError("EXTERNAL_API_ERROR", "Image generation failed", error);
  }
}

function extractImageFromResponse(response: GeminiResponse): string {
  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) {
    throw createError("EXTERNAL_API_ERROR", "No content in generation response");
  }

  const imagePart = parts.find((part) => part.inlineData?.data);
  if (!imagePart?.inlineData) {
    const textPart = parts.find((part) => part.text);
    if (textPart?.text) {
      logger.warn("Gemini returned text instead of image", { text: textPart.text });
    }
    throw createError("EXTERNAL_API_ERROR", "No image data found in response");
  }

  const { data, mimeType } = imagePart.inlineData;
  return `data:${mimeType || "image/png"};base64,${data}`;
}

export async function generateCNYImage(config: GenerationConfig): Promise<string> {
  const startTime = Date.now();

  try {
    const session = await getServerSession();
    const userId = session?.user?.id;

    if (!userId) {
      throw createError("UNAUTHORIZED");
    }

    const validationResult = generationConfigSchema.safeParse(config);
    if (!validationResult.success) {
      const issues = validationResult.error.issues.map((i) => i.message).join(", ");
      throw createError("INVALID_INPUT", `Invalid generation config: ${issues}`);
    }

    const validatedConfig = validationResult.data;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.error("GEMINI_API_KEY not configured");
      throw createError("CONFIGURATION_ERROR");
    }

    await deductCredits(userId);

    const prompt = buildPrompt(validatedConfig);
    const parts = buildParts(validatedConfig, prompt);
    const imageData = await callGeminiAPI(apiKey, parts, validatedConfig.aspectRatio);

    const duration = Date.now() - startTime;
    logger.info("Image generated", {
      userId,
      styleId: validatedConfig.styleId,
      hasReferenceImage: !!validatedConfig.imageBase64,
      duration,
    });

    return imageData;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error("Image generation failed", error, { duration });
    throw error;
  }
}

export async function generateCNYImageUnauthenticated(
  config: GenerationConfig,
  apiKey: string
): Promise<string> {
  const startTime = Date.now();

  try {
    const validationResult = generationConfigSchema.safeParse(config);
    if (!validationResult.success) {
      const issues = validationResult.error.issues.map((i) => i.message).join(", ");
      throw createError("INVALID_INPUT", `Invalid generation config: ${issues}`);
    }

    const validatedConfig = validationResult.data;

    const prompt = buildPrompt(validatedConfig);
    const parts = buildParts(validatedConfig, prompt);
    const imageData = await callGeminiAPI(apiKey, parts, validatedConfig.aspectRatio);

    const duration = Date.now() - startTime;
    logger.info("Image generated (unauthenticated)", {
      styleId: validatedConfig.styleId,
      hasReferenceImage: !!validatedConfig.imageBase64,
      duration,
    });

    return imageData;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error("Image generation failed", error, { duration });
    throw error;
  }
}
