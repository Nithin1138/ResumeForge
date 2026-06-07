import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { generateGroqFallback } from "@/lib/gemini";
import { PDF_WORKER_BASE64 } from "@/lib/pdfWorkerBase64";
let PDFParse: any = null;
let PDFParser: any = null;

try {
  if (typeof (global as any).DOMMatrix === "undefined") {
    (global as any).DOMMatrix = class DOMMatrix {};
  }
  const pdfParseMod = require("pdf-parse");
  PDFParse = pdfParseMod.PDFParse || pdfParseMod;
} catch (e: any) {
  console.warn("Failed to load pdf-parse:", e.message || e);
}

try {
  PDFParser = require("pdf2json");
} catch (e: any) {
  console.warn("Failed to load pdf2json:", e.message || e);
}

const workerUrl = `data:text/javascript;base64,${PDF_WORKER_BASE64}`;
if (PDFParse) {
  try {
    PDFParse.setWorker(workerUrl);
  } catch (e) {
    console.warn("Failed to set PDF worker path:", e);
  }
}

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
          personal: { fullName: "Mock User", email: "mock@example.com", collegeName: "Mock University", branch: "Computer Science", graduationYear: "2025", cgpa: "8.5", targetRole: "Software Engineer", phone: "1234567890", linkedin: "", github: "", hasPG: false, pgCollegeName: "", pgBranch: "", pgGraduationYear: "", pgCgpa: "", pgDegreeName: "", codingProfiles: [] },
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
CRITICAL RULE: If a field is missing in the resume, you MUST leave it as an empty string "". Do not make up information. Do not use placeholder text like 'Extracted Name'. 
CRITICAL RULE: LINKS ARE MANDATORY IF PRESENT. For 'linkedin', 'github', 'projects[].link', and 'personal.codingProfiles[].link', extract the FULL URL. If the resume contains a handle/username, you MUST construct the full functional URL.
CRITICAL RULE: For 'achievements[].description', extract the context, metric, or details of the award/achievement. The description MUST NOT contain or repeat the title. Instead, focus strictly on details or work done. If there are no details, leave 'description' as an empty string "".
CRITICAL RULE: For each project in 'projects', split the resume details cleanly between 'description' and 'keyResult'. Do NOT repeat the same sentences, phrases, or technologies between 'description' and 'keyResult'. They must be distinct and non-overlapping.
CRITICAL RULE: For each internship in 'internships', do NOT repeat the technologies listed in 'techUsed' inside the 'workDone' field.
CRITICAL RULE: For 'personal.codingProfiles', extract competitive programming handles or rankings if mentioned (e.g. LeetCode, Codeforces, HackerRank, CodeChef, GeeksforGeeks). Platform, handle, full link, problemsSolved, and rating. If none, return [].

Return ONLY a valid JSON object matching this exact structure:

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
      "pgDegreeName": "",
      "codingProfiles": [
        {
          "platform": "",
          "handle": "",
          "link": "",
          "problemsSolved": "",
          "rating": ""
        }
      ]
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
    let linkPrompt = "";
    let pdfText = "";

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      let contents: any[] = [];
      if (isPDF) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64String = buffer.toString("base64");

        // Try extracting exact text stream and annotations using PDFParse
        let extractedLinks: string[] = [];
        try {
          if (!PDFParse) {
            throw new Error("pdf-parse library is not loaded on this server.");
          }
          if (workerUrl) {
            PDFParse.setWorker(workerUrl);
          }
          const parser = new PDFParse({ data: new Uint8Array(buffer) });
          const textResult = await parser.getText();
          pdfText = textResult.text || "";

          // Extract link annotations (supports compressed streams)
          const infoResult = await parser.getInfo({ parsePageInfo: true });
          if (infoResult && infoResult.pages) {
            for (const page of infoResult.pages) {
              if (page.links) {
                for (const link of page.links) {
                  if (link.url && (link.url.startsWith('http') || link.url.includes('www.'))) {
                    extractedLinks.push(link.url);
                  }
                }
              }
            }
          }
        } catch (parseError) {
          console.warn("PDFParse text extraction failed:", parseError);
        }

        // Robust regex to extract hidden hyperlinks from raw PDF buffer as fallback
        try {
          const content = buffer.toString('binary');
          const links = new Set<string>();
          
          // Match literal strings: /URI (https://...)
          const uriRegex = /\/URI\s*\(([^)]+)\)/g;
          let match;
          while ((match = uriRegex.exec(content)) !== null) {
            const cleanLink = match[1].replace(/\\0/g, '').trim();
            if (cleanLink.startsWith('http') || cleanLink.includes('www.')) {
               links.add(cleanLink);
            }
          }
          
          // Match hex strings: /URI <68747470...>
          const hexUriRegex = /\/URI\s*<([0-9a-fA-F]+)>/g;
          while ((match = hexUriRegex.exec(content)) !== null) {
            try {
              const hexStr = match[1];
              let str = '';
              for (let i = 0; i < hexStr.length; i += 2) {
                str += String.fromCharCode(parseInt(hexStr.substr(i, 2), 16));
              }
              if (str.startsWith('http') || str.includes('www.')) {
                 links.add(str);
              }
            } catch (e) {}
          }
          for (const rawLink of links) {
            if (!extractedLinks.includes(rawLink)) {
              extractedLinks.push(rawLink);
            }
          }
        } catch (e) {}

        if (extractedLinks.length > 0) {
          linkPrompt = `\n\n[CRITICAL: The following hidden URLs were extracted from the PDF metadata/annotations: ${extractedLinks.join(', ')}]\nYou MUST match these URLs with the visual text to extract FULL, functional URLs for 'linkedin', 'github', and project 'link' fields. If a link in this list contains "linkedin.com", it MUST be the LinkedIn profile link. If it contains "github.com" and is a user profile (e.g. github.com/username), it is the GitHub profile link. If it contains a repository or project name, it is a project link. Assign them accurately and NEVER leave these fields blank if they are present in the list.`;
        }

        let combinedText = prompt;
        if (linkPrompt) {
          combinedText += linkPrompt;
        }
        if (pdfText) {
          combinedText += `\n\n[CRITICAL: EXACT SELECTABLE TEXT EXTRACTED FROM PDF DIRECTLY]:\n${pdfText}\n\n[INSTRUCTION]: Compare the exact text above with the visual layout in the uploaded PDF. Use the exact text to prevent any typos, spelling errors, or hallucinations. Correctly map the sections (such as Education, Experience, Projects, achievements) even if they are in columns in the PDF view.`;
        }

        contents = [
          { text: combinedText },
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
        model: "gemini-2.5-flash",
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
        let fallbackText = pdfText;
        if (!fallbackText) {
          if (isPDF) {
            if (!PDFParser) {
              throw new Error("pdf2json library is not loaded on this server.");
            }
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
