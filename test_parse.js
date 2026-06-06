const { GoogleGenAI } = require("@google/genai");
require('dotenv').config({ path: '.env' });

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("No API key");
    return;
  }
  
  const resumeText = "Nithin Kumar\nnithin.kumar@vit.edu\nVIT-AP University\nB.Tech Computer Science\nGraduation: 2025\nCGPA: 8.76\nPhone: +91 98765 43210\nGitHub: github.com/nithin\nLinkedIn: linkedin.com/in/nithin\nSkills: Python, JavaScript, React\nProjects:\n- AI Resume Builder (React, Node.js): Built a cool app. Increased speed by 10%. Link: example.com. Jan 2023 - Mar 2023\n";

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
}

RESUME TEXT:
${resumeText}
`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0,
      }
    });
    console.log(response.text);
  } catch(e) { console.error(e); }
}

run();
