/**
 * Test script for the Technical Skills Generation Engine.
 * Exercises all major pipeline steps: normalization, soft skill removal,
 * project extraction, deduplication, re-categorization, sorting, and trimming.
 * 
 * Run: npx tsx scratch/test-skills-engine.ts
 */

// We need to resolve the path alias manually for direct tsx execution
import { generateTechnicalSkills } from "../lib/skillsEngine";

// ── Test Helpers ───────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

function assertIncludes(arr: string[], item: string, msg: string) {
  assert(arr.includes(item), `${msg} — expected "${item}" in [${arr.join(", ")}]`);
}

function assertNotIncludes(arr: string[], item: string, msg: string) {
  assert(!arr.includes(item), `${msg} — "${item}" should NOT be in [${arr.join(", ")}]`);
}

// ── Build a mock ResumeFormData ────────────────────────────────────────────
function makeFormData(overrides: any = {}) {
  return {
    personal: {
      fullName: "Test User",
      email: "test@test.com",
      collegeName: "VIT",
      branch: "CSE",
      graduationYear: "2026",
      cgpa: "8.5",
      targetRole: "Software Engineer",
      phone: "",
      linkedin: "",
      github: "",
      location: "",
      hasPG: false,
    },
    skills: {
      languages: overrides.languages ?? "",
      frameworks: overrides.frameworks ?? "",
      tools: overrides.tools ?? "",
      databases: overrides.databases ?? "",
      concepts: overrides.concepts ?? "",
      softSkills: overrides.softSkills ?? "",
      certifications: overrides.certifications ?? "",
    },
    projects: overrides.projects ?? [],
    internships: overrides.internships ?? [],
    positions: [],
    achievements: [],
    options: {
      jobDescription: "",
      tone: "Professional & Formal" as const,
      projectVariants: "1 version" as const,
    },
  };
}

// ── TEST SUITE ─────────────────────────────────────────────────────────────
console.log("\n🧪 Technical Skills Engine — Test Suite\n");

// Test 1: Normalization
console.log("📋 Test 1: Skill Normalization");
{
  const form = makeFormData({
    languages: "ReactJS, NodeJS, Postgres, JS, python, c++",
    frameworks: "",
    concepts: "DSA, OOPs, DBMS, OS",
  });
  const result = generateTechnicalSkills(form);

  // ReactJS, NodeJS should be normalized and re-categorized to frameworks
  assertIncludes(result.frameworks, "React.js", "ReactJS → React.js");
  assertIncludes(result.frameworks, "Node.js", "NodeJS → Node.js");

  // Postgres → PostgreSQL (re-categorized to databases)
  assertIncludes(result.databases, "PostgreSQL", "Postgres → PostgreSQL in databases");

  // JS → JavaScript, python → Python, c++ → C++ (stay in languages)
  assertIncludes(result.languages, "JavaScript", "JS → JavaScript");
  assertIncludes(result.languages, "Python", "python → Python");
  assertIncludes(result.languages, "C++", "c++ → C++");

  // Concepts normalization
  assertIncludes(result.csConcepts, "Data Structures & Algorithms", "DSA → Data Structures & Algorithms");
  assertIncludes(result.csConcepts, "Object-Oriented Programming", "OOPs → Object-Oriented Programming");
  assertIncludes(result.csConcepts, "Database Management Systems", "DBMS → Database Management Systems");
  assertIncludes(result.csConcepts, "Operating Systems", "OS → Operating Systems");
}

// Test 2: Soft Skills Removal
console.log("\n📋 Test 2: Soft Skills Removal");
{
  const form = makeFormData({
    languages: "Python, Java",
    concepts: "Teamwork, Communication, Data Structures & Algorithms (DSA), Leadership, Problem Solving",
  });
  const result = generateTechnicalSkills(form);

  assertIncludes(result.csConcepts, "Data Structures & Algorithms", "DSA kept in concepts");
  assertNotIncludes(result.csConcepts, "Teamwork", "Teamwork removed");
  assertNotIncludes(result.csConcepts, "Communication", "Communication removed");
  assertNotIncludes(result.csConcepts, "Leadership", "Leadership removed");
  assertNotIncludes(result.csConcepts, "Problem Solving", "Problem Solving removed");
}

