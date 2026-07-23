import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getInboundAlias } from "@/lib/telegram";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { linkToken } = await req.json();

    if (!linkToken) {
      return NextResponse.json({ message: "Link token is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Verify token
    const verToken = await prisma.verificationToken.findFirst({
      where: {
        token: linkToken,
        expires: { gt: new Date() },
      },
    });

    if (!verToken) {
      return NextResponse.json({ message: "Invalid or expired link token" }, { status: 400 });
    }

    const inboundAlias = getInboundAlias(user.id);
    const mockChatId = `dev_chat_${user.id.slice(-6)}`;

    // Upsert TelegramUser in DB
    const tgUser = await prisma.telegramUser.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        telegramChatId: mockChatId,
        telegramUsername: "dev_candidate",
        inboundAlias,
      },
      update: {
        telegramChatId: mockChatId,
        telegramUsername: "dev_candidate",
        inboundAlias,
      },
    });

    // Delete token
    await prisma.verificationToken.deleteMany({
      where: { identifier: verToken.identifier },
    });

    return NextResponse.json({
      ok: true,
      message: `[Dev Mode] Successfully simulated /start. Linked account to ${inboundAlias}`,
      telegramUser: tgUser,
    });
  } catch (error) {
    console.error("Error in dev simulate endpoint:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
