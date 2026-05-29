import { ResumeFormData } from "@/types/resume";

// ── Output type ────────────────────────────────────────────────────────────
export interface ProcessedSkills {
  languages: string[];
  frameworks: string[];
  databases: string[];
  tools: string[];
  csConcepts: string[];
  aiAndData: string[];
  cloudAndDevops: string[];
  cybersecurity: string[];
  embeddedSystems: string[];
  dataEngineering: string[];
  engineeringSoftware: string[];
}

type CategoryKey = keyof ProcessedSkills;

const DYNAMIC_CATEGORIES: CategoryKey[] = [
  "aiAndData",
  "cloudAndDevops",
  "cybersecurity",
  "embeddedSystems",
  "dataEngineering",
  "engineeringSoftware",
];

const CORE_CATEGORIES: CategoryKey[] = [
  "languages",
  "frameworks",
  "databases",
  "tools",
  "csConcepts",
];

// ── 1. Normalization Map ───────────────────────────────────────────────────
const NORMALIZATION_MAP: Record<string, string> = {
  // Languages
  "js": "JavaScript", "javascript": "JavaScript", "ts": "TypeScript", "typescript": "TypeScript",
  "py": "Python", "python": "Python", "c++": "C++", "cpp": "C++", "c#": "C#", "csharp": "C#",
  "golang": "Go", "go": "Go", "java": "Java", "kotlin": "Kotlin", "swift": "Swift", "r": "R",
  "ruby": "Ruby", "php": "PHP", "sql": "SQL", "html": "HTML", "css": "CSS", "dart": "Dart",
  "rust": "Rust", "scala": "Scala", "perl": "Perl", "matlab": "MATLAB", "bash": "Bash",
  "shell": "Shell Scripting", "shell scripting": "Shell Scripting",

  // Frameworks & Libraries
  "reactjs": "React.js", "react.js": "React.js", "react": "React.js",
  "nextjs": "Next.js", "next.js": "Next.js", "next": "Next.js",
  "nodejs": "Node.js", "node.js": "Node.js", "node": "Node.js",
  "expressjs": "Express.js", "express.js": "Express.js", "express": "Express.js",
  "angularjs": "Angular", "angular": "Angular", "vuejs": "Vue.js", "vue.js": "Vue.js", "vue": "Vue.js",
  "django": "Django", "flask": "Flask", "fastapi": "FastAPI",
  "spring boot": "Spring Boot", "springboot": "Spring Boot", "spring": "Spring Boot",
  "tailwindcss": "Tailwind CSS", "tailwind css": "Tailwind CSS", "tailwind": "Tailwind CSS",
  "bootstrap": "Bootstrap", "jquery": "jQuery", "redux": "Redux",
  "pytorch": "PyTorch", "tensorflow": "TensorFlow", "keras": "Keras",
  "scikit-learn": "Scikit-learn", "sklearn": "Scikit-learn", "pandas": "Pandas", "numpy": "NumPy",
  "matplotlib": "Matplotlib", "opencv": "OpenCV", "streamlit": "Streamlit",
  "flutter": "Flutter", "react native": "React Native", "svelte": "Svelte",

  // Databases
  "postgres": "PostgreSQL", "postgresql": "PostgreSQL", "mysql": "MySQL",
  "mongo": "MongoDB", "mongodb": "MongoDB", "sqlite": "SQLite", "redis": "Redis",
  "dynamodb": "DynamoDB", "firebase": "Firebase", "cassandra": "Cassandra",
  "sql server": "SQL Server", "mssql": "SQL Server", "neo4j": "Neo4j",
  "elasticsearch": "Elasticsearch", "supabase": "Supabase",

  // Tools
  "git": "Git", "github": "GitHub", "gitlab": "GitLab",
  "docker": "Docker", "kubernetes": "Kubernetes", "k8s": "Kubernetes",
  "aws": "AWS", "amazon web services": "AWS",
  "gcp": "Google Cloud", "google cloud": "Google Cloud", "google cloud (gcp)": "Google Cloud",
  "azure": "Microsoft Azure", "microsoft azure": "Microsoft Azure",
  "vercel": "Vercel", "netlify": "Netlify", "heroku": "Heroku",
  "jenkins": "Jenkins", "github actions": "GitHub Actions", "ci/cd": "CI/CD", "cicd": "CI/CD",
  "terraform": "Terraform", "ansible": "Ansible", "figma": "Figma", "postman": "Postman",
  "linux": "Linux", "unix": "Unix", "jira": "Jira", "vscode": "VS Code", "vs code": "VS Code",
  "rest api": "REST APIs", "rest apis": "REST APIs", "restful apis": "REST APIs",
  "graphql": "GraphQL", "webpack": "Webpack", "vite": "Vite", "nginx": "Nginx",
  "apache kafka": "Apache Kafka", "kafka": "Apache Kafka", "rabbitmq": "RabbitMQ",
  "swagger": "Swagger", "websockets": "WebSockets", "websocket": "WebSockets",

  // AI & Data
  "ml": "Machine Learning", "machine learning": "Machine Learning",
  "ai": "Artificial Intelligence", "artificial intelligence": "Artificial Intelligence",
  "dl": "Deep Learning", "deep learning": "Deep Learning",
  "nlp": "Natural Language Processing", "natural language processing": "Natural Language Processing",
  "computer vision": "Computer Vision", "cv": "Computer Vision",
  "generative ai": "Generative AI", "gen ai": "Generative AI", "genai": "Generative AI",
  "llm": "LLMs", "llms": "LLMs", "large language models": "LLMs",
  "prompt engineering": "Prompt Engineering", "data science": "Data Science",
  "data analysis": "Data Analysis", "data analytics": "Data Analytics",
  "data visualization": "Data Visualization", "data mining": "Data Mining",
  "big data": "Big Data", "neural networks": "Neural Networks",
  "reinforcement learning": "Reinforcement Learning", "transfer learning": "Transfer Learning",
  "text classification": "Text Classification", "sentiment analysis": "Sentiment Analysis",
  "image processing": "Image Processing",

  // Data Engineering
  "data warehousing": "Data Warehousing", "etl": "ETL Pipelines", "etl pipelines": "ETL Pipelines",
  "apache spark": "Apache Spark", "spark": "Apache Spark", "hadoop": "Hadoop",
  "data modeling": "Data Modeling", "data lakes": "Data Lakes", "data lake": "Data Lakes",

  // Cybersecurity
  "network security": "Network Security", "penetration testing": "Penetration Testing",
  "digital forensics": "Digital Forensics", "ethical hacking": "Ethical Hacking",
  "kali linux": "Kali Linux", "burp suite": "Burp Suite", "wireshark": "Wireshark",

  // Embedded Systems
  "arduino": "Arduino", "raspberry pi": "Raspberry Pi", "esp32": "ESP32",
  "microcontrollers": "Microcontrollers", "embedded c": "Embedded C",
  "rtos": "RTOS", "iot": "IoT", "internet of things": "IoT",

  // Engineering Software
  "autocad": "AutoCAD", "solidworks": "SolidWorks", "ansys": "ANSYS",
  "catia": "CATIA", "fusion 360": "Fusion 360", "revit": "Revit", "staad pro": "STAAD Pro",

  // CS Concepts
  "dsa": "Data Structures & Algorithms", "data structures & algorithms": "Data Structures & Algorithms",
  "oop": "Object-Oriented Programming", "oops": "Object-Oriented Programming",
  "object-oriented programming": "Object-Oriented Programming",
  "dbms": "Database Management Systems", "database management systems": "Database Management Systems",
  "os": "Operating Systems", "operating systems": "Operating Systems",
  "cn": "Computer Networks", "computer networks": "Computer Networks",
  "system design": "System Design", "software engineering": "Software Engineering",
  "agile": "Agile Methodology", "web development": "Web Development",
  "cloud computing": "Cloud Computing", "microservices": "Microservices"
};

