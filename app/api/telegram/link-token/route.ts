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
        botUsername: process.env.TELEGRAM_BOT_USERNAME || "ATSLiftBot",
      });
    }

    // Generate or reuse linking token
    const tokenIdentifier = `${userId}:telegram-link`;
    const tokenValue = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    await prisma.verificationToken.deleteMany({
      where: { identifier: tokenIdentifier },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: tokenIdentifier,
        token: tokenValue,
        expires,
      },
    });

    const botUsername = process.env.TELEGRAM_BOT_USERNAME || "ATSLiftBot";
    const deepLinkUrl = `https://t.me/${botUsername}?start=${tokenValue}`;

    return NextResponse.json({
      isLinked: false,
      linkToken: tokenValue,
      deepLinkUrl,
      botUsername,
      expectedAlias: getInboundAlias(userId),
    });
  } catch (error) {
    console.error("Error in /api/telegram/link-token:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
