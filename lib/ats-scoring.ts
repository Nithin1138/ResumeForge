// lib/ats-scoring.ts
import { prisma } from "@/lib/prisma";
import { generateLlmText } from "@/lib/llm";

export const DAILY_ATS_CHECK_LIMIT = 10;

export interface AtsCheckResult {
  id: string;
  userId: string;
  masterProfileId: string | null;
  jobPostingId: string | null;
  overallScore: number;
  keywordGaps: string[];
  structuralIssues: string[];
  contentIssues: string[];
  improvements: Array<{ suggestion: string; relatedTo: string }>;
  strengths: string[];
  createdAt: Date;
}

export interface AtsScoringOutput {
  overall_score: number;
  keyword_gaps: string[];
  structural_issues: string[];
  content_issues: string[];
  improvements: Array<{ suggestion: string; relatedTo: string }>;
  strengths: string[];
}

/**
 * Isolated Prompt Template for ATS Scoring & Gap Analysis.
 * Can be iterated independently from execution logic.
 */
export function buildAtsScoringPrompt(profileDataText: string, jobPostingText?: string): string {
  return `You are an expert ATS (Applicant Tracking System) Auditor and Senior Technical Recruiter.
Analyze the following student resume/profile data against ${
    jobPostingText ? "the provided Job Description (JD)" : "general engineering ATS standards"
  }.

=== STUDENT RESUME / MY SPACE PROFILE DATA ===
${profileDataText}

${
  jobPostingText
    ? `=== TARGET JOB DESCRIPTION (JD) ===
${jobPostingText}`
    : "=== NO SPECIFIC JD PROVIDED (General ATS Readiness Evaluation) ==="
}

INSTRUCTIONS:
1. Provide an overall ATS Match / Quality Score from 0 to 100 based on keyword match, bullet impact, clarity, and structural completeness.
2. Identify missing key skills, frameworks, or domain keywords required by the JD (if no JD, return empty array for keyword_gaps).
3. Identify structural or formatting issues (e.g. missing contact links, summary length, missing section depth).
4. Identify content issues (e.g. unquantified project bullets, weak action verbs, vague descriptions).
5. Provide specific, actionable improvements with the section it relates to (e.g., "Skills", "Projects", "Experience", "Summary", "Academics").
6. Highlight key strengths already aligned well.

STRICT JSON OUTPUT FORMAT (Respond ONLY with valid JSON, no markdown wrappers, no commentary):
{
  "overall_score": 85,
  "keyword_gaps": ["Docker", "Kubernetes", "AWS S3"],
  "structural_issues": ["No LinkedIn or GitHub link provided"],
  "content_issues": ["Project 1 bullet points lack metrics (e.g. latency, users, throughput)"],
  "improvements": [
    { "suggestion": "Highlight TypeScript and REST APIs under Skills to match JD requirements", "relatedTo": "Skills" },
    { "suggestion": "Add quantitative metrics to your backend project description", "relatedTo": "Projects" }
  ],
  "strengths": ["Strong CGPA", "Relevant React and Node.js experience"]
}`;
}

