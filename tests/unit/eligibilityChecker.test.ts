// tests/unit/eligibilityChecker.test.ts
import { test, describe } from "node:test";
import assert from "node:assert";
import { buildEligibilityPrompt } from "../../lib/eligibility-checker";
import { BRANCH_SKILL_CONFIGS } from "../../lib/branchConfig";

describe("Campus Placement Eligibility Engine", () => {
  test("buildEligibilityPrompt includes strict non-rejection uncertain fallback rules", () => {
    const profile = "Branch: B.Tech CSE\nCGPA: 8.5\nActive Backlogs: 0";
    const rawEmail = "Google Campus Drive 2026 for B.Tech students with CGPA >= 7.5";
    const criteria = "Eligible branches: CSE, IT, ECE. Minimum CGPA: 7.5. Max active arrears: 0.";

    const prompt = buildEligibilityPrompt(profile, rawEmail, criteria);

    assert.ok(prompt.includes("CRITICAL EVALUATION RULES"));
    assert.ok(prompt.includes('"uncertain"'));
    assert.ok(prompt.includes("NOT to wrongly reject a student"));
    assert.ok(prompt.includes("Do NOT dump all 10-15 eligible branches"));
    assert.ok(prompt.includes("matched_summary"));
  });

  test("BRANCH_SKILL_CONFIGS maps major engineering disciplines with required skills", () => {
    const branches = Object.keys(BRANCH_SKILL_CONFIGS);

    assert.ok(branches.includes("CSE"));
    assert.ok(branches.includes("ECE"));
    assert.ok(branches.includes("EEE"));
    assert.ok(branches.includes("Mechanical"));
    assert.ok(branches.includes("Civil"));

    const cseCategories = BRANCH_SKILL_CONFIGS["CSE"].map((c) => c.id);
    assert.ok(cseCategories.includes("languages"));
    assert.ok(cseCategories.includes("frameworks"));
    assert.ok(cseCategories.includes("databases"));
    assert.ok(cseCategories.includes("tools"));
  });

  test("Personalized branch match instruction prevents multi-branch raw dumps", () => {
    const sampleJd = "Eligible: B.Tech CSE, IT, AI&DS, ECE, EEE, Mechanical, Civil, Chemical, Biotech, Aerospace";
    const studentProfile = "Branch: Computer Science and Engineering";
    const prompt = buildEligibilityPrompt(studentProfile, sampleJd, sampleJd);

    assert.ok(prompt.includes("matched_summary"));
    assert.ok(prompt.includes("Output ONLY the student's specific branch that matched"));
  });
});
