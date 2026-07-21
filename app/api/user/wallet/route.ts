import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        walletBalance: true,
        walletTransactions: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get admin discount config
    let discountPercent = 10;
    try {
      const config = await prisma.adminConfig.findUnique({ where: { id: "admin" } });
      if (config && typeof config.walletDiscountPercent === "number") {
        discountPercent = config.walletDiscountPercent;
      }
    } catch (e) {
      console.warn("Failed to load wallet discount config:", e);
    }

    return NextResponse.json({
      balance: user.walletBalance || 0,
      discountPercent,
      transactions: user.walletTransactions || [],
    });
  } catch (error: any) {
    console.error("Fetch wallet error:", error);
    return NextResponse.json({ error: error.message || "Failed to load wallet" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topUpAmount } = await req.json(); // e.g. 100, 200, 500
    const targetCredit = parseInt(topUpAmount, 10);

    if (isNaN(targetCredit) || targetCredit <= 0) {
      return NextResponse.json({ error: "Invalid top-up amount" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch discount percentage from Admin Config
    let discountPercent = 10;
    try {
      const config = await prisma.adminConfig.findUnique({ where: { id: "admin" } });
      if (config && typeof config.walletDiscountPercent === "number") {
        discountPercent = config.walletDiscountPercent;
      }
    } catch {}

    // Calculate discounted payable price
    // e.g., targetCredit = 100, discountPercent = 10 -> payableAmount = 90
    const payableAmount = Math.round(targetCredit * (1 - discountPercent / 100));

    // Top-up transaction & balance update
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        walletBalance: { increment: targetCredit },
        walletTransactions: {
          create: {
            type: "TOPUP",
            amount: targetCredit,
            paidAmount: payableAmount,
            description: `Top-up ₹${targetCredit} (Paid ₹${payableAmount} with ${discountPercent}% Admin Discount)`,
          },
        },
      },
      select: {
        walletBalance: true,
      },
    });

    return NextResponse.json({
      success: true,
      newBalance: updatedUser.walletBalance,
      credited: targetCredit,
      paidAmount: payableAmount,
      discountPercent,
    });
  } catch (error: any) {
    console.error("Top-up wallet error:", error);
    return NextResponse.json({ error: error.message || "Failed to top up wallet" }, { status: 500 });
  }
}
