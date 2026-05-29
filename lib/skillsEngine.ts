import { ResumeFormData } from "@/types/resume";

// ── Output type ────────────────────────────────────────────────────────────
export interface ProcessedSkills {
  languages: string[];
  frameworks: string[];
  databases: string[];
  tools: string[];
  aiAndData: string[];
  csConcepts: string[];
}

// ── 1. Normalization Map ───────────────────────────────────────────────────
// Maps common abbreviations / variations → canonical ATS-friendly form.
// Keys are LOWERCASE for case-insensitive matching.
const NORMALIZATION_MAP: Record<string, string> = {
  // Languages
  "js": "JavaScript",
  "javascript": "JavaScript",
  "ts": "TypeScript",
  "typescript": "TypeScript",
  "py": "Python",
  "python": "Python",
  "c++": "C++",
  "cpp": "C++",
  "c#": "C#",
  "csharp": "C#",
  "golang": "Go",
  "go": "Go",
  "java": "Java",
  "kotlin": "Kotlin",
  "swift": "Swift",
  "r": "R",
  "ruby": "Ruby",
  "php": "PHP",
  "sql": "SQL",
  "html": "HTML",
  "css": "CSS",
  "dart": "Dart",
  "rust": "Rust",
  "scala": "Scala",
  "perl": "Perl",
  "matlab": "MATLAB",
  "bash": "Bash",
  "shell": "Shell Scripting",
  "shell scripting": "Shell Scripting",

  // Frameworks & Libraries
  "reactjs": "React.js",
  "react.js": "React.js",
  "react": "React.js",
  "nextjs": "Next.js",
  "next.js": "Next.js",
  "next": "Next.js",
  "nodejs": "Node.js",
  "node.js": "Node.js",
  "node": "Node.js",
  "expressjs": "Express.js",
  "express.js": "Express.js",
  "express": "Express.js",
  "angularjs": "Angular",
  "angular": "Angular",
  "vuejs": "Vue.js",
  "vue.js": "Vue.js",
  "vue": "Vue.js",
  "django": "Django",
  "flask": "Flask",
  "fastapi": "FastAPI",
  "spring boot": "Spring Boot",
  "springboot": "Spring Boot",
  "spring": "Spring Boot",
  "tailwindcss": "Tailwind CSS",
  "tailwind css": "Tailwind CSS",
  "tailwind": "Tailwind CSS",
  "bootstrap": "Bootstrap",
  "jquery": "jQuery",
  "redux": "Redux",
  "pytorch": "PyTorch",
  "tensorflow": "TensorFlow",
  "keras": "Keras",
  "scikit-learn": "Scikit-learn",
  "sklearn": "Scikit-learn",
  "pandas": "Pandas",
  "numpy": "NumPy",
  "matplotlib": "Matplotlib",
  "opencv": "OpenCV",
  "streamlit": "Streamlit",
  "flutter": "Flutter",
  "react native": "React Native",
  "svelte": "Svelte",

  // Databases
  "postgres": "PostgreSQL",
  "postgresql": "PostgreSQL",
  "mysql": "MySQL",
  "mongo": "MongoDB",
  "mongodb": "MongoDB",
  "sqlite": "SQLite",
  "redis": "Redis",
  "dynamodb": "DynamoDB",
  "firebase": "Firebase",
  "cassandra": "Cassandra",
  "sql server": "SQL Server",
  "mssql": "SQL Server",
  "neo4j": "Neo4j",
  "elasticsearch": "Elasticsearch",
  "supabase": "Supabase",

  // Tools & Platforms
  "git": "Git",
  "github": "GitHub",
  "gitlab": "GitLab",
  "docker": "Docker",
  "kubernetes": "Kubernetes",
  "k8s": "Kubernetes",
  "aws": "AWS",
  "amazon web services": "AWS",
  "gcp": "Google Cloud",
  "google cloud": "Google Cloud",
  "google cloud (gcp)": "Google Cloud",
  "google cloud platform": "Google Cloud",
  "azure": "Microsoft Azure",
  "microsoft azure": "Microsoft Azure",
  "vercel": "Vercel",
  "netlify": "Netlify",
  "heroku": "Heroku",
  "jenkins": "Jenkins",
  "github actions": "GitHub Actions",
  "ci/cd": "CI/CD",
  "cicd": "CI/CD",
  "terraform": "Terraform",
  "ansible": "Ansible",
  "figma": "Figma",
  "postman": "Postman",
  "linux": "Linux",
  "unix": "Unix",
  "jira": "Jira",
  "vscode": "VS Code",
  "vs code": "VS Code",
  "rest api": "REST APIs",
  "rest apis": "REST APIs",
  "restful apis": "REST APIs",
  "graphql": "GraphQL",
  "webpack": "Webpack",
  "vite": "Vite",
  "nginx": "Nginx",
  "apache kafka": "Apache Kafka",
  "kafka": "Apache Kafka",
  "rabbitmq": "RabbitMQ",
  "swagger": "Swagger",

  // AI & Data concepts
  "ml": "Machine Learning",
  "machine learning": "Machine Learning",
  "ai": "Artificial Intelligence",
  "artificial intelligence": "Artificial Intelligence",
  "dl": "Deep Learning",
  "deep learning": "Deep Learning",
  "nlp": "Natural Language Processing",
  "natural language processing": "Natural Language Processing",
  "computer vision": "Computer Vision",
  "cv": "Computer Vision",
  "generative ai": "Generative AI",
  "gen ai": "Generative AI",
  "genai": "Generative AI",
  "llm": "LLMs",
  "llms": "LLMs",
  "large language models": "LLMs",
  "prompt engineering": "Prompt Engineering",
  "data science": "Data Science",
  "data analysis": "Data Analysis",
  "data analytics": "Data Analytics",
  "data visualization": "Data Visualization",
  "data mining": "Data Mining",
  "big data": "Big Data",
  "neural networks": "Neural Networks",
  "reinforcement learning": "Reinforcement Learning",
  "transfer learning": "Transfer Learning",
  "text classification": "Text Classification",
  "sentiment analysis": "Sentiment Analysis",
  "image processing": "Image Processing",
  "data warehousing": "Data Warehousing",
  "etl": "ETL Pipelines",
  "etl pipelines": "ETL Pipelines",

  // CS Concepts
  "dsa": "Data Structures & Algorithms",
  "data structures & algorithms": "Data Structures & Algorithms",
  "data structures and algorithms": "Data Structures & Algorithms",
  "data structures & algorithms (dsa)": "Data Structures & Algorithms",
  "oop": "Object-Oriented Programming",
  "oops": "Object-Oriented Programming",
  "object oriented programming": "Object-Oriented Programming",
  "object-oriented programming": "Object-Oriented Programming",
  "object-oriented programming (oops)": "Object-Oriented Programming",
  "object oriented programming (oops)": "Object-Oriented Programming",
  "dbms": "Database Management Systems",
  "database management systems": "Database Management Systems",
  "database management systems (dbms)": "Database Management Systems",
  "os": "Operating Systems",
  "operating systems": "Operating Systems",
  "operating systems (os)": "Operating Systems",
  "cn": "Computer Networks",
  "computer networks": "Computer Networks",
  "system design": "System Design",
  "software engineering": "Software Engineering",
  "agile": "Agile Methodology",
  "agile methodology": "Agile Methodology",
  "web development": "Web Development",
  "cloud computing": "Cloud Computing",
  "cybersecurity": "Cybersecurity",
  "devops": "DevOps",
  "microservices": "Microservices",
};

