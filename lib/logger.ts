// lib/logger.ts
// Structured Observability & Production Logger for ATSLift

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  userId?: string;
  route?: string;
  operation?: string;
  durationMs?: number;
  [key: string]: any;
}

const SENSITIVE_KEYS = [
  "password",
  "secret",
  "token",
  "apikey",
  "api_key",
  "authorization",
  "cookie",
  "gemini_api_key",
  "nextauth_secret",
];

function sanitize(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map(sanitize);
  }

  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s))) {
      clean[key] = "[REDACTED]";
    } else if (typeof val === "object") {
      clean[key] = sanitize(val);
    } else {
      clean[key] = val;
    }
  }
  return clean;
}

class Logger {
  private isProd = process.env.NODE_ENV === "production";

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const entry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      ...(context ? sanitize(context) : {}),
    };

    if (this.isProd) {
      return JSON.stringify(entry);
    }

    const duration = context?.durationMs ? ` (${context.durationMs}ms)` : "";
    const ctxString = context ? ` ${JSON.stringify(sanitize(context))}` : "";
    return `[${entry.timestamp}] [${level.toUpperCase()}] ${message}${duration}${ctxString}`;
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
