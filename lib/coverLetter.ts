/**
 * Utility functions for cover letter generation, formatting, and presentation.
 */

/**
 * Sanitizes a cover letter sign-off closing phrase, removing any redundant candidate name,
 * placeholders, or trailing lines so that the candidate's name is rendered cleanly only once.
 *
 * @param rawSignOff The sign-off string returned from LLM or saved in DB (e.g. "Sincerely,\nNithin Kumar")
 * @param candidateName The candidate's name (e.g. "Nithin Kumar")
 * @returns Clean closing phrase (e.g. "Sincerely," or "Best regards,")
 */
export function getCleanSignOff(
  rawSignOff?: string | null,
  candidateName?: string | null
): string {
  if (!rawSignOff || typeof rawSignOff !== "string" || !rawSignOff.trim()) {
    return "Sincerely,";
  }

  let cleaned = rawSignOff.trim();

  // 1. Strip trailing candidate name if present (case-insensitive)
  if (candidateName && candidateName.trim()) {
    const trimmedName = candidateName.trim();
    const escapedName = trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const nameRegex = new RegExp(`[\\r\\n,\\-\\s]+${escapedName}\\s*$`, "i");
    cleaned = cleaned.replace(nameRegex, "").trim();
  }

  // 2. Strip generic placeholders like "[Your Name]", "[Candidate Name]", "Candidate Name", "Your Name"
  cleaned = cleaned.replace(/[\r\n,\-\s]+(\[.*?\]|Your Name|Candidate Name)\s*$/i, "").trim();

  // 3. If there are multiple lines (e.g. "Sincerely,\nNithin"), take the first line as closing greeting
  const lines = cleaned.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length > 0) {
    cleaned = lines[0];
  }

  // 4. Clean any trailing dashes, colons, or stray whitespace
  cleaned = cleaned.replace(/[-:]+$/, "").trim();

  // 5. Ensure standard trailing comma if it's a greeting phrase without punctuation (e.g. "Sincerely" -> "Sincerely,")
  if (cleaned && !/[.,!]$/.test(cleaned)) {
    cleaned = `${cleaned},`;
  }

  return cleaned || "Sincerely,";
}
