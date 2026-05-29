/**
 * Test script for the Dynamic Skill Category Engine.
 * Exercises all major pipeline steps: normalization, thresholding (>=2),
 * branch-aware priorities (max 6), and deduplication.
 * 
 * Run: npx tsx scratch/test-skills-engine.ts
 */

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

function assertIncludes(arr: string[] | undefined, item: string, msg: string) {
  const safeArr = arr || [];
  assert(safeArr.includes(item), `${msg} — expected "${item}" in [${safeArr.join(", ")}]`);
}

function assertNotIncludes(arr: string[] | undefined, item: string, msg: string) {
  const safeArr = arr || [];
  assert(!safeArr.includes(item), `${msg} — "${item}" should NOT be in [${safeArr.join(", ")}]`);
}

// ── Build a mock ResumeFormData ────────────────────────────────────────────
function makeFormData(overrides: any = {}) {
  return {
    personal: {
      fullName: "Test User",
      email: "test@test.com",
      collegeName: "VIT",
      branch: overrides.branch ?? "CSE",
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

// Test 1: Dynamic Thresholding (Fallback to Tools)
console.log("📋 Test 1: Dynamic Category Thresholding");
{
  const form = makeFormData({
    // Only 1 cloud skill (Google Cloud), only 1 AI skill (Computer Vision)
    certifications: "Google Cloud Digital Leader",
    tools: "Git, Postman, Computer Vision"
  });
  const result = generateTechnicalSkills(form);

  assert(result.cloudAndDevops.length === 0, "Cloud category empty because < 2 skills");
  assert(result.aiAndData.length === 0, "AI category empty because < 2 skills");
  assertIncludes(result.tools, "Google Cloud", "Google Cloud moved to Tools");
  assertIncludes(result.tools, "Computer Vision", "Computer Vision moved to Tools");
}

// Test 2: Dynamic Category Creation (>= 2 skills)
console.log("\n📋 Test 2: Dynamic Category Creation");
{
  const form = makeFormData({
    tools: "AWS, Docker, Jenkins", // 3 Cloud skills
    concepts: "Machine Learning, Deep Learning, NLP" // 3 AI skills
  });
  const result = generateTechnicalSkills(form);

  assertIncludes(result.cloudAndDevops, "AWS", "AWS correctly placed in Cloud & DevOps");
  assertIncludes(result.cloudAndDevops, "Docker", "Docker correctly placed in Cloud & DevOps");
  assertNotIncludes(result.tools, "AWS", "AWS removed from Tools");
  
  assertIncludes(result.aiAndData, "Machine Learning", "ML correctly placed in AI & Data");
  assertIncludes(result.aiAndData, "Natural Language Processing", "NLP correctly placed in AI & Data");
  assertNotIncludes(result.csConcepts, "Machine Learning", "ML removed from Concepts");
}

// Test 3: Branch-Aware Category Dropping (Max 6 categories)
console.log("\n📋 Test 3: Branch-Aware Limiting");
{
  const form = makeFormData({
    branch: "Civil", // Should deprioritize Cloud, AI, Data Eng, etc. if too many
    languages: "Python, C++",
    frameworks: "React, Next.js",
    databases: "PostgreSQL, MySQL",
    tools: "Git, Postman",
    concepts: "Data Structures & Algorithms, Object-Oriented Programming", // CS Concepts (2)
    // Add multiple dynamic categories (at least 2 skills each to pass threshold)
    projects: [
      {
        title: "AI App",
        techStack: "OpenCV, YOLO", // aiAndData (2)
      },
      {
        title: "Data Pipeline",
        techStack: "Apache Spark, Hadoop", // dataEngineering (2)
      },
      {
        title: "Cloud Infra",
        techStack: "AWS, Kubernetes", // cloudAndDevops (2)
      },
      {
        title: "AutoCAD Design",
        techStack: "AutoCAD, SolidWorks", // engineeringSoftware (2)
      }
    ]
  });
  const result = generateTechnicalSkills(form);
  
  // Total possible categories: languages, frameworks, databases, tools, csConcepts, 
  // aiAndData, dataEngineering, cloudAndDevops, engineeringSoftware (9 categories).
  // Max is 6. Civil prefers Engineering Software and Tools.
  
  const nonEmpty = Object.keys(result).filter(k => (result as any)[k].length > 0);
  assert(nonEmpty.length <= 6, `Max 6 categories enforced (got ${nonEmpty.length}: ${nonEmpty.join(", ")})`);
  
  // Engineering software should definitely be kept for Civil
  assertIncludes(result.engineeringSoftware, "AutoCAD", "AutoCAD retained in Engineering Software for Civil");
  
  // One of the dropped categories (e.g. AI or Data Eng or Cloud) should have its skills merged into Tools
  assert(result.tools.includes("OpenCV") || result.tools.includes("AWS") || result.tools.includes("Hadoop"), 
    "Dropped category skills correctly merged into Tools");
}

// Test 4: Project Intelligence Extraction for New Categories
console.log("\n📋 Test 4: New Category Extraction (Data Eng, Embedded)");
{
  const form = makeFormData({
    projects: [
      {
        title: "ETL Pipeline Manager",
        techStack: "Python, PostgreSQL, Apache Airflow",
        description: "Built an ETL pipeline for data warehousing and transformation workflows",
        keyResult: "Processed 50,000 records daily with 99.9% reliability",
      },
      {
        title: "Smart Home Controller",
        techStack: "Arduino, ESP32, IoT",
        description: "Built a microcontroller based RTOS",
      }
    ],
  });
  const result = generateTechnicalSkills(form);

  // ETL -> dataEngineering
  assertIncludes(result.dataEngineering, "ETL Pipelines", "ETL Pipelines extracted");
  assertIncludes(result.dataEngineering, "Data Warehousing", "Data Warehousing extracted");
  
  // Arduino -> embeddedSystems
  assertIncludes(result.embeddedSystems, "IoT", "IoT extracted");
  assertIncludes(result.embeddedSystems, "Embedded C", "Embedded C extracted");
}

// ── Summary ────────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(50)}`);
console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${passed + failed} assertions\n`);

if (failed > 0) {
  process.exit(1);
}