// ── 2. Soft Skills Blacklist ───────────────────────────────────────────────
const SOFT_SKILLS_BLACKLIST = new Set([
  "teamwork", "team work", "hardworking", "hard working", "communication", "leadership",
  "punctuality", "dedication", "creativity", "adaptability", "time management",
  "problem solving", "critical thinking", "interpersonal skills", "work ethic",
  "self motivated", "self-motivated", "attention to detail", "multitasking",
  "negotiation", "conflict resolution", "emotional intelligence", "empathy",
  "patience", "flexibility", "decision making", "decision-making", "collaboration",
  "team collaboration", "team player", "positive attitude", "management",
  "organizational skills", "analytical skills", "quick learner", "fast learner",
  "self-starter", "detail-oriented", "motivated", "enthusiastic", "reliable",
  "responsible", "proactive", "innovative",
]);

// ── 3. Project Intelligence Patterns ───────────────────────────────────────
interface TechPattern {
  patterns: string[];
  skills: string[];
  category: CategoryKey;
}

const PROJECT_TECH_PATTERNS: TechPattern[] = [
  // AI & Data
  { patterns: ["opencv", "computer vision", "image processing", "object detection", "yolo"], skills: ["OpenCV", "Computer Vision"], category: "aiAndData" },
  { patterns: ["sentiment analysis", "vader", "text classification", "nlp", "nltk", "spacy"], skills: ["NLP", "Text Classification"], category: "aiAndData" },
  { patterns: ["machine learning", "ml model", "random forest", "svm", "scikit", "sklearn"], skills: ["Machine Learning"], category: "aiAndData" },
  { patterns: ["deep learning", "neural network", "cnn", "pytorch", "tensorflow", "keras"], skills: ["Deep Learning", "Neural Networks"], category: "aiAndData" },
  { patterns: ["llm", "large language model", "gpt", "openai", "prompt engineering", "langchain"], skills: ["Generative AI", "LLMs"], category: "aiAndData" },
  { patterns: ["data analysis", "data visualization", "pandas", "numpy", "matplotlib", "seaborn"], skills: ["Data Analysis", "Data Visualization"], category: "aiAndData" },

  // Data Engineering
  { patterns: ["etl", "data pipeline", "data warehouse", "airflow", "spark", "apache spark", "hadoop"], skills: ["ETL Pipelines", "Data Warehousing"], category: "dataEngineering" },

  // Cloud & DevOps
  { patterns: ["aws", "amazon web services", "s3", "ec2", "lambda"], skills: ["AWS"], category: "cloudAndDevops" },
  { patterns: ["google cloud", "gcp"], skills: ["Google Cloud"], category: "cloudAndDevops" },
  { patterns: ["azure"], skills: ["Microsoft Azure"], category: "cloudAndDevops" },
  { patterns: ["docker", "containerization"], skills: ["Docker"], category: "cloudAndDevops" },
  { patterns: ["kubernetes", "k8s"], skills: ["Kubernetes"], category: "cloudAndDevops" },
  { patterns: ["ci/cd", "github actions", "jenkins", "terraform"], skills: ["CI/CD"], category: "cloudAndDevops" },

  // Cybersecurity
  { patterns: ["penetration testing", "ethical hacking", "kali linux", "burp suite", "wireshark"], skills: ["Penetration Testing", "Network Security"], category: "cybersecurity" },

  // Embedded Systems
  { patterns: ["arduino", "raspberry pi", "esp32", "microcontroller", "rtos", "iot"], skills: ["IoT", "Embedded C"], category: "embeddedSystems" },

  // Engineering Software
  { patterns: ["autocad", "solidworks", "ansys", "catia", "fusion 360", "matlab"], skills: ["AutoCAD", "SolidWorks"], category: "engineeringSoftware" },

  // Frameworks
  { patterns: ["react", "reactjs"], skills: ["React.js"], category: "frameworks" },
  { patterns: ["next.js", "nextjs"], skills: ["Next.js"], category: "frameworks" },
  { patterns: ["node.js", "nodejs", "express"], skills: ["Node.js"], category: "frameworks" },
  { patterns: ["django"], skills: ["Django"], category: "frameworks" },
  { patterns: ["fastapi"], skills: ["FastAPI"], category: "frameworks" },
  { patterns: ["spring boot"], skills: ["Spring Boot"], category: "frameworks" },
  { patterns: ["streamlit"], skills: ["Streamlit"], category: "frameworks" },

  // Databases
  { patterns: ["mongodb", "mongo"], skills: ["MongoDB"], category: "databases" },
  { patterns: ["postgresql", "postgres"], skills: ["PostgreSQL"], category: "databases" },
  { patterns: ["mysql"], skills: ["MySQL"], category: "databases" },

  // Tools
  { patterns: ["rest api", "rest apis", "restful", "api endpoint"], skills: ["REST APIs"], category: "tools" },
  { patterns: ["graphql"], skills: ["GraphQL"], category: "tools" },

  // Languages
  { patterns: ["python"], skills: ["Python"], category: "languages" },
  { patterns: ["javascript", "js"], skills: ["JavaScript"], category: "languages" },
  { patterns: ["typescript", "ts"], skills: ["TypeScript"], category: "languages" },
  { patterns: ["java"], skills: ["Java"], category: "languages" },
  { patterns: ["c++", "cpp"], skills: ["C++"], category: "languages" },
];

