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
