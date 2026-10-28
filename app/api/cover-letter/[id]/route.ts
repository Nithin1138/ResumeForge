import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const coverLetter = await prisma.coverLetter.findUnique({ where: { id } });
    if (!coverLetter) {
      return NextResponse.json({ error: "Cover letter not found." }, { status: 404 });
    }

    const userId = (session.user as any).id;
    if (coverLetter.userId && coverLetter.userId !== userId) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    await prisma.coverLetter.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Delete failed" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const coverLetter = await prisma.coverLetter.findUnique({ where: { id } });
    if (!coverLetter) {
      return NextResponse.json({ error: "Cover letter not found." }, { status: 404 });
    }

    const userId = (session.user as any).id;
    if (coverLetter.userId && coverLetter.userId !== userId) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const body = await req.json();
    const { categoryTag, companyName, targetRole } = body;

    const updated = await prisma.coverLetter.update({
      where: { id },
      data: {
        ...(categoryTag !== undefined && { categoryTag: categoryTag || "blue" }),
        ...(companyName !== undefined && { companyName }),
        ...(targetRole !== undefined && { targetRole }),
      },
    });

    return NextResponse.json({ success: true, coverLetter: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Update failed" }, { status: 500 });
  }
}
