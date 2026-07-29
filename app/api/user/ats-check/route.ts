import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runAtsScoreCheck, getDailyAtsCheckCount, DAILY_ATS_CHECK_LIMIT } from "@/lib/ats-scoring";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized access: Please sign in." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { masterProfile: true, resumes: { take: 1 } },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hasProfileOrResume = !!user.masterProfile || user.resumes.length > 0;

    const url = new URL(req.url);
    const jobPostingId = url.searchParams.get("jobPostingId");

    const whereCondition: any = { userId: user.id };
    if (jobPostingId) {
      whereCondition.jobPostingId = jobPostingId;
    }

    const checks = await prisma.atsScoreCheck.findMany({
      where: whereCondition,
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        jobPosting: {
          select: { companyName: true, roleTitle: true },
        },
      },
    });

    const dailyCount = await getDailyAtsCheckCount(user.id);

    const formattedChecks = checks.map((c: any) => {
      let keywordGaps: string[] = [];
      let structuralIssues: string[] = [];
      let contentIssues: string[] = [];
      let improvements: any[] = [];
      let strengths: string[] = [];

      try { keywordGaps = JSON.parse(c.keywordGaps || "[]"); } catch (e) {}
      try { structuralIssues = JSON.parse(c.structuralIssues || "[]"); } catch (e) {}
      try { contentIssues = JSON.parse(c.contentIssues || "[]"); } catch (e) {}
      try { improvements = JSON.parse(c.improvements || "[]"); } catch (e) {}
      try { strengths = JSON.parse(c.strengths || "[]"); } catch (e) {}

      return {
        id: c.id,
        jobPostingId: c.jobPostingId,
        companyName: c.jobPosting?.companyName || "General ATS Check",
        roleTitle: c.jobPosting?.roleTitle || "Overall Profile",
        overallScore: c.overallScore,
        keywordGaps,
        structuralIssues,
        contentIssues,
        improvements,
        strengths,
        createdAt: c.createdAt,
      };
    });

    return NextResponse.json({
      hasResumeInMySpace: hasProfileOrResume,
      dailyCount,
      dailyLimit: DAILY_ATS_CHECK_LIMIT,
      checks: formattedChecks,
    });
  } catch (error: any) {
    console.error("GET /api/user/ats-check error:", error);
    return NextResponse.json({ error: error.message || "Failed to load score checks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized access: Please sign in." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const { jobPostingId } = body;

    const result = await runAtsScoreCheck({
      userId: user.id,
      jobPostingId: jobPostingId || undefined,
    });

    return NextResponse.json({ success: true, check: result });
  } catch (error: any) {
    console.error("POST /api/user/ats-check error:", error);

    if (error.message === "NO_RESUME_FOUND") {
      return NextResponse.json(
        { error: "NO_RESUME_FOUND", message: "Please add a resume or profile details to My Space before checking your ATS score." },
        { status: 400 }
      );
    }

    if (error.message?.includes("limit reached")) {
      return NextResponse.json(
        { error: "RATE_LIMIT", message: error.message },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to analyze ATS score." },
      { status: 500 }
    );
  }
}
