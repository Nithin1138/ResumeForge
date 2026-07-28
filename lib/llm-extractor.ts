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
  packageDetails?: string | null; // e.g. CTC, Salary, or Stipend info
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

  if (cleaned.length > 15000) {
    cleaned = cleaned.slice(0, 15000) + "\n...[text truncated]";
  }

  return cleaned;
}

function heuristicFallbackParse(text: string): ExtractedJdData {
  let company = "Placement Drive";
  let role = "Software Engineer / Intern";
  let deadlineStr: string | null = null;
  let eligibility = "All Branches";
  let stipendOrCtc: string | null = null;

  // Match Company Name (e.g. "Name of the Company : Nutanix", "Company: Nutanix", "Nutanix Placement Drive")
  const companyMatch = text.match(/(?:Company Name|Name of the Company|Company|Organization)\s*[:\-\s]+\s*([A-Za-z0-9\.\-\s]+)/i);
  if (companyMatch && companyMatch[1].trim()) {
    company = companyMatch[1].trim().split("\n")[0].slice(0, 50);
  }

  // Match Role / Category
  const roleMatch = text.match(/(?:Role|Designation|Job Title|Position|Category)\s*[:\-\s]+\s*([A-Za-z0-9\.\-\/\s]+)/i);
  if (roleMatch && roleMatch[1].trim()) {
    role = roleMatch[1].trim().split("\n")[0].slice(0, 60);
  }

  // Match Deadline (e.g. "Last date for Registration : 27th July 2026")
  const deadlineMatch = text.match(/(?:Last date for Registration|Application Deadline|Deadline|Last Date)\s*[:\-\s]+\s*([A-Za-z0-9\:\s\(\)\,\-]+)/i);
  if (deadlineMatch) {
    const rawD = deadlineMatch[1].trim().split("\n")[0];
    const cleanD = rawD.replace(/\(.*?\)/g, "").trim();
    
    // Custom check for DD/MM/YYYY format in fallback regex
    const ddmmyyyyMatch = cleanD.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (ddmmyyyyMatch) {
      const d = parseInt(ddmmyyyyMatch[1], 10);
      const m = parseInt(ddmmyyyyMatch[2], 10) - 1; // 0-indexed
      const y = parseInt(ddmmyyyyMatch[3], 10);
      const dateObj = new Date(Date.UTC(y, m, d, 18, 30, 0)); // Default to 11:59 PM IST (18:30 UTC)
      deadlineStr = dateObj.toISOString();
    } else {
      const parsedD = new Date(cleanD);
      if (!isNaN(parsedD.getTime())) {
        deadlineStr = parsedD.toISOString();
      }
    }
  }

  // Match Eligibility
  const eligMatch = text.match(/(?:Eligibility|Eligible Branches|Criteria)\s*[:\-\s]+\s*([^\n]+)/i);
  if (eligMatch) {
    eligibility = eligMatch[1].trim();
  }

  // Match Stipend / CTC Fallback
  const stipendMatch = text.match(/(?:Stipend|CTC|Package|Salary)\s*[:\-\s]+\s*([^\n]+)/i);
  if (stipendMatch) {
    stipendOrCtc = stipendMatch[1].trim().slice(0, 80);
  }

  return {
    companyName: company,
    roleTitle: role,
    eligibilityCriteria: {
      rawEligibilityText: eligibility,
    },
    packageDetails: stipendOrCtc,
    applicationDeadline: deadlineStr,
    driveDate: null,
    otherImportantDates: [],
  };
}

export async function extractJdInfoWithLLM(
  rawEmailText: string,
  rawHtmlText?: string,
  attempt: number = 1
): Promise<ExtractedJdData> {
  const cleanedText = cleanEmailText(rawEmailText, rawHtmlText);

  if (!cleanedText || cleanedText.length < 5) {
    return heuristicFallbackParse(rawEmailText || "Placement Drive Email");
  }

  const prompt = `
You are an expert Job Description & Placement Drive Parser for Indian Engineering College Placement Cells.
Your goal is to extract extremely accurate, 100% correct placement details from the following email text (which contains placement announcements).

EMAIL TEXT:
"""
${cleanedText}
"""

CRITICAL INSTRUCTIONS (MUST BE 100% ACCURATE):
1. "companyName": Extract the exact name of the company hiring (e.g. Nutanix, Honeywell, Tekion, Amazon, TCS, Microsoft, etc.). Look in table fields like "Name of the Company", "Company Name", or email headers. If unspecified, use "Placement Drive".
2. "roleTitle": Extract the exact job role, designation, or hiring type (e.g. SDE Intern, Software Engineer, Full Time + Internship, Super Dream Internship, etc.).
3. "eligibilityCriteria":
   - "branches": Array of eligible branch strings (e.g. ["CSE", "IT", "ECE", "EEE"]).
   - "cgpaCutoff": Cutoff/criteria (e.g. "7.5 CGPA", "No CGPA Cutoff").
   - "backlogPolicy": Backlog rules (e.g. "No standing backlogs", "Active backlogs allowed").
   - "rawEligibilityText": A clean, concise bulleted summary of ALL eligibility criteria. Do not miss any details like 10th/12th percentages or branch limitations.
4. "packageDetails": Extract the compensation package, CTC, salary, or monthly stipend (e.g., "12 LPA", "50k stipend", "₹45,000/month", "Not Specified"). Look for terms like "Package", "CTC", "Salary", or "Stipend".
5. "applicationDeadline": The exact registration/application deadline date and time.
   *CRITICAL TIMEZONE & DATE RULES FOR INDIAN PLACEMENTS:*
   - Dates in Indian emails use DD/MM/YYYY format! For example, "01/08/2026" or "01-08-2026" means 1st August 2026 (NOT January 8th).
   - Carefully read the day, month, and year. Do not invert day and month.
   - If a time is mentioned (e.g., "10:30 PM", "5:00 PM", "11:59 PM"), combine it with the date to produce the correct ISO 8601 string.
   - Convert the date and time to a valid ISO 8601 string in Indian Standard Time (GMT+5:30) or UTC (e.g., "2026-08-01T17:00:00.000Z"). Return null if no deadline is specified.
6. "driveDate": ISO 8601 Date string or null if no drive date is mentioned.

REQUIRED JSON STRUCTURE (Return ONLY raw JSON, no markdown wrappers, no explanations):
{
  "companyName": "Company Name",
  "roleTitle": "Role Title",
  "eligibilityCriteria": {
    "branches": ["CS", "IT"],
    "cgpaCutoff": "7.5 CGPA",
    "backlogPolicy": "No Standing Arrears",
    "rawEligibilityText": "B.Tech CSE/IT with 7.5 CGPA, 70% in 10th & 12th, and no active backlogs."
  },
  "packageDetails": "CTC / Stipend Details",
  "applicationDeadline": "YYYY-MM-DDTHH:mm:ssZ",
  "driveDate": "YYYY-MM-DDTHH:mm:ssZ",
  "otherImportantDates": []
}

Today's Date: ${new Date().toISOString()}
Return ONLY valid JSON.
`;

  // 1. Try Gemini 1.5 Flash API
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
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
          if (parsed.companyName) {
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
          if (parsed.companyName) {
            return parsed as ExtractedJdData;
          }
        }
      }
    } catch (err) {
      console.warn("[LLM Extraction - Groq Error]:", err);
    }
  }

  // Final Guaranteed Fallback Parser (Zero-Failure Guarantee)
  return heuristicFallbackParse(cleanedText);
}
