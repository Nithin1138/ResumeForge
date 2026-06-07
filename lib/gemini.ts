import { ResumeFormData, FullResumeOutput } from "@/types/resume";
import { generateTechnicalSkills, SkillCategoryOutput } from "@/lib/skillsEngine";
import { normalizeTechStack, optimizeResumeForAts } from "@/lib/atsFormatting";
import { generateLlmText, hasLlmConfigured } from "@/lib/llm";

export { callGroq as generateGroqFallback } from "@/lib/llm";

function isEmptyArray(arr: any[] | undefined | null): boolean {
  if (!arr || arr.length === 0) return true;
  return arr.every((item) => {
    if (!item) return true;
    if (typeof item === "string") return item.trim() === "";
    if (typeof item === "object") {
      return Object.entries(item).every(([key, val]) => {
        if (key === "isFlash") return true;
        if (typeof val === "string") return val.trim() === "";
        if (typeof val === "boolean") return !val;
        return true;
      });
    }
    return false;
  });
}

function sanitizeEmptyArrays(result: FullResumeOutput, formData: ResumeFormData): FullResumeOutput {
  const cleanResult = { ...result };
  if (isEmptyArray(formData.internships)) {
    cleanResult.experience = [];
  }
  if (isEmptyArray(formData.positions)) {
    cleanResult.positions = [];
  }
  if (isEmptyArray(formData.achievements)) {
    cleanResult.achievements = [];
  }
  if (isEmptyArray(formData.projects) || formData.options?.noProjects) {
    cleanResult.projects = [];
  }
  return cleanResult;
}

function finalizeResumeOutput(
  result: FullResumeOutput,
  processedSkills: SkillCategoryOutput[],
  formData: ResumeFormData
): FullResumeOutput {
  const sanitized = sanitizeEmptyArrays(result, formData);
  return optimizeResumeForAts(sanitized, processedSkills);
}

