import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET /api/draft — load latest draft for logged-in user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ draft: null });
    }

    const userId = (session.user as any).id;

    const latestDraft = await prisma.resume.findFirst({
      where: {
        userId,
        status: "DRAFT",
        abandoned: false,
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        inputData: true,
        updatedAt: true,
      },
    });

    if (!latestDraft) {
      return NextResponse.json({ draft: null });
    }

    const parsed = JSON.parse(latestDraft.inputData);
    const { _activeStep, ...formData } = parsed;

    return NextResponse.json({
      draft: {
        id: latestDraft.id,
        formData,
        activeStep: _activeStep || 1,
        updatedAt: latestDraft.updatedAt,
      },
    });
  } catch (err) {
    console.error("[draft GET]", err);
    return NextResponse.json({ draft: null });
  }
}

// POST /api/draft — save or update draft for logged-in user
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { formData, activeStep } = body;

    if (!formData) {
      return NextResponse.json({ error: "No form data provided" }, { status: 400 });
    }

    const inputPayload = JSON.stringify({ ...formData, _activeStep: activeStep || 1 });

    const existingDraft = await prisma.resume.findFirst({
      where: { userId, status: "DRAFT", abandoned: false },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    });

    if (existingDraft) {
      await prisma.resume.update({
        where: { id: existingDraft.id },
        data: {
          inputData: inputPayload,
          targetRole: formData.personal?.targetRole || null,
          branch: formData.personal?.branch || null,
          cgpa: formData.personal?.cgpa || null,
          college: formData.personal?.collegeName || null,
        },
      });
      return NextResponse.json({ success: true, id: existingDraft.id });
    } else {
      const newDraft = await prisma.resume.create({
        data: {
          userId,
          sessionId: `draft_${userId}_${Date.now()}`,
          status: "DRAFT",
          inputData: inputPayload,
          targetRole: formData.personal?.targetRole || null,
          branch: formData.personal?.branch || null,
          cgpa: formData.personal?.cgpa || null,
          college: formData.personal?.collegeName || null,
        },
      });
      return NextResponse.json({ success: true, id: newDraft.id });
    }
  } catch (err) {
    console.error("[draft POST]", err);
    return NextResponse.json({ error: "Failed to save draft" }, { status: 500 });
  }
}

// DELETE /api/draft — discard draft
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    await prisma.resume.updateMany({
      where: { userId, status: "DRAFT", abandoned: false },
      data: { abandoned: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[draft DELETE]", err);
    return NextResponse.json({ error: "Failed to discard draft" }, { status: 500 });
  }
}
