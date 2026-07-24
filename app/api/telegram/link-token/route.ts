import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getInboundAlias } from "@/lib/telegram";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const userId = user.id;

    // Check if already linked
    const existingLink = await prisma.telegramUser.findUnique({
      where: { userId },
    });

    if (existingLink) {
      return NextResponse.json({
        isLinked: true,
        inboundAlias: existingLink.inboundAlias,
        telegramChatId: existingLink.telegramChatId,
        telegramUsername: existingLink.telegramUsername,
        gmailVerificationCode: existingLink.gmailVerificationCode,
        gmailVerificationLink: existingLink.gmailVerificationLink,
        botUsername: process.env.TELEGRAM_BOT_USERNAME || "ATSLiftBot",
      });
    }

    // Ensure static, un-expiring user telegramLinkCode for seamless experience
    let linkCode = user.telegramLinkCode;

    if (!linkCode) {
      linkCode = Math.floor(100000 + Math.random() * 900000).toString();
      await prisma.user.update({
        where: { id: userId },
        data: { telegramLinkCode: linkCode },
      });
    }

    // Sync to verificationToken table with generous 24h expiration
    const tokenIdentifier = `${userId}:telegram-link`;
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.deleteMany({
      where: { identifier: tokenIdentifier },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: tokenIdentifier,
        token: linkCode,
        expires,
      },
    });

    const botUsername = process.env.TELEGRAM_BOT_USERNAME || "ATSLiftBot";
    const deepLinkUrl = `https://t.me/${botUsername}?start=${linkCode}`;

    return NextResponse.json({
      isLinked: false,
      linkToken: linkCode,
      deepLinkUrl,
      botUsername,
      expectedAlias: getInboundAlias(userId),
    });
  } catch (error) {
    console.error("Error in /api/telegram/link-token:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