// Generate realistic mock data using student's actual inputs
const generateMockResume = (formData: ResumeFormData): FullResumeOutput => {
  const { personal, skills, projects, internships, positions, achievements, options } = formData;

  // Use the skills engine for deterministic, validated output
  const processedSkills = generateTechnicalSkills(formData);
  const findSkills = (label: string) => processedSkills.find(c => c.category === label)?.skills || [];

  const languagesList = findSkills("Programming Languages");
  const frameworksList = findSkills("Frameworks & Libraries");
  const toolsList = findSkills("Tools & Platforms");
  const databasesList = findSkills("Databases");
  const aiAndDataList = findSkills("AI & Data Technologies");
  const csConceptsList = findSkills("Core CS Concepts");

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
  const mockProjects = (projects.length > 0 && !isEmptyArray(projects)) ? projects.map((proj, idx) => {
    return {
      title: proj.title || `Project ${idx + 1}`,
      techStack: normalizeTechStack(proj.techStack || "React, Node.js"),
      duration: proj.duration || "Jan 2025 – Mar 2025",
      link: proj.link || "",
      bullets: [
        `Architected and implemented a high-performance system for ${proj.description || "core product operations"}, optimizing request latencies and response pipelines.`,
        `Integrated a robust backend to handle ${proj.keyResult || "core key features"}, scaling concurrency to handle 100+ simulated requests per second.`,
        `Streamlined deployment processes and client-side page rendering pathways, decreasing application loading times by 25%.`
      ]
    };
  }) : (options?.noProjects ? [] : [
    {
      title: "AI Interview Simulator",
      techStack: "Python, FastAPI, Next.js, OpenAI API",
      duration: "Jan 2025 – Mar 2025",
      link: "https://github.com/student/ai-prep",
      bullets: [
        "Built a full-stack automated behavioral interview prep portal, handling 150+ concurrent mock test sessions.",
        "Engineered real-time audio-to-text scoring modules, increasing interview performance rating metrics by 35%.",
        "Optimized client-side rendering pathways using React and Next.js, reducing interactive latency by 20%."
      ]
    }
  ]);

  // Build internships
  const mockExperience = (internships.length > 0 && !isEmptyArray(internships)) ? internships.map((intern) => {
    return {
      company: intern.company || "Startup Tech",
      role: intern.role || "SDE Intern",
      duration: intern.duration || "May 2025 – Jul 2025",
      bullets: [
        `Developed and optimized critical backend routes using ${intern.techUsed || "Node.js, Express"}, reducing page load times for 2,000+ daily visitors by 25%.`,
        `Collaborated in agile team sprints to deploy key features: ${intern.workDone || "data reporting metrics"}, resolving 15+ bug reports.`,
        `Configured CI/CD pipelines to automate testing and verification steps, improving deployment reliability by 30%.`
      ]
    };
  }) : [];

  // Build PORs
  const mockPositions = (positions.length > 0 && !isEmptyArray(positions)) ? positions.map((pos) => {
    return {
      title: pos.title || "Technical Coordinator",
      organization: pos.organization || "IEEE Club",
      bullet: pos.description || "Led a core team of 5 developers to build hackathon portals and hosted technical workshops."
    };
  }) : [];

  // Build Achievements
  const mockAchievements = achievements && achievements.length > 0 && !isEmptyArray(achievements)
    ? achievements.map(a => `${a.title}: ${a.description}`)
    : [];

  const firstProj = mockProjects[0];

  return {
    summary: `B.Tech student in ${branchName} at ${collegeName} specializing as a ${targetRole}. Experienced in building efficient engineering systems using ${languagesList.slice(0, 3).join(", ")}.`,
    skills: processedSkills.length > 0 ? processedSkills : [
      { category: "Programming Languages", skills: ["Python", "Java", "C++"] },
      { category: "Frameworks & Libraries", skills: ["React", "Next.js", "Express"] },
      { category: "Tools & Platforms", skills: ["Git", "Docker", "AWS"] },
      { category: "Databases", skills: ["MySQL", "PostgreSQL"] }
    ],
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
    atsScore: 92,
    breakdown: {
      keywordMatch: 28,
      atsCompatibility: 25,
      technicalStrength: 15,
      projectQuality: 15,
      recruiterReadability: 10,
      experienceCredibility: 3
    },
    strengths: [
      "Excellent technical skills categorization",
      "Strong academic standing with documented CGPA",
      "Includes exact target role keyword alignment"
    ],
    weaknesses: [
      "Missing live URLs for project verification"
    ],
    improvements: [
      "Double-check that all project links (e.g. GitHub) resolve to active repositories to build recruiter trust.",
      "Your skills category for programming languages is strong, consider adding certification badges for your cloud tools.",
      "Good quantification of results. Make sure to describe the database schemas under the experience bullets in the final Word doc."
    ],
    variantMetrics: options?.projectVariants === "3 versions" ? [
      {
        role: options?.targetRoles?.[0] || "Software Engineer",
        atsScore: 92,
        breakdown: { keywordMatch: 29, atsCompatibility: 25, technicalStrength: 14, projectQuality: 14, recruiterReadability: 8, experienceCredibility: 2 },
        strengths: ["Highly aligned to primary role", "Excellent framework usage"],
        weaknesses: ["Could add more system design terms"],
        improvements: ["Add a caching layer implementation detail."]
      },
      {
        role: options?.targetRoles?.[1] || "Data Analyst",
        atsScore: 85,
        breakdown: { keywordMatch: 22, atsCompatibility: 25, technicalStrength: 13, projectQuality: 14, recruiterReadability: 8, experienceCredibility: 3 },
        strengths: ["Strong data processing skills"],
        weaknesses: ["Missing visualization keywords"],
        improvements: ["Mention tools like Tableau or PowerBI."]
      },
      {
        role: options?.targetRoles?.[2] || "Backend Engineer",
        atsScore: 88,
        breakdown: { keywordMatch: 26, atsCompatibility: 25, technicalStrength: 14, projectQuality: 14, recruiterReadability: 7, experienceCredibility: 2 },
        strengths: ["Good API design metrics"],
        weaknesses: ["Lacking database scaling examples"],
        improvements: ["Quantify database query optimization."]
      }
    ] : undefined,
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
  const { personal, skills, projects, internships, positions, achievements, options } = formData;

  const wantsVariants = options?.projectVariants === "3 versions";
  const r1 = options?.targetRoles?.[0] || "Frontend Engineer";
  const r2 = options?.targetRoles?.[1] || "Backend Engineer";
  const r3 = options?.targetRoles?.[2] || "Fullstack Engineer";

  const instruction15 = wantsVariants
    ? `15. PROJECT VARIANTS: You MUST provide exactly 3 distinct versions of the bullets tailored to the target roles selected (Role 1: ${r1}, Role 2: ${r2}, Role 3: ${r3}) inside a "variants" array. The standard "bullets" array must still have the primary version. ADDITIONALLY, you MUST include a "variantMetrics" array at the root level containing exactly 3 objects with role-specific "role" (matching these 3 roles exactly), "atsScore", "breakdown", "strengths", "weaknesses", and "improvements".`
    : `15. PROJECT VARIANTS: Since PROJECT VARIANTS PREFERENCE is "1 version", you MUST NOT include the "variants" field in projects nor the "variantMetrics" field in the root JSON. Only output standard "bullets".`;

  const variantsSchema = wantsVariants
    ? `,
      "variants": [
        { "role": "${r1}", "bullets": ["${r1} focused bullet 1", "${r1} focused bullet 2", "${r1} focused bullet 3"] },
        { "role": "${r2}", "bullets": ["${r2} focused bullet 1", "${r2} focused bullet 2", "${r2} focused bullet 3"] },
        { "role": "${r3}", "bullets": ["${r3} focused bullet 1", "${r3} focused bullet 2", "${r3} focused bullet 3"] }
      ]`
    : ``;

  const variantMetricsSchema = wantsVariants
    ? `,
  "variantMetrics": [
    {
      "role": "${r1}",
      "atsScore": 93,
      "breakdown": {
        "keywordMatch": 29,
        "atsCompatibility": 25,
        "technicalStrength": 15,
        "projectQuality": 15,
        "recruiterReadability": 10,
        "experienceCredibility": 3
      },
      "strengths": ["Strong ${r1} skills."],
      "weaknesses": ["Missing other database/cloud keywords."],
      "improvements": ["Add cloud deployment."]
    },
    {
      "role": "${r2}",
      "atsScore": 88,
      "breakdown": {
        "keywordMatch": 25,
        "atsCompatibility": 25,
        "technicalStrength": 14,
        "projectQuality": 14,
        "recruiterReadability": 8,
        "experienceCredibility": 2
      },
      "strengths": ["Strong ${r2} skills."],
      "weaknesses": ["Lacks UI experience."],
      "improvements": ["Add simple UI."]
    },
    {
      "role": "${r3}",
      "atsScore": 90,
      "breakdown": {
        "keywordMatch": 27,
        "atsCompatibility": 25,
        "technicalStrength": 15,
        "projectQuality": 14,
        "recruiterReadability": 9,
        "experienceCredibility": 2
      },
      "strengths": ["Well-rounded ${r3} profile."],
      "weaknesses": ["Lacks specialized topics."],
      "improvements": ["Highlight optimization details."]
    }
  ]`
    : ``;

  // ── Run deterministic skills engine BEFORE LLM call ──────────────────
  const processedSkills = generateTechnicalSkills(formData);
  if (process.env.NODE_ENV !== "production") {
    console.log("🔧 Skills Engine Output:", JSON.stringify(processedSkills, null, 2));
  }

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
8. PROJECT BULLET COUNTS: The priority of the projects corresponds to their order in the list. For the FIRST TWO projects (Top 2 priorities), generate EXACTLY 3 bullet points each. For ANY ADDITIONAL projects (3rd or 4th priorities, i.e., Minor Projects), generate EXACTLY 2 bullet points each to save space on the page. Internship/experience items MUST contain exactly 3 or 4 bullet points.
9. For skills: group logically. Do not repeat skills across sections.
10. For the summary: You must explicitly mention the exact target role: "${personal.targetRole}" early in the summary text. Keep the summary targeted and professional, strictly 1-2 sentences maximum, aiming to fill between 1.5 to 2 lines on the page (approximately 110 to 160 characters in total). Do NOT make it extremely short (such as under 80 characters or a brief phrase like 'Delivers software solutions'). It must read as a cohesive summary describing the candidate's core expertise and engineering background.
11. If the tech stack is already displayed below the project title, do NOT repeat technologies inside bullet points unless absolutely necessary for explaining a specific implementation detail. Focus strictly on technical implementation, architecture, and outcomes.
12. Avoid fake corporate buzzwords or exaggerated claims inside project bullet points.
13. IMPORTANT FOR TIPS: Do NOT give tips about resume structure, adding keywords, or formatting (since this app handles the formatting for them). The \`atsTips\` should strictly contain highly personalized CAREER and SKILL improvement advice based on their exact input.
14. TONE ADAPTATION: Adapt your writing style precisely to the TONE PREFERENCE specified by the user.
${instruction15}
16. BULLET CHARACTER LENGTH LIMITS: To optimize readability and ATS compliance, every single bullet point in projects and experience sections MUST be between 65 and 135 characters in length. Do not make bullet points shorter than 65 characters or longer than 135 characters.
17. ATS SCORE ENGINE v2.0:
    Calculate the ATS score deterministically using fixed weighted categories. DO NOT GUESS.
    - Category 1: Keyword Match & Role Alignment (30 Points). Evaluate required tech, domain terms. 0-10 weak, 11-20 moderate, 21-30 strong.
    - Category 2: ATS Compatibility (25 Points). Our app formats this perfectly, so default to 23-25 unless data is severely lacking.
    - Category 3: Technical Strength (15 Points). Evaluate skill quality, complexity. 0-5 weak, 6-10 average, 11-15 strong.
    - Category 4: Project Quality & Impact (15 Points). Evaluate metrics, complexity. 0-5 weak, 6-10 moderate, 11-15 strong.
    - Category 5: Recruiter Readability (10 Points). Evaluate bullet structure, action verbs. 0-3 poor, 4-7 average, 8-10 excellent.
    - Category 6: Experience & Credibility (5 Points). Evaluate internships, achievements. 0-2 weak, 3-4 moderate, 5 strong.
    ANTI-INFLATION RULES: Never assign >95 or <40. No projects/internships = 40-60. Strong projects/metrics = 80-95.
    Output the exact breakdown.
    PARSING RULES (DO NOT PENALIZE): ATSLift auto-formats skill lines (max 95 chars per category) and tech stacks (max 6 tools on a dedicated line below the project title). NEVER deduct ATS Compatibility or list weaknesses about parsing quirks, long skill lines, or inline tech stacks.
21. EMPTY INPUT HANDLING:
    - If the input "INTERNSHIPS/EXPERIENCE" is empty, the "experience" array in your JSON output MUST be empty: []. Do NOT invent, reuse, or hallucinate internships, and do NOT copy/move projects or achievements into the experience section.
    - If the input "POSITIONS OF RESPONSIBILITY" is empty, the "positions" array in your JSON output MUST be empty: []. Do NOT invent, reuse, or hallucinate positions.
    - If the input "ACHIEVEMENTS" is empty, the "achievements" array in your JSON output MUST be empty: []. Do NOT invent, reuse, or hallucinate achievements.
19. SKILLS & TECH STACK FORMATTING:
    - Each skill category line must fit within 95 characters when skills are comma-separated. Prioritize the most relevant skills; omit overflow rather than writing a long line.
    - For each project, set "techStack" as a comma-separated string of at most 6 core technologies (e.g. "Python, FastAPI, React.js, PostgreSQL"). Never embed the tech stack inside the project title.
    - Do NOT repeat the full tech stack inside bullet points (it appears on its own line in the final document).
20. ENGINEER-GRADE PROJECT BULLETS:
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
  - METRICS, IMPACT & GOOGLE X-Y-Z FORMULA:
    Write project bullet points following the Google X-Y-Z formula (Accomplishing [X], as measured by [Y], by doing [Z]), but you MUST phrase them naturally and dynamically. Do NOT literally use the words "Accomplished", "as measured by", or "by doing" in every sentence. Start each bullet point with a strong, varied technical action verb (e.g., Optimized, Trained, Refactored, Engineered, Automated).
    Always integrate specific engineering metrics—such as processing speed, model accuracy rates, data throughput, or database latency—wherever possible to demonstrate impact.
    CRITICAL: Keep each bullet point extremely concise, short, and compact to satisfy the character length limit (strictly 65 to 135 characters).
    GOOD EXAMPLES (natural, following X-Y-Z & under 135 chars): 
      * "Decreased DB latency by 45% using Redis caches and relational indexing to support 1k+ concurrent users"
      * "Achieved 93% accuracy on 5k test inputs by training a custom CNN with augmentation to automate disease detection"
      * "Boosted API pipeline efficiency by 30% by refactoring data ingestion to process 10k daily entries"
    Avoid fake corporate jargon, academic textbook phrasing, or generic words. Vary the sentence structure and starting verbs across all bullets.
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
${processedSkills.map(c => `${c.category}: ${c.skills.join(", ")}`).join("\n")}
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
PROJECT VARIANTS PREFERENCE: ${options.projectVariants || "1 version"}

OUTPUT FORMAT (return ONLY this JSON, no other text):
{
  "summary": "Motivated student specializing as a ${personal.targetRole} with hands-on skill templates...",
  "skills": [
    {
      "category": "Programming Languages",
      "skills": ["Python", "JavaScript"]
    },
    {
      "category": "Frameworks",
      "skills": ["React", "FastAPI"]
    }
  ],
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
        "Bullet point 1 with strong action verb and length between 65 and 135 characters",
        "Bullet point 2 with outcome or feature and length between 65 and 135 characters",
        "Bullet point 3 with scaling or metrics details and length between 65 and 135 characters"
      ]${variantsSchema},
      "duration": "Jan 2025 – Mar 2025",
      "link": "https://github.com/... (leave empty string if none provided)"
    }
  ],
  "experience": [
    {
      "company": "Company Name (Note: If no internships/experience items are provided in the input, return an empty array [] for the experience field)",
      "role": "Role Title",
      "duration": "May 2025 – Jul 2025",
      "bullets": [
        "First descriptive internship bullet point with character length between 65 and 135 characters",
        "Second descriptive internship bullet point with character length between 65 and 135 characters",
        "Third descriptive internship bullet point with character length between 65 and 135 characters"
      ]
    }
  ],
  "positions": [
    {
      "title": "POR Title (Note: If no positions of responsibility are provided in the input, return an empty array [] for the positions field)",
      "organization": "Org Name",
      "bullet": "One strong sentence describing contribution"
    }
  ],
  "achievements": [
    "Achievement bullet 1 (Note: If no achievements are provided in the input, return an empty array [] for the achievements field)"
  ],
  "atsScore": 92,
  "breakdown": {
    "keywordMatch": 28,
    "atsCompatibility": 25,
    "technicalStrength": 15,
    "projectQuality": 15,
    "recruiterReadability": 10,
    "experienceCredibility": 3
  },
  "strengths": [
    "Strong use of modern frameworks like React and FastAPI.",
    "Clear impact metrics in project descriptions."
  ],
  "weaknesses": [
    "Lacks cloud deployment keywords (e.g., AWS, Docker).",
    "Missing professional internship experience."
  ],
  "improvements": [
    "Add a project demonstrating backend cloud deployment.",
    "Quantify your contribution in the college club role."
  ]${variantMetricsSchema},
  "freeTierPreview": {
    "summary": "First sentence of summary only...",
    "firstProject": {
      "title": "Project 1 Title",
      "bullet": "First bullet only, rest blurred"
    }
  }
}
`;

  if (!hasLlmConfigured()) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(finalizeResumeOutput(generateMockResume(formData), processedSkills, formData)), 1500);
    });
  }

  try {
    const responseText = await generateLlmText(prompt, { json: true });
    const result = JSON.parse(responseText.trim()) as FullResumeOutput;
    return finalizeResumeOutput(result, processedSkills, formData);
  } catch (error) {
    console.error("LLM resume generation failed, using mock response:", error);
    return finalizeResumeOutput(generateMockResume(formData), processedSkills, formData);
  }
}

