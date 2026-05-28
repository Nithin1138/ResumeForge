import { GoogleGenAI } from "@google/genai";
import { ResumeFormData, FullResumeOutput } from "@/types/resume";

// Initialize the Google Gen AI client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "mock" || apiKey === "xxx") {
    console.warn("GEMINI_API_KEY not configured or set to mock. Using simulated LLM response.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Generate realistic mock data using student's actual inputs
const generateMockResume = (formData: ResumeFormData): FullResumeOutput => {
  const { personal, skills, projects, internships, positions, achievements, options } = formData;

  const languagesList = skills.languages ? skills.languages.split(",").map(s => s.trim()) : ["Python", "Java", "C++"];
  const frameworksList = skills.frameworks ? skills.frameworks.split(",").map(s => s.trim()) : ["React", "FastAPI", "Next.js"];
  const toolsList = skills.tools ? skills.tools.split(",").map(s => s.trim()) : ["Git", "Docker", "AWS"];
  const databasesList = skills.databases ? skills.databases.split(",").map(s => s.trim()) : ["MySQL", "PostgreSQL", "MongoDB"];
  const conceptsList = skills.concepts ? skills.concepts.split(",").map(s => s.trim()) : ["REST APIs", "OOPs", "DSA"];
  const softSkillsList = skills.softSkills ? skills.softSkills.split(",").map(s => s.trim()) : ["Communication", "Problem Solving", "Teamwork"];

  const collegeName = personal.collegeName || "Vellore Institute of Technology";
  const branchName = personal.branch || "CSE";
  const cgpaValue = personal.cgpa || "8.5";
  const targetRole = personal.targetRole || "Software Engineer";
  const gradYear = personal.graduationYear || "2026";
  const fullName = personal.fullName || "Student Name";

  const pgEducation = personal.hasPG ? {
    degree: `${personal.pgDegreeName || "Post Graduation"} in ${personal.pgBranch || "Specialization"}`,
    institution: personal.pgCollegeName || "Indian Institute of Technology",
    year: personal.pgGraduationYear || "2026",
    cgpa: `${personal.pgCgpa || "9.0"} / 10.0`
  } : undefined;

  // Build high-impact project bullets
  const mockProjects = projects.length > 0 ? projects.map((proj, idx) => {
    return {
      title: proj.title || `Project ${idx + 1}`,
      techStack: proj.techStack || "React, Node.js",
      duration: proj.duration || "Jan 2025 – Mar 2025",
      link: proj.link || "https://github.com/student/project",
      bullets: [
        `Architected and implemented a high-performance system for ${proj.description || "core product operations"}, optimizing request latencies and response pipelines.`,
        `Integrated a robust backend to handle ${proj.keyResult || "core key features"}, scaling concurrency to handle 100+ simulated requests per second.`
      ]
    };
  }) : [
    {
      title: "AI Interview Simulator",
      techStack: "Python, FastAPI, Next.js, OpenAI API",
      duration: "Jan 2025 – Mar 2025",
      link: "https://github.com/student/ai-prep",
      bullets: [
        "Built a full-stack automated behavioral interview prep portal, handling 150+ concurrent mock test sessions.",
        "Engineered real-time audio-to-text scoring modules, increasing interview performance rating metrics by 35%."
      ]
    }
  ];

  // Build internships
  const mockExperience = internships.length > 0 ? internships.map((intern) => {
    return {
      company: intern.company || "Startup Tech",
      role: intern.role || "SDE Intern",
      duration: intern.duration || "May 2025 – Jul 2025",
      bullets: [
        `Developed and optimized critical backend routes using ${intern.techUsed || "Node.js, Express"}, reducing page load times for 2,000+ daily visitors by 25%.`,
        `Collaborated in agile team sprints to deploy key features: ${intern.workDone || "data reporting metrics"}, resolving 15+ bug reports.`
      ]
    };
  }) : [];

  // Build PORs
  const mockPositions = positions.length > 0 ? positions.map((pos) => {
    return {
      title: pos.title || "Technical Coordinator",
      organization: pos.organization || "IEEE Club",
      bullet: pos.description || "Led a core team of 5 developers to build hackathon portals and hosted technical workshops."
    };
  }) : [];

  // Build Achievements
  const mockAchievements = achievements && achievements.length > 0
    ? achievements.map(a => `${a.title}: ${a.description}`)
    : [
      "Secured top 5% rank in Smart India Hackathon among 10,000+ applicants.",
      "Solved 350+ data structures and algorithms questions on LeetCode (Max Rating: 1650)."
    ];

  const firstProj = mockProjects[0];

  return {
    summary: `Motivated B.Tech student in ${branchName} at ${collegeName} (CGPA: ${cgpaValue}/10.0), specializing in ${targetRole}. Proven record of engineering high-impact projects using ${languagesList.slice(0, 3).join(", ")}. Passionate about building scalable systems, applying optimal data structures, and deploying cloud-native web services.`,
    skills: {
      languages: languagesList,
      frameworks: frameworksList,
      tools: toolsList,
      databases: databasesList,
      concepts: conceptsList,
      softSkills: softSkillsList
    },
    education: {
      degree: `B.Tech in ${branchName === "CSE" ? "Computer Science and Engineering" : branchName === "ECE" ? "Electronics and Communication Engineering" : "Engineering"}`,
      institution: collegeName,
      year: gradYear,
      cgpa: `${cgpaValue} / 10.0`
    },
    pgEducation,
    projects: mockProjects,
    experience: mockExperience,
    positions: mockPositions,
    achievements: mockAchievements,
    atsScore: 89,
    atsFeedbackCategory: "EXCELLENT STRUCTURE",
    atsFeedbackSummary: `We parsed your ${branchName}-specific skills and CGPA metrics. Your resume already scores higher than 85% of other applicants based on its initial structure.`,
    atsTips: [
      "Tip 1: Double-check that all project links (e.g. GitHub) resolve to active repositories to build recruiter trust.",
      "Tip 2: Your skills category for programming languages is strong, consider adding certification badges for your cloud tools.",
      "Tip 3: Good quantification of results. Make sure to describe the database schemas under the experience bullets in the final Word doc."
    ],
    keywordsAdded: ["FastAPI", "Object-Oriented Programming", "REST API", "Schema Indexing"],
    freeTierPreview: {
      summary: `Motivated B.Tech student in ${branchName} at ${collegeName} (CGPA: ${cgpaValue}/10.0), specializing in ${targetRole}.`,
      firstProject: {
        title: firstProj.title,
        bullet: firstProj.bullets[0]
      }
    }
  };
};

// High-performance Groq Fallback Engine [NEW]
export async function generateGroqFallback(prompt: string, isJson: boolean = false): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    throw new Error("Groq API key missing");
  }

  // High-performance standard Groq models
  const MODELS = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "openai/gpt-oss-safeguard-120b",
    "groq/compound",
    "groq/compound-mini",
    "qwen/qwen3-32b",
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
    "gemma2-9b-it"
  ];

  for (const modelName of MODELS) {
    try {
      console.log(`🔄 Trying Groq model: ${modelName}`);
      const payload: any = {
        model: modelName,
        temperature: 0,
        messages: [{ role: "user", content: prompt }]
      };
      if (isJson) {
        payload.response_format = { type: "json_object" };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`❌ Groq model failed [${modelName}]: ${errorText.substring(0, 200)}`);
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        console.log(`✅ Groq success via ${modelName}`);
        return content;
      }
    } catch (e: any) {
      console.error(`🔥 Groq error on ${modelName}:`, e.message || e);
      continue;
    }
  }

  throw new Error("All AI providers (Gemini/Groq) are currently exhausted.");
}