// ── 2. Soft Skills Blacklist ───────────────────────────────────────────────
// These are non-technical terms that should NEVER appear in Technical Skills.
const SOFT_SKILLS_BLACKLIST = new Set([
  "teamwork",
  "team work",
  "hardworking",
  "hard working",
  "communication",
  "leadership",
  "punctuality",
  "dedication",
  "creativity",
  "adaptability",
  "time management",
  "problem solving",
  "critical thinking",
  "interpersonal skills",
  "work ethic",
  "self motivated",
  "self-motivated",
  "attention to detail",
  "multitasking",
  "negotiation",
  "conflict resolution",
  "emotional intelligence",
  "empathy",
  "patience",
  "flexibility",
  "decision making",
  "decision-making",
  "collaboration",
  "team collaboration",
  "team player",
  "positive attitude",
  "management",
  "organizational skills",
  "analytical skills",
  "quick learner",
  "fast learner",
  "self-starter",
  "detail-oriented",
  "motivated",
  "enthusiastic",
  "reliable",
  "responsible",
  "proactive",
  "innovative",
]);

// ── 3. Project Intelligence Patterns ───────────────────────────────────────
// Maps keyword patterns found in project descriptions/tech stacks → skills to infer.
// Each entry: { patterns: string[], skills: string[], category: keyof ProcessedSkills }
interface TechPattern {
  patterns: string[];
  skills: string[];
  category: keyof ProcessedSkills;
}