// Test 3: Project Intelligence Extraction
console.log("\n📋 Test 3: Project Intelligence Extraction");
{
  const form = makeFormData({
    languages: "Python",
    projects: [
      {
        title: "Drowsiness Detection System",
        techStack: "Python, OpenCV, dlib",
        description: "Built a real-time drowsiness detection system using computer vision and facial landmark analysis",
        keyResult: "Achieved 95% detection accuracy using eye-aspect ratio calculations",
        link: "",
        duration: "Jan 2025 – Mar 2025",
      },
      {
        title: "Product Sentiment Analyzer",
        techStack: "Python, VADER, Streamlit",
        description: "Developed a sentiment analysis dashboard for e-commerce product reviews using NLP techniques",
        keyResult: "Analyzed 10,000+ product reviews with 91% classification accuracy",
        link: "",
        duration: "Apr 2025 – May 2025",
      },
      {
        title: "AI Resume Builder",
        techStack: "Next.js, TypeScript, Gemini API",
        description: "Built an LLM-powered resume builder using generative AI and prompt engineering",
        keyResult: "Automated resume generation with ATS-optimized output",
        link: "",
        duration: "May 2025",
      },
    ],
  });
  const result = generateTechnicalSkills(form);

  // From OpenCV project
  assertIncludes(result.aiAndData, "Computer Vision", "OpenCV project → Computer Vision extracted");

  // From Sentiment project
  assertIncludes(result.aiAndData, "NLP", "Sentiment project → NLP extracted");
  assertIncludes(result.aiAndData, "Text Classification", "Sentiment project → Text Classification extracted");

  // From LLM project
  assertIncludes(result.aiAndData, "Generative AI", "LLM project → Generative AI extracted");
  assertIncludes(result.aiAndData, "LLMs", "LLM project → LLMs extracted");
  assertIncludes(result.aiAndData, "Prompt Engineering", "LLM project → Prompt Engineering extracted");

  // OpenCV should be in frameworks
  assertIncludes(result.frameworks, "OpenCV", "OpenCV extracted to frameworks");

  // Streamlit from tech stack
  assertIncludes(result.frameworks, "Streamlit", "Streamlit extracted to frameworks");
}

// Test 4: Internship Extraction
console.log("\n📋 Test 4: Internship Extraction");
{
  const form = makeFormData({
    languages: "Python",
    internships: [
      {
        company: "TechCorp",
        role: "Backend Developer Intern",
        duration: "May 2025 – Jul 2025",
        workDone: "Built REST APIs using FastAPI and deployed on AWS with Docker containers",
        techUsed: "Python, FastAPI, PostgreSQL, Docker, AWS",
      },
    ],
  });
  const result = generateTechnicalSkills(form);

  assertIncludes(result.tools, "REST APIs", "REST APIs extracted from internship");
  assertIncludes(result.tools, "Docker", "Docker extracted from internship");
  assertIncludes(result.tools, "AWS", "AWS extracted from internship");
  assertIncludes(result.frameworks, "FastAPI", "FastAPI extracted from internship");
  assertIncludes(result.databases, "PostgreSQL", "PostgreSQL extracted from internship");
}

// Test 5: Re-categorization
console.log("\n📋 Test 5: Re-categorization of Misplaced Skills");
{
  const form = makeFormData({
    // User puts Machine Learning in concepts, REST APIs in concepts, React in languages
    languages: "Python, React, Java",
    concepts: "Machine Learning, REST APIs, Data Structures & Algorithms (DSA)",
  });
  const result = generateTechnicalSkills(form);

  // React should be moved from languages to frameworks
  assertIncludes(result.frameworks, "React.js", "React moved to frameworks");
  assertNotIncludes(result.languages, "React.js", "React NOT in languages");

  // Machine Learning should be in aiAndData
  assertIncludes(result.aiAndData, "Machine Learning", "ML moved to aiAndData");
  assertNotIncludes(result.csConcepts, "Machine Learning", "ML NOT in csConcepts");

  // REST APIs should be in tools
  assertIncludes(result.tools, "REST APIs", "REST APIs moved to tools");
  assertNotIncludes(result.csConcepts, "REST APIs", "REST APIs NOT in csConcepts");
}

// Test 6: Deduplication
console.log("\n📋 Test 6: Deduplication Across Categories");
{
  const form = makeFormData({
    languages: "Python, Python, JavaScript",
    frameworks: "React, React",
    tools: "Git, Git, GitHub",
  });
  const result = generateTechnicalSkills(form);

  // Should not have duplicates
  const allSkills = [
    ...result.languages,
    ...result.frameworks,
    ...result.databases,
    ...result.tools,
    ...result.aiAndData,
    ...result.csConcepts,
  ];
  const uniqueSkills = new Set(allSkills);
  assert(allSkills.length === uniqueSkills.size, `No duplicates across categories (${allSkills.length} total, ${uniqueSkills.size} unique)`);
}

