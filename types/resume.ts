export interface PersonalInfo {
  fullName: string;
  email: string;
  collegeName: string;
  branch: string;
  graduationYear: string;
  cgpa: string;
  targetRole: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  hasPG?: boolean;
  pgCollegeName?: string;
  pgBranch?: string;
  pgGraduationYear?: string;
  pgCgpa?: string;
  pgDegreeName?: string;
}

export interface SkillsInfo {
  languages: string;
  frameworks: string;
  tools: string;
  databases: string;
  concepts: string;
  softSkills: string;
  certifications: string;
}

export interface ProjectInfo {
  title: string;
  techStack: string;
  description: string;
  keyResult: string;
  link: string;
  duration: string;
}

export interface InternshipInfo {
  company: string;
  role: string;
  duration: string;
  workDone: string;
  techUsed: string;
}

export interface PositionOfResponsibility {
  title: string;
  organization: string;
  description: string;
}

export interface FinalOptions {
  jobDescription: string;
  tone: "Professional & Formal" | "Modern & Concise" | "Technical & Detailed";
  includeAchievements: boolean;
  achievements: string;
  projectVariants: "1 version" | "3 versions";
  noProjects?: boolean;
}

export interface ResumeFormData {
  personal: PersonalInfo;
  skills: SkillsInfo;
  projects: ProjectInfo[];
  internships: InternshipInfo[];
  positions: PositionOfResponsibility[];
  options: FinalOptions;
}

export interface FreeTierPreview {
  summary: string;
  firstProject: {
    title: string;
    bullet: string;
  };
}

export interface FullResumeOutput {
  summary: string;
  skills: {
    languages: string[];
    frameworks: string[];
    tools: string[];
    databases: string[];
    concepts: string[];
    softSkills?: string[];
  };
  education: {
    degree: string;
    institution: string;
    year: string;
    cgpa: string;
  };
  pgEducation?: {
    degree: string;
    institution: string;
    year: string;
    cgpa: string;
  };
  projects: {
    title: string;
    techStack: string;
    bullets: string[];
    duration?: string;
    link?: string;
  }[];
  experience: {
    company: string;
    role: string;
    duration: string;
    bullets: string[];
  }[];
  positions: {
    title: string;
    organization: string;
    bullet: string;
  }[];
  achievements: string[];
  atsScore: number;
  atsFeedbackCategory?: string;
  atsFeedbackSummary?: string;
  atsTips: string[];
  keywordsAdded: string[];
  freeTierPreview: FreeTierPreview;
}