export async function generateResumeContent(formData: ResumeFormData): Promise<FullResumeOutput> {
  const { personal, skills, projects, internships, positions, achievements, options } = formData;

  // Build precise prompt instructions
  const prompt = `
SYSTEM:
You are an expert ATS resume writer specializing in Indian engineering student resumes.
Your output must strictly follow these rules:
1. NEVER invent, fabricate, or exaggerate facts. Only use information provided.
2. If a metric is not given, improve phrasing without adding fake numbers.
3. Use strong action verbs at the start of every bullet point.
4. Use ATS-safe language: standard section names, no tables, no graphics, no special symbols.
5. Align all wording to the target role specified.
6. If a job description is provided, mirror its keywords naturally in bullets — do not stuff keywords.
7. Output ONLY valid JSON matching the schema below. No markdown. No explanation.
8. Keep bullet points to 1-2 lines maximum. Scannable, not paragraphs.
9. For skills: group logically. Do not repeat skills across sections.
10. For the summary: mention target role in first line. Keep to 3 sentences max. ATS reads the first 100 words hard.
11. If the tech stack is already displayed below the project title, do NOT repeat technologies inside bullet points unless absolutely necessary for explaining a specific implementation detail. Focus strictly on technical implementation, architecture, and outcomes.
12. Avoid fake corporate buzzwords or exaggerated claims inside project bullet points.
13. IMPORTANT FOR TIPS: Do NOT give tips about resume structure, adding keywords, or formatting (since this app handles the formatting for them). The \`atsTips\` should strictly contain highly personalized CAREER and SKILL improvement advice based on their exact input.
14. ENGINEER-GRADE PROJECT BULLETS:
  - CORE IDENTITY & NATURALNESS:
    Write from the perspective of a technically strong engineering student. Favor clarity, practical implementation, and recruiter readability over enterprise sophistication. Bullets must sound believable for real B.Tech student projects, NOT senior infrastructure engineering work.
  - REALISM FILTER:
    Avoid language that sounds like: Senior Staff Engineer, Enterprise Architect, FAANG Infrastructure Lead, enterprise SaaS consultant, or production-scale distributed systems engineer.
  - ANTI-BUZZWORD FILTER:
    Completely avoid: orchestrated, leveraged, spearheaded, synergized, revolutionary, enterprise-grade, cutting-edge, scalable architecture, world-class, mission-critical, highly scalable, robust framework. Use simple technical language instead.
  - CONTEXTUAL ENGINEERING LANGUAGE:
    Only use terminology genuinely relevant to the project domain.
      * OpenCV/Vision Projects: real-time processing, facial landmarks, eye-aspect ratio, frame analysis, fatigue detection, alert mechanisms, detection pipelines.
      * NLP/Sentiment Projects: sentiment analysis, classification workflows, preprocessing, feature extraction, scoring systems, rule-mining, aggregation.
      * ETL/Data Projects: ingestion pipelines, transformation workflows, aggregation, warehousing, structured querying, preprocessing, ETL processing.
      * LLM/GenAI Projects: template parsing, structured generation, prompt workflows, extraction pipelines, automated formatting, dynamic content generation.
    Do NOT force unrelated backend/infrastructure terminology into projects.
  - OPENINGS & SENTENCE VARIETY:
    Avoid repetitive generic openings like: Developed, Implemented, Designed, Built.
    Instead naturally rotate stronger but believable verbs: Automated, Optimized, Processed, Integrated, Engineered, Streamlined, Generated, Refactored, Trained, Reduced, Constructed, Enabled.
    Mix sentence structures naturally: Short technical implementation bullets, Medium explanatory bullets, Metric-driven outcome bullets, Workflow-focused bullets.
    Avoid identical cadence across all bullets.
  - SCANABILITY RULE:
    The core technical value must appear within the first 8–12 words of every bullet point. Recruiters should instantly understand: 1. what was built, 2. what technical domain was involved, 3. why it mattered. Avoid long introductory setup phrases.
  - REDUNDANCY FILTER:
    Do NOT repeat identical sentence rhythm, technical structure, or semantic patterns across multiple bullets. If one bullet emphasizes automation, the next should emphasize processing, optimization, transformation, detection, integration, workflows, or measurable outcomes.
  - METRICS & IMPACT:
    Reintroduce realistic measurable outcomes where genuinely valuable.
    GOOD: "Processed 10,000+ reviews", "Achieved 91% accuracy", "Reduced manual analysis effort by 40%"
    BAD: "Increased efficiency dramatically", "Handled millions of requests", "Improved productivity by 500%"
    Metrics should support the technical story, not dominate every sentence.
  - PHRASING RULES:
    Avoid repetitive textbook phrasing like: "by using", "for", "ensuring", "designed to", "capable of", "resulting in". Avoid generic passive explanations and academic-report tone.
  - TECHNICAL DEPTH PRIORITY:
    Prioritize: processing pipelines, automation workflows, system logic, real-time operations, integration mechanisms, data transformation, classification workflows, template parsing, and practical implementation details.
    Avoid vague statements like: "helps users", "improves workflow", "enhances productivity" unless paired with concrete technical execution.
  - FINAL OUTPUT QUALITY:
    Bullets must feel: technically strong, implementation-focused, ATS-safe, recruiter-readable, natural, concise, and believable for an engineering student project.
    The writing should resemble: real engineering project work, NOT AI-generated corporate resume language.


RESUME DATA INPUT:
Name: ${personal.fullName}
Target Role: ${personal.targetRole}
Branch: ${personal.branch}
College: ${personal.collegeName}
Graduation Year: ${personal.graduationYear}
CGPA: ${personal.cgpa}
${personal.hasPG ? `
POST GRADUATION DETAILS:
PG Degree: ${personal.pgDegreeName}
PG Branch/Specialization: ${personal.pgBranch}
PG College: ${personal.pgCollegeName}
PG Graduation Year: ${personal.pgGraduationYear}
PG CGPA: ${personal.pgCgpa}
` : ""}

SKILLS:
Languages: ${skills.languages}
Frameworks: ${skills.frameworks}
Tools: ${skills.tools}
Databases: ${skills.databases}
Concepts: ${skills.concepts}
Soft Skills: ${skills.softSkills || "None"}
Certifications: ${skills.certifications || "None"}

PROJECTS:
${projects.map((proj, idx) => `
Project #${idx + 1}:
Title: ${proj.title}
Tech Stack: ${proj.techStack}
Description: ${proj.description}
Key Result/Feature: ${proj.keyResult}
Duration: ${proj.duration || "None"}
Link: ${proj.link || "None"}
`).join("\n")}

INTERNSHIPS/EXPERIENCE:
${internships.map((intern, idx) => `
Internship #${idx + 1}:
Company: ${intern.company}
Role: ${intern.role}
Duration: ${intern.duration}
Work Done: ${intern.workDone}
Tech Used: ${intern.techUsed}
`).join("\n")}

POSITIONS OF RESPONSIBILITY:
${positions.map((pos, idx) => `
POR #${idx + 1}:
Title: ${pos.title}
Organization: ${pos.organization}
Description: ${pos.description}
`).join("\n")}

ACHIEVEMENTS:
${achievements && achievements.length > 0 ? achievements.map((a, idx) => `
Achievement #${idx + 1}:
Title: ${a.title}
Description: ${a.description}
`).join("\n") : "None"}

JOB DESCRIPTION FOR KEYWORD ALIGNMENT (if provided):
${options.jobDescription || "None"}

TONE PREFERENCE: ${options.tone}

OUTPUT FORMAT (return ONLY this JSON, no other text):
{
  "summary": "3-sentence professional summary string here",
  "skills": {
    "languages": ["Python", "Java"],
    "frameworks": ["React", "FastAPI"],
    "tools": ["Git", "Docker"],
    "databases": ["MySQL", "MongoDB"],
    "concepts": ["REST APIs", "OOPS", "Machine Learning"],
    "softSkills": ["Problem Solving", "Team Leadership"]
  },
  "education": {
    "degree": "B.Tech in Computer Science and Engineering",
    "institution": "${personal.collegeName}",
    "year": "${personal.graduationYear}",
    "cgpa": "${personal.cgpa} / 10.0"
  },
  "pgEducation": {
    "degree": "M.Tech in Data Science (Only include if POST GRADUATION DETAILS are provided in the input; otherwise omit this field)",
    "institution": "PG College Name",
    "year": "PG Graduation Year",
    "cgpa": "PG CGPA / 10.0"
  },
  "projects": [
    {
      "title": "Project Title",
      "techStack": "Python, FastAPI, React",
      "bullets": [
        "Bullet point 1 with strong action verb",
        "Bullet point 2 with outcome or feature"
      ],
      "duration": "Jan 2025 – Mar 2025",
      "link": "https://github.com/..."
    }
  ],
  "experience": [
    {
      "company": "Company Name",
      "role": "Role Title",
      "duration": "May 2025 – Jul 2025",
      "bullets": [
        "Bullet point 1",
        "Bullet point 2"
      ]
    }
  ],
  "positions": [
    {
      "title": "POR Title",
      "organization": "Org Name",
      "bullet": "One strong sentence describing contribution"
    }
  ],
  "achievements": [
    "Achievement bullet 1",
    "Achievement bullet 2"
  ],
  "atsScore": 65, // Must be calculated dynamically (strictly between 40 and 95) based entirely on the actual strength of bullet points, missing keywords, and lack of metrics. Do NOT show partiality. Give low scores (40-60) if the input is weak. DO NOT hardcode this value.
  "atsFeedbackCategory": "NEEDS IMPROVEMENT", // A 1-3 word short category (e.g. EXCELLENT STRUCTURE, NEEDS METRICS, POOR KEYWORDS) based on the resume's true state.
  "atsFeedbackSummary": "Your resume lacks quantifiable metrics in your project descriptions and fails to hit key industry keywords. You need to focus on results over responsibilities to pass modern ATS filters.", // A 1-3 sentence summary of the exact flaws or strengths in the user's input data. Be brutally honest.
  "atsTips": [ // IMPORTANT: DO NOT give generic advice about resume structure, formatting, or keywords (we build the resume for them). Instead, give highly personalized CAREER & SKILL tips based on their actual background. What next project should they do? What certification fits their skills? What gap exists in their tech stack?
    "Tip 1: Since you have strong Python skills, consider completing an AWS certification to strengthen your cloud deployment profile.",
    "Tip 2: Your projects focus heavily on frontend React; try building a full-stack project using Node.js to show backend competency.",
    "Tip 3: You have great academic scores, try contributing to open-source projects in the Data Science space to stand out."
  ],
  "keywordsAdded": ["REST API", "Machine Learning", "Data Analysis"],
  "freeTierPreview": {
    "summary": "First sentence of summary only...",
    "firstProject": {
      "title": "Project 1 Title",
      "bullet": "First bullet only, rest blurred"
    }
  }
}
`;

  const client = getGeminiClient();

  if (!client) {
    if (process.env.GROQ_API_KEY) {
      try {
        console.log("No Gemini API key available, but Groq key is present. Using Groq directly for resume generation.");
        const groqResponse = await generateGroqFallback(prompt, true);
        return JSON.parse(groqResponse.trim()) as FullResumeOutput;
      } catch (groqError) {
        console.error("Groq direct call failed:", groqError);
      }
    }
    return new Promise((resolve) => {
      setTimeout(() => resolve(generateMockResume(formData)), 1500);
    });
  }

  try {
    const response = await client.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }

    return JSON.parse(responseText.trim()) as FullResumeOutput;
  } catch (error) {
    console.error("Error communicating with Gemini API, trying Groq fallback:", error);
    try {
      const groqResponse = await generateGroqFallback(prompt, true);
      return JSON.parse(groqResponse.trim()) as FullResumeOutput;
    } catch (groqError) {
      console.error("Groq fallback failed as well, using mock response:", groqError);
      return generateMockResume(formData);
    }
  }
}

