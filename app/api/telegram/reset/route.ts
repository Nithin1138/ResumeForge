import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST() {
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

    // Generate new unique link code and fresh random suffix for inbound alias
    const newLinkCode = Math.floor(100000 + Math.random() * 900000).toString();
    const randomSuffix = crypto.randomBytes(4).toString("hex"); // e.g. "a1b2c3d4"
    const newInboundAlias = `jd_${user.id.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().slice(0, 8)}_${randomSuffix}@atslift.app`;

    // Reset TelegramUser connection & clear pending verification state
    await prisma.telegramUser.deleteMany({
      where: { userId: user.id },
    });

    // Update user record with new telegramLinkCode
    await prisma.user.update({
      where: { id: user.id },
      data: { telegramLinkCode: newLinkCode },
    });

    return NextResponse.json({
      ok: true,
      message: "Reset successfully. Telegram connection cleared & fresh alias generated.",
      newLinkCode,
      newInboundAlias,
    });
  } catch (error) {
    console.error("[Telegram Reset API Error]:", error);
    return NextResponse.json(
      { message: "Failed to reset automation state" },
      { status: 500 }
    );
  }
}
