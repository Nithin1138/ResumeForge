export interface CodingProfile {
  platform: string;
  handle: string;
  link: string;
  problemsSolved: string;
  rating?: string;
}

export interface PersonalInfo {
  fullName: string;
  email: string;
  collegeName: string;
  ugDegree?: string;    // e.g. B.E., B.Tech, B.Sc
  branch: string;
  graduationYear: string;
  cgpa: string;
  targetRole: string;
  phone?: string;
  linkedin: string;
  github: string;
  location: string;
  hasPG: boolean;
  pgCollegeName?: string;
  pgBranch?: string;
  pgGraduationYear?: string;
  pgCgpa?: string;
  pgDegreeName?: string;
  codingProfiles?: CodingProfile[];
  // 12th
  has12th?: boolean;
  school12thName?: string;
  marks12th?: string;        // percentage or CGPA string
  board12th?: string;        // e.g. CBSE, ICSE, State board
  passYear12th?: string;
  // 10th
  has10th?: boolean;
  school10thName?: string;
  marks10th?: string;
  board10th?: string;
  passYear10th?: string;
}


export interface SkillsInfo {
  categories: Record<string, string>;
  softSkills: string;
  certifications: string;
}

export interface ProjectInfo {
  title: string;
  techStack: string;
  description: string;
  keyResult: string;
  link: string;         // legacy – kept for backward compat
  githubLink?: string;  // GitHub repository URL
  liveLink?: string;    // Live demo / deployed URL
  duration: string;
  isFlash?: boolean;
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

export interface AchievementInfo {
  title: string;
  description: string;
}


export interface FinalOptions {
  jobDescription: string;
  tone: "Professional & Formal" | "Modern & Concise" | "Technical & Detailed";
  projectVariants: "1 version" | "3 versions";
  targetRoles?: string[];
  noProjects?: boolean;
  templateId?: string;
  hasPhoto?: boolean;
  photoUrl?: string;
}

export interface ResumeFormData {
  personal: PersonalInfo;
  skills: SkillsInfo;
  projects: ProjectInfo[];
  internships: InternshipInfo[];
  positions: PositionOfResponsibility[];
  achievements: AchievementInfo[];
  options: FinalOptions;
}

export interface FreeTierPreview {
  summary: string;
  firstProject: {
    title: string;
    bullet: string;
  };
}

export interface VariantMetric {
  role: string;
  atsScore: number;
  breakdown: {
    keywordMatch: number;
    atsCompatibility: number;
    technicalStrength: number;
    projectQuality: number;
    recruiterReadability: number;
    experienceCredibility: number;
  };
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
}

export interface FullResumeOutput {
  summary: string;
  skills: {
    category: string;
    skills: string[];
  }[];
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
    variants?: {
      role: string;
      bullets: string[];
    }[];
    duration?: string;
    link?: string;
    githubLink?: string;
    liveLink?: string;
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
  breakdown: {
    keywordMatch: number;
    atsCompatibility: number;
    technicalStrength: number;
    projectQuality: number;
    recruiterReadability: number;
    experienceCredibility: number;
  };
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  variantMetrics?: VariantMetric[];
  freeTierPreview: FreeTierPreview;
}