export async function generateSectionContent(
  sectionType: string,
  currentText: string,
  expectedBulletCount?: number,
  projectContext?: { title?: string; techStack?: string; description?: string; keyResult?: string },
  density?: "concise" | "normal" | "expand"
): Promise<string> {
  const isProjectOrExperience = sectionType.toLowerCase().includes("project") || sectionType.toLowerCase().includes("experience") || sectionType.toLowerCase().includes("work");

  const bulletCount = expectedBulletCount || 3;

  const hasUserInput = projectContext?.description || projectContext?.keyResult;

  let charLimitInstruction = "";
  if (density === "concise") {
    charLimitInstruction = "Target character count: Every single bullet point MUST be strictly between 50 and 80 characters in length. Keep them very short, punchy, compact, and highly dense.";
  } else if (density === "expand") {
    charLimitInstruction = "Target character count: Every single bullet point MUST be strictly between 130 and 180 characters in length. Elaborate slightly, adding more detail about the technical context, implementation, or impact.";
  } else {
    charLimitInstruction = "Target character count: Every single bullet point MUST be strictly between 65 and 135 characters in length.";
  }

  const prompt = isProjectOrExperience
    ? `
You are an expert resume writer. Generate EXACTLY ${bulletCount} strong resume bullet points for this project using the Google X-Y-Z formula.

PROJECT DETAILS:
- Project Name: ${projectContext?.title || sectionType}
- Tech Stack: ${projectContext?.techStack || "Not specified"}
${hasUserInput ? `- What was built (user's own words): ${projectContext?.description || "Not provided"}
- Key result / highlight (user's own words): ${projectContext?.keyResult || "Not provided"}` : `- Current bullets (rewrite these to be stronger):
${currentText}`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SYSTEM:
You are an expert ATS resume writer. Rewrite the following resume section (${sectionType}) to be more impactful, using strong action verbs, removing fluff, and making it highly professional and metric-driven if possible. Do NOT add fabricated metrics.
${isProjectOrExperience ? `CRITICAL RULE: Since this is a project or experience bullet, you MUST structure it to follow the Google X-Y-Z formula: "Accomplished [X], as measured by [Y], by doing [Z]" style structure, integrating specific engineering metrics like processing speed, model accuracy rates, or pipeline efficiency percentages.` : ""}
You MUST output EXACTLY ${bulletCount} distinct bullet points, each on a new line without any prefix symbol (no "-", "•", "*", or numbers).
${charLimitInstruction}
Do not wrap the output in quotes or markdown formatting, just return the raw text.
`
    : `
SYSTEM:
You are an expert ATS resume writer. Rewrite the following resume section (${sectionType}) to be more impactful, using strong action verbs, removing fluff, and making it highly professional and metric-driven if possible. Do NOT add fabricated metrics.
If it's a bullet point, output a single bullet point. If it's a paragraph, output a paragraph.
Do not wrap the output in quotes or markdown formatting, just return the raw text.
CURRENT TEXT:
${currentText}
`;

  function cleanSectionText(text: string, isBulletList: boolean): string {
    const lines = text.trim().split("\n");
    const cleaned = lines.map(line => {
      let cleanedLine = line.trim();
      if (isBulletList) {
        cleanedLine = cleanedLine.replace(/^[-*•\d\.\s]+/, "");
      } else {
        cleanedLine = cleanedLine.replace(/^[-*•\s]+/, "");
      }
      return cleanedLine;
    }).filter(Boolean);
    return cleaned.join("\n");
  }

  if (!hasLlmConfigured()) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(cleanSectionText(currentText + " (Mock Regenerated)", isProjectOrExperience)), 1000);
    });
  }

  try {
    const responseText = await generateLlmText(prompt, { json: false });
    return cleanSectionText(responseText, isProjectOrExperience);
  } catch (error) {
    console.error("LLM section generation failed, using current text:", error);
    return cleanSectionText(currentText, isProjectOrExperience);
  }
}

