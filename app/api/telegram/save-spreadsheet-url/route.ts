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

    const { url } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Update the syncSpreadsheetUrl on the TelegramUser linked to this user
    const updated = await prisma.telegramUser.update({
      where: { userId: user.id },
      data: {
        syncSpreadsheetUrl: url || null,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Spreadsheet URL saved successfully",
      syncSpreadsheetUrl: updated.syncSpreadsheetUrl,
    });
  } catch (error) {
    console.error("[Save Spreadsheet URL Error]:", error);
    return NextResponse.json(
      { message: "Failed to save spreadsheet URL" },
      { status: 500 }
    );
  }
}
