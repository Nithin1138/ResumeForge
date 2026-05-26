import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ResumeFormData, PersonalInfo, SkillsInfo, ProjectInfo, InternshipInfo, PositionOfResponsibility, FinalOptions } from "@/types/resume";

interface FormStore {
  formData: ResumeFormData;
  activeStep: number;
  lastSaved: number | null;

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

  // Set entirely new parsed data
  setFullFormData: (data: ResumeFormData) => void;
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
    noProjects: false,
  },
};

export const useFormStore = create<FormStore>()(
  persist(
    (set) => ({
      formData: initialFormData,
      activeStep: 1,
      lastSaved: null,

      nextStep: () => set((state) => ({ activeStep: Math.min(state.activeStep + 1, 5) })),
      prevStep: () => set((state) => ({ activeStep: Math.max(state.activeStep - 1, 1) })),
      goToStep: (step) => set(() => ({ activeStep: Math.max(1, Math.min(step, 5)) })),

      setFullFormData: (data) =>
        set(() => ({
          formData: {
            personal: { ...initialFormData.personal, ...(data.personal || {}) },
            skills: { ...initialFormData.skills, ...(data.skills || {}) },
            projects: data.projects || [],
            internships: data.internships || [],
            positions: data.positions || [],
            options: { ...initialFormData.options, ...(data.options || {}) },
          },
          lastSaved: Date.now(),
        })),

      updatePersonal: (personal) =>
        set((state) => ({
          formData: {
            ...state.formData,
            personal: { ...state.formData.personal, ...personal },
          },
          lastSaved: Date.now(),
        })),

      updateSkills: (skills) =>
        set((state) => ({
          formData: {
            ...state.formData,
            skills: { ...state.formData.skills, ...skills },
          },
          lastSaved: Date.now(),
        })),

      addProject: () =>
        set((state) => {
          if (state.formData.projects.length >= 4) return state;
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
            lastSaved: Date.now(),
          };
        }),

      removeProject: (index) =>
        set((state) => ({
          formData: {
            ...state.formData,
            projects: state.formData.projects.filter((_, i) => i !== index),
          },
          lastSaved: Date.now(),
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
            lastSaved: Date.now(),
          };
        }),

      addInternship: () =>
        set((state) => {
          if (state.formData.internships.length >= 3) return state;
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
            lastSaved: Date.now(),
          };
        }),

      removeInternship: (index) =>
        set((state) => ({
          formData: {
            ...state.formData,
            internships: state.formData.internships.filter((_, i) => i !== index),
          },
          lastSaved: Date.now(),
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
            lastSaved: Date.now(),
          };
        }),

      addPosition: () =>
        set((state) => {
          if (state.formData.positions.length >= 2) return state;
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
            lastSaved: Date.now(),
          };
        }),

      removePosition: (index) =>
        set((state) => ({
          formData: {
            ...state.formData,
            positions: state.formData.positions.filter((_, i) => i !== index),
          },
          lastSaved: Date.now(),
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
            lastSaved: Date.now(),
          };
        }),

      updateOptions: (options) =>
        set((state) => ({
          formData: {
            ...state.formData,
            options: { ...state.formData.options, ...options },
          },
          lastSaved: Date.now(),
        })),

      resetForm: () => set(() => ({ formData: initialFormData, activeStep: 1, lastSaved: null })),
    }),
    {
      name: "atslift-form-draft", // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Persist everything including activeStep
      partialize: (state) => ({
        formData: state.formData,
        activeStep: state.activeStep,
        lastSaved: state.lastSaved,
      }),
    }
  )
);