function localReorderSkillsFallback(currentSkills: any[], jobDescription: string): any[] {
  const jdLower = jobDescription.toLowerCase();
  const isDataScience = jdLower.includes("data science") ||
    jdLower.includes("datascience") ||
    jdLower.includes("machine learning") ||
    jdLower.includes("deep learning") ||
    jdLower.includes("artificial intelligence") ||
    jdLower.includes("data scientist") ||
    jdLower.includes("ml engineer") ||
    jdLower.includes("nlp");

  // Create deep copy
  let skills = JSON.parse(JSON.stringify(currentSkills));

  if (isDataScience) {
    // Find Data Engineering and AI & Data Technologies categories
    const deIndex = skills.findIndex((c: any) => c.category.toUpperCase() === "DATA ENGINEERING");
    let aiIndex = skills.findIndex((c: any) =>
      c.category.toUpperCase() === "AI & DATA TECHNOLOGIES" ||
      c.category.toUpperCase() === "AI & DATA TECHNOLOGIE" ||
      c.category.toUpperCase() === "DATA TECHNOLOGIES" ||
      c.category.toUpperCase() === "DATA TECHNOLOGIE"
    );

    const deSkills = deIndex !== -1 ? skills[deIndex].skills : [];

    if (deIndex !== -1) {
      // Remove Data Engineering category
      skills.splice(deIndex, 1);
    }

    // Merge skills into AI & Data Technologies (rename to DATA TECHNOLOGIES)
    if (aiIndex !== -1) {
      skills[aiIndex].skills = Array.from(new Set([...skills[aiIndex].skills, ...deSkills]));
      skills[aiIndex].category = "DATA TECHNOLOGIES";
    } else if (deSkills.length > 0) {
      // Create new category "DATA TECHNOLOGIES"
      skills.push({
        category: "DATA TECHNOLOGIES",
        skills: deSkills
      });
    }

    // Reorder categories to make DATA TECHNOLOGIES first
    const dtCatIndex = skills.findIndex((c: any) => c.category.toUpperCase() === "DATA TECHNOLOGIES");
    if (dtCatIndex !== -1) {
      const [dtCat] = skills.splice(dtCatIndex, 1);
      skills.unshift(dtCat);
    }
  } else {
    // Basic relevance sort based on keyword occurrences
    skills.sort((a: any, b: any) => {
      const aHas = jdLower.includes(a.category.toLowerCase()) || a.skills.some((s: string) => jdLower.includes(s.toLowerCase()));
      const bHas = jdLower.includes(b.category.toLowerCase()) || b.skills.some((s: string) => jdLower.includes(s.toLowerCase()));
      if (aHas && !bHas) return -1;
      if (!aHas && bHas) return 1;
      return 0;
    });
  }

  return skills;
}

