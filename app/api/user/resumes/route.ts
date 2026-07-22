import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized access: Please sign in." }, { status: 401 });
    }
    
    // Fetch resumes matching the logged in user email strictly
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        resumes: {
          where: { abandoned: false },
          orderBy: { updatedAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ resumes: [] });
    }

    const resumes = user.resumes;

    const parsedResumes = resumes.map((resume: any) => {
      let atsScore = 85;
      try {
        if (resume.outputFull) {
          const parsed = JSON.parse(resume.outputFull);
          atsScore = parsed.atsScore || 85;
        }
      } catch (err) {
        // Fallback in case of parse error
      }

      return {
        id: resume.id,
        resumeName: resume.resumeName || null,
        targetRole: resume.targetRole || "Software Developer",
        branch: resume.branch || null,
        cgpa: resume.cgpa || "N/A",
        college: resume.college || "N/A",
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
        paymentStatus: resume.paymentStatus,
        status: resume.status,
        inputData: resume.inputData,
        atsScore,
      };
    });

    return NextResponse.json({ resumes: parsedResumes });
  } catch (error) {
    console.error("API /api/user/resumes GET error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while retrieving user dashboard." },
      { status: 500 }
    );
  }
}
