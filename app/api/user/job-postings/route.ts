import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { telegramUser: true },
    });

    if (!user || !user.telegramUser) {
      return NextResponse.json({
        isLinked: false,
        jobPostings: [],
      });
    }

    const jobPostings = await prisma.jobPosting.findMany({
      where: { telegramUserId: user.telegramUser.id },
      orderBy: { createdAt: "desc" },
      include: { reminders: true },
    });

    return NextResponse.json({
      isLinked: true,
      inboundAlias: user.telegramUser.inboundAlias,
      jobPostings,
    });
  } catch (error) {
    console.error("Error in /api/user/job-postings GET:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { postingId, status } = await req.json();

    if (!postingId || !status) {
      return NextResponse.json({ message: "Posting ID and status are required" }, { status: 400 });
    }

    const validStatuses = ["APPLIED", "NOT_ELIGIBLE", "SKIPPED", "MANUAL_REVIEW"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: "Invalid status value" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { telegramUser: true },
    });

    if (!user || !user.telegramUser) {
      return NextResponse.json({ message: "Telegram account not linked" }, { status: 400 });
    }

    // Verify ownership
    const posting = await prisma.jobPosting.findFirst({
      where: { id: postingId, telegramUserId: user.telegramUser.id },
    });

    if (!posting) {
      return NextResponse.json({ message: "Job posting not found" }, { status: 404 });
    }

    const updated = await prisma.jobPosting.update({
      where: { id: postingId },
      data: { status },
    });

    // Cancel pending reminders for this posting if status changed to APPLIED, NOT_ELIGIBLE, or SKIPPED
    if (["APPLIED", "NOT_ELIGIBLE", "SKIPPED"].includes(status)) {
      await prisma.reminder.updateMany({
        where: { jobPostingId: postingId, sent: false },
        data: { sent: true },
      });
    }

    return NextResponse.json({ ok: true, posting: updated });
  } catch (error) {
    console.error("Error in /api/user/job-postings PATCH:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