function cleanAndParseJson(text: string): any {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  }
  return JSON.parse(cleaned);
}

function extractSkillsArray(parsedJson: any): any[] {
  if (Array.isArray(parsedJson)) {
    return parsedJson;
  }
  if (parsedJson && typeof parsedJson === "object") {
    if (Array.isArray(parsedJson.skills)) {
      return parsedJson.skills;
    }
    if (Array.isArray(parsedJson.categories)) {
      return parsedJson.categories;
    }
    for (const key of Object.keys(parsedJson)) {
      if (Array.isArray(parsedJson[key])) {
        const first = parsedJson[key][0];
        if (first && typeof first === "object" && ("category" in first || "skills" in first)) {
          return parsedJson[key];
        }
      }
    }
  }
  return [];
}

function enforceRequiredCategories(originalSkills: any[], optimizedSkills: any[]): any[] {
  const REQUIRED = ["TOOLS & PLATFORMS", "CORE CS CONCEPTS", "DATABASES"];
  let result = JSON.parse(JSON.stringify(optimizedSkills));

  for (const reqCat of REQUIRED) {
    const origItem = originalSkills.find(c => c && c.category && c.category.toUpperCase() === reqCat);
    if (origItem) {
      const optIndex = result.findIndex((c: any) => c && c.category && c.category.toUpperCase() === reqCat);
      if (optIndex === -1) {
        result.push(origItem);
      }
    }
  }
  return result;
}

