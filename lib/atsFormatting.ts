import { FullResumeOutput } from "@/types/resume";
import { SkillCategoryOutput } from "@/lib/skillsEngine";

export const MAX_SKILL_LINE_CHARS = 95;
const MAX_TECH_STACK_ITEMS = 6;
const MAX_TECH_STACK_CHARS = 75;

/** Keep skills on one ATS-safe line (category: skill1, skill2, ...). */
export function trimSkillsToLineLimit(
  skills: string[],
  maxChars = MAX_SKILL_LINE_CHARS
): string[] {
  if (skills.length === 0) return skills;

  const result: string[] = [];
  for (const skill of skills) {
    const line = [...result, skill].join(", ");
    if (line.length <= maxChars) {
      result.push(skill);
    } else {
      break;
    }
  }

  return result.length > 0 ? result : [skills[0]];
}

/** Normalize project tech stacks: dedupe, cap count, and limit line length. */
export function normalizeTechStack(techStack: string): string {
  if (!techStack?.trim()) return techStack || "";

  const items = techStack
    .split(/[,|;/•·\n]+/)
    .map((s) => s.trim().replace(/^\[|\]$/g, ""))
    .filter(Boolean);

  const unique = Array.from(new Set(items));
  let trimmed = unique.slice(0, MAX_TECH_STACK_ITEMS);
  let line = trimmed.join(", ");

  while (line.length > MAX_TECH_STACK_CHARS && trimmed.length > 1) {
    trimmed = trimmed.slice(0, -1);
    line = trimmed.join(", ");
  }

  if (line.length > MAX_TECH_STACK_CHARS && trimmed.length === 1) {
    return trimmed[0].slice(0, MAX_TECH_STACK_CHARS);
  }

  return line;
}

const FORMATTING_FEEDBACK_PATTERNS = [
  /parsing quirk/i,
  /very long skill/i,
  /long skill line/i,
  /skill lines?/i,
  /tech stack.*inline/i,
  /inline.*tech stack/i,
  /listed inline/i,
  /ats pars/i,
  /formatting structure/i,
  /resume structure/i,
  /parseable/i,
];

function stripFormattingFeedback(items: string[]): string[] {
  return items.filter((item) => !FORMATTING_FEEDBACK_PATTERNS.some((p) => p.test(item)));
}

function recalculateAtsScore(breakdown: FullResumeOutput["breakdown"]): number {
  return Object.values(breakdown).reduce((sum, v) => sum + v, 0);
}

/**
 * Normalizes resume project and experience bullet points to strictly 1 to 1.5 lines
 * (target: between 70 and 125 characters, maximum 135 characters).
 * Strips accidental repetitive boilerplate prefixes, suffixes, and run-on paragraphs.
 */
