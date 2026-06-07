import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import * as mammoth from "mammoth";
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
        personal: { fullName: "Mock User", email: "mock@example.com", collegeName: "Mock University", branch: "Computer Science", graduationYear: "2025", cgpa: "8.5", targetRole: "Software Engineer", phone: "1234567890", linkedin: "", github: "", location: "", hasPG: false, pgCollegeName: "", pgBranch: "", pgGraduationYear: "", pgCgpa: "", pgDegreeName: "", codingProfiles: [] },
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
CRITICAL RULE: LINKS ARE MANDATORY IF PRESENT. For 'linkedin', 'github', 'projects[].link', and 'personal.codingProfiles[].link', extract the FULL URL (e.g., 'https://github.com/username', 'https://leetcode.com/username'). If the resume contains a username, handle, or partial link (e.g., 'nithin1138', 'in/nithin', 'github.com/nithin'), you MUST construct the full functional URL. Check both the visual text and any provided hidden URLs. NEVER leave these blank if a reference exists. DO NOT just return the domain name.
CRITICAL RULE: The JSON structure below shows arrays with one empty object as a template. If there are no projects, internships, positions, achievements, or coding profiles, you MUST return an empty array [] for that field. DO NOT return an array containing an empty object.
CRITICAL RULE: For 'skills.categories.csConcepts', look for "Coursework", "Related Courses", or core CS subjects (Data Structures, Algorithms, OOP, OS, DBMS, Computer Networks, System Design, etc.) and extract them. For 'skills.softSkills', extract non-technical skills (Communication, Leadership, Teamwork, Problem Solving, etc.). Do not leave these blank if the resume contains them.
CRITICAL RULE: For 'achievements[].description', extract the context, metric, or details of the award/achievement. The description MUST NOT contain or repeat the title (e.g. if title is '2nd Prize in Bharat Blockchain Yatra', the description must NOT be 'Secured 2nd Prize in Bharat Blockchain Yatra'). Instead, focus strictly on details or work done. If there are no details about what was built/done to win it, or if it is just a simple award name, leave 'description' as an empty string "". Never duplicate or rephrase the title to fill the description.
CRITICAL RULE: For each project in 'projects', split the resume details cleanly between 'description' (what was built/done) and 'keyResult' (the technical metric, outcome, optimization, or impact achieved). Do NOT repeat the same sentences, phrases, or technologies between 'description' and 'keyResult'. They must be distinct and non-overlapping. If no key result outcome is present, leave 'keyResult' as an empty string "".
CRITICAL RULE: For each internship in 'internships', do NOT repeat the technologies listed in 'techUsed' inside the 'workDone' field. Under 'workDone', summarize the engineering achievements and responsibilities. Under 'techUsed', list the comma-separated tools and technologies used.
CRITICAL RULE: For 'personal.codingProfiles', extract competitive programming handles or rankings if mentioned (e.g. LeetCode, Codeforces, HackerRank, CodeChef, GeeksforGeeks). Set the 'platform' name correctly, extract the 'handle' (username), construct the full 'link' to their profile, extract number of 'problemsSolved' (as a string, e.g. '500+') if mentioned, and extract their 'rating' (e.g. '1650' or '3-star') if present. If none are found, return [].

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
    let linkPrompt = "";
    let pdfText = "";
    const isPDF = file.type === "application/pdf" || file.name.endsWith(".pdf");
    const isDocx = file.name.endsWith(".docx");

    try {
      let response;
      let resumeText = "";

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

        // Prepare hybrid input for Gemini: Prompt + metadata links + exact extracted text + visual page
        const contents: any[] = [];
        let combinedText = prompt;
        if (linkPrompt) {
          combinedText += linkPrompt;
        }
        if (pdfText) {
          combinedText += `\n\n[CRITICAL: EXACT SELECTABLE TEXT EXTRACTED FROM PDF DIRECTLY]:\n${pdfText}\n\n[INSTRUCTION]: Compare the exact text above with the visual layout in the uploaded PDF. Use the exact text to prevent any typos, spelling errors, or hallucinations. Correctly map the sections (such as Education, Experience, Projects, achievements) even if they are in columns in the PDF view.`;
        }

        contents.push({ text: combinedText });
        contents.push({
          inlineData: {
            data: base64String,
            mimeType: "application/pdf"
          }
        });

        // Use native Gemini vision (most robust for layout/columns) alongside the extracted links
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: contents,
          config: {
            responseMimeType: "application/json",
            temperature: 0,
          }
        });
      } else {
        // Handle DOCX or TXT
        if (isDocx) {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const result = await mammoth.convertToHtml({ buffer });
          resumeText = result.value;
        } else {
          resumeText = await file.text();
        }
        
        const fullPrompt = prompt + "\n\nRESUME TEXT:\n" + resumeText.substring(0, 15000);
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: fullPrompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0,
          }
        });
      }
      
      responseText = response.text || "";
    } catch (geminiError: any) {
      console.warn("Gemini generation failed on direct parse:", geminiError.message || geminiError);
      
      // Fallback: send to Groq. We need to extract text for Groq if it's a PDF.
      let fallbackText = "";
      if (isPDF) {
        fallbackText = pdfText;
        if (!fallbackText) {
          try {
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
          } catch (pdfError) {
            console.error("pdf2json failed during Groq fallback", pdfError);
            throw new Error(`Gemini failed (${geminiError.message || geminiError}) and PDF text extraction for Groq fallback also failed.`);
          }
        }
      } else if (isDocx) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ buffer: Buffer.from(arrayBuffer) });
        fallbackText = result.value.replace(/<[^>]+>/g, " ");
      } else {
        fallbackText = await file.text();
      }

      // Add link extraction data to Groq fallback if we have it
      let fallbackPrompt = prompt;
      if (typeof linkPrompt !== 'undefined' && linkPrompt) {
        fallbackPrompt += linkPrompt;
      }
      fallbackPrompt += "\n\nRESUME TEXT:\n" + fallbackText.substring(0, 15000);

      try {
        responseText = await generateGroqFallback(fallbackPrompt, true);
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