/** Helper to format MasterProfile into a clean readable text representation */
export function formatProfileDataForPrompt(profile: any): string {
  const lines: string[] = [];

  lines.push(`Full Name: ${profile.fullName || "N/A"}`);
  lines.push(`Email: ${profile.email || "N/A"}`);
  lines.push(`College: ${profile.college || "N/A"}`);
  lines.push(`Branch: ${profile.branch || "N/A"}`);
  lines.push(`CGPA: ${profile.cgpa || "N/A"}`);
  lines.push(`Graduation Year: ${profile.graduationYear || "N/A"}`);
  lines.push(`Active Backlogs (Arrears): ${profile.activeBacklogs !== null && profile.activeBacklogs !== undefined ? profile.activeBacklogs : "0"}`);
  lines.push(`Total Backlog History: ${profile.backlogHistory !== null && profile.backlogHistory !== undefined ? profile.backlogHistory : "0"}`);
  lines.push(`Academic Gap Years: ${profile.academicGapYears !== null && profile.academicGapYears !== undefined ? profile.academicGapYears : "0"}`);
  lines.push(`Notice Period: ${profile.noticePeriod || "N/A"}`);

  if (profile.github) lines.push(`GitHub: ${profile.github}`);
  if (profile.linkedin) lines.push(`LinkedIn: ${profile.linkedin}`);
  if (profile.portfolio) lines.push(`Portfolio: ${profile.portfolio}`);

  if (profile.summary) {
    lines.push(`\n--- SUMMARY ---\n${profile.summary}`);
  }

  // Skills
  try {
    const skills = JSON.parse(profile.skillsJson || "[]");
    if (Array.isArray(skills) && skills.length > 0) {
      lines.push(`\n--- SKILLS ---\n${skills.join(", ")}`);
    }
  } catch (e) {}

  // Education
  try {
    const edus = JSON.parse(profile.educationJson || "[]");
    if (Array.isArray(edus) && edus.length > 0) {
      lines.push("\n--- EDUCATION ---");
      edus.forEach((e: any) => {
        lines.push(`- ${e.type || e.degree}: ${e.institution || ""} (${e.branch || ""}) CGPA/Percentage: ${e.cgpaOrPercentage || "N/A"} Year: ${e.graduationYear || ""}`);
      });
    }
  } catch (e) {}

  // Projects
  try {
    const projects = JSON.parse(profile.projectsJson || "[]");
    if (Array.isArray(projects) && projects.length > 0) {
      lines.push("\n--- PROJECTS ---");
      projects.forEach((p: any) => {
        const title = p.title || p.name || "Project";
        const tech = p.techStack || p.technologies || "";
        const desc = p.description || p.details || (Array.isArray(p.bullets) ? p.bullets.join("\n") : "");
        lines.push(`- ${title}${tech ? ` (${tech})` : ""}:\n  ${desc}`);
      });
    }
  } catch (e) {}

  // Experience
  try {
    const exps = JSON.parse(profile.experiencesJson || "[]");
    if (Array.isArray(exps) && exps.length > 0) {
      lines.push("\n--- EXPERIENCE ---");
      exps.forEach((x: any) => {
        const role = x.role || x.position || "Intern/Developer";
        const company = x.company || x.organization || "";
        const desc = x.description || (Array.isArray(x.bullets) ? x.bullets.join("\n") : "");
        lines.push(`- ${role} at ${company}:\n  ${desc}`);
      });
    }
  } catch (e) {}

  // Certifications
  try {
    const certs = JSON.parse(profile.certificationsJson || "[]");
    if (Array.isArray(certs) && certs.length > 0) {
      lines.push(`\n--- CERTIFICATIONS ---\n${certs.map((c: any) => typeof c === "string" ? c : `${c.name} (${c.year || ""})`).join(", ")}`);
    }
  } catch (e) {}

  // Achievements
  try {
    const achs = JSON.parse(profile.achievementsJson || "[]");
    if (Array.isArray(achs) && achs.length > 0) {
      lines.push(`\n--- ACHIEVEMENTS & AWARDS ---\n${achs.join("\n")}`);
    }
  } catch (e) {}

  return lines.join("\n");
}

/** Check user's daily ATS check rate limit */
export async function getDailyAtsCheckCount(userId: string): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  return prisma.atsScoreCheck.count({
    where: {
      userId,
      createdAt: { gte: startOfDay },
    },
  });
}

/**
 * Main Scoring Engine function.
 * Fetches user profile + optional JobPosting, generates ATS analysis via LLM with 1 retry,
 * stores the result in prisma.atsScoreCheck, and returns the record.
 */
