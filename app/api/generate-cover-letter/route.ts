import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateLlmText, hasLlmConfigured } from "@/lib/llm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      resumeId,
      companyName,
      targetRole,
      tone,
      jobDescription,
      inputData: rawInputData,
      directCandidateDetails,
    } = body;

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

    const personal = inputData?.personal || directCandidateDetails || {};
    const candidateName = personal.fullName || directCandidateDetails?.fullName || "Aarav Sharma";
    const candidateRole = targetRole || personal.targetRole || directCandidateDetails?.targetRole || "Software Development Engineer";
    const candidateCollege = personal.collegeName || directCandidateDetails?.collegeName || "Engineering Institute";
    const candidateBranch = personal.branch || directCandidateDetails?.branch || "Computer Science & Engineering";
    const candidateSkills = directCandidateDetails?.skills || "";
    const candidateProject = directCandidateDetails?.topProject || "";

    const company = companyName || "Target Company";
    const selectedTone = tone || "Professional & Executive";

    // Extract top projects & experience details
    const projects = inputData?.projects || [];
    const internships = inputData?.internships || [];

    const topProject = projects[0]?.title
      ? `${projects[0].title} (${projects[0].techStack || ""}): ${projects[0].description || ""}`
      : candidateProject;
    const secondProject = projects[1]?.title
      ? `${projects[1].title} (${projects[1].techStack || ""}): ${projects[1].description || ""}`
      : "";
    const topInternship = internships[0]?.company
      ? `${internships[0].role} at ${internships[0].company}: ${internships[0].workDone || ""}`
      : "";

    const prompt = `
SYSTEM:
You are an expert ATS cover letter writer specializing in software engineering candidates and tech job applications.
Your task is to generate a highly polished, professional 3-paragraph ATS cover letter for a candidate applying to a specific company.

CRITICAL INSTRUCTIONS:
1. NEVER use brackets, placeholders, or meta-comments like "[mention a generic positive aspect]", "[insert skills here]", or "Candidate". Always write complete, elegant, realistic sentences.
2. Tone must strictly match: "${selectedTone}".
3. Keep each paragraph concise (3-4 sentences max) to fit neatly on a single-page document.
4. Structure MUST be formatted as JSON with exactly these fields:
   - "recipient": String (e.g. "Hiring Manager")
   - "company": String (Target Company Name)
   - "subject": String (Application subject line, e.g. "Application for ${candidateRole} Position — ${candidateName}")
   - "salutation": String (e.g. "Dear Hiring Team at ${company},")
   - "openingParagraph": String (Paragraph 1: Clear hook expressing genuine interest in the ${candidateRole} role at ${company}, introducing candidate's background in ${candidateBranch} from ${candidateCollege}.)
   - "bodyParagraph": String (Paragraph 2: Highlight core technical accomplishments, system architecture skills, or key engineering projects, proving capability and metric-driven impact.)
   - "closingParagraph": String (Paragraph 3: Reiteration of value add, alignment with ${company}'s engineering culture, and a proactive call to action for an interview.)
   - "signOff": String (e.g. "Sincerely,\n${candidateName}")

CANDIDATE DETAILS:
Name: ${candidateName}
Target Role: ${candidateRole}
College: ${candidateCollege}
Branch: ${candidateBranch}
Target Company: ${company}
${topProject ? `Top Project: ${topProject}` : ""}
${secondProject ? `Additional Project: ${secondProject}` : ""}
${topInternship ? `Experience: ${topInternship}` : ""}
${candidateSkills ? `Skills: ${candidateSkills}` : ""}
${jobDescription ? `Job Description Keywords: ${jobDescription}` : ""}

Return ONLY raw valid JSON matching the schema described. No markdown formatting, no triple backticks.
`;

    let coverLetterData;

    if (!hasLlmConfigured()) {
      // Mock Fallback Cover Letter
      coverLetterData = {
        recipient: "Hiring Team",
        company: company,
        subject: `Application for ${candidateRole} Position — ${candidateName}`,
        salutation: `Dear Hiring Team at ${company},`,
        openingParagraph: `I am writing to express my strong interest in the ${candidateRole} position at ${company}. Having closely followed ${company}'s technical innovations, I am eager to bring my background in ${candidateBranch} from ${candidateCollege} to your engineering team.`,
        bodyParagraph: `During my academic coursework and hands-on project work, I developed scalable applications utilizing modern frameworks, system design principles, and database management. I focused on building robust APIs, optimizing backend throughput, and implementing clean software architectures that deliver reliable user experiences.`,
        closingParagraph: `I am excited about the opportunity to contribute my technical foundation and problem-solving drive to ${company}. Thank you for your time and consideration; I look forward to discussing how my background aligns with your engineering goals.`,
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