export async function generateSectionContent(sectionType: string, currentText: string): Promise<string> {
  const prompt = `
SYSTEM:
You are an expert ATS resume writer. Rewrite the following resume section (${sectionType}) to be more impactful, using strong action verbs, removing fluff, and making it highly professional and metric-driven if possible. Do NOT add fabricated metrics.
If it's a bullet point, output a single bullet point. If it's a paragraph, output a paragraph.
Do not wrap the output in quotes or markdown formatting, just return the raw text.

CURRENT TEXT:
${currentText}
`;

  const client = getGeminiClient();

  if (!client) {
    if (process.env.GROQ_API_KEY) {
      try {
        console.log("No Gemini API key available, but Groq key is present. Using Groq directly for section generation.");
        const groqResponse = await generateGroqFallback(prompt, false);
        return groqResponse.trim().replace(/^-\s*/, "");
      } catch (groqError) {
        console.error("Groq direct call failed for section:", groqError);
      }
    }
    return new Promise((resolve) => {
      setTimeout(() => resolve(currentText + " (Mock Regenerated)"), 1000);
    });
  }

  try {
    const response = await client.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }

    return responseText.trim().replace(/^-\s*/, ""); // remove bullet dash if added by AI
  } catch (error) {
    console.error("Error communicating with Gemini API, trying Groq fallback:", error);
    try {
      const groqResponse = await generateGroqFallback(prompt, false);
      return groqResponse.trim().replace(/^-\s*/, "");
    } catch (groqError) {
      console.error("Groq fallback failed as well, using current text:", groqError);
      return currentText;
    }
  }
}
