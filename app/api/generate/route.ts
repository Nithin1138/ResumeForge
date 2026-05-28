import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateResumeContent } from "@/lib/gemini";

// Global cache for simple rate limiting across edge invocations
const rateLimitMap = new Map<string, number[]>();

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
    const windowStart = now - 60 * 1000;
    
    // Cleanup old entries
    for (const [key, timestamps] of rateLimitMap.entries()) {
      const validTimestamps = timestamps.filter(t => t > windowStart);
      if (validTimestamps.length === 0) rateLimitMap.delete(key);
      else rateLimitMap.set(key, validTimestamps);
    }

    const userRequests = rateLimitMap.get(ip) || [];
    if (userRequests.length >= 5) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute before generating again." },
        { status: 429 }
      );
    }
    
    userRequests.push(now);
    rateLimitMap.set(ip, userRequests);

    // Call LLM generation logic
    const generatedContent = await generateResumeContent(formData);

    // Save standard strings/JSON-strings to database
    const resume = await prisma.resume.create({
      data: {
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

    // Log backend analytics event for step completion
    try {
      await prisma.analyticsEvent.create({
        data: {
          sessionId,
          eventType: "FORM_COMPLETE",
          page: "build",
          metadata: JSON.stringify({ resumeId: resume.id, college: resume.college, branch: resume.branch })
        }
      });
    } catch (e) {
      console.error("Failed to log form completion event:", e);
    }

    return NextResponse.json({ resumeId: resume.id });
  } catch (error) {
    console.error("API /api/generate POST error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred during resume processing." },
      { status: 500 }
    );
  }
}
