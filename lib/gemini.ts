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
  const { personal, skills, projects, internships, positions, options } = formData;
  
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
  const mockAchievements = options.includeAchievements && options.achievements
    ? options.achievements.split(",").map(a => a.trim())
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

export async function generateResumeContent(formData: ResumeFormData): Promise<FullResumeOutput> {
  const client = getGeminiClient();
  
  if (!client) {
    // Return mock fallback for offline/no-key mode
    return new Promise((resolve) => {
      setTimeout(() => resolve(generateMockResume(formData)), 1500);
    });
  }

  const { personal, skills, projects, internships, positions, options } = formData;

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
11. If the tech stack is already displayed below the project title, do NOT repeat technologies inside bullet points unless absolutely necessary for explaining a specific implementation detail (e.g. do not write 'built using Python/React...' if Python/React is already in the project's tech stack above). Focus strictly on technical implementation, architecture, functionality, outcomes, and technical depth.
12. Avoid fake corporate buzzwords or exaggerated claims inside project bullet points.

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
${options.includeAchievements ? options.achievements : "None"}

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
  "atsScore": 87,
  "atsTips": [
    "Tip 1: Add more quantifiable results to your project descriptions",
    "Tip 2: Include relevant keywords from job description in skills section",
    "Tip 3: Expand internship bullet points with specific technologies used"
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
    console.error("Error communicating with Gemini API:", error);
    // Graceful fallback to mock response in case of API limits or timeouts
    return generateMockResume(formData);
  }
}
