import { generateReorderedSkills } from "../lib/gemini";

const sampleSkills = [
  {
    category: "Programming Languages",
    skills: ["Python", "JavaScript", "C++"]
  },
  {
    category: "Frameworks & Libraries",
    skills: ["FastAPI", "React.js", "Node.js"]
  },
  {
    category: "Databases",
    skills: ["PostgreSQL", "MySQL"]
  },
  {
    category: "Tools & Platforms",
    skills: ["REST APIs", "Git", "GitHub"]
  },
  {
    category: "AI & Data Technologies",
    skills: ["Machine Learning", "NLP", "Data Analysis"]
  },
  {
    category: "Data Engineering",
    skills: ["Data Warehousing", "ETL Pipelines"]
  }
];

async function runTest() {
  console.log("--- Initial Skills ---");
  console.log(JSON.stringify(sampleSkills, null, 2));

  console.log("\n--- Testing with Data Science Job Description ---");
  const dsJD = "We are looking for a Data Scientist to build machine learning models, analyze big data, and deploy NLP pipelines. Python expertise is required.";
  const dsResult = await generateReorderedSkills(sampleSkills, dsJD);
  console.log(JSON.stringify(dsResult, null, 2));

  console.log("\n--- Testing with Frontend Web Job Description ---");
  const webJD = "Seeking a Frontend Developer experienced in React.js, modern JavaScript/TypeScript, and integrating with REST APIs.";
  const webResult = await generateReorderedSkills(sampleSkills, webJD);
  console.log(JSON.stringify(webResult, null, 2));
}

runTest().catch(console.error);
