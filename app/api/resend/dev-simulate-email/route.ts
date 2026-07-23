import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
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
      return NextResponse.json({ message: "Telegram account not linked yet." }, { status: 400 });
    }

    // Call internal Resend Inbound endpoint with mock placement email payload
    const mockEmailPayload = {
      type: "email.received",
      data: {
        email_id: "mock_test_id_" + Date.now(),
        from: "cdc@placement.ac.in",
        to: [user.telegramUser.inboundAlias],
        subject: "Fwd: Placement Drive: Amazon SDE 2026 Batch",
        text: `
Dear Students,

Campus Recruitment Drive for Amazon SDE 2026 is now open!

Company Name: Amazon
Role Title: Software Development Engineer (SDE)
Eligible Branches: B.Tech CSE, IT, ECE, EEE
CGPA Cutoff: 7.5 CGPA or 75%
Backlog Policy: No active backlogs

Application Deadline: 2026-08-30T23:59:00Z
Drive Date: 2026-09-05T09:00:00Z

Instructions: Make sure to apply on ATSLift before the deadline!
        `,
      },
    };

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";

    const inboundRes = await fetch(`${protocol}://${host}/api/resend/inbound`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockEmailPayload),
    });

    const inboundResult = await inboundRes.json();

    return NextResponse.json({
      ok: true,
      message: "Successfully simulated receiving a Placement Drive email!",
      inboundResult,
    });
  } catch (error) {
    console.error("Error in dev simulate email endpoint:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
