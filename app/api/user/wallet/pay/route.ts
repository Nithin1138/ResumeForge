import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeId } = await req.json();
    if (!resumeId) {
      return NextResponse.json({ error: "Missing parameter: resumeId" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Determine price
    let priceInRupees = 49;
    try {
      const inputData = JSON.parse(resume.inputData || "{}");
      if (inputData.options?.projectVariants === "3 versions") {
        priceInRupees = 99;
      } else {
        const config = await prisma.adminConfig.findUnique({ where: { id: "admin" } });
        if (config) {
          priceInRupees = config.isFlashOfferActive ? config.flashPrice : config.dynamicPrice;
        }
      }
    } catch {}

    if (user.walletBalance < priceInRupees) {
      return NextResponse.json(
        { error: `Insufficient wallet balance. Available: ₹${user.walletBalance}, Required: ₹${priceInRupees}` },
        { status: 400 }
      );
    }

    // Deduct wallet balance and unlock resume
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          walletBalance: { decrement: priceInRupees },
          walletTransactions: {
            create: {
              type: "SPEND",
              amount: priceInRupees,
              paidAmount: 0,
              description: `Unlocked Resume Output #${resume.id.substring(0, 6)}`,
            },
          },
        },
      }),
      prisma.resume.update({
        where: { id: resumeId },
        data: {
          status: "PAID",
          paymentStatus: "PAID",
          amountPaid: priceInRupees * 100,
        },
      }),
    ]);

    return NextResponse.json({ success: true, pricePaid: priceInRupees });
  } catch (error: any) {
    console.error("Wallet pay error:", error);
    return NextResponse.json({ error: error.message || "Wallet payment failed" }, { status: 500 });
  }
}