export async function runAtsScoreCheck(params: {
  userId: string;
  jobPostingId?: string;
  triggeredBy?: "manual" | "auto_notification";
}): Promise<AtsCheckResult> {
  const { userId, jobPostingId, triggeredBy = "manual" } = params;

  // 1. Enforce Rate Limit
  const dailyCount = await getDailyAtsCheckCount(userId);
  if (dailyCount >= DAILY_ATS_CHECK_LIMIT) {
    throw new Error(`Daily ATS check limit reached (${DAILY_ATS_CHECK_LIMIT}/${DAILY_ATS_CHECK_LIMIT} per day). Please try again tomorrow!`);
  }

  // 2. Fetch MasterProfile (or fallback auto-populate)
  let masterProfile = await prisma.masterProfile.findUnique({
    where: { userId },
  });

  if (!masterProfile) {
    // Attempt auto-populate from latest resume
    const userResumes = await prisma.resume.findMany({
      where: { userId, abandoned: false },
      orderBy: { createdAt: "desc" },
      take: 1,
    });

    if (userResumes.length === 0) {
      throw new Error("NO_RESUME_FOUND");
    }

    // Call /api/user/my-space trigger or fetch again
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { masterProfile: true },
    });
    masterProfile = user?.masterProfile || null;

    if (!masterProfile) {
      throw new Error("NO_RESUME_FOUND");
    }
  }

  // 3. Fetch JobPosting if specified
  let jobPosting: any = null;
  let jobPostingText = "";
  if (jobPostingId) {
    jobPosting = await prisma.jobPosting.findUnique({
      where: { id: jobPostingId },
    });

    if (jobPosting) {
      jobPostingText = `Company: ${jobPosting.companyName}
Role: ${jobPosting.roleTitle}
Package Details: ${jobPosting.packageDetails || "N/A"}
Eligibility / Criteria: ${jobPosting.eligibilityCriteria || "N/A"}

Full Description:
${jobPosting.rawEmailText}`;
    }
  }

  // 4. Format Profile Data
  const profileText = formatProfileDataForPrompt(masterProfile);

  // 5. LLM Call with 1 Retry mechanism
  const prompt = buildAtsScoringPrompt(profileText, jobPostingText || undefined);
  let parsedOutput: AtsScoringOutput | null = null;
  let lastError: string | null = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const responseText = await generateLlmText(prompt, { json: true });
      const cleanJson = responseText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      const data = JSON.parse(cleanJson);

      if (typeof data.overall_score === "number") {
        parsedOutput = {
          overall_score: Math.min(100, Math.max(0, Math.round(data.overall_score))),
          keyword_gaps: Array.isArray(data.keyword_gaps) ? data.keyword_gaps.map(String) : [],
          structural_issues: Array.isArray(data.structural_issues) ? data.structural_issues.map(String) : [],
          content_issues: Array.isArray(data.content_issues) ? data.content_issues.map(String) : [],
          improvements: Array.isArray(data.improvements)
            ? data.improvements.map((item: any) => ({
                suggestion: String(item.suggestion || item.text || item || ""),
                relatedTo: String(item.relatedTo || item.section || "General"),
              }))
            : [],
          strengths: Array.isArray(data.strengths) ? data.strengths.map(String) : [],
        };
        break;
      }
    } catch (err: any) {
      lastError = err?.message || String(err);
      console.warn(`[ats-scoring] Attempt ${attempt} failed:`, lastError);
    }
  }

  if (!parsedOutput) {
    throw new Error(`Scoring engine error: Unable to parse structured ATS score output. (${lastError || "Unknown error"})`);
  }

  // 6. Save check to Database
  const createdCheck = await prisma.atsScoreCheck.create({
    data: {
      userId,
      masterProfileId: masterProfile.id,
      jobPostingId: jobPosting?.id || null,
      overallScore: parsedOutput.overall_score,
      keywordGaps: JSON.stringify(parsedOutput.keyword_gaps),
      structuralIssues: JSON.stringify(parsedOutput.structural_issues),
      contentIssues: JSON.stringify(parsedOutput.content_issues),
      improvements: JSON.stringify(parsedOutput.improvements),
      strengths: JSON.stringify(parsedOutput.strengths),
      triggeredBy,
    },
  });

  return {
    id: createdCheck.id,
    userId: createdCheck.userId,
    masterProfileId: createdCheck.masterProfileId,
    jobPostingId: createdCheck.jobPostingId,
    overallScore: createdCheck.overallScore,
    keywordGaps: parsedOutput.keyword_gaps,
    structuralIssues: parsedOutput.structural_issues,
    contentIssues: parsedOutput.content_issues,
    improvements: parsedOutput.improvements,
    strengths: parsedOutput.strengths,
    createdAt: createdCheck.createdAt,
  };
}