export function normalizeNormalBullet(rawBullet: string): string {
  if (!rawBullet || typeof rawBullet !== "string") return "";
  let b = rawBullet.trim();

  // 1. Remove leading list/bullet markers
  b = b.replace(/^[•\*\-\–\—\s]+/, "").replace(/^\d+[\.\)\:\-]\s+/, "").trim();

  // 2. Strip template wrappers that cause runaway length and double verbs
  b = b.replace(/^Architected and implemented a high-performance system for\s+/i, "");
  b = b.replace(/^Integrated a robust backend to handle\s+/i, "");
  b = b.replace(/^Streamlined deployment processes and client-side page rendering pathways,\s+/i, "Streamlined deployment pipelines, ");

  // Strip boilerplate suffixes
  b = b.replace(/[,\s]*[.,]\s*optimizing request latencies and response pipelines\.?$/i, "");
  b = b.replace(/[,\s]*[.,]\s*scaling concurrency to handle 100\+ simulated requests per second\.?$/i, "");
  b = b.replace(/[.,\s]+$/, "").trim();

  // 3. Fix double verbs or strange capitalization at start
  b = b.charAt(0).toUpperCase() + b.slice(1);

  // 4. If bullet contains multiple complete sentences, take the first complete punchy sentence
  if (b.length > 130) {
    const firstSentenceMatch = b.match(/^([^.?!]+[.?!])(?:\s+[A-Z]|$)/);
    if (firstSentenceMatch && firstSentenceMatch[1].trim().length >= 60 && firstSentenceMatch[1].trim().length <= 135) {
      b = firstSentenceMatch[1].trim();
    }
  }

  // 5. If still over 135 chars, find natural clause break (comma, semicolon, 'and', 'by') between 70 and 125 chars
  if (b.length > 135) {
    const sub = b.slice(0, 130);
    const breakIdx = Math.max(
      sub.lastIndexOf(", "),
      sub.lastIndexOf("; "),
      sub.lastIndexOf(" - "),
      sub.lastIndexOf(" by "),
      sub.lastIndexOf(" and ")
    );
    if (breakIdx >= 65) {
      b = sub.slice(0, breakIdx).trim();
    } else {
      const lastSpace = sub.lastIndexOf(" ");
      if (lastSpace >= 65) {
        b = sub.slice(0, lastSpace).trim();
      }
    }
  }

  // Ensure trailing single period
  b = b.replace(/[.,\s]+$/, "").trim();
  if (b.length > 0 && !/[.!?]$/.test(b)) {
    b += ".";
  }

  return b;
}

export function optimizeResumeForAts(
  resume: FullResumeOutput,
  processedSkills: SkillCategoryOutput[]
): FullResumeOutput {
  const optimizedSkills = processedSkills
    .map((cat) => ({
      category: cat.category,
      skills: trimSkillsToLineLimit(cat.skills),
    }))
    .filter((cat) => cat.skills.length > 0);

  const optimizedProjects = (resume.projects || []).map((proj) => ({
    ...proj,
    techStack: normalizeTechStack(proj.techStack),
    bullets: Array.isArray(proj.bullets)
      ? proj.bullets.map(normalizeNormalBullet).filter(Boolean)
      : proj.bullets,
  }));

  const optimizedExperience = (resume.experience || []).map((exp) => ({
    ...exp,
    bullets: Array.isArray(exp.bullets)
      ? exp.bullets.map(normalizeNormalBullet).filter(Boolean)
      : exp.bullets,
  }));

  const hasCoreSections =
    (resume.summary?.trim().length ?? 0) > 30 &&
    optimizedProjects.length > 0 &&
    optimizedSkills.length > 0;

  const breakdown = resume.breakdown
    ? { ...resume.breakdown }
    : {
        keywordMatch: 20,
        atsCompatibility: 25,
        technicalStrength: 10,
        projectQuality: 10,
        recruiterReadability: 8,
        experienceCredibility: 3,
      };

  if (hasCoreSections) {
    breakdown.atsCompatibility = Math.max(breakdown.atsCompatibility, 24);
  }

  const weaknesses = stripFormattingFeedback(resume.weaknesses || []);
  const improvements = stripFormattingFeedback(resume.improvements || []);

  const variantMetrics = resume.variantMetrics?.map((vm) => {
    const variantBreakdown = hasCoreSections
      ? { ...vm.breakdown, atsCompatibility: Math.max(vm.breakdown.atsCompatibility, 24) }
      : vm.breakdown;

    return {
      ...vm,
      breakdown: variantBreakdown,
      atsScore: Math.min(95, recalculateAtsScore(variantBreakdown)),
      weaknesses: stripFormattingFeedback(vm.weaknesses || []),
      improvements: stripFormattingFeedback(vm.improvements || []),
    };
  });

  return {
    ...resume,
    skills: optimizedSkills,
    projects: optimizedProjects,
    breakdown,
    atsScore: Math.min(95, recalculateAtsScore(breakdown)),
    weaknesses,
    improvements,
    variantMetrics,
  };
}
