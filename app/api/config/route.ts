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
        activePrice: config.isFlashOfferActive ? config.flashPrice : config.dynamicPrice,
        // Dynamic CMS fields
        heroHeadline: (config as any).heroHeadline || "Your Projects Are Gold. Your Resume Doesn't Show It.",
        heroSubheadline: (config as any).heroSubheadline || "Turn your CGPA, branch-specific skills, and raw projects into ATS-ready, recruiter-approved resume content in 2 minutes.",
        ctaText: (config as any).ctaText || "Build Resume Free",
        badgeText: (config as any).badgeText || "Built for Indian Engineering Students",
        testimonialsJson: (config as any).testimonialsJson || "[]",
        faqsJson: (config as any).faqsJson || "[]"
      });
    }

    // Default configuration fallback
    return NextResponse.json({
      bannerText: "🔥 Placement Season: Use our ATS-friendly templates to get noticed.",
      isBannerActive: true,
      dynamicPrice: 49,
      landingVariant: "minimal",
      isFlashOfferActive: false,
      flashPrice: 39,
      isReferralActive: true,
      invitesRequired: 3,
      activePrice: 49,
      heroHeadline: "Your Projects Are Gold. Your Resume Doesn't Show It.",
      heroSubheadline: "Turn your CGPA, branch-specific skills, and raw projects into ATS-ready, recruiter-approved resume content in 2 minutes.",
      ctaText: "Build Resume Free",
      badgeText: "Built for Indian Engineering Students",
      testimonialsJson: "[]",
      faqsJson: "[]"
    });
  } catch (error: any) {
    console.error("Failed to query public config:", error);
    return NextResponse.json({
      bannerText: "🔥 Placement Season: Use our ATS-friendly templates to get noticed.",
      isBannerActive: true,
      dynamicPrice: 49,
      landingVariant: "minimal",
      isFlashOfferActive: false,
      flashPrice: 39,
      isReferralActive: true,
      invitesRequired: 3,
      activePrice: 49,
      heroHeadline: "Your Projects Are Gold. Your Resume Doesn't Show It.",
      heroSubheadline: "Turn your CGPA, branch-specific skills, and raw projects into ATS-ready, recruiter-approved resume content in 2 minutes.",
      ctaText: "Build Resume Free",
      badgeText: "Built for Indian Engineering Students",
      testimonialsJson: "[]",
      faqsJson: "[]"
    });
  }
}
