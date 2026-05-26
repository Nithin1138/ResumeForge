import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import * as mammoth from "mammoth";
import { generateGroqFallback } from "@/lib/gemini";
// @ts-ignore
const PDFParser = require("pdf2json");

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
        personal: { fullName: "Mock User", email: "mock@example.com", collegeName: "Mock University", branch: "Computer Science", graduationYear: "2025", cgpa: "8.5", targetRole: "Software Engineer", phone: "1234567890", linkedin: "", github: "", hasPG: false, pgCollegeName: "", pgBranch: "", pgGraduationYear: "", pgCgpa: "", pgDegreeName: "" },
        skills: { languages: "Python, JavaScript", frameworks: "React, Node.js", tools: "Git, Docker", databases: "MySQL", concepts: "OOP", softSkills: "Communication", certifications: "" },
        projects: [{ title: "Mock Project", techStack: "React", description: "A simple web app", keyResult: "Increased speed by 10%", link: "", duration: "" }],
        internships: [],
        positions: [],
        options: { jobDescription: "", tone: "Professional & Formal", includeAchievements: false, achievements: "", projectVariants: "1 version" }
      });
    }

    const prompt = `
You are an expert ATS data extraction system.
Extract all structured data from the provided resume to populate a Resume Builder form. 
CRITICAL RULE: If a field is missing in the resume, you MUST leave it as an empty string "". Do not make up information. Do not use placeholder text like 'Extracted Name'. 
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
    "hasPG": false,
    "pgCollegeName": "",
    "pgBranch": "",
    "pgGraduationYear": "",
    "pgCgpa": "",
    "pgDegreeName": ""
  },
  "skills": {
    "languages": "",
    "frameworks": "",
    "tools": "",
    "databases": "",
    "concepts": "",
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
  "options": {
    "jobDescription": "",
    "tone": "Professional & Formal",
    "includeAchievements": false,
    "achievements": "",
    "projectVariants": "1 version"
  }
}
`;

    const ai = new GoogleGenAI({ apiKey });
    let responseText = "";
    const isPDF = file.type === "application/pdf" || file.name.endsWith(".pdf");
    const isDocx = file.name.endsWith(".docx");

    try {
      if (isPDF) {
        // Native PDF parsing with Gemini
        const arrayBuffer = await file.arrayBuffer();
        const base64String = Buffer.from(arrayBuffer).toString("base64");
        
        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: [
            prompt,
            {
              inlineData: {
                data: base64String,
                mimeType: "application/pdf"
              }
            }
          ],
          config: {
            responseMimeType: "application/json",
            temperature: 0,
          }
        });
        responseText = response.text || "";
      } else {
        // Handle DOCX or TXT
        let resumeText = "";
        if (isDocx) {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const result = await mammoth.extractRawText({ buffer });
          resumeText = result.value;
        } else {
          resumeText = await file.text();
        }

        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: prompt + "\n\nRESUME TEXT:\n" + resumeText.substring(0, 15000),
          config: {
            responseMimeType: "application/json",
            temperature: 0,
          }
        });
        responseText = response.text || "";
      }
    } catch (geminiError: any) {
      console.warn("Gemini generation failed on direct parse:", geminiError.message || geminiError);
      
      // Fallback: extract text (even for PDF) and send to Groq
      let fallbackText = "";
      if (isPDF) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fallbackText = await new Promise((resolve, reject) => {
          const pdfParser = new PDFParser(null, 1);
          pdfParser.on("pdfParser_dataError", (err: any) => reject(err.parserError));
          pdfParser.on("pdfParser_dataReady", () => resolve(pdfParser.getRawTextContent()));
          pdfParser.parseBuffer(buffer);
        });
      } else if (isDocx) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) });
        fallbackText = result.value;
      } else {
        fallbackText = await file.text();
      }

      const fullPrompt = prompt + "\n\nRESUME TEXT:\n" + fallbackText.substring(0, 15000);
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
