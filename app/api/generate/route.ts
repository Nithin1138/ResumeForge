import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateResumeContent } from "@/lib/gemini";

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

    return NextResponse.json({ resumeId: resume.id });
  } catch (error) {
    console.error("API /api/generate POST error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred during resume processing." },
      { status: 500 }
    );
  }
}
