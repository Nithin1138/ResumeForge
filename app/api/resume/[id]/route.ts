import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // In Next 15+, params is a Promise and must be awaited
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing resume ID." }, { status: 400 });
    }

    const resume = await prisma.resume.findUnique({
      where: { id },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    // Decode standard JSON strings back into structured data
    return NextResponse.json({
      id: resume.id,
      sessionId: resume.sessionId,
      status: resume.status,
      inputData: JSON.parse(resume.inputData),
      outputFree: resume.outputFree ? JSON.parse(resume.outputFree) : null,
      outputFull: resume.outputFull ? JSON.parse(resume.outputFull) : null,
      paymentStatus: resume.paymentStatus,
      paymentId: resume.paymentId,
      paymentLinkId: resume.paymentLinkId,
      amountPaid: resume.amountPaid,
      targetRole: resume.targetRole,
      branch: resume.branch,
      cgpa: resume.cgpa,
      college: resume.college,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
    });
  } catch (error) {
    console.error("API GET /api/resume/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while retrieving resume." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing resume ID." }, { status: 400 });
    }

    await prisma.resume.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Resume deleted successfully." });
  } catch (error) {
    console.error("API DELETE /api/resume/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while deleting resume." },
      { status: 500 }
    );
  }
}
