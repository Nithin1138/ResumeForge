import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ResumeFormData, PersonalInfo, SkillsInfo, ProjectInfo, InternshipInfo, PositionOfResponsibility, AchievementInfo, FinalOptions } from "@/types/resume";

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
  moveProjectUp: (index: number) => void;
  moveProjectDown: (index: number) => void;

  // Internship Repeater
  addInternship: () => void;
  removeInternship: (index: number) => void;
  updateInternship: (index: number, internship: Partial<InternshipInfo>) => void;

  // POS Repeater
  addPosition: () => void;
  removePosition: (index: number) => void;
  updatePosition: (index: number, position: Partial<PositionOfResponsibility>) => void;

  // Achievement Repeater
  addAchievement: () => void;
  removeAchievement: (index: number) => void;
  updateAchievement: (index: number, achievement: Partial<AchievementInfo>) => void;


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
    location: "",
    hasPG: false,
    pgCollegeName: "",
    pgBranch: "",
    pgGraduationYear: "",
    pgCgpa: "",
    pgDegreeName: "",
    codingProfiles: [],
  },
  skills: {
    categories: {},
    softSkills: "",
    certifications: "",
  },
  projects: [],
  internships: [],
  positions: [],
  achievements: [],
  options: {
    jobDescription: "",
    tone: "Professional & Formal",
    projectVariants: "1 version",
    targetRoles: ["", "", ""],
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
        set(() => {
          // Helper to check if an object is completely empty (all string values are "")
          const isNotEmpty = (obj: any) => Object.values(obj).some((v) => typeof v === 'string' && v.trim() !== "");

          const personal = { ...initialFormData.personal, ...(data.personal || {}) };
          if (personal.fullName) personal.fullName = personal.fullName.toUpperCase();
          if (personal.collegeName) personal.collegeName = personal.collegeName.toUpperCase();
          if (personal.pgCollegeName) personal.pgCollegeName = personal.pgCollegeName.toUpperCase();

          return {
            formData: {
              personal,
              skills: { ...initialFormData.skills, ...(data.skills || {}) },
              projects: (data.projects || []).filter(isNotEmpty),
              internships: (data.internships || []).filter(isNotEmpty),
              positions: (data.positions || []).filter(isNotEmpty),
              achievements: (data.achievements || []).filter(isNotEmpty),
              options: { ...initialFormData.options, ...(data.options || {}) },
            },
            lastSaved: Date.now(),
          };
        }),

      updatePersonal: (personal) =>
        set((state) => {
          const updatedPersonal = { ...state.formData.personal, ...personal };
          if (updatedPersonal.fullName) updatedPersonal.fullName = updatedPersonal.fullName.toUpperCase();
          if (updatedPersonal.collegeName) updatedPersonal.collegeName = updatedPersonal.collegeName.toUpperCase();
          if (updatedPersonal.pgCollegeName) updatedPersonal.pgCollegeName = updatedPersonal.pgCollegeName.toUpperCase();
          
          return {
            formData: {
              ...state.formData,
              personal: updatedPersonal,
            },
            lastSaved: Date.now(),
          };
        }),

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
            isFlash: false,
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

      moveProjectUp: (index) =>
        set((state) => {
          if (index === 0) return state;
          const updatedProjects = [...state.formData.projects];
          const temp = updatedProjects[index - 1];
          updatedProjects[index - 1] = updatedProjects[index];
          updatedProjects[index] = temp;
          return {
            formData: { ...state.formData, projects: updatedProjects },
            lastSaved: Date.now(),
          };
        }),

      moveProjectDown: (index) =>
        set((state) => {
          if (index === state.formData.projects.length - 1) return state;
          const updatedProjects = [...state.formData.projects];
          const temp = updatedProjects[index + 1];
          updatedProjects[index + 1] = updatedProjects[index];
          updatedProjects[index] = temp;
          return {
            formData: { ...state.formData, projects: updatedProjects },
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
          const newPositions = [...state.formData.positions];
          newPositions[index] = { ...newPositions[index], ...position };
          return {
            formData: { ...state.formData, positions: newPositions },
            lastSaved: Date.now(),
          };
        }),

      // Achievement actions
      addAchievement: () =>
        set((state) => ({
          formData: {
            ...state.formData,
            achievements: [
              ...state.formData.achievements,
              { title: "", description: "" },
            ],
          },
          lastSaved: Date.now(),
        })),

      removeAchievement: (index) =>
        set((state) => ({
          formData: {
            ...state.formData,
            achievements: state.formData.achievements.filter((_, i) => i !== index),
          },
          lastSaved: Date.now(),
        })),

      updateAchievement: (index, achievement) =>
        set((state) => {
          const newAchievements = [...state.formData.achievements];
          newAchievements[index] = { ...newAchievements[index], ...achievement };
          return {
            formData: { ...state.formData, achievements: newAchievements },
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
      onRehydrateStorage: () => (state) => {
        if (state && state.lastSaved) {
          // Expiration time set to 2 hours (in milliseconds)
          const EXPIRATION_TIME = 2 * 60 * 60 * 1000;
          if (Date.now() - state.lastSaved > EXPIRATION_TIME) {
            // Data is expired, reset to initial state
            setTimeout(() => {
              state.resetForm();
            }, 0);
          }
        }
      },
    }
  )
);
