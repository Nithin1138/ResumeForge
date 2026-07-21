import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateLlmText, hasLlmConfigured } from "@/lib/llm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeId, companyName, targetRole, tone, jobDescription, inputData: rawInputData } = body;

    let inputData = rawInputData;

    // Fetch from database if resumeId is provided
    if (resumeId && !inputData) {
      const resume = await prisma.resume.findUnique({
        where: { id: resumeId },
      });
      if (resume?.inputData) {
        inputData = typeof resume.inputData === "string" ? JSON.parse(resume.inputData) : resume.inputData;
      }
    }

    const personal = inputData?.personal || {};
    const candidateName = personal.fullName || "Candidate";
    const candidateRole = targetRole || personal.targetRole || "Software Engineer";
    const candidateCollege = personal.collegeName || "Engineering Institute";
    const candidateBranch = personal.branch || "Computer Science";
    const company = companyName || "Target Company";
    const selectedTone = tone || "Professional & Executive";

    // Extract top projects & experience details
    const projects = inputData?.projects || [];
    const internships = inputData?.internships || [];

    const topProject = projects[0]?.title ? `${projects[0].title} (${projects[0].techStack || ""}): ${projects[0].description || ""}` : "";
    const secondProject = projects[1]?.title ? `${projects[1].title} (${projects[1].techStack || ""}): ${projects[1].description || ""}` : "";
    const topInternship = internships[0]?.company ? `${internships[0].role} at ${internships[0].company}: ${internships[0].workDone || ""}` : "";

    const prompt = `
SYSTEM:
You are an expert ATS cover letter writer specializing in engineering candidates and tech applications.
Your job is to generate a highly convincing, tailored 3-paragraph ATS cover letter for a candidate applying to a specific company.

HARD RULES:
1. Do NOT fabricate fake experience. Base highlights strictly on candidate's provided background.
2. Tone must match: "${selectedTone}".
3. Structure MUST be formatted as JSON with exactly these fields:
   - "recipient": String (e.g. "Hiring Manager")
   - "company": String (Target Company)
   - "subject": String (Application subject line)
   - "salutation": String (e.g. "Dear Hiring Team at ${company},")
   - "openingParagraph": String (Paragraph 1: Clear hook expressing interest in the ${candidateRole} role at ${company}, introducing candidate's ${candidateBranch} background from ${candidateCollege}.)
   - "bodyParagraph": String (Paragraph 2: Deep dive into 1-2 key technical accomplishments, projects, or internships, proving capability and metric-driven engineering impact.)
   - "closingParagraph": String (Paragraph 3: Reiteration of value add, enthusiasm for ${company}'s team culture/goals, and call to action for an interview.)
   - "signOff": String (e.g. "Sincerely,\n${candidateName}")

CANDIDATE DETAILS:
Name: ${candidateName}
Target Role: ${candidateRole}
College: ${candidateCollege}
Branch: ${candidateBranch}
Target Company: ${company}
${topProject ? `Top Project 1: ${topProject}` : ""}
${secondProject ? `Top Project 2: ${secondProject}` : ""}
${topInternship ? `Experience: ${topInternship}` : ""}
${jobDescription ? `Job Description: ${jobDescription}` : ""}

Return ONLY raw valid JSON matching the schema described. No markdown, no triple backticks.
`;

    let coverLetterData;

    if (!hasLlmConfigured()) {
      // Mock Fallback Cover Letter
      coverLetterData = {
        recipient: "Hiring Team",
        company: company,
        subject: `Application for ${candidateRole} Position — ${candidateName}`,
        salutation: `Dear Hiring Team at ${company},`,
        openingParagraph: `I am writing to express my strong interest in the ${candidateRole} position at ${company}. As a final-year ${candidateBranch} student at ${candidateCollege}, I have built a solid foundation in modern software development and system architecture.`,
        bodyParagraph: `During my academic coursework and project development, I built ${projects[0]?.title || "high-throughput applications"} using ${projects[0]?.techStack || "React, Node.js, and SQL"}. I focused on optimizing request latencies, automating deployment pipelines, and crafting clean, scalable code that delivers measurable technical results.`,
        closingParagraph: `I am eager to bring my problem-solving drive and technical execution to the engineering team at ${company}. Thank you for your time and consideration; I look forward to discussing how my background aligns with your team's goals.`,
        signOff: `Sincerely,\n${candidateName}`
      };
    } else {
      const responseText = await generateLlmText(prompt, { json: true });
      let cleanedText = responseText.trim();
      if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
      }
      coverLetterData = JSON.parse(cleanedText);
    }

    return NextResponse.json({ success: true, coverLetter: coverLetterData });
  } catch (error: any) {
    console.error("Cover Letter Generation Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate cover letter." },
      { status: 500 }
    );
  }
}
