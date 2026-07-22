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
You are a human candidate writing a direct, natural interview/application answer for a job.

CANDIDATE PROFILE DATA:
${profileContext}

TARGET JOB CONTEXT:
Company Name: ${companyName || "Hiring Company"}
Job Role: ${jobRole || "Software Candidate"}

QUESTION TO ANSWER:
"${question}"

STRICT GUIDELINES:
1. SHORT & CLEAR: Keep the answer under 100-120 words total (1-2 short paragraphs). Be concise and direct.
2. PLAIN HUMAN ENGLISH: Write in simple, everyday conversational words (first-person "I"). Sound like a real person talking in an interview or writing a job application form.
3. NO COMPLEX JARGON / ROBOTIC FILLER: Do NOT use complex AI buzzwords or unnatural phrases (avoid "paramount", "testament", "intricate", "culminating in", "rewarding undertaking", etc.). Use simple direct words like "I built", "I solved", "I used", "I improved".
4. NO UNNECESSARY PERSONAL DATA DUMPING: Do NOT start with "As a student at [College]..." or mention CGPA/College unless the question specifically asks for your degree/education background. Focus directly on the question asked.
5. FACTUAL: Use only the candidate's actual projects, skills, or experience from the profile data above. Do not invent details.
6. NO META-TEXT: Output ONLY the exact text ready to copy-paste.
`.trim();

    const answer = await generateLlmText(prompt, { json: false });

    return NextResponse.json({ success: true, answer: answer.trim() });
  } catch (error: any) {
    console.error("AI Assistant error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate answer" }, { status: 500 });
  }
}