export async function generateReorderedSkills(currentSkills: any[], jobDescription: string): Promise<any[]> {
  const prompt = `
SYSTEM:
You are an expert ATS resume writer. Your task is to re-order, filter, clean, and merge the candidate's technical skills based on the provided job description to make the resume highly targeted and relevant.

CRITICAL RULES:
1. Re-order the categories and the skills within them so that the most relevant ones to the job description appear first.
2. Filter/prune any completely irrelevant skills or categories that do not fit the job description at all. Keep only required things.
3. SPECIFIC RULE: If the job description is related to Data Science, Data Scientist, Machine Learning, Deep Learning, or AI:
   - REMOVE "Data Engineering" as a separate category.
   - MERGE any relevant skills from "Data Engineering" (e.g. ETL Pipelines, Data Warehousing, etc.) into a category called "DATA TECHNOLOGIES" or "AI & DATA TECHNOLOGIES".
4. NEVER remove, delete, or prune "Tools & Platforms", "Core CS Concepts", or "Databases". These are essential technical foundations and must always be kept in the final output (though you can re-order them).
5. Output ONLY a valid JSON array of categories, where each item has "category" (string) and "skills" (array of strings). Do not include any markdown formatting (like \`\`\`json) or surrounding text.

CURRENT SKILLS JSON:
${JSON.stringify(currentSkills, null, 2)}

JOB DESCRIPTION:
${jobDescription}
`;

  if (!hasLlmConfigured()) {
    const result = localReorderSkillsFallback(currentSkills, jobDescription);
    return enforceRequiredCategories(currentSkills, result);
  }

  try {
    const responseText = await generateLlmText(prompt, { json: true });
    const parsed = cleanAndParseJson(responseText);
    const result = extractSkillsArray(parsed);
    return enforceRequiredCategories(currentSkills, result);
  } catch (error) {
    console.error("LLM skills reorder failed, using local reorder:", error);
    const result = localReorderSkillsFallback(currentSkills, jobDescription);
    return enforceRequiredCategories(currentSkills, result);
  }
}

