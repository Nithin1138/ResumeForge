import { FullResumeOutput } from "@/types/resume";
import { MAX_SKILL_LINE_CHARS } from "@/lib/atsFormatting";

const MAX_TECH_STACK_CHARS = 75;

export interface CalculatedMetrics {
  atsScore: number;
  breakdown: {
    keywordMatch: number; // /30
    atsCompatibility: number; // /25
    technicalStrength: number; // /15
    projectQuality: number; // /15
    recruiterReadability: number; // /10
    experienceCredibility: number; // /5
  };
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
}

export function calculateDynamicMetrics(
  resume: FullResumeOutput,
  targetRole: string
): CalculatedMetrics {
  let keywordMatch = 0;
  let atsCompatibility = 0;
  let technicalStrength = 0;
  let projectQuality = 0;
  let recruiterReadability = 0;
  let experienceCredibility = 0;

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const improvements: string[] = [];

  const rawText = JSON.stringify(resume).toLowerCase();
  const roleLower = (targetRole || "software engineer").toLowerCase();

  // 1. ATS Compatibility (Max 25)
  if (resume.summary && resume.summary.trim().length > 30) {
    atsCompatibility += 10;
    strengths.push("Professional summary is present and adequately detailed.");
  } else {
    weaknesses.push("Missing or overly brief professional summary.");
    improvements.push("Add a compelling 2-3 sentence professional summary highlighting your top skills.");
  }

  if (resume.projects && resume.projects.length > 0) {
    atsCompatibility += 10;
  } else {
    weaknesses.push("No projects found.");
    improvements.push("Add at least 1-2 relevant projects to demonstrate practical experience.");
  }

  if (resume.skills && resume.skills.length > 0) {
    atsCompatibility += 5;

    const skillLinesOk = resume.skills.every((cat) => {
      const line = (cat.skills || []).join(", ");
      return line.length <= MAX_SKILL_LINE_CHARS;
    });
    const techStacksOk = (resume.projects || []).every(
      (p) => (p.techStack || "").length <= MAX_TECH_STACK_CHARS
    );

    if (skillLinesOk && techStacksOk) {
      atsCompatibility = Math.max(atsCompatibility, 24);
      strengths.push("Skills and tech stacks are formatted for reliable ATS parsing.");
    } else {
      weaknesses.push("Some skill lines or tech stacks are too long for ATS parsers.");
      improvements.push("Limit each skill category to a short comma-separated list and cap project tech stacks to 4–6 tools.");
    }
  } else {
    weaknesses.push("Skills section is missing.");
    improvements.push("Add a categorized skills section for better ATS parsing.");
  }

  // 2. Keyword Match (Max 30)
  const roleKeywords = roleLower.split(/[\s,/-]+/).filter(w => w.length > 3);
  let keywordsFound = 0;
  if (roleKeywords.length > 0) {
    roleKeywords.forEach(kw => {
      if (rawText.includes(kw)) keywordsFound++;
    });
    const keywordRatio = keywordsFound / roleKeywords.length;
    keywordMatch = Math.floor(keywordRatio * 20); // base up to 20
  } else {
    keywordMatch = 15;
  }
  
  if (resume.summary && resume.summary.toLowerCase().includes(roleLower)) {
    keywordMatch = Math.min(30, keywordMatch + 10);
  } else {
    keywordMatch = Math.min(30, keywordMatch + 5);
  }

  if (keywordMatch >= 20) {
    strengths.push(`Strong alignment with ${targetRole} keywords.`);
  } else {
    improvements.push(`Include more specific keywords related to "${targetRole}" in your bullet points.`);
  }

  // 3. Technical Strength (Max 15)
  let totalSkills = 0;
  (resume.skills || []).forEach(cat => {
    totalSkills += (cat.skills || []).length;
  });
  
  if (totalSkills > 15) {
    technicalStrength = 15;
    strengths.push("Excellent breadth of technical skills listed.");
  } else if (totalSkills > 8) {
    technicalStrength = 10;
  } else {
    technicalStrength = 5;
    weaknesses.push("Technical skills list is relatively short.");
    improvements.push("Expand your skills section with specific tools and frameworks you know.");
  }

  // 4. Project Quality (Max 15)
  const numProjects = (resume.projects || []).length;
  if (numProjects >= 2) {
    projectQuality += 10;
  } else if (numProjects === 1) {
    projectQuality += 5;
  }

  let totalBullets = 0;
  (resume.projects || []).forEach(p => {
    totalBullets += (p.bullets || []).length;
  });

  if (numProjects > 0 && (totalBullets / numProjects) >= 3) {
    projectQuality = Math.min(15, projectQuality + 5);
    strengths.push("Projects are well-detailed with sufficient bullet points.");
  } else if (numProjects > 0) {
    improvements.push("Aim for 3-4 descriptive bullet points per project.");
  }

  // 5. Recruiter Readability (Max 10)
  let avgBulletLength = 0;
  if (totalBullets > 0) {
    let charCount = 0;
    (resume.projects || []).forEach(p => {
      (p.bullets || []).forEach(b => charCount += b.length);
    });
    avgBulletLength = charCount / totalBullets;
  }

  if (avgBulletLength > 150) {
    recruiterReadability = 5;
    weaknesses.push("Some bullet points are too long and dense.");
    improvements.push("Keep bullet points concise (under 2 lines each) for better readability.");
  } else if (avgBulletLength > 40) {
    recruiterReadability = 10;
  } else {
    recruiterReadability = 5;
  }

  // 6. Experience Credibility (Max 5)
  if (resume.experience && resume.experience.length > 0) {
    experienceCredibility = 5;
    strengths.push("Professional experience section adds strong credibility.");
  } else {
    experienceCredibility = 3;
  }

  // Ensure Fallbacks
  if (strengths.length === 0) strengths.push("Strong foundational knowledge in the selected domain.");
  if (weaknesses.length === 0) weaknesses.push("Could quantify achievements with more specific metrics.");
  if (improvements.length === 0) improvements.push("Ensure bullet points focus on impact rather than responsibilities.");

  const atsScore = keywordMatch + atsCompatibility + technicalStrength + projectQuality + recruiterReadability + experienceCredibility;

  // Final sanity bounds
  const clampedScore = Math.max(30, Math.min(100, atsScore));

  return {
    atsScore: clampedScore,
    breakdown: {
      keywordMatch,
      atsCompatibility,
      technicalStrength,
      projectQuality,
      recruiterReadability,
      experienceCredibility
    },
    strengths: Array.from(new Set(strengths)).slice(0, 4),
    weaknesses: Array.from(new Set(weaknesses)).slice(0, 4),
    improvements: Array.from(new Set(improvements)).slice(0, 4)
  };
}
