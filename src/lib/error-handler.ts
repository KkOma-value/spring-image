/**
 * Centralized error handling utilities for the application
 */

export type ErrorCode =
  | "UNAUTHORIZED"
  | "INSUFFICIENT_CREDITS"
  | "INVALID_INPUT"
  | "CONFIGURATION_ERROR"
  | "EXTERNAL_API_ERROR"
  | "DATABASE_ERROR"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "UNKNOWN_ERROR";

export interface AppError {
  code: ErrorCode;
  message: string;
  statusCode: number;
  cause?: unknown;
}

export class ApplicationError extends Error implements AppError {
  code: ErrorCode;
  statusCode: number;
  cause?: unknown;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number,
    cause?: unknown
  ) {
    super(message);
    this.name = "ApplicationError";
    this.code = code;
    this.statusCode = statusCode;
    this.cause = cause;
  }
}

const errorMap: Record<ErrorCode, { message: string; statusCode: number }> = {
  UNAUTHORIZED: { message: "Authentication required", statusCode: 401 },
  INSUFFICIENT_CREDITS: { message: "Insufficient credits", statusCode: 402 },
  INVALID_INPUT: { message: "Invalid input provided", statusCode: 400 },
  CONFIGURATION_ERROR: { message: "Server configuration error", statusCode: 500 },
  EXTERNAL_API_ERROR: { message: "External service error", statusCode: 502 },
  DATABASE_ERROR: { message: "Database error", statusCode: 500 },
  NOT_FOUND: { message: "Resource not found", statusCode: 404 },
  RATE_LIMITED: { message: "Rate limit exceeded", statusCode: 429 },
  UNKNOWN_ERROR: { message: "An unexpected error occurred", statusCode: 500 },
};

export function createError(
  code: ErrorCode,
  message?: string,
  cause?: unknown
): ApplicationError {
  const errorInfo = errorMap[code];
  return new ApplicationError(
    code,
    message || errorInfo.message,
    errorInfo.statusCode,
    cause
  );
}

export function handleUnknownError(error: unknown): ApplicationError {
  if (error instanceof ApplicationError) {
    return error;
  }

  if (error instanceof Error) {
    if (error.message.includes("UNAUTHORIZED")) {
      return createError("UNAUTHORIZED", error.message, error);
    }
    if (error.message.includes("INSUFFICIENT_CREDITS")) {
      return createError("INSUFFICIENT_CREDITS", error.message, error);
    }
    return createError("UNKNOWN_ERROR", error.message, error);
  }

  return createError("UNKNOWN_ERROR", String(error), error);
}

export function errorToResponse(error: unknown): Response {
  const appError = handleUnknownError(error);

  const message =
    process.env.NODE_ENV === "production" && appError.statusCode >= 500
      ? "Internal server error"
      : appError.message;

  return Response.json(
    { error: { code: appError.code, message } },
    { status: appError.statusCode }
  );
}
