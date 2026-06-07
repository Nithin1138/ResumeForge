import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

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

    // Access control check
    if (resume.userId) {
      const session = await getServerSession(authOptions);
      const userId = session?.user ? (session.user as any).id : null;
      if (resume.userId !== userId) {
        return NextResponse.json({ error: "Access denied." }, { status: 403 });
      }
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
      resumeName: resume.resumeName,
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing resume ID." }, { status: 400 });
    }

    const body = await req.json();
    const { resumeName } = body;

    const resume = await prisma.resume.findUnique({ where: { id } });
    if (!resume) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    // Access control check
    if (resume.userId) {
      const session = await getServerSession(authOptions);
      const userId = session?.user ? (session.user as any).id : null;
      if (resume.userId !== userId) {
        return NextResponse.json({ error: "Access denied." }, { status: 403 });
      }
    }

    await prisma.resume.update({
      where: { id },
      data: { resumeName: resumeName || null },
    });

    revalidatePath("/dashboard");

    return NextResponse.json({ success: true, message: "Resume renamed successfully." });
  } catch (error) {
    console.error("API PATCH /api/resume/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while renaming resume." },
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

    const resume = await prisma.resume.findUnique({ where: { id } });
    if (!resume) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    // Access control check
    if (resume.userId) {
      const session = await getServerSession(authOptions);
      const userId = session?.user ? (session.user as any).id : null;
      if (resume.userId !== userId) {
        return NextResponse.json({ error: "Access denied." }, { status: 403 });
      }
    }

    await prisma.resume.delete({
      where: { id },
    });

    revalidatePath("/dashboard");

    return NextResponse.json({ success: true, message: "Resume deleted successfully." });
  } catch (error) {
    console.error("API DELETE /api/resume/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while deleting resume." },
      { status: 500 }
    );
  }
}