// Test 7: Category Limits
console.log("\n📋 Test 7: Category Limits Enforcement");
{
  const form = makeFormData({
    languages: "Python, Java, C++, JavaScript, TypeScript, Go, Rust, Kotlin, Swift, PHP, R, Ruby",
  });
  const result = generateTechnicalSkills(form);
  assert(result.languages.length <= 6, `Languages limited to ≤6 (got ${result.languages.length})`);
}

// Test 8: Certification Extraction
console.log("\n📋 Test 8: Certification Extraction");
{
  const form = makeFormData({
    languages: "Python",
    certifications: "AWS Certified Cloud Practitioner, Google Cloud Digital Leader, Coursera Deep Learning",
  });
  const result = generateTechnicalSkills(form);

  assertIncludes(result.tools, "AWS", "AWS extracted from certification");
  assertIncludes(result.tools, "Google Cloud", "Google Cloud extracted from certification");
  assertIncludes(result.aiAndData, "Deep Learning", "Deep Learning extracted from certification");
}

// Test 9: No invented skills
console.log("\n📋 Test 9: No Invented Skills (empty input)");
{
  const form = makeFormData({});
  const result = generateTechnicalSkills(form);

  // With no user input, all categories should be empty
  assert(result.languages.length === 0, "No languages invented");
  assert(result.frameworks.length === 0, "No frameworks invented");
  assert(result.databases.length === 0, "No databases invented");
  assert(result.tools.length === 0, "No tools invented");
  assert(result.aiAndData.length === 0, "No AI skills invented");
  assert(result.csConcepts.length === 0, "No CS concepts invented");
}

// Test 10: Full Integration Test
console.log("\n📋 Test 10: Full Integration (realistic student profile)");
{
  const form = makeFormData({
    languages: "Python, Java, C++, JS, SQL",
    frameworks: "React, Node.js, FastAPI, OpenCV, Scikit-learn, VADER",
    databases: "MySQL, Postgres",
    tools: "Git, GitHub, Docker, AWS",
    concepts: "DSA, OOPs, DBMS, OS, Machine Learning, Computer Vision, NLP",
    certifications: "AWS Certified Cloud Practitioner",
    projects: [
      {
        title: "ETL Pipeline Manager",
        techStack: "Python, PostgreSQL, Apache Airflow",
        description: "Built an ETL pipeline for data warehousing and transformation workflows",
        keyResult: "Processed 50,000 records daily with 99.9% reliability",
        link: "",
        duration: "Jan 2025 – Mar 2025",
      },
    ],
  });
  const result = generateTechnicalSkills(form);

  console.log("\n  🔍 Full output:");
  console.log(`    Languages: ${result.languages.join(", ")}`);
  console.log(`    Frameworks: ${result.frameworks.join(", ")}`);
  console.log(`    Databases: ${result.databases.join(", ")}`);
  console.log(`    Tools: ${result.tools.join(", ")}`);
  console.log(`    AI & Data: ${result.aiAndData.join(", ")}`);
  console.log(`    CS Concepts: ${result.csConcepts.join(", ")}`);

  // Basic sanity checks
  assert(result.languages.length >= 3, `Has ≥3 languages (got ${result.languages.length})`);
  assert(result.frameworks.length >= 3, `Has ≥3 frameworks (got ${result.frameworks.length})`);
  assert(result.databases.length >= 1, `Has ≥1 database (got ${result.databases.length})`);
  assert(result.tools.length >= 2, `Has ≥2 tools (got ${result.tools.length})`);
  assert(result.aiAndData.length >= 2, `Has ≥2 AI/Data skills (got ${result.aiAndData.length})`);
  assert(result.csConcepts.length >= 2, `Has ≥2 CS concepts (got ${result.csConcepts.length})`);

  // ETL project should have added skills
  assertIncludes(result.aiAndData, "ETL Pipelines", "ETL Pipelines from project");
  assertIncludes(result.aiAndData, "Data Warehousing", "Data Warehousing from project");
}

// ── Summary ────────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(50)}`);
console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${passed + failed} assertions\n`);

if (failed > 0) {
  process.exit(1);
}
