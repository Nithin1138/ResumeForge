import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { generateGroqFallback } from "@/lib/gemini";
// @ts-ignore
const PDFParser = require("pdf2json");

// Configure maximum size (e.g., 5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "mock" || apiKey === "xxx") {
      // Mock response if no key is provided
      return NextResponse.json({
        overallScore: 78,
        categories: [
          { name: "Keyword Match & Searchability", weightage: 35, score: 25, feedback: "You have a solid tech stack, but try to include more keywords." },
          { name: "Resume Parsing & Structure", weightage: 25, score: 20, feedback: "Your resume appears to have a clean, parseable structure." },
          { name: "Technical Signal Strength", weightage: 20, score: 15, feedback: "Good signal, but highlighting more complex engineering helps." },
          { name: "Impact & Quantification", weightage: 10, score: 7, feedback: "Great project descriptions, but quantify your achievements." },
          { name: "Recruiter Readability", weightage: 7, score: 5, feedback: "Easy to skim and formatted cleanly." },
          { name: "Experience & Relevance", weightage: 3, score: 2, feedback: "Good academic background." }
        ],
        extractedData: {
          personal: { fullName: "Mock User", email: "mock@example.com", collegeName: "Mock University", branch: "Computer Science", graduationYear: "2025", cgpa: "8.5", targetRole: "Software Engineer", phone: "1234567890", linkedin: "", github: "", hasPG: false, pgCollegeName: "", pgBranch: "", pgGraduationYear: "", pgCgpa: "", pgDegreeName: "" },
          skills: { categories: { languages: "Python, JavaScript", frameworks: "React, Node.js", tools: "Git, Docker", databases: "MySQL", core: "OOP", aiAndData: "", csConcepts: "" }, softSkills: "Communication", certifications: "" },
          projects: [{ title: "Mock Project", techStack: "React", description: "A simple web app", keyResult: "Increased speed by 10%", link: "", duration: "" }],
          internships: [],
          positions: [],
          options: { jobDescription: "", tone: "Professional & Formal", includeAchievements: false, achievements: "", projectVariants: "1 version" }
        }
      });
    }

    const isPDF = file.type === "application/pdf" || file.name.endsWith(".pdf");

    const prompt = `
You are an expert ATS (Applicant Tracking System) used by top-tier tech companies.
Analyze the provided resume document and evaluate it against realtime universal software engineering and tech company needs.
Provide a realistic score out of 100 based on the following metrics:
- Keyword Match (Weightage: 35)
- Parsing & Structure (Weightage: 25)
- Signal Strength (Weightage: 20)
- Quantification (Weightage: 10)
- Readability (Weightage: 7)
- Role Relevance (Weightage: 3)

Also, extract all structured data from the resume to populate a Resume Builder form. 
CRITICAL RULE: If a field is missing in the resume, you MUST leave it as an empty string "". Do not make up information. Do not use placeholder text like 'Extracted Name'. Return ONLY a valid JSON object matching this exact structure:

{
  "overallScore": 82,
  "categories": [
    { "name": "Keyword Match", "weightage": 35, "score": 30, "feedback": "Good use of Python, but missing cloud keywords." },
    { "name": "Parsing & Structure", "weightage": 25, "score": 22, "feedback": "Clean formatting and easily parseable." },
    { "name": "Signal Strength", "weightage": 20, "score": 15, "feedback": "Solid engineering projects." },
    { "name": "Quantification", "weightage": 10, "score": 7, "feedback": "Need more quantified results in projects." },
    { "name": "Readability", "weightage": 7, "score": 6, "feedback": "Well-organized and skim-friendly." },
    { "name": "Role Relevance", "weightage": 3, "score": 2, "feedback": "Highly relevant background." }
  ],
  "extractedData": {
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
      "categories": {
        "languages": "",
        "frameworks": "",
        "tools": "",
        "databases": "",
        "core": "",
        "aiAndData": "",
        "csConcepts": ""
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
    "options": {
      "jobDescription": "",
      "tone": "Professional & Formal",
      "includeAchievements": false,
      "achievements": "",
      "projectVariants": "1 version"
    }
  }
}
`;

    let responseText = "";

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      let contents: any[] = [];
      if (isPDF) {
        const arrayBuffer = await file.arrayBuffer();
        const base64String = Buffer.from(arrayBuffer).toString("base64");
        contents = [
          prompt,
          {
            inlineData: {
              data: base64String,
              mimeType: "application/pdf"
            }
          }
        ];
      } else {
        const resumeText = await file.text();
        contents = [prompt + "\n\nRESUME TEXT:\n" + resumeText.substring(0, 15000)];
      }

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: contents,
        config: {
          responseMimeType: "application/json",
          temperature: 0,
        }
      });
      responseText = response.text || "";
      if (!responseText) {
        throw new Error("Empty response from Gemini API");
      }
    } catch (geminiError: any) {
      console.warn("Gemini generation failed, falling back to Groq:", geminiError.message || geminiError);
      
      try {
        // Fallback text extraction if Gemini fails
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
        } else {
          fallbackText = await file.text();
        }
        
        responseText = await generateGroqFallback(prompt + "\n\nRESUME TEXT:\n" + fallbackText, true);
      } catch (groqError: any) {
        console.error("Groq fallback also failed:", groqError);
        throw new Error("All AI generation engines are currently exhausted or unavailable.");
      }
    }

    // Strip possible markdown code blocks
    responseText = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

    try {
      const jsonResult = JSON.parse(responseText);
      return NextResponse.json(jsonResult);
    } catch (parseError) {
      console.error("Failed to parse AI response:", responseText);
      throw new Error(`Failed to parse AI response. Raw output: ${responseText.substring(0, 100)}...`);
    }

  } catch (error: any) {
    console.error("API /api/ats-check POST error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error occurred during resume parsing." },
      { status: 500 }
    );
  }
}