const PROJECT_TECH_PATTERNS: TechPattern[] = [
  // Computer Vision
  { patterns: ["opencv", "computer vision", "image processing", "object detection", "face detection", "facial recognition", "yolo", "cnn image"],
    skills: ["OpenCV", "Computer Vision"],
    category: "aiAndData" },

  // NLP / Sentiment
  { patterns: ["sentiment analysis", "sentiment", "vader", "text classification", "text mining", "nlp", "natural language", "nltk", "spacy", "tokenization", "word embedding", "word2vec", "bert", "transformers"],
    skills: ["NLP", "Text Classification"],
    category: "aiAndData" },

  // Machine Learning
  { patterns: ["machine learning", "ml model", "classification", "regression", "random forest", "decision tree", "svm", "support vector", "k-means", "clustering", "scikit", "sklearn", "xgboost", "gradient boosting"],
    skills: ["Machine Learning"],
    category: "aiAndData" },

  // Deep Learning
  { patterns: ["deep learning", "neural network", "cnn", "rnn", "lstm", "gan", "autoencoder", "pytorch", "tensorflow", "keras"],
    skills: ["Deep Learning", "Neural Networks"],
    category: "aiAndData" },

  // Generative AI / LLMs
  { patterns: ["llm", "large language model", "gpt", "chatgpt", "openai", "gemini api", "gemini", "claude", "langchain", "rag", "retrieval augmented", "prompt engineering", "prompt", "generative ai", "gen ai", "fine-tuning", "fine tuning"],
    skills: ["Generative AI", "LLMs", "Prompt Engineering"],
    category: "aiAndData" },

  // Data Engineering / ETL
  { patterns: ["etl", "data pipeline", "data ingestion", "data warehouse", "data warehousing", "data lake", "apache airflow", "airflow", "spark", "apache spark", "pyspark", "hadoop", "mapreduce"],
    skills: ["ETL Pipelines", "Data Warehousing"],
    category: "aiAndData" },

  // Data Science / Analysis
  { patterns: ["data analysis", "data analytics", "data visualization", "pandas", "numpy", "matplotlib", "seaborn", "plotly", "tableau", "power bi", "jupyter", "eda", "exploratory data"],
    skills: ["Data Analysis", "Data Visualization"],
    category: "aiAndData" },

  // Web frameworks (already user-selected usually, but reinforce from projects)
  { patterns: ["react", "reactjs", "react.js"],
    skills: ["React.js"],
    category: "frameworks" },
  { patterns: ["next.js", "nextjs"],
    skills: ["Next.js"],
    category: "frameworks" },
  { patterns: ["node.js", "nodejs", "express"],
    skills: ["Node.js"],
    category: "frameworks" },
  { patterns: ["django"],
    skills: ["Django"],
    category: "frameworks" },
  { patterns: ["flask"],
    skills: ["Flask"],
    category: "frameworks" },
  { patterns: ["fastapi"],
    skills: ["FastAPI"],
    category: "frameworks" },
  { patterns: ["spring boot", "springboot"],
    skills: ["Spring Boot"],
    category: "frameworks" },
  { patterns: ["streamlit"],
    skills: ["Streamlit"],
    category: "frameworks" },

  // Databases (extract from project usage)
  { patterns: ["mongodb", "mongo"],
    skills: ["MongoDB"],
    category: "databases" },
  { patterns: ["postgresql", "postgres"],
    skills: ["PostgreSQL"],
    category: "databases" },
  { patterns: ["mysql"],
    skills: ["MySQL"],
    category: "databases" },
  { patterns: ["redis"],
    skills: ["Redis"],
    category: "databases" },
  { patterns: ["firebase"],
    skills: ["Firebase"],
    category: "databases" },
  { patterns: ["supabase"],
    skills: ["Supabase"],
    category: "databases" },

  // Tools
  { patterns: ["docker", "containerization", "container"],
    skills: ["Docker"],
    category: "tools" },
  { patterns: ["kubernetes", "k8s"],
    skills: ["Kubernetes"],
    category: "tools" },
  { patterns: ["aws", "amazon web services", "s3", "ec2", "lambda"],
    skills: ["AWS"],
    category: "tools" },
  { patterns: ["google cloud", "gcp"],
    skills: ["Google Cloud"],
    category: "tools" },
  { patterns: ["rest api", "rest apis", "restful", "api endpoint"],
    skills: ["REST APIs"],
    category: "tools" },
  { patterns: ["graphql"],
    skills: ["GraphQL"],
    category: "tools" },
  { patterns: ["ci/cd", "cicd", "github actions", "jenkins", "continuous integration"],
    skills: ["CI/CD"],
    category: "tools" },
  { patterns: ["websocket", "socket.io", "real-time", "realtime"],
    skills: ["WebSockets"],
    category: "tools" },

  // Languages (extract from project tech stack)
  { patterns: ["python"],
    skills: ["Python"],
    category: "languages" },
  { patterns: ["javascript", "js"],
    skills: ["JavaScript"],
    category: "languages" },
  { patterns: ["typescript", "ts"],
    skills: ["TypeScript"],
    category: "languages" },
  { patterns: ["java"],
    skills: ["Java"],
    category: "languages" },
  { patterns: ["c++", "cpp"],
    skills: ["C++"],
    category: "languages" },
];

