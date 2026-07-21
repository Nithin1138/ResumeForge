import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateLlmText } from "@/lib/llm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { question, companyName, jobRole } = await req.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Application question is required" }, { status: 400 });
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

    let profileContext = "";
    const mp = user.masterProfile;

    if (mp) {
      profileContext = `
Candidate Name: ${mp.fullName || user.name || "Candidate"}
Phone: ${mp.phone || "N/A"}
Location: ${mp.location || "N/A"}
GitHub: ${mp.github || "N/A"}
LinkedIn: ${mp.linkedin || "N/A"}
Notice Period: ${mp.noticePeriod || "Immediate"}
College: ${mp.college || "Engineering College"}
Branch: ${mp.branch || "Computer Science / Engineering"}
CGPA: ${mp.cgpa || "N/A"}
Graduation Year: ${mp.graduationYear || "2025"}
Summary: ${mp.summary || "Motivated engineering candidate with strong technical foundations."}
Technical Skills: ${mp.skillsJson}
Projects: ${mp.projectsJson}
Experience: ${mp.experiencesJson}
Certifications: ${mp.certificationsJson}
Custom Fields & Key-Value Details: ${mp.customFieldsJson}
Custom Achievements & Notes: ${mp.customNotes || "None"}
      `.trim();
    } else if (user.resumes.length > 0) {
      const latest = user.resumes[0];
      profileContext = `
Candidate Name: ${user.name || "Candidate"}
Target Role: ${latest.targetRole || "Software Engineer"}
College: ${latest.college || "Engineering Institute"}
Branch: ${latest.branch || "Engineering"}
CGPA: ${latest.cgpa || "N/A"}
Resume Data: ${latest.inputData}
      `.trim();
    } else {
      profileContext = `
Candidate Name: ${user.name || session.user.email?.split("@")[0]}
Email: ${user.email}
      `.trim();
    }

    const prompt = `
You are the ATSLift Candidate Application Copilot. A candidate is applying for a job and needs to answer a company application form question.

CANDIDATE MASTER PROFILE DATA:
${profileContext}

TARGET CONTEXT:
Company Name: ${companyName || "Target Hiring Company"}
Job Role: ${jobRole || "Engineering Role"}

QUESTION TO ANSWER:
"${question}"

INSTRUCTIONS:
1. Write a compelling, highly professional, first-person ("I") answer tailored specifically to this job application question.
2. Directly integrate facts from the candidate's real profile above (their specific college, branch, CGPA, technical skills, projects, and achievements).
3. Do NOT hallucinate skills or projects not mentioned in their profile context.
4. Keep the output clean, polished, structured with natural paragraphs, and directly ready to copy-paste into an application text box.
5. Do NOT include meta-commentary like "Here is your response:". Just provide the exact response text.
    `.trim();

    const answer = await generateLlmText(prompt, { json: false });

    return NextResponse.json({ success: true, answer: answer.trim() });
  } catch (error: any) {
    console.error("AI Assistant error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate answer" }, { status: 500 });
  }
}
