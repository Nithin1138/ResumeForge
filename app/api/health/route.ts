import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "disconnected";
  let dbLatencyMs: number | null = null;

  try {
    // Lightweight database ping with timeout
    const dbPromise = prisma.$queryRaw`SELECT 1`;
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database ping timed out after 3000ms")), 3000)
    );

    await Promise.race([dbPromise, timeoutPromise]);
    dbStatus = "connected";
    dbLatencyMs = Date.now() - startTime;
  } catch (error: any) {
    dbStatus = "unavailable";
    console.warn("[health-check] Database ping notice:", error?.message || error);
  }

  const hasLiveGemini = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "mock" && process.env.GEMINI_API_KEY !== "xxx";
  const hasGroq = !!process.env.GROQ_API_KEY;
  const isHealthy = dbStatus === "connected" || process.env.NODE_ENV !== "production";

  const responseBody = {
    status: isHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
      provider: "postgresql",
    },
    services: {
      ai: {
        gemini: hasLiveGemini ? "active" : "mock_fallback",
        groq: hasGroq ? "configured" : "unconfigured",
      },
      payments: {
        razorpay: process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== "mock" ? "live" : "sandbox",
      },
      messaging: {
        telegram: !!process.env.TELEGRAM_BOT_TOKEN ? "enabled" : "unconfigured",
        resend: !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "mock" ? "live" : "mock",
      },
    },
  };

  return NextResponse.json(responseBody, {
    status: isHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
