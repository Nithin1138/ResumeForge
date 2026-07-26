import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST() {
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
      return NextResponse.json({ message: "Telegram account not linked" }, { status: 404 });
    }

    const tgUser = user.telegramUser;

    // Clear verification fields in DB
    await prisma.telegramUser.update({
      where: { id: tgUser.id },
      data: {
        gmailVerificationCode: null,
        gmailVerificationLink: null,
      },
    });

    // Send confirmation message to Telegram
    const confirmMsg = `🎉 <b>Gmail Auto-Forwarding Verified!</b>\n\nYour placement email alias <code>${tgUser.inboundAlias}</code> is now verified. Automated placement drive alerts and 3-day / 1-day reminders are active!`;

    await sendTelegramMessage(tgUser.telegramChatId, confirmMsg);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error in /api/telegram/verify-gmail-forwarding:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
