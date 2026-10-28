// tests/unit/atsFormatting.test.ts
import { test, describe } from "node:test";
import assert from "node:assert";
import { trimSkillsToLineLimit, normalizeTechStack } from "../../lib/atsFormatting";
import { formatProfileDataForPrompt, buildAtsScoringPrompt } from "../../lib/ats-scoring";

describe("ATS Formatting & Section Normalization", () => {
  test("trimSkillsToLineLimit respects maximum character threshold", () => {
    const skills = [
      "TypeScript",
      "React",
      "Node.js",
      "PostgreSQL",
      "Prisma",
      "Docker",
      "Kubernetes",
      "Google Cloud Platform",
      "Very Long Framework Name That Exceeds Single Line Width",
    ];

    const trimmed = trimSkillsToLineLimit(skills, 60);
    const line = trimmed.join(", ");
    assert.ok(line.length <= 60, `Line length ${line.length} should be <= 60`);
    assert.ok(trimmed.includes("TypeScript"), "First skill should always be included");
  });

  test("normalizeTechStack removes duplicate items and cleans delimiters", () => {
    const raw = "React, Node.js | TypeScript; React • Docker / Node.js";
    const normalized = normalizeTechStack(raw);
    const items = normalized.split(", ");

    assert.strictEqual(items.length, new Set(items).size, "Should not contain duplicates");
    assert.ok(normalized.includes("React"));
    assert.ok(normalized.includes("Node.js"));
    assert.ok(normalized.includes("TypeScript"));
  });

  test("formatProfileDataForPrompt extracts structured text from master profile", () => {
    const mockProfile = {
      fullName: "Isunuri Veera Nithin",
      email: "nithin@example.com",
      college: "National Institute of Technology",
      branch: "Computer Science and Engineering",
      cgpa: "8.9",
      github: "https://github.com/Nithin1138",
      linkedin: "https://linkedin.com/in/nithin1138",
      skillsJson: JSON.stringify(["TypeScript", "Python", "PostgreSQL", "Next.js"]),
      projectsJson: JSON.stringify([
        {
          title: "ResumeForge",
          techStack: "Next.js, TypeScript",
          description: "Engineered parallel LLM pipelines reducing latency by 65%.",
        },
      ]),
    };

    const text = formatProfileDataForPrompt(mockProfile);

    assert.ok(text.includes("Isunuri Veera Nithin"));
    assert.ok(text.includes("Computer Science and Engineering"));
    assert.ok(text.includes("8.9"));
    assert.ok(text.includes("TypeScript, Python, PostgreSQL, Next.js"));
    assert.ok(text.includes("ResumeForge"));
    assert.ok(text.includes("reducing latency by 65%"));
  });

  test("buildAtsScoringPrompt outputs valid prompt with JD when provided", () => {
    const profileText = "Full Name: Test User\nSkills: React, Node.js";
    const jdText = "Looking for Senior React and TypeScript Engineer with 8+ CGPA";

    const prompt = buildAtsScoringPrompt(profileText, jdText);

    assert.ok(prompt.includes("=== STUDENT RESUME / MY SPACE PROFILE DATA ==="));
    assert.ok(prompt.includes("=== TARGET JOB DESCRIPTION (JD) ==="));
    assert.ok(prompt.includes("overall_score"));
    assert.ok(prompt.includes("STRICT JSON OUTPUT FORMAT"));
  });
});
