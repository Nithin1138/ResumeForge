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
          { name: "Keywords & Skills", weightage: 30, score: 22, feedback: "You have a solid tech stack, but try to include more cloud computing keywords like AWS or Docker." },
          { name: "Impact & Metrics", weightage: 40, score: 32, feedback: "Great project descriptions, but quantify your achievements (e.g., 'improved speed by X%')." },
          { name: "Formatting & Readability", weightage: 10, score: 9, feedback: "Your resume appears to have a clean, parseable structure." },
          { name: "Education & Experience", weightage: 20, score: 15, feedback: "Good academic background. Highlighting coursework might add more value." }
        ]
      });
    }

    let resumeText = "";
    
    // Parse the file based on its type
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      try {
        resumeText = await new Promise((resolve, reject) => {
          const pdfParser = new PDFParser(null, 1);
          pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
          pdfParser.on("pdfParser_dataReady", () => resolve(pdfParser.getRawTextContent()));
          pdfParser.parseBuffer(buffer);
        });
        
        // pdf2json uses URL encoding for spaces etc, so decode it
        resumeText = decodeURIComponent(resumeText);
      } catch (pdfError) {
        console.error("PDF Parsing Error:", pdfError);
        throw new Error("Failed to parse the PDF file. Ensure it is not corrupted or password protected.");
      }
    } else {
      resumeText = await file.text();
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract text from the file" },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert ATS (Applicant Tracking System) used by top-tier tech companies.
Analyze the provided resume document and evaluate it against realtime universal software engineering and tech company needs.
Provide a realistic score out of 100 based on the following metrics:
- Keywords & Skills (Weightage: 30)
- Impact & Metrics (Weightage: 40)
- Formatting & Readability (Weightage: 10)
- Education & Experience (Weightage: 20)

Calculate the scores proportionally based on the weightage (e.g. if a category is out of 30, a perfect score is 30).
Also provide a short, actionable feedback sentence for each category.

Return ONLY a valid JSON object with no markdown formatting. It must exactly match this structure:
{
  "overallScore": 82,
  "categories": [
    { "name": "Keywords & Skills", "weightage": 30, "score": 25, "feedback": "Good use of Python, but missing cloud keywords." },
    { "name": "Impact & Metrics", "weightage": 40, "score": 30, "feedback": "Need more quantified results in projects." },
    { "name": "Formatting & Readability", "weightage": 10, "score": 9, "feedback": "Clean formatting." },
    { "name": "Education & Experience", "weightage": 20, "score": 18, "feedback": "Strong academic background." }
  ]
}

RESUME TEXT:
${resumeText.substring(0, 10000)} // Truncate to avoid massive tokens
`;

    let responseText = "";

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      responseText = response.text || "";
      if (!responseText) {
        throw new Error("Empty response from Gemini API");
      }
    } catch (geminiError: any) {
      console.warn("Gemini generation failed, falling back to Groq:", geminiError.message || geminiError);
      
      try {
        responseText = await generateGroqFallback(prompt, true);
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