// ── 4. Category Routing ────────────────────────────────────────────────────
const SKILL_TO_CATEGORY: Record<string, CategoryKey> = {
  "Python": "languages", "Java": "languages", "C++": "languages", "C": "languages",
  "C#": "languages", "JavaScript": "languages", "TypeScript": "languages", "Go": "languages",
  "HTML": "languages", "CSS": "languages", "SQL": "languages", "MATLAB": "languages",

  "React.js": "frameworks", "Next.js": "frameworks", "Node.js": "frameworks",
  "Express.js": "frameworks", "Angular": "frameworks", "Vue.js": "frameworks",
  "Django": "frameworks", "Flask": "frameworks", "FastAPI": "frameworks",
  "Spring Boot": "frameworks", "Tailwind CSS": "frameworks", "Bootstrap": "frameworks",
  "PyTorch": "frameworks", "TensorFlow": "frameworks", "Scikit-learn": "frameworks",
  "Pandas": "frameworks", "NumPy": "frameworks", "OpenCV": "frameworks", "Streamlit": "frameworks",

  "PostgreSQL": "databases", "MySQL": "databases", "MongoDB": "databases",
  "SQLite": "databases", "Redis": "databases", "Firebase": "databases",

  "Git": "tools", "GitHub": "tools", "VS Code": "tools", "Figma": "tools",
  "Postman": "tools", "Linux": "tools", "REST APIs": "tools", "GraphQL": "tools",

  "Machine Learning": "aiAndData", "Deep Learning": "aiAndData", "Natural Language Processing": "aiAndData",
  "Computer Vision": "aiAndData", "Generative AI": "aiAndData", "LLMs": "aiAndData",
  "Prompt Engineering": "aiAndData", "Data Science": "aiAndData", "Data Analysis": "aiAndData",

  "Data Warehousing": "dataEngineering", "ETL Pipelines": "dataEngineering",
  "Apache Spark": "dataEngineering", "Hadoop": "dataEngineering", "Data Lakes": "dataEngineering",

  "AWS": "cloudAndDevops", "Google Cloud": "cloudAndDevops", "Microsoft Azure": "cloudAndDevops",
  "Docker": "cloudAndDevops", "Kubernetes": "cloudAndDevops", "CI/CD": "cloudAndDevops",
  "Jenkins": "cloudAndDevops", "Terraform": "cloudAndDevops",

  "Network Security": "cybersecurity", "Penetration Testing": "cybersecurity",
  "Ethical Hacking": "cybersecurity", "Kali Linux": "cybersecurity", "Wireshark": "cybersecurity",

  "Arduino": "embeddedSystems", "Raspberry Pi": "embeddedSystems", "ESP32": "embeddedSystems",
  "Microcontrollers": "embeddedSystems", "Embedded C": "embeddedSystems", "IoT": "embeddedSystems",

  "AutoCAD": "engineeringSoftware", "SolidWorks": "engineeringSoftware", "ANSYS": "engineeringSoftware",
  "CATIA": "engineeringSoftware", "Fusion 360": "engineeringSoftware",

  "Data Structures & Algorithms": "csConcepts", "Object-Oriented Programming": "csConcepts",
  "Database Management Systems": "csConcepts", "Operating Systems": "csConcepts",
  "Computer Networks": "csConcepts", "Software Engineering": "csConcepts",
};

