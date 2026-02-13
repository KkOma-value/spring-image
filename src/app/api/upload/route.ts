import { put } from "@vercel/blob";
import { headers } from "next/headers";
import { logger } from "@/lib/logger";
import { createError, errorToResponse, ApplicationError } from "@/lib/error-handler";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface RateLimitEntry {
  timestamps: number[];
}

const uploadAttempts = new Map<string, RateLimitEntry>();

function checkRateLimit(clientId: string): { limited: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxAttempts = 5;

  const entry = uploadAttempts.get(clientId);
  const timestamps = entry?.timestamps.filter(t => now - t < windowMs) || [];

  if (timestamps.length >= maxAttempts) {
    return { limited: true, remaining: 0 };
  }

  timestamps.push(now);
  uploadAttempts.set(clientId, { timestamps });

  return { limited: false, remaining: maxAttempts - timestamps.length };
}

function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}` };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB` };
  }

  return { valid: true };
}

export async function POST(request: Request): Promise<Response> {
  const startTime = Date.now();

  try {
    const headersList = await headers();
    const clientId = headersList.get("x-forwarded-for") || "unknown";
    const rateLimit = checkRateLimit(clientId);

    if (rateLimit.limited) {
      logger.warn("Rate limit exceeded", { clientId, path: "/api/upload" });
      throw createError("RATE_LIMITED", "Too many uploads. Please try again later.");
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      throw createError("INVALID_INPUT", "Invalid form data");
    }

    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      throw createError("INVALID_INPUT", "No file uploaded");
    }

    const validation = validateFile(file);
    if (!validation.valid) {
      throw createError("INVALID_INPUT", validation.error);
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      logger.error("BLOB_READ_WRITE_TOKEN not configured");
      throw createError("CONFIGURATION_ERROR");
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").substring(0, 100);

    const blob = await put(`uploads/${Date.now()}-${sanitizedName}`, file, {
      access: "public",
      addRandomSuffix: true,
      token,
      contentType: file.type,
    });

    const duration = Date.now() - startTime;
    logger.api("POST", "/api/upload", 200, duration);
    logger.info("File uploaded", { clientId, filename: sanitizedName, size: file.size });

    return Response.json(
      { success: true, url: blob.url, size: file.size },
      { headers: { "X-RateLimit-Remaining": String(rateLimit.remaining) } }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    const statusCode = error instanceof ApplicationError ? error.statusCode : 500;

    logger.api("POST", "/api/upload", statusCode, duration);
    logger.error("Upload failed", error);

    return errorToResponse(error);
  }
}
