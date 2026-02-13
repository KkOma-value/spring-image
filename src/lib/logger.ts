/**
 * Centralized logging utility
 * In production, this should integrate with a proper logging service
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private shouldLog(level: LogLevel): boolean {
    const currentLevel = (process.env.LOG_LEVEL as LogLevel) || "info";
    return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog("debug")) {
      console.debug(this.formatMessage("debug", message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog("info")) {
      console.info(this.formatMessage("info", message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog("warn")) {
      console.warn(this.formatMessage("warn", message, context));
    }
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    if (!this.shouldLog("error")) return;

    const errorContext: LogContext = { ...context };

    if (error instanceof Error) {
      errorContext.errorName = error.name;
      errorContext.errorMessage = error.message;
      errorContext.stack = error.stack;
    } else if (error !== undefined) {
      errorContext.error = String(error);
    }

    console.error(this.formatMessage("error", message, errorContext));
  }

  api(method: string, path: string, statusCode: number, duration?: number): void {
    this.info("API Request", {
      method,
      path,
      statusCode,
      duration: duration ? `${duration}ms` : undefined,
    });
  }

  stripe(event: string, success: boolean, metadata?: LogContext): void {
    this.info("Stripe Event", { event, success, ...metadata });
  }

  gemini(operation: string, success: boolean, metadata?: LogContext): void {
    this.info("Gemini API", { operation, success, ...metadata });
  }
}

export const logger = new Logger();