// ── 4. Category Routing ────────────────────────────────────────────────────
// For skills that may be placed in the wrong category by the user, define
// which category each canonical skill actually belongs to.
const SKILL_TO_CATEGORY: Record<string, keyof ProcessedSkills> = {
  // Languages
  "Python": "languages", "Java": "languages", "C++": "languages", "C": "languages",
  "C#": "languages", "JavaScript": "languages", "TypeScript": "languages", "Go": "languages",
  "Rust": "languages", "Kotlin": "languages", "Swift": "languages", "R": "languages",
  "Ruby": "languages", "PHP": "languages", "SQL": "languages", "HTML": "languages",
  "CSS": "languages", "Dart": "languages", "Scala": "languages", "Perl": "languages",
  "MATLAB": "languages", "Bash": "languages", "Shell Scripting": "languages",

  // Frameworks
  "React.js": "frameworks", "Next.js": "frameworks", "Node.js": "frameworks",
  "Express.js": "frameworks", "Angular": "frameworks", "Vue.js": "frameworks",
  "Django": "frameworks", "Flask": "frameworks", "FastAPI": "frameworks",
  "Spring Boot": "frameworks", "Tailwind CSS": "frameworks", "Bootstrap": "frameworks",
  "jQuery": "frameworks", "Redux": "frameworks", "PyTorch": "frameworks",
  "TensorFlow": "frameworks", "Keras": "frameworks", "Scikit-learn": "frameworks",
  "Pandas": "frameworks", "NumPy": "frameworks", "Matplotlib": "frameworks",
  "OpenCV": "frameworks", "Streamlit": "frameworks", "Flutter": "frameworks",
  "React Native": "frameworks", "Svelte": "frameworks",

  // Databases
  "PostgreSQL": "databases", "MySQL": "databases", "MongoDB": "databases",
  "SQLite": "databases", "Redis": "databases", "DynamoDB": "databases",
  "Firebase": "databases", "Cassandra": "databases", "SQL Server": "databases",
  "Neo4j": "databases", "Elasticsearch": "databases", "Supabase": "databases",

  // Tools
  "Git": "tools", "GitHub": "tools", "GitLab": "tools", "Docker": "tools",
  "Kubernetes": "tools", "AWS": "tools", "Google Cloud": "tools",
  "Microsoft Azure": "tools", "Vercel": "tools", "Netlify": "tools",
  "Heroku": "tools", "Jenkins": "tools", "GitHub Actions": "tools",
  "CI/CD": "tools", "Terraform": "tools", "Ansible": "tools",
  "Figma": "tools", "Postman": "tools", "Linux": "tools", "Unix": "tools",
  "Jira": "tools", "VS Code": "tools", "REST APIs": "tools",
  "GraphQL": "tools", "Webpack": "tools", "Vite": "tools", "Nginx": "tools",
  "Apache Kafka": "tools", "RabbitMQ": "tools", "Swagger": "tools",
  "WebSockets": "tools",

  // AI & Data
  "Machine Learning": "aiAndData", "Artificial Intelligence": "aiAndData",
  "Deep Learning": "aiAndData", "Natural Language Processing": "aiAndData",
  "NLP": "aiAndData", "Computer Vision": "aiAndData",
  "Generative AI": "aiAndData", "LLMs": "aiAndData",
  "Prompt Engineering": "aiAndData", "Data Science": "aiAndData",
  "Data Analysis": "aiAndData", "Data Analytics": "aiAndData",
  "Data Visualization": "aiAndData", "Data Mining": "aiAndData",
  "Big Data": "aiAndData", "Neural Networks": "aiAndData",
  "Reinforcement Learning": "aiAndData", "Transfer Learning": "aiAndData",
  "Text Classification": "aiAndData", "Sentiment Analysis": "aiAndData",
  "Image Processing": "aiAndData", "Data Warehousing": "aiAndData",
  "ETL Pipelines": "aiAndData",

  // CS Concepts
  "Data Structures & Algorithms": "csConcepts",
  "Object-Oriented Programming": "csConcepts",
  "Database Management Systems": "csConcepts",
  "Operating Systems": "csConcepts",
  "Computer Networks": "csConcepts",
  "System Design": "csConcepts",
  "Software Engineering": "csConcepts",
  "Web Development": "csConcepts",
  "Cloud Computing": "csConcepts",
  "Cybersecurity": "csConcepts",
  "DevOps": "csConcepts",
  "Microservices": "csConcepts",
  "Agile Methodology": "csConcepts",
};

