import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import * as mammoth from "mammoth";
import { generateGroqFallback } from "@/lib/gemini";
// @ts-ignore
import pdfParse from "pdf-parse";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "mock" || apiKey === "xxx") {
      return NextResponse.json({
        personal: { fullName: "Mock User", email: "mock@example.com", collegeName: "Mock University", branch: "Computer Science", graduationYear: "2025", cgpa: "8.5", targetRole: "Software Engineer", phone: "1234567890", linkedin: "", github: "", location: "", hasPG: false, pgCollegeName: "", pgBranch: "", pgGraduationYear: "", pgCgpa: "", pgDegreeName: "" },
        skills: { categories: { languages: "Python, JavaScript", frameworks: "React, Node.js", tools: "Git, Docker", databases: "MySQL", csConcepts: "OOP" }, softSkills: "Communication", certifications: "" },
        projects: [{ title: "Mock Project", techStack: "React", description: "A simple web app", keyResult: "Increased speed by 10%", link: "", duration: "" }],
        internships: [],
        positions: [],
        achievements: [],
        options: { jobDescription: "", tone: "Professional & Formal", projectVariants: "1 version" }
      });
    }

    const prompt = `
You are an expert ATS data extraction system.
Extract all structured data from the provided resume to populate a Resume Builder form. 
CRITICAL RULE: If a field is missing in the resume, you MUST leave it as an empty string "". Do not make up information. Do not use placeholder text like 'Extracted Name'. 
CRITICAL RULE: Education details (College, Branch/Major, Graduation Year, CGPA) MUST be placed inside the 'personal' object exactly as defined. Do NOT create a separate 'education' array.
CRITICAL RULE: For 'branch' and 'pgBranch', you MUST select ONLY ONE of these exact strings: 'CSE', 'ECE', 'EEE', 'IT', 'Mechanical', 'Civil', 'Chemical', 'Biotechnology', 'Aerospace', or 'Other'. Map the resume's major to the closest one.
CRITICAL RULE: For 'cgpa' and 'pgCgpa', extract ONLY the numerical value (e.g., '8.5' or '3.8'), stripping out any '/10' or '%' symbols. For graduation year, extract just the 4-digit year.
CRITICAL RULE: Pay special attention to extracting hyperlinks (URLs). For DOCX files, you will receive HTML content, so look at the <a href="..."> tags to extract URLs for 'link', 'linkedin', 'github', etc. If a link is present, extract the full URL. If a URL is embedded behind text, extract the underlying link.
Return ONLY a valid JSON object matching this exact structure exactly (no markdown):

{
  "personal": {
    "fullName": "",
    "email": "",
    "collegeName": "",
    "branch": "",
    "graduationYear": "",
    "cgpa": "",
    "targetRole": "",
    "phone": "",
    "linkedin": "",
    "github": "",
    "location": "",
    "hasPG": false,
    "pgCollegeName": "",
    "pgBranch": "",
    "pgGraduationYear": "",
    "pgCgpa": "",
    "pgDegreeName": ""
  },
  "skills": {
    "categories": {
      "languages": "",
      "frameworks": "",
      "tools": "",
      "databases": "",
      "csConcepts": "",
      "aiAndData": "",
      "embeddedSystems": "",
      "engineeringSoftware": "",
      "designSoftware": "",
      "processEngineering": "",
      "bioinformaticsTools": "",
      "aerodynamics": ""
    },
    "softSkills": "",
    "certifications": ""
  },
  "projects": [
    {
      "title": "",
      "techStack": "",
      "description": "",
      "keyResult": "",
      "link": "",
      "duration": ""
    }
  ],
  "internships": [
    {
      "company": "",
      "role": "",
      "duration": "",
      "workDone": "",
      "techUsed": ""
    }
  ],
  "positions": [
    {
      "title": "",
      "organization": "",
      "description": ""
    }
  ],
  "achievements": [
    {
      "title": "",
      "description": ""
    }
  ],
  "options": {
    "jobDescription": "",
    "tone": "Professional & Formal",
    "projectVariants": "1 version"
  }
}
`;

    const ai = new GoogleGenAI({ apiKey });
    let responseText = "";
    const isPDF = file.type === "application/pdf" || file.name.endsWith(".pdf");
    const isDocx = file.name.endsWith(".docx");

    // Unified text extraction
    let resumeText = "";
    try {
      if (isPDF) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        function render_page(pageData: any) {
          let render_options = { normalizeWhitespace: false, disableCombineTextItems: false };
          return pageData.getTextContent(render_options).then(function(textContent: any) {
            let text = textContent.items.map((item: any) => item.str).join('');
            return pageData.getAnnotations().then((annotations: any) => {
              let links = annotations
                .filter((a: any) => a.subtype === 'Link' && a.url)
                .map((a: any) => a.url);
              if (links.length > 0) {
                text += `\n[Hidden Links Extracted from PDF: ${links.join(', ')}]\n`;
              }
              return text;
            });
          });
        }
        
        const data = await pdfParse(buffer, { pagerender: render_page });
        resumeText = data.text;
      } else if (isDocx) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const result = await mammoth.convertToHtml({ buffer });
        resumeText = result.value;
      } else {
        resumeText = await file.text();
      }
      
      const fullPrompt = prompt + "\n\nRESUME TEXT:\n" + resumeText.substring(0, 15000);

      const response = await ai.models.generateContent({
        model: "gemini-1.5-pro",
        contents: fullPrompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0,
        }
      });
      responseText = response.text || "";
    } catch (geminiError: any) {
      console.warn("Gemini generation failed on direct parse:", geminiError.message || geminiError);
      
      // Fallback: send to Groq
      const fullPrompt = prompt + "\n\nRESUME TEXT:\n" + resumeText.substring(0, 15000);
      try {
        responseText = await generateGroqFallback(fullPrompt, true);
      } catch (groqError: any) {
        throw new Error("All AI parsing engines exhausted.");
      }
    }

    responseText = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

    try {
      const jsonResult = JSON.parse(responseText);
      return NextResponse.json(jsonResult);
    } catch (parseError) {
      throw new Error("Failed to parse extracted AI response.");
    }

  } catch (error: any) {
    console.error("API /api/parse-resume POST error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error occurred." },
      { status: 500 }
    );
  }
}