// ── 5. Category Limits ─────────────────────────────────────────────────────
const CATEGORY_LIMITS: Record<CategoryKey, number> = {
  languages: 6,
  frameworks: 8,
  databases: 4,
  tools: 8,
  csConcepts: 6,
  aiAndData: 5,
  cloudAndDevops: 6,
  cybersecurity: 5,
  embeddedSystems: 6,
  dataEngineering: 5,
  engineeringSoftware: 6,
};

function normalizeSkill(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const key = trimmed.toLowerCase();
  return NORMALIZATION_MAP[key] || trimmed;
}

function parseAndNormalize(csv: string | undefined): string[] {
  if (!csv || !csv.trim()) return [];
  return csv.split(",").map((s) => normalizeSkill(s)).filter((s) => s.length > 0);
}

function isSoftSkill(skill: string): boolean {
  return SOFT_SKILLS_BLACKLIST.has(skill.toLowerCase());
}

function extractFromText(text: string, results: Map<CategoryKey, Set<string>>, frequencyMap: Map<string, number>): void {
  if (!text || !text.trim()) return;
  const lower = text.toLowerCase();
  for (const pattern of PROJECT_TECH_PATTERNS) {
    for (const keyword of pattern.patterns) {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(?:^|[^a-z])${escaped}(?:[^a-z]|$)`, "i");
      if (regex.test(lower)) {
        const categorySet = results.get(pattern.category) || new Set();
        for (const skill of pattern.skills) {
          categorySet.add(skill);
          frequencyMap.set(skill, (frequencyMap.get(skill) || 0) + 1);
        }
        results.set(pattern.category, categorySet);
        break;
      }
    }
  }
}

function getCategoryForSkill(skill: string): CategoryKey | null {
  return SKILL_TO_CATEGORY[skill] || null;
}

// Map branches to ordered category priorities
function getBranchPriorities(branch: string | undefined): CategoryKey[] {
  if (!branch) return [];
  const b = branch.toLowerCase();
  if (b.includes("cs") || b.includes("computer") || b.includes("it") || b.includes("software") || b.includes("information")) {
    return ["languages", "frameworks", "databases", "csConcepts", "cloudAndDevops", "tools"];
  }
  if (b.includes("ai") || b.includes("data") || b.includes("machine learning")) {
    return ["aiAndData", "languages", "databases", "dataEngineering", "frameworks", "tools"];
  }
  if (b.includes("ece") || b.includes("electronics") || b.includes("communication")) {
    return ["embeddedSystems", "languages", "csConcepts", "tools"];
  }
  if (b.includes("eee") || b.includes("electrical")) {
    return ["embeddedSystems", "engineeringSoftware", "tools"];
  }
  if (b.includes("mech")) {
    return ["engineeringSoftware", "languages", "tools"];
  }
  if (b.includes("civil")) {
    return ["engineeringSoftware", "tools"];
  }
  if (b.includes("chem")) {
    return ["engineeringSoftware", "tools"];
  }
  return [];
}

export function generateTechnicalSkills(formData: ResumeFormData): ProcessedSkills {
  const { skills, projects, internships, personal } = formData;
  const frequencyMap = new Map<string, number>();

  // 1. Initialize raw categories
  const rawCategories: Record<CategoryKey, string[]> = {
    languages: parseAndNormalize(skills.languages),
    frameworks: parseAndNormalize(skills.frameworks),
    databases: parseAndNormalize(skills.databases),
    tools: parseAndNormalize(skills.tools),
    csConcepts: parseAndNormalize(skills.concepts),
    aiAndData: [], cloudAndDevops: [], cybersecurity: [],
    embeddedSystems: [], dataEngineering: [], engineeringSoftware: []
  };

  // Add frequency for user selections
  for (const cat of Object.keys(rawCategories) as CategoryKey[]) {
    for (const skill of rawCategories[cat]) {
      frequencyMap.set(skill, (frequencyMap.get(skill) || 0) + 1);
    }
  }

  // 2. Remove soft skills
  for (const cat of Object.keys(rawCategories) as CategoryKey[]) {
    rawCategories[cat] = rawCategories[cat].filter((s) => !isSoftSkill(s));
  }

  // 3-5. Extract from projects, internships, certs
  const extractedSkills = new Map<CategoryKey, Set<string>>();
  for (const cat of Object.keys(rawCategories) as CategoryKey[]) {
    extractedSkills.set(cat, new Set());
  }

  if (projects?.length) {
    for (const proj of projects) {
      extractFromText([proj.title, proj.techStack, proj.description, proj.keyResult].join(" "), extractedSkills, frequencyMap);
    }
  }
  if (internships?.length) {
    for (const intern of internships) {
      extractFromText([intern.role, intern.techUsed, intern.workDone].join(" "), extractedSkills, frequencyMap);
    }
  }
  if (skills.certifications) {
    extractFromText(skills.certifications, extractedSkills, frequencyMap);
  }

  // 6. Merge
  for (const [cat, skillSet] of extractedSkills.entries()) {
    for (const skill of skillSet) {
      if (!rawCategories[cat].includes(skill)) rawCategories[cat].push(skill);
    }
  }

  // 7. Re-categorize correctly
  const finalCategories: Record<CategoryKey, Set<string>> = {
    languages: new Set(), frameworks: new Set(), databases: new Set(), tools: new Set(), csConcepts: new Set(),
    aiAndData: new Set(), cloudAndDevops: new Set(), cybersecurity: new Set(),
    embeddedSystems: new Set(), dataEngineering: new Set(), engineeringSoftware: new Set()
  };

  for (const cat of Object.keys(rawCategories) as CategoryKey[]) {
    for (const skill of rawCategories[cat]) {
      const correctCat = getCategoryForSkill(skill) || cat;
      finalCategories[correctCat].add(skill);
    }
  }

  // 8. Deduplicate and sort
  const sortedCategories: Record<CategoryKey, string[]> = {
    languages: [], frameworks: [], databases: [], tools: [], csConcepts: [],
    aiAndData: [], cloudAndDevops: [], cybersecurity: [],
    embeddedSystems: [], dataEngineering: [], engineeringSoftware: []
  };

  const seen = new Set<string>();
  for (const cat of Object.keys(finalCategories) as CategoryKey[]) {
    const arr = Array.from(finalCategories[cat]).sort((a, b) => {
      const freqA = frequencyMap.get(a) || 0;
      const freqB = frequencyMap.get(b) || 0;
      if (freqB !== freqA) return freqB - freqA;
      return a.localeCompare(b);
    });
    
    for (const skill of arr) {
      if (!seen.has(skill)) {
        seen.add(skill);
        sortedCategories[cat].push(skill);
      }
    }
  }

  // 9. Apply dynamic category thresholds (merge into Tools if < 2)
  for (const cat of DYNAMIC_CATEGORIES) {
    if (sortedCategories[cat].length > 0 && sortedCategories[cat].length < 2) {
      sortedCategories.tools.push(...sortedCategories[cat]);
      sortedCategories[cat] = [];
    }
  }

  // Dedupe tools after merge
  sortedCategories.tools = Array.from(new Set(sortedCategories.tools));

  // 10. Branch-aware category limiting (Max 6 non-empty categories)
  const nonEmptyCats = (Object.keys(sortedCategories) as CategoryKey[]).filter(c => sortedCategories[c].length > 0);
  if (nonEmptyCats.length > 6) {
    const branchPriority = getBranchPriorities(personal?.branch);
    
    // Determine which categories to keep
    // Default core order as fallback
    const priorityOrder = [...branchPriority, ...CORE_CATEGORIES, ...DYNAMIC_CATEGORIES];
    const orderedNonEmpty = Array.from(new Set(priorityOrder)).filter(c => nonEmptyCats.includes(c));
    
    const categoriesToKeep = new Set(orderedNonEmpty.slice(0, 6));
    const categoriesToDrop = orderedNonEmpty.slice(6);
    
    // Merge dropped categories into Tools (if Tools is kept, otherwise drop completely)
    for (const cat of categoriesToDrop) {
      if (categoriesToKeep.has("tools")) {
        sortedCategories.tools.push(...sortedCategories[cat]);
      }
      sortedCategories[cat] = [];
    }
  }
  
  // Dedupe tools again just in case
  sortedCategories.tools = Array.from(new Set(sortedCategories.tools));

  // 11. Trim to limits
  for (const cat of Object.keys(sortedCategories) as CategoryKey[]) {
    const limit = CATEGORY_LIMITS[cat];
    if (sortedCategories[cat].length > limit) {
      sortedCategories[cat] = sortedCategories[cat].slice(0, limit);
    }
  }

  return sortedCategories;
}