// ── 5. Category Limits ─────────────────────────────────────────────────────
const CATEGORY_LIMITS: Record<keyof ProcessedSkills, number> = {
  languages: 6,
  frameworks: 8,
  databases: 4,
  tools: 8,
  aiAndData: 5,
  csConcepts: 6,
};

// ── Helper: Normalize a single skill string ────────────────────────────────
function normalizeSkill(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const key = trimmed.toLowerCase();
  return NORMALIZATION_MAP[key] || trimmed;
}

// ── Helper: Parse comma-separated string into normalized array ─────────────
function parseAndNormalize(csv: string): string[] {
  if (!csv || !csv.trim()) return [];
  return csv
    .split(",")
    .map((s) => normalizeSkill(s))
    .filter((s) => s.length > 0);
}

// ── Helper: Check if a skill is a soft skill ───────────────────────────────
function isSoftSkill(skill: string): boolean {
  return SOFT_SKILLS_BLACKLIST.has(skill.toLowerCase());
}

// ── Helper: Extract tech from text corpus ──────────────────────────────────
function extractFromText(
  text: string,
  results: Map<keyof ProcessedSkills, Set<string>>,
  frequencyMap: Map<string, number>
): void {
  if (!text || !text.trim()) return;
  const lower = text.toLowerCase();

  for (const pattern of PROJECT_TECH_PATTERNS) {
    for (const keyword of pattern.patterns) {
      // Use word-boundary-aware matching to avoid false positives
      // e.g., "java" should not match inside "javascript"
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(?:^|[^a-z])${escaped}(?:[^a-z]|$)`, "i");
      if (regex.test(lower)) {
        const categorySet = results.get(pattern.category) || new Set();
        for (const skill of pattern.skills) {
          categorySet.add(skill);
          frequencyMap.set(skill, (frequencyMap.get(skill) || 0) + 1);
        }
        results.set(pattern.category, categorySet);
        break; // One match per pattern group is enough
      }
    }
  }
}

// ── Helper: Determine correct category for a skill ─────────────────────────
function getCategoryForSkill(skill: string): keyof ProcessedSkills | null {
  return SKILL_TO_CATEGORY[skill] || null;
}

// ── Main Engine ────────────────────────────────────────────────────────────
export function generateTechnicalSkills(formData: ResumeFormData): ProcessedSkills {
  const { skills, projects, internships } = formData;

  // Frequency tracker: how many times each skill appears across all sources
  const frequencyMap = new Map<string, number>();

  // ─── Step 1: Collect raw skills from user input ────────────────────────
  const rawCategories: Record<keyof ProcessedSkills, string[]> = {
    languages: parseAndNormalize(skills.languages),
    frameworks: parseAndNormalize(skills.frameworks),
    databases: parseAndNormalize(skills.databases),
    tools: parseAndNormalize(skills.tools),
    aiAndData: [], // Will be populated from concepts + project extraction
    csConcepts: parseAndNormalize(skills.concepts),
  };

  // Count frequency from user selections
  for (const cat of Object.keys(rawCategories) as (keyof ProcessedSkills)[]) {
    for (const skill of rawCategories[cat]) {
      frequencyMap.set(skill, (frequencyMap.get(skill) || 0) + 1);
    }
  }

  // ─── Step 2: Remove soft skills from all categories ────────────────────
  for (const cat of Object.keys(rawCategories) as (keyof ProcessedSkills)[]) {
    rawCategories[cat] = rawCategories[cat].filter((s) => !isSoftSkill(s));
  }

  // ─── Step 3: Extract demonstrated skills from projects ─────────────────
  const extractedSkills = new Map<keyof ProcessedSkills, Set<string>>();
  for (const cat of Object.keys(rawCategories) as (keyof ProcessedSkills)[]) {
    extractedSkills.set(cat, new Set());
  }

  if (projects && projects.length > 0) {
    for (const proj of projects) {
      const corpus = [proj.title, proj.techStack, proj.description, proj.keyResult]
        .filter(Boolean)
        .join(" ");
      extractFromText(corpus, extractedSkills, frequencyMap);
    }
  }

  // ─── Step 4: Extract from internships ──────────────────────────────────
  if (internships && internships.length > 0) {
    for (const intern of internships) {
      const corpus = [intern.role, intern.techUsed, intern.workDone]
        .filter(Boolean)
        .join(" ");
      extractFromText(corpus, extractedSkills, frequencyMap);
    }
  }

  // ─── Step 5: Extract from certifications ───────────────────────────────
  if (skills.certifications) {
    extractFromText(skills.certifications, extractedSkills, frequencyMap);
  }

  // ─── Step 6: Merge extracted skills into raw categories ────────────────
  for (const [cat, skillSet] of extractedSkills.entries()) {
    for (const skill of skillSet) {
      if (!rawCategories[cat].includes(skill)) {
        rawCategories[cat].push(skill);
      }
    }
  }

  // ─── Step 7: Re-categorize misplaced skills ────────────────────────────
  // Move skills to their correct canonical category
  const finalCategories: Record<keyof ProcessedSkills, Set<string>> = {
    languages: new Set(),
    frameworks: new Set(),
    databases: new Set(),
    tools: new Set(),
    aiAndData: new Set(),
    csConcepts: new Set(),
  };

  for (const cat of Object.keys(rawCategories) as (keyof ProcessedSkills)[]) {
    for (const skill of rawCategories[cat]) {
      const correctCat = getCategoryForSkill(skill);
      if (correctCat) {
        finalCategories[correctCat].add(skill);
      } else {
        // Unknown skill — keep it in its original category
        finalCategories[cat].add(skill);
      }
    }
  }

  // ─── Step 8: Sort within each category ─────────────────────────────────
  // Primary sort: frequency (most mentioned first)
  // Secondary sort: alphabetical for ties
  const sortedCategories: Record<keyof ProcessedSkills, string[]> = {
    languages: [],
    frameworks: [],
    databases: [],
    tools: [],
    aiAndData: [],
    csConcepts: [],
  };

  for (const cat of Object.keys(finalCategories) as (keyof ProcessedSkills)[]) {
    sortedCategories[cat] = Array.from(finalCategories[cat]).sort((a, b) => {
      const freqA = frequencyMap.get(a) || 0;
      const freqB = frequencyMap.get(b) || 0;
      if (freqB !== freqA) return freqB - freqA; // Higher frequency first
      return a.localeCompare(b); // Alphabetical tiebreak
    });
  }

  // ─── Step 9: Trim to category limits ───────────────────────────────────
  for (const cat of Object.keys(sortedCategories) as (keyof ProcessedSkills)[]) {
    const limit = CATEGORY_LIMITS[cat];
    if (sortedCategories[cat].length > limit) {
      sortedCategories[cat] = sortedCategories[cat].slice(0, limit);
    }
  }

  // ─── Step 10: Final deduplication across categories ────────────────────
  // If somehow a skill ended up in multiple categories, keep it only in its
  // primary (correct) category.
  const seen = new Set<string>();
  for (const cat of ["languages", "frameworks", "databases", "tools", "aiAndData", "csConcepts"] as (keyof ProcessedSkills)[]) {
    sortedCategories[cat] = sortedCategories[cat].filter((skill) => {
      if (seen.has(skill)) return false;
      seen.add(skill);
      return true;
    });
  }

  return sortedCategories;
}
