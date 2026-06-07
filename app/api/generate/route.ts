import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateResumeContent } from "@/lib/gemini";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

// Global cache for simple rate limiting across edge invocations
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, formData } = body;

    if (!sessionId || !formData) {
      return NextResponse.json(
        { error: "Missing required parameters: sessionId and formData are mandatory." },
        { status: 400 }
      );
    }

    // Basic in-memory rate limiting (max 5 requests per minute per IP)
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW_MS;

    // Cleanup stale entries periodically (avoid O(n) scan every request)
    if (rateLimitMap.size > 200 || Math.random() < 0.05) {
      for (const [key, timestamps] of rateLimitMap.entries()) {
        const validTimestamps = timestamps.filter((t) => t > windowStart);
        if (validTimestamps.length === 0) rateLimitMap.delete(key);
        else rateLimitMap.set(key, validTimestamps);
      }
    }

    const userRequests = (rateLimitMap.get(ip) || []).filter((t) => t > windowStart);
    if (userRequests.length >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute before generating again." },
        { status: 429 }
      );
    }
    
    userRequests.push(now);
    rateLimitMap.set(ip, userRequests);

    // Call LLM generation logic
    const generatedContent = await generateResumeContent(formData);

    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as any).id : null;

    // Save standard strings/JSON-strings to database
    const resume = await prisma.resume.create({
      data: {
        userId,
        sessionId,
        status: "GENERATED",
        inputData: JSON.stringify(formData),
        outputFree: JSON.stringify(generatedContent.freeTierPreview),
        outputFull: JSON.stringify(generatedContent),
        paymentStatus: "PENDING",
        targetRole: formData.personal.targetRole || "",
        branch: formData.personal.branch || "",
        cgpa: formData.personal.cgpa || "",
        college: formData.personal.collegeName || "",
      },
    });

    // Non-blocking analytics — don't delay the response
    void prisma.analyticsEvent
      .create({
        data: {
          sessionId,
          eventType: "FORM_COMPLETE",
          page: "build",
          metadata: JSON.stringify({
            resumeId: resume.id,
            college: resume.college,
            branch: resume.branch,
          }),
        },
      })
      .catch((e) => console.error("Failed to log form completion event:", e));

    return NextResponse.json({ resumeId: resume.id });
  } catch (error) {
    console.error("API /api/generate POST error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred during resume processing." },
      { status: 500 }
    );
  }
}
