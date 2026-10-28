import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getCleanSignOff } from "../../lib/coverLetter";

describe("Cover Page Sign-Off Cleaning & Duplicate Name Prevention", () => {
  it("strips candidate name when appended with a newline", () => {
    const raw = "Sincerely,\nNithin Kumar";
    const cleaned = getCleanSignOff(raw, "Nithin Kumar");
    assert.strictEqual(cleaned, "Sincerely,");
  });

  it("strips candidate name case-insensitively with trailing whitespace", () => {
    const raw = "Sincerely,\n  nithin kumar  ";
    const cleaned = getCleanSignOff(raw, "Nithin Kumar");
    assert.strictEqual(cleaned, "Sincerely,");
  });

  it("strips candidate name when separated by comma or dash", () => {
    const rawWithComma = "Sincerely, Nithin Kumar";
    assert.strictEqual(getCleanSignOff(rawWithComma, "Nithin Kumar"), "Sincerely,");

    const rawWithDash = "Warm regards - Nithin Kumar";
    assert.strictEqual(getCleanSignOff(rawWithDash, "Nithin Kumar"), "Warm regards,");
  });

  it("removes generic placeholders like [Your Name] or [Candidate Name]", () => {
    assert.strictEqual(getCleanSignOff("Sincerely,\n[Candidate Name]", "Nithin Kumar"), "Sincerely,");
    assert.strictEqual(getCleanSignOff("Best regards,\n[Your Name]", "Nithin Kumar"), "Best regards,");
    assert.strictEqual(getCleanSignOff("Warm regards,\nCandidate Name", "Nithin Kumar"), "Warm regards,");
  });

  it("adds trailing comma if greeting is missing standard punctuation", () => {
    assert.strictEqual(getCleanSignOff("Best regards", "Nithin Kumar"), "Best regards,");
    assert.strictEqual(getCleanSignOff("Respectfully", "Nithin Kumar"), "Respectfully,");
  });

  it("handles null, undefined, or empty signOff gracefully", () => {
    assert.strictEqual(getCleanSignOff(null, "Nithin Kumar"), "Sincerely,");
    assert.strictEqual(getCleanSignOff(undefined, "Nithin Kumar"), "Sincerely,");
    assert.strictEqual(getCleanSignOff("", "Nithin Kumar"), "Sincerely,");
    assert.strictEqual(getCleanSignOff("   ", "Nithin Kumar"), "Sincerely,");
  });

  it("preserves standalone greetings when no candidate name is present in signOff", () => {
    assert.strictEqual(getCleanSignOff("Sincerely,", "Nithin Kumar"), "Sincerely,");
    assert.strictEqual(getCleanSignOff("Best regards,", "Nithin Kumar"), "Best regards,");
  });
});
