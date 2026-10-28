// lib/logger.ts
// Structured Observability & Production Logger for ATSLift with PII Redaction
import { sanitizeLogData, redactPiiFromText } from "@/lib/pii";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  userId?: string;
  route?: string;
  operation?: string;
  durationMs?: number;
  [key: string]: any;
}

class Logger {
  private isProd = process.env.NODE_ENV === "production";

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const cleanMessage = redactPiiFromText(message, { maskOnly: true });
    const cleanContext = context ? sanitizeLogData(context) : undefined;

    const entry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message: cleanMessage,
      ...(cleanContext ? cleanContext : {}),
    };

    if (this.isProd) {
      return JSON.stringify(entry);
    }

    const duration = context?.durationMs ? ` (${context.durationMs}ms)` : "";
    const ctxString = cleanContext ? ` ${JSON.stringify(cleanContext)}` : "";
    return `[${entry.timestamp}] [${level.toUpperCase()}] ${cleanMessage}${duration}${ctxString}`;
  }

  info(message: string, context?: LogContext): void {
    console.log(this.formatMessage("info", message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage("warn", message, context));
  }

  error(message: string, context?: LogContext): void {
    console.error(this.formatMessage("error", message, context));
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.DEBUG || !this.isProd) {
      console.log(this.formatMessage("debug", message, context));
    }
  }

  /**
   * Times an asynchronous function and logs its latency automatically.
   */
  async timeAsync<T>(
    operationName: string,
    fn: () => Promise<T>,
    context?: LogContext
  ): Promise<{ result: T; durationMs: number }> {
    const start = performance.now();
    try {
      const result = await fn();
      const durationMs = Math.round(performance.now() - start);
      this.info(`[TIMING] ${operationName} succeeded`, {
        ...context,
        operation: operationName,
        durationMs,
        success: true,
      });
      return { result, durationMs };
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - start);
      this.error(`[TIMING] ${operationName} failed`, {
        ...context,
        operation: operationName,
        durationMs,
        success: false,
        error: err?.message || String(err),
      });
      throw err;
    }
  }
}

export const logger = new Logger();
