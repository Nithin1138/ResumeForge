// lib/llm-extractor.ts
// Extract structured Placement Drive / JD information from forwarded email text & HTML tables

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

export function htmlToPlainText(html: string): string {
  if (!html) return "";

  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/td>/gi, " : ")
    .replace(/<\/th>/gi, " : ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[\r\t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

export function cleanEmailText(rawEmail: string, rawHtml?: string): string {
  let combined = rawEmail || "";

  if (rawHtml) {
    const convertedHtml = htmlToPlainText(rawHtml);
    if (convertedHtml.length > combined.length) {
      combined = convertedHtml;
    }
  }

  if (!combined) return "";

  // Remove common Gmail forwarding headers
  let cleaned = combined
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
  rawHtmlText?: string,
  attempt: number = 1
): Promise<ExtractedJdData | null> {
  const cleanedText = cleanEmailText(rawEmailText, rawHtmlText);

  if (!cleanedText || cleanedText.length < 10) {
    console.warn("[LLM Extractor] Email text is too short or empty.");
    return null;
  }

  const prompt = `
You are an expert Job Description & Placement Drive Parser for Engineering Students.
Parse the following placement cell email text (which may contain converted HTML tables) and extract structured information in strict JSON format ONLY.

EMAIL TEXT:
"""
${cleanedText}
"""

CRITICAL INSTRUCTIONS:
1. "companyName": Extract the actual company name hiring in this drive. If the company name is in the subject or table header, extract it. If not explicitly specified, use the Organization name or "Campus Placement Drive". NEVER invent a fake company name like Amazon if it's not in the email!
2. "roleTitle": Extract the exact role title (e.g. SDE, Software Engineer, Graduate Trainee, etc.). If unspecified, use "Placement Drive Candidate".
3. "eligibilityCriteria":
   - "branches": Array of eligible branch strings (e.g. ["CSE", "IT", "ECE"] or ["All Branches"]).
   - "cgpaCutoff": Cutoff mentioned in email (e.g. "7.0 CGPA or 70% in X, XII & Degree") or "No Cutoff".
   - "backlogPolicy": Backlog policy (e.g. "No Standing Arrears" or "Not Specified").
4. "applicationDeadline": ISO 8601 Date string (e.g. "2026-08-15T23:59:00Z") or null if no deadline mentioned.
5. "driveDate": ISO 8601 Date string or null if no drive date mentioned.
6. Do NOT hallucinate dates or company names not present in the text!

REQUIRED JSON STRUCTURE (Return ONLY raw JSON, no markdown wrappers, no explanations):
{
  "companyName": "Company Name",
  "roleTitle": "Role Title",
  "eligibilityCriteria": {
    "branches": ["CS", "IT"],
    "cgpaCutoff": "7.0 CGPA",
    "backlogPolicy": "No Standing Arrears"
  },
  "applicationDeadline": "YYYY-MM-DDTHH:mm:ssZ",
  "driveDate": "YYYY-MM-DDTHH:mm:ssZ",
  "otherImportantDates": []
}

Today's Date: ${new Date().toISOString()}
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
    return extractJdInfoWithLLM(rawEmailText, rawHtmlText, attempt + 1);
  }

  return null;
}
