import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const config = await prisma.adminConfig.findUnique({
      where: { id: "admin" }
    });

    if (config) {
      return NextResponse.json({
        bannerText: config.bannerText,
        isBannerActive: config.isBannerActive,
        dynamicPrice: config.dynamicPrice,
        landingVariant: config.landingVariant,
        isFlashOfferActive: config.isFlashOfferActive,
        flashPrice: config.flashPrice,
        isReferralActive: config.isReferralActive,
        invitesRequired: config.invitesRequired,
        activePrice: config.isFlashOfferActive ? config.flashPrice : config.dynamicPrice
      });
    }

    // Default configuration fallback
    return NextResponse.json({
      bannerText: "🚀 Placement Season Hack: Get 20% off unlocked copyable resume formats today only!",
      isBannerActive: true,
      dynamicPrice: 49,
      landingVariant: "minimal",
      isFlashOfferActive: false,
      flashPrice: 39,
      isReferralActive: true,
      invitesRequired: 3,
      activePrice: 49
    });
  } catch (error: any) {
    console.error("Failed to query public config:", error);
    return NextResponse.json({
      bannerText: "🚀 Placement Season Hack: Get 20% off unlocked copyable resume formats today only!",
      isBannerActive: true,
      dynamicPrice: 49,
      landingVariant: "minimal",
      isFlashOfferActive: false,
      flashPrice: 39,
      isReferralActive: true,
      invitesRequired: 3,
      activePrice: 49
    });
  }
}
