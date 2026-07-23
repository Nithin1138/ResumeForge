// lib/llm-extractor.ts
// Extract structured Placement Drive / JD information from forwarded email text

export interface ExtractedJdData {
  companyName: string;
  roleTitle: string;
  eligibilityCriteria: {
    branches?: string[];
    cgpaCutoff?: string;
    backlogPolicy?: string;
    rawEligibilityText?: string;
  };
  applicationDeadline?: string | null; // ISO Date String
  driveDate?: string | null; // ISO Date String
  otherImportantDates?: Array<{ event: string; date: string }>;
}

export function cleanEmailText(rawEmail: string): string {
  if (!rawEmail) return "";

  // Remove common Gmail forwarding headers
  let cleaned = rawEmail
    .replace(/^---------- Forwarded message ---------[\s\S]*?To:.*?\n/g, "")
    .replace(/^From:.*?\nDate:.*?\nSubject:.*?\nTo:.*?\n/gm, "")
    .replace(/^>+/gm, "") // Strip quoted text angle brackets
    .trim();

  // Limit length to prevent extreme prompt context overflow (max ~15,000 chars)
  if (cleaned.length > 15000) {
    cleaned = cleaned.slice(0, 15000) + "\n...[text truncated]";
  }

  return cleaned;
}

export async function extractJdInfoWithLLM(
  rawEmailText: string,
  attempt: number = 1
): Promise<ExtractedJdData | null> {
  const cleanedText = cleanEmailText(rawEmailText);

  const prompt = `
You are an expert Job Description & Placement Drive Parser for Engineering Students.
Parse the following placement cell email text and extract structured information in strict JSON format ONLY.

EMAIL TEXT:
"""
${cleanedText}
"""

REQUIRED JSON STRUCTURE (Return ONLY raw JSON, no markdown wrappers, no explanations):
{
  "companyName": "Exact Company Name",
  "roleTitle": "Job Title / Role (e.g. SDE Intern, Software Engineer)",
  "eligibilityCriteria": {
    "branches": ["CS", "IT", "ECE"], // Allowed branches or "All Engineering Branches"
    "cgpaCutoff": "7.5 CGPA or 75%", // Cutoff or "No Cutoff"
    "backlogPolicy": "No active backlogs allowed" // Policy or "Not Specified"
  },
  "applicationDeadline": "YYYY-MM-DDTHH:mm:ssZ", // ISO 8601 string or null if not found
  "driveDate": "YYYY-MM-DDTHH:mm:ssZ", // ISO 8601 string or null if not found
  "otherImportantDates": [
    { "event": "PPT / Online Test", "date": "YYYY-MM-DDTHH:mm:ssZ" }
  ]
}

Today's Date: ${new Date().toISOString()}
If a year is omitted in the email, infer the current or upcoming placement year (2026).
Return ONLY valid JSON.
`;

  // 1. Try Gemini API first
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const rawJsonStr = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJsonStr) {
          const parsed = JSON.parse(rawJsonStr);
          if (parsed.companyName && parsed.roleTitle) {
            return parsed as ExtractedJdData;
          }
        }
      }
    } catch (err) {
      console.warn("[LLM Extraction - Gemini Error]:", err);
    }
  }

  // 2. Fallback to Groq API if configured
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.1,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const rawJsonStr = data.choices?.[0]?.message?.content;
        if (rawJsonStr) {
          const parsed = JSON.parse(rawJsonStr);
          if (parsed.companyName && parsed.roleTitle) {
            return parsed as ExtractedJdData;
          }
        }
      }
    } catch (err) {
      console.warn("[LLM Extraction - Groq Error]:", err);
    }
  }

  // Retry once if attempt === 1
  if (attempt < 2) {
    console.log("[LLM Extraction]: Retrying extraction (attempt 2)...");
    return extractJdInfoWithLLM(rawEmailText, attempt + 1);
  }

  return null;
}
