/**
 * Input validation utilities
 */

import { createError } from "./error-handler";

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function validateString(
  value: unknown,
  fieldName: string,
  options?: { minLength?: number; maxLength?: number; required?: boolean }
): ValidationResult<string> {
  if (value === undefined || value === null || value === "") {
    if (options?.required === false) {
      return { success: true, data: "" };
    }
    return { success: false, error: `${fieldName} is required` };
  }

  if (typeof value !== "string") {
    return { success: false, error: `${fieldName} must be a string` };
  }

  const str = value.trim();

  if (options?.minLength !== undefined && str.length < options.minLength) {
    return { success: false, error: `${fieldName} must be at least ${options.minLength} characters` };
  }

  if (options?.maxLength !== undefined && str.length > options.maxLength) {
    return { success: false, error: `${fieldName} must be at most ${options.maxLength} characters` };
  }

  return { success: true, data: str };
}

export function validateFile(
  file: unknown,
  options?: { allowedTypes?: string[]; maxSize?: number; required?: boolean }
): ValidationResult<File> {
  if (!file) {
    if (options?.required === false) {
      return { success: true };
    }
    return { success: false, error: "File is required" };
  }

  if (!(file instanceof File)) {
    return { success: false, error: "Invalid file type" };
  }

  if (options?.allowedTypes && !options.allowedTypes.includes(file.type)) {
    return { success: false, error: `File type ${file.type} is not allowed` };
  }

  if (options?.maxSize && file.size > options.maxSize) {
    return { success: false, error: `File size exceeds maximum of ${options.maxSize / 1024 / 1024}MB` };
  }

  return { success: true, data: file };
}

export function validateBase64Image(dataUrl: string): ValidationResult<{ data: string; mimeType: string }> {
  const parts = dataUrl.split(",");
  if (parts.length !== 2) {
    return { success: false, error: "Invalid base64 image format" };
  }

  const [mimePart, base64Part] = parts;
  const mimeMatch = mimePart.match(/^data:(image\/(png|jpeg|jpg|gif|webp));base64$/);

  if (!mimeMatch) {
    return { success: false, error: "Invalid image mime type" };
  }

  try {
    atob(base64Part);
  } catch {
    return { success: false, error: "Invalid base64 data" };
  }

  return { success: true, data: { data: base64Part, mimeType: mimeMatch[1] } };
}

export function assertString(
  value: unknown,
  fieldName: string,
  options?: { minLength?: number; maxLength?: number }
): string {
  const result = validateString(value, fieldName, { ...options, required: true });
  if (!result.success) {
    throw createError("INVALID_INPUT", result.error);
  }
  return result.data!;
}

export function assertFile(
  file: unknown,
  options?: { allowedTypes?: string[]; maxSize?: number }
): File {
  const result = validateFile(file, { ...options, required: true });
  if (!result.success) {
    throw createError("INVALID_INPUT", result.error);
  }
  return result.data!;
}
