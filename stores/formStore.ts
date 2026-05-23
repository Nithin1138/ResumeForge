import { create } from "zustand";
import { ResumeFormData, PersonalInfo, SkillsInfo, ProjectInfo, InternshipInfo, PositionOfResponsibility, FinalOptions } from "@/types/resume";

interface FormStore {
  formData: ResumeFormData;
  activeStep: number;
  
  // Navigation
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  
  // Field Updates
  updatePersonal: (personal: Partial<PersonalInfo>) => void;
  updateSkills: (skills: Partial<SkillsInfo>) => void;
  
  // Project Repeater
  addProject: () => void;
  removeProject: (index: number) => void;
  updateProject: (index: number, project: Partial<ProjectInfo>) => void;
  
  // Internship Repeater
  addInternship: () => void;
  removeInternship: (index: number) => void;
  updateInternship: (index: number, internship: Partial<InternshipInfo>) => void;
  
  // POS Repeater
  addPosition: () => void;
  removePosition: (index: number) => void;
  updatePosition: (index: number, position: Partial<PositionOfResponsibility>) => void;
  
  // Options
  updateOptions: (options: Partial<FinalOptions>) => void;
  
  resetForm: () => void;
}

const initialFormData: ResumeFormData = {
  personal: {
    fullName: "",
    email: "",
    collegeName: "",
    branch: "",
    graduationYear: "",
    cgpa: "",
    targetRole: "",
    phone: "",
    linkedin: "",
    github: "",
    hasPG: false,
    pgCollegeName: "",
    pgBranch: "",
    pgGraduationYear: "",
    pgCgpa: "",
    pgDegreeName: "",
  },
  skills: {
    languages: "",
    frameworks: "",
    tools: "",
    databases: "",
    concepts: "",
    softSkills: "",
    certifications: "",
  },
  projects: [],
  internships: [],
  positions: [],
  options: {
    jobDescription: "",
    tone: "Professional & Formal",
    includeAchievements: false,
    achievements: "",
    projectVariants: "1 version",
  },
};

export const useFormStore = create<FormStore>((set) => ({
  formData: initialFormData,
  activeStep: 1,

  nextStep: () => set((state) => ({ activeStep: Math.min(state.activeStep + 1, 5) })),
  prevStep: () => set((state) => ({ activeStep: Math.max(state.activeStep - 1, 1) })),
  goToStep: (step) => set(() => ({ activeStep: Math.max(1, Math.min(step, 5)) })),

  updatePersonal: (personal) =>
    set((state) => ({
      formData: {
        ...state.formData,
        personal: { ...state.formData.personal, ...personal },
      },
    })),

  updateSkills: (skills) =>
    set((state) => ({
      formData: {
        ...state.formData,
        skills: { ...state.formData.skills, ...skills },
      },
    })),

  addProject: () =>
    set((state) => {
      if (state.formData.projects.length >= 4) return state; // Cap at 4 projects
      const newProject: ProjectInfo = {
        title: "",
        techStack: "",
        description: "",
        keyResult: "",
        link: "",
        duration: "",
      };
      return {
        formData: {
          ...state.formData,
          projects: [...state.formData.projects, newProject],
        },
      };
    }),

  removeProject: (index) =>
    set((state) => ({
      formData: {
        ...state.formData,
        projects: state.formData.projects.filter((_, i) => i !== index),
      },
    })),

  updateProject: (index, project) =>
    set((state) => {
      const updatedProjects = [...state.formData.projects];
      updatedProjects[index] = { ...updatedProjects[index], ...project };
      return {
        formData: {
          ...state.formData,
          projects: updatedProjects,
        },
      };
    }),

  addInternship: () =>
    set((state) => {
      if (state.formData.internships.length >= 3) return state; // Cap at 3 internships
      const newInternship: InternshipInfo = {
        company: "",
        role: "",
        duration: "",
        workDone: "",
        techUsed: "",
      };
      return {
        formData: {
          ...state.formData,
          internships: [...state.formData.internships, newInternship],
        },
      };
    }),

  removeInternship: (index) =>
    set((state) => ({
      formData: {
        ...state.formData,
        internships: state.formData.internships.filter((_, i) => i !== index),
      },
    })),

  updateInternship: (index, internship) =>
    set((state) => {
      const updatedInternships = [...state.formData.internships];
      updatedInternships[index] = { ...updatedInternships[index], ...internship };
      return {
        formData: {
          ...state.formData,
          internships: updatedInternships,
        },
      };
    }),

  addPosition: () =>
    set((state) => {
      if (state.formData.positions.length >= 2) return state; // Cap at 2 PORs
      const newPosition: PositionOfResponsibility = {
        title: "",
        organization: "",
        description: "",
      };
      return {
        formData: {
          ...state.formData,
          positions: [...state.formData.positions, newPosition],
        },
      };
    }),

  removePosition: (index) =>
    set((state) => ({
      formData: {
        ...state.formData,
        positions: state.formData.positions.filter((_, i) => i !== index),
      },
    })),

  updatePosition: (index, position) =>
    set((state) => {
      const updatedPositions = [...state.formData.positions];
      updatedPositions[index] = { ...updatedPositions[index], ...position };
      return {
        formData: {
          ...state.formData,
          positions: updatedPositions,
        },
      };
    }),

  updateOptions: (options) =>
    set((state) => ({
      formData: {
        ...state.formData,
        options: { ...state.formData.options, ...options },
      },
    })),

  resetForm: () => set(() => ({ formData: initialFormData, activeStep: 1 })),
}));
