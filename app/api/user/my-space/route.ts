import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        masterProfile: true,
        resumes: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let masterProfile = user.masterProfile;

    // Auto-populate from latest resume if MasterProfile doesn't exist yet!
    if (!masterProfile && user.resumes.length > 0) {
      try {
        const latestResume = user.resumes[0];
        const inputData = JSON.parse(latestResume.inputData || "{}");
        const personal = inputData.personal || {};

        masterProfile = await prisma.masterProfile.create({
          data: {
            userId: user.id,
            fullName: personal.fullName || user.name || "",
            phone: personal.phone || "",
            location: personal.city || personal.location || "",
            college: personal.collegeName || latestResume.college || "",
            branch: personal.branch || latestResume.branch || "",
            cgpa: personal.cgpa || latestResume.cgpa || "",
            summary: inputData.summary || "",
            skillsJson: JSON.stringify(inputData.skills || []),
            projectsJson: JSON.stringify(inputData.projects || []),
            experiencesJson: JSON.stringify(inputData.experience || []),
            certificationsJson: JSON.stringify(inputData.certifications || []),
          },
        });
      } catch (e) {
        console.error("Auto-populate master profile failed:", e);
      }
    }

    return NextResponse.json({
      profile: masterProfile,
      userName: user.name,
      userEmail: user.email,
    });
  } catch (error: any) {
    console.error("Fetch My Space error:", error);
    return NextResponse.json({ error: error.message || "Failed to load My Space" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      fullName,
      phone,
      location,
      college,
      branch,
      cgpa,
      graduationYear,
      summary,
      skillsJson,
      projectsJson,
      experiencesJson,
      certificationsJson,
      customNotes,
    } = body;

    const updatedProfile = await prisma.masterProfile.upsert({
      where: { userId: user.id },
      update: {
        fullName,
        phone,
        location,
        college,
        branch,
        cgpa,
        graduationYear,
        summary,
        skillsJson: typeof skillsJson === "string" ? skillsJson : JSON.stringify(skillsJson || []),
        projectsJson: typeof projectsJson === "string" ? projectsJson : JSON.stringify(projectsJson || []),
        experiencesJson: typeof experiencesJson === "string" ? experiencesJson : JSON.stringify(experiencesJson || []),
        certificationsJson: typeof certificationsJson === "string" ? certificationsJson : JSON.stringify(certificationsJson || []),
        customNotes,
      },
      create: {
        userId: user.id,
        fullName: fullName || user.name || "",
        phone,
        location,
        college,
        branch,
        cgpa,
        graduationYear,
        summary,
        skillsJson: typeof skillsJson === "string" ? skillsJson : JSON.stringify(skillsJson || []),
        projectsJson: typeof projectsJson === "string" ? projectsJson : JSON.stringify(projectsJson || []),
        experiencesJson: typeof experiencesJson === "string" ? experiencesJson : JSON.stringify(experiencesJson || []),
        certificationsJson: typeof certificationsJson === "string" ? certificationsJson : JSON.stringify(certificationsJson || []),
        customNotes,
      },
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error: any) {
    console.error("Update My Space error:", error);
    return NextResponse.json({ error: error.message || "Failed to save My Space" }, { status: 500 });
  }
}
