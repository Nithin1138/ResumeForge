import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const userSession = await getSessionUser(req);
    if (!userSession) {
      return NextResponse.json({ error: "Unauthorized access: Please sign in." }, { status: 401 });
    }

    // Intelligent query: Fetch by active userId OR find guest resumes matched to candidate email
    const resumes = await prisma.resume.findMany({
      where: {
        OR: [
          { userId: userSession.userId },
          {
            inputData: {
              contains: `"email":"${userSession.email}"`,
            },
          },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    const parsedResumes = resumes.map((resume) => {
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
        targetRole: resume.targetRole || "Software Developer",
        cgpa: resume.cgpa || "N/A",
        college: resume.college || "N/A",
        createdAt: resume.createdAt,
        paymentStatus: resume.paymentStatus,
        status: resume.status,
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
