"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFormStore } from "@/stores/formStore";
import { ArrowLeft, ArrowRight, Plus, Trash2, Loader2, Sparkles, Check, ChevronDown, X, Cloud, CloudOff, RotateCcw, User, Code2, Rocket, Briefcase, Wand2, Zap, ArrowUp, ArrowDown, Archive, Layout, Camera, Upload, Image as ImageIcon } from "lucide-react";
import { getLocalSession } from "@/lib/authClient";
import { ThemeToggle } from "@/components/theme-toggle";
import { BRANCH_SKILL_CONFIGS, DEFAULT_BRANCH_CONFIG } from "@/lib/branchConfig";
import { NORMALIZATION_MAP } from "@/lib/skillsEngine";

// Curated popular suggestions for each skill block
const SOFT_SKILLS_SUGGESTIONS = ["Technical Writing", "Public Speaking", "Team Collaboration", "Agile Methodology", "Problem Solving", "Leadership", "Time Management", "Critical Thinking"];
const CERTIFICATIONS_SUGGESTIONS = ["AWS Certified Cloud Practitioner", "Google Cloud Digital Leader", "Oracle Java Certified", "NPTEL Algorithms", "Coursera Deep Learning", "Microsoft Azure Fundamentals"];

interface TagInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  suggestions: string[];
  placeholder: string;
  error?: string;
  required?: boolean;
}

function TagInput({
  label,
  value,
  onChange,
  suggestions,
  placeholder,
  error,
  required = false
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const activeTags = value ? value.split(",").map(t => t.trim()).filter(Boolean) : [];

  const uniqueActiveTags: string[] = [];
  const seenNormalized = new Set<string>();
  for (const tag of activeTags) {
    const normalized = NORMALIZATION_MAP[tag.toLowerCase()] || tag.trim();
    if (!seenNormalized.has(normalized.toLowerCase())) {
      seenNormalized.add(normalized.toLowerCase());
      uniqueActiveTags.push(normalized);
    }
  }

  const handleAddTag = (tag: string) => {
    let trimmed = tag.trim();
    if (!trimmed) return;
    
    // Normalize if possible
    const lower = trimmed.toLowerCase();
    if (NORMALIZATION_MAP[lower]) {
      trimmed = NORMALIZATION_MAP[lower];
    }

    // Case-insensitive and semantic inclusion check
    if (seenNormalized.has(trimmed.toLowerCase())) return;

    const newTags = [...uniqueActiveTags, trimmed];
    onChange(newTags.join(", "));
    setInputValue("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = uniqueActiveTags.filter(t => t !== tagToRemove);
    onChange(newTags.join(", "));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && uniqueActiveTags.length > 0) {
      handleRemoveTag(uniqueActiveTags[uniqueActiveTags.length - 1]);
    }
  };

  const handleToggleSuggestion = (sug: string) => {
    const normalizedSug = NORMALIZATION_MAP[sug.toLowerCase()] || sug.trim();
    
    if (seenNormalized.has(normalizedSug.toLowerCase())) {
      // Find the exact string we kept in uniqueActiveTags to remove it
      const existing = uniqueActiveTags.find(t => t.toLowerCase() === normalizedSug.toLowerCase());
      if (existing) {
        handleRemoveTag(existing);
      }
    } else {
      handleAddTag(sug);
    }
  };

  const filteredSuggestions = suggestions.filter(
    sug => {
      const normalizedSug = NORMALIZATION_MAP[sug.toLowerCase()] || sug.trim();
      return !seenNormalized.has(normalizedSug.toLowerCase()) && sug.toLowerCase().includes(inputValue.toLowerCase());
    }
  );

  return (
    <div className="space-y-2 relative">
      <label className="block text-sm font-semibold text-text text-left">
        {label} {required && <span className="text-error">*</span>}
      </label>
      
      <div 
        className={`w-full min-h-[50px] p-2.5 flex flex-wrap gap-2 items-center rounded-xl border bg-surface transition-all ${
          isOpen ? "ring-2 ring-primary border-transparent" : "border-border"
        }`}
        onClick={() => setIsOpen(true)}
      >
        {uniqueActiveTags.map((tag) => (
          <span 
            key={tag} 
            className="inline-flex items-center space-x-1.5 px-3 py-1 bg-primary/10 border border-primary/20 text-primary font-bold text-xs rounded-full"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveTag(tag);
              }}
              className="hover:bg-primary/20 p-0.5 rounded-full text-primary/80 hover:text-primary transition-colors cursor-pointer flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-text outline-hidden p-1"
          placeholder={activeTags.length === 0 ? placeholder : ""}
        />
        
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="p-1 text-text-muted hover:text-text cursor-pointer flex items-center justify-center"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Quick-tap scrollable pills directly below the input (Visible only on mobile for ultimate touch ease!) */}
      <div className="md:hidden flex items-center space-x-2 overflow-x-auto py-2 hide-scrollbar">
        <span className="text-[10px] font-black text-text-muted shrink-0 uppercase tracking-wider bg-surface px-2 py-1 rounded-sm border border-border">Popular:</span>
        <div className="flex gap-1.5">
          {suggestions.map((sug) => {
            const isSelected = activeTags.includes(sug);
            return (
              <button
                key={sug}
                type="button"
                onClick={() => handleToggleSuggestion(sug)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-surface border-border text-text-muted hover:text-text hover:border-primary/30"
                }`}
              >
                {sug}
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="text-xs text-error mt-1 font-semibold text-left">{error}</p>}

      {isOpen && filteredSuggestions.length > 0 && (
        <>
          <div className="absolute z-50 w-full mt-1 bg-surface border border-border shadow-lg rounded-xl max-h-48 overflow-y-auto">
            {filteredSuggestions.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddTag(sug);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
              >
                {sug}
              </button>
            ))}
          </div>
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />
        </>
      )}

    </div>
  );
}

export default function BuildPage() {
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const [isParsing, setIsParsing] = useState(false);

  const [isCodingProfileModalOpen, setIsCodingProfileModalOpen] = useState(false);
  const [editingCodingProfileIndex, setEditingCodingProfileIndex] = useState<number | null>(null);
  const [codingProfileForm, setCodingProfileForm] = useState({
    platform: "LeetCode",
    handle: "",
    link: "",
    problemsSolved: "",
    rating: "",
  });

  const handleAutoFillUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit");
        return;
      }
      setIsParsing(true);
      const formDataToSend = new FormData();
      formDataToSend.append("file", file);

      try {
        const response = await fetch("/api/parse-resume", {
          method: "POST",
          body: formDataToSend,
        });

        const text = await response.text();
        if (!response.ok) {
          let errorMessage = "Failed to parse resume";
          try {
            const errorData = JSON.parse(text);
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            errorMessage = `Server Error (${response.status}): ${response.statusText || "Internal Server Error"}`;
          }
          throw new Error(errorMessage);
        }

        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error("Failed to parse the server response. Please try again.");
        }

        useFormStore.getState().setFullFormData(data);
        alert("Auto-fill complete! Please review the extracted data.");
      } catch (error: any) {
        console.error("Parse error:", error);
        alert(error.message || "Failed to extract data. Please try again.");
      } finally {
        setIsParsing(false);
        if (e.target) e.target.value = "";
      }
    }
  };

  const router = useRouter();
  const {
    formData,
    activeStep,
    nextStep,
    prevStep,
    goToStep,
    updatePersonal,
    updateSkills,
    addProject,
    removeProject,
    updateProject,
    addInternship,
    removeInternship,
    updateInternship,
    addPosition,
    removePosition,
    updatePosition,
    addAchievement,
    removeAchievement,
    updateAchievement,
    updateOptions,
    setFullFormData,
    resetForm,
    moveProjectUp,
    moveProjectDown,
  } = useFormStore();

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [highlightedProjectIdx, setHighlightedProjectIdx] = useState<number | null>(null);

  const handleSaveCodingProfile = () => {
    const currentProfiles = formData.personal.codingProfiles || [];
    if (editingCodingProfileIndex !== null) {
      const newProfiles = [...currentProfiles];
      newProfiles[editingCodingProfileIndex] = codingProfileForm as any;
      updatePersonal({ codingProfiles: newProfiles });
    } else {
      updatePersonal({ codingProfiles: [...currentProfiles, codingProfileForm as any] });
    }
    setIsCodingProfileModalOpen(false);
    setEditingCodingProfileIndex(null);
    setCodingProfileForm({ platform: "LeetCode", handle: "", link: "", problemsSolved: "", rating: "" });
  };

  const handleEditCodingProfile = (index: number) => {
    const profile = (formData.personal.codingProfiles || [])[index];
    if (profile) {
      setCodingProfileForm({
        platform: profile.platform,
        handle: profile.handle,
        link: profile.link,
        problemsSolved: profile.problemsSolved,
        rating: profile.rating || "",
      });
      setEditingCodingProfileIndex(index);
      setIsCodingProfileModalOpen(true);
    }
  };

  const handleRemoveCodingProfile = (index: number) => {
    const currentProfiles = formData.personal.codingProfiles || [];
    const newProfiles = currentProfiles.filter((_, i) => i !== index);
    updatePersonal({ codingProfiles: newProfiles });
  };

  const handleMoveProjectUp = (idx: number) => {
    if (idx === 0) return;
    const newIdx = idx - 1;
    setHighlightedProjectIdx(newIdx);
    moveProjectUp(idx);
    setTimeout(() => {
      const el = document.getElementById(`project-card-${newIdx}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
    setTimeout(() => {
      setHighlightedProjectIdx(null);
    }, 1200);
  };

  const handleMoveProjectDown = (idx: number) => {
    if (idx === formData.projects.length - 1) return;
    const newIdx = idx + 1;
    setHighlightedProjectIdx(newIdx);
    moveProjectDown(idx);
    setTimeout(() => {
      const el = document.getElementById(`project-card-${newIdx}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
    setTimeout(() => {
      setHighlightedProjectIdx(null);
    }, 1200);
  };

  // Local project draft storage with LocalStorage persistence
  const [draftedProjects, setDraftedProjects] = useState<import("@/types/resume").ProjectInfo[]>([]);
  const [isDraftOpen, setIsDraftOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("project_drafts");
      if (stored) {
        setDraftedProjects(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load project drafts:", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("project_drafts", JSON.stringify(draftedProjects));
    } catch (e) {
      console.error("Failed to save project drafts:", e);
    }
  }, [draftedProjects]);

  const handleSendToDraft = (idx: number) => {
    const projectToDraft = formData.projects[idx];
    setDraftedProjects(prev => [...prev, projectToDraft]);
    removeProject(idx);
  };

  const handleRestoreFromDraft = (draftIdx: number) => {
    const currentProjects = useFormStore.getState().formData.projects;
    if (currentProjects.length >= 4) return;
    
    const projectToRestore = draftedProjects[draftIdx];
    addProject();
    const newIdx = useFormStore.getState().formData.projects.length - 1;
    updateProject(newIdx, projectToRestore);
    setDraftedProjects(prev => prev.filter((_, i) => i !== draftIdx));
  };

  const handleDeleteFromDraft = (draftIdx: number) => {
    setDraftedProjects(prev => prev.filter((_, i) => i !== draftIdx));
  };

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  // Draft persistence state
  const [draftStatus, setDraftStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const lastSaved = useFormStore((s) => s.lastSaved);

  // Flash Project Modal State
  const [flashProjectModal, setFlashProjectModal] = useState({ isOpen: false, title: "", repoUrl: "", isLoading: false, error: "" });

  const handleFlashProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flashProjectModal.repoUrl) return;
    
    setFlashProjectModal(prev => ({ ...prev, isLoading: true, error: "" }));
    try {
      const res = await fetch("/api/flash-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: flashProjectModal.repoUrl })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch project details.");

      // Add new project if limit not reached
      if (formData.projects.length < 4 && !formData.options.noProjects) {
        // We need to add a new project and then update it.
        // Wait, the formStore doesn't return the new state from addProject,
        // so we can't easily grab the index. But it appends.
        addProject();
        // The newly added project will be at index = formData.projects.length
        // But because of React state closure, formData.projects.length here is the old length.
        const newIndex = formData.projects.length;
        updateProject(newIndex, {
          title: data.title || "Flash Project",
          githubLink: flashProjectModal.repoUrl,
          link: flashProjectModal.repoUrl,
          techStack: data.techStack || "",
          description: data.description || "",
          keyResult: data.keyResult || "",
          duration: data.duration || "",
          isFlash: true
        });

      }
      setFlashProjectModal({ isOpen: false, title: "", repoUrl: "", isLoading: false, error: "" });
    } catch (err: any) {
      setFlashProjectModal(prev => ({ ...prev, isLoading: false, error: err.message }));
    }
  };

  // Check if user is logged in
  useEffect(() => {
    const session = getLocalSession();
    setIsLoggedIn(!!session);

    // Log Form Load analytics event
    try {
      let sid = localStorage.getItem("atslift_session_id");
      if (!sid) {
        sid = "session_" + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("atslift_session_id", sid);
      }
      fetch("/api/analytics/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sid,
          eventType: "FORM_LOAD",
          page: "build",
          metadata: { loggedIn: !!session }
        })
      }).catch(err => console.error("Failed to log form load:", err));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Cloud auto-save for logged-in users (debounced, every 15s)
  useEffect(() => {
    if (!isLoggedIn || !lastSaved) return;
    const timer = setTimeout(async () => {
      try {
        setDraftStatus("saving");
        await fetch("/api/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formData, activeStep }),
        });
        setDraftStatus("saved");
        setTimeout(() => setDraftStatus("idle"), 3000);
      } catch {
        setDraftStatus("error");
        setTimeout(() => setDraftStatus("idle"), 3000);
      }
    }, 2000); // debounce 2s after last change
    return () => clearTimeout(timer);
  }, [lastSaved, isLoggedIn]);

  // On mount: for logged-in users, check if there's a newer server draft vs localStorage
  useEffect(() => {
    if (!isLoggedIn) return;
    (async () => {
      try {
        const res = await fetch("/api/draft");
        const data = await res.json();
        if (data.draft) {
          const serverTime = new Date(data.draft.updatedAt).getTime();
          const localTime = lastSaved || 0;
          // Show banner only if server draft is newer than what we have locally
          if (serverTime > localTime + 5000) {
            setShowDraftBanner(true);
          }
        }
      } catch {
        // Silently fail
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  useEffect(() => {
    if (validationErrors.projectsGlobal) {
      const timer = setTimeout(() => {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.projectsGlobal;
          return newErrors;
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [validationErrors.projectsGlobal]);

  const loadingSteps = [
    "Structuring resume schema...",
    "Analyzing core project architectures...",
    "Mapping skills to industry recruiter keywords...",
    "Rewriting bullets with strong action verbs...",
    "Calculating real-time ATS optimization score...",
    "Saving draft and compiling output..."
  ];

  // Manual step validation
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.personal.fullName.trim()) errors.fullName = "Full Name is required";
      if (!formData.personal.email.trim()) {
        errors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.personal.email)) {
        errors.email = "Invalid email format";
      }
      if (!formData.personal.collegeName.trim()) errors.collegeName = "College Name is required";
      if (!formData.personal.branch) errors.branch = "Branch selection is required";
      if (!formData.personal.graduationYear) errors.graduationYear = "Graduation Year is required";
      
      const cgpaNum = parseFloat(formData.personal.cgpa);
      if (!formData.personal.cgpa.trim()) {
        errors.cgpa = "CGPA is required";
      } else if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
        errors.cgpa = "CGPA must be between 0.0 and 10.0";
      }

      if (formData.personal.hasPG) {
        if (!formData.personal.pgDegreeName) errors.pgDegreeName = "PG Degree selection is required";
        if (!formData.personal.pgCollegeName?.trim()) errors.pgCollegeName = "PG College Name is required";
        if (!formData.personal.pgBranch?.trim()) errors.pgBranch = "PG Specialization is required";
        if (!formData.personal.pgGraduationYear) errors.pgGraduationYear = "PG Graduation Year is required";
        
        const pgCgpaNum = parseFloat(formData.personal.pgCgpa || "");
        if (!formData.personal.pgCgpa?.trim()) {
          errors.pgCgpa = "PG CGPA is required";
        } else if (isNaN(pgCgpaNum) || pgCgpaNum < 0 || pgCgpaNum > 10) {
          errors.pgCgpa = "PG CGPA must be between 0.0 and 10.0";
        }
      }
    }

    if (step === 2) {
      const config = BRANCH_SKILL_CONFIGS[formData.personal.branch] || DEFAULT_BRANCH_CONFIG;
      config.forEach(cat => {
        if (cat.required && !formData.skills.categories?.[cat.id]?.trim()) {
          errors[`category_${cat.id}`] = `At least one item is required for ${cat.label}`;
        }
      });
    }

    if (step === 3) {
      if (!formData.options.noProjects) {
        if (formData.projects.length === 0) {
          errors.projectsGlobal = "Please add at least one project to build your resume content";
        } else {
          formData.projects.forEach((proj, idx) => {
            if (!proj.title.trim()) errors[`proj_${idx}_title`] = "Project title is required";
            if (!proj.techStack.trim()) errors[`proj_${idx}_tech`] = "Tech stack is required";
            if (!proj.description.trim()) errors[`proj_${idx}_desc`] = "Description is required";
            if (!proj.keyResult.trim()) errors[`proj_${idx}_result`] = "Key feature/result is required";
          });
        }
      }
    }

    if (step === 4) {
      // Internships are optional, but if added they must be valid
      formData.internships.forEach((intern, idx) => {
        if (!intern.company.trim()) errors[`intern_${idx}_company`] = "Company name is required";
        if (!intern.role.trim()) errors[`intern_${idx}_role`] = "Role title is required";
        if (!intern.duration.trim()) errors[`intern_${idx}_dur`] = "Duration is required";
        if (!intern.workDone.trim()) errors[`intern_${idx}_work`] = "Description is required";
        if (intern.workDone.length > 200) errors[`intern_${idx}_work`] = "Description must be under 200 characters";
      });

      formData.positions.forEach((pos, idx) => {
        if (!pos.title.trim()) errors[`pos_${idx}_title`] = "Title is required";
        if (!pos.organization.trim()) errors[`pos_${idx}_org`] = "Organization is required";
        if (!pos.description.trim()) errors[`pos_${idx}_desc`] = "Description is required";
      });

      formData.achievements.forEach((achieve, idx) => {
        if (!achieve.title.trim()) errors[`achieve_${idx}_title`] = "Title is required";
        if (!achieve.description.trim()) errors[`achieve_${idx}_desc`] = "Description is required";
      });
    }

    if (step === 6) {
      if (formData.options.projectVariants === "3 versions") {
        const roles = formData.options.targetRoles || [];
        if (!roles[0] || !roles[1] || !roles[2]) {
          errors.targetRoles = "Please select all 3 target roles";
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      nextStep();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    prevStep();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepClick = (step: number) => {
    // Only allow clicking to steps that have already been validated
    let canGo = true;
    for (let i = 1; i < step; i++) {
      if (!validateStep(i)) {
        canGo = false;
        break;
      }
    }
    if (canGo) {
      goToStep(step);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) return;

    setIsGenerating(true);
    setGenerationStep(0);

    // Simulated step loader progression
    const interval = setInterval(() => {
      setGenerationStep((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1500);

    try {
      // Generate a temporary session ID if not present
      const sessionId = "session_" + Math.random().toString(36).substr(2, 9);
      
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          formData,
        }),
      });

      clearInterval(interval);

      if (!response.ok) {
        throw new Error("Failed to generate resume content");
      }

      const data = await response.json();
      router.push(`/result/${data.resumeId}`);
    } catch (err) {
      clearInterval(interval);
      setIsGenerating(false);
      alert("Error generating resume content. Please try again.");
      console.error(err);
    }
  };

  // Step 1: Personal Info Form
  const renderStep1 = () => (
    <div className="space-y-8">
      <div className="border-b border-border/60 pb-4">
        <h2 className="text-xl font-bold font-sans">Personal &amp; Academic Details</h2>
        <p className="text-sm text-text-muted">Enter your basic info, contact details and academic history.</p>
      </div>

      {/* ── PERSONAL DETAILS ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-5 w-1 rounded-full bg-primary" />
          <h3 className="text-sm font-extrabold text-text uppercase tracking-wider">Personal Details</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Full Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
              placeholder="e.g. Nithin Kumar"
              value={formData.personal.fullName}
              onChange={(e) => updatePersonal({ fullName: e.target.value })}
            />
            {validationErrors.fullName && <p className="text-xs text-error mt-1 font-semibold">{validationErrors.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Email Address</label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
              placeholder="e.g. nithin.kumar@vit.edu"
              value={formData.personal.email}
              onChange={(e) => updatePersonal({ email: e.target.value })}
            />
            {validationErrors.email && <p className="text-xs text-error mt-1 font-semibold">{validationErrors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Phone Number</label>
            <input
              type="tel"
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
              placeholder="e.g. +91 98765 43210"
              value={formData.personal.phone || ""}
              onChange={(e) => updatePersonal({ phone: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Location</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
              placeholder="e.g. Andhra Pradesh, India"
              value={formData.personal.location || ""}
              onChange={(e) => updatePersonal({ location: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">LinkedIn Profile Link</label>
            <input
              type="url"
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
              placeholder="e.g. linkedin.com/in/username"
              value={formData.personal.linkedin || ""}
              onChange={(e) => updatePersonal({ linkedin: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">GitHub Profile Link</label>
            <input
              type="url"
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
              placeholder="e.g. github.com/username"
              value={formData.personal.github || ""}
              onChange={(e) => updatePersonal({ github: e.target.value })}
            />
          </div>

          <div className="md:col-span-2 flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold">Coding Profiles</label>
              <button
                type="button"
                onClick={() => {
                  setCodingProfileForm({ platform: "LeetCode", handle: "", link: "", problemsSolved: "", rating: "" });
                  setEditingCodingProfileIndex(null);
                  setIsCodingProfileModalOpen(true);
                }}
                className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center bg-primary/10 px-3 py-1 rounded-full"
              >
                <Code2 className="w-3.5 h-3.5 mr-1" />
                Add Profile
              </button>
            </div>
            {(formData.personal.codingProfiles || []).length > 0 ? (
              <div className="flex flex-col gap-3 flex-1">
                {(formData.personal.codingProfiles || []).map((profile, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-surface border border-border rounded-xl">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="bg-primary/10 text-primary p-2 rounded-lg shrink-0">
                        <Code2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-text truncate">{profile.platform}</h4>
                        <p className="text-xs text-text-muted truncate">
                          {profile.handle} • {profile.problemsSolved} problems {profile.rating ? `• ${profile.rating}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1 shrink-0">
                      <button type="button" onClick={() => handleEditCodingProfile(i)} className="text-primary hover:bg-primary/10 p-1.5 rounded-md transition-colors"><Wand2 className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={() => handleRemoveCodingProfile(i)} className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-md transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-border rounded-xl p-4 text-center bg-surface/50 flex-1 flex flex-col justify-center">
                <p className="text-xs text-text-muted">Boost validation metrics by adding your LeetCode, HackerRank, or CodeChef profiles.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── ACADEMIC DETAILS ── */}
      <div className="space-y-5 border-t border-border/40 pt-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-5 w-1 rounded-full bg-primary" />
          <h3 className="text-sm font-extrabold text-text uppercase tracking-wider">Academic Details</h3>
        </div>

        {/* UG — always visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-primary/5 p-5 rounded-2xl border border-primary/20">
          <div className="md:col-span-2">
            <h4 className="text-xs font-extrabold text-primary uppercase tracking-wider">Under Graduation (UG)</h4>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-2">College Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
              placeholder="e.g. Vellore Institute of Technology (VIT), Vellore"
              value={formData.personal.collegeName}
              onChange={(e) => updatePersonal({ collegeName: e.target.value })}
            />
            {validationErrors.collegeName && <p className="text-xs text-error mt-1 font-semibold">{validationErrors.collegeName}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Degree</label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
              value={formData.personal.ugDegree || ""}
              onChange={(e) => updatePersonal({ ugDegree: e.target.value, branch: "" })}
            >
              <option value="">Select degree</option>
              <option value="B.E.">B.E. (Bachelor of Engineering)</option>
              <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
              <option value="B.Sc">B.Sc (Bachelor of Science)</option>
              <option value="BCA">BCA (Bachelor of Computer Applications)</option>
              <option value="BBA">BBA (Bachelor of Business Administration)</option>
              <option value="B.Com">B.Com (Bachelor of Commerce)</option>
              <option value="B.Arch">B.Arch (Bachelor of Architecture)</option>
              <option value="Other">Other Degree</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Branch / Specialization</label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
              value={formData.personal.branch}
              onChange={(e) => updatePersonal({ branch: e.target.value })}
            >
              <option value="">Select branch</option>
              {((degree: string) => {
                const map: Record<string, { label: string; value: string }[]> = {
                  "B.E.": [
                    { label: "Computer Science & Engineering (CSE)", value: "CSE" },
                    { label: "Electronics & Communication Engineering (ECE)", value: "ECE" },
                    { label: "Electrical & Electronics Engineering (EEE)", value: "EEE" },
                    { label: "Information Technology (IT)", value: "IT" },
                    { label: "Artificial Intelligence & Data Science (AI & DS)", value: "AI & DS" },
                    { label: "Cyber Security", value: "Cyber Security" },
                    { label: "Mechanical Engineering", value: "Mechanical" },
                    { label: "Civil Engineering", value: "Civil" },
                    { label: "Chemical Engineering", value: "Chemical" },
                    { label: "Biotechnology", value: "Biotechnology" },
                    { label: "Aerospace Engineering", value: "Aerospace" },
                    { label: "Other Engineering Branch", value: "Other" },
                  ],
                  "B.Tech": [
                    { label: "Computer Science & Engineering (CSE)", value: "CSE" },
                    { label: "Electronics & Communication Engineering (ECE)", value: "ECE" },
                    { label: "Electrical & Electronics Engineering (EEE)", value: "EEE" },
                    { label: "Information Technology (IT)", value: "IT" },
                    { label: "Artificial Intelligence & Data Science (AI & DS)", value: "AI & DS" },
                    { label: "Cyber Security", value: "Cyber Security" },
                    { label: "Mechanical Engineering", value: "Mechanical" },
                    { label: "Civil Engineering", value: "Civil" },
                    { label: "Chemical Engineering", value: "Chemical" },
                    { label: "Biotechnology", value: "Biotechnology" },
                    { label: "Aerospace Engineering", value: "Aerospace" },
                    { label: "Other B.Tech Branch", value: "Other" },
                  ],
                  "B.Sc": [
                    { label: "Computer Science / IT", value: "CSE" },
                    { label: "Data Science & Analytics", value: "AI & DS" },
                    { label: "Mathematics & Statistics", value: "Mathematics" },
                    { label: "Physics", value: "Physics" },
                    { label: "Chemistry", value: "Chemistry" },
                    { label: "Biotechnology / Microbiology", value: "Biotechnology" },
                    { label: "Electronics", value: "ECE" },
                    { label: "Other B.Sc Stream", value: "Other" },
                  ],
                  "BCA": [
                    { label: "General Computer Applications", value: "CSE" },
                    { label: "Data Analytics & Data Science", value: "AI & DS" },
                    { label: "Cloud Computing & Cyber Security", value: "Cyber Security" },
                    { label: "Software Development & Web Technologies", value: "IT" },
                    { label: "Other BCA Specialization", value: "Other" },
                  ],
                  "BBA": [
                    { label: "General Management", value: "Management" },
                    { label: "Finance & Accounting", value: "Finance" },
                    { label: "Marketing & Sales", value: "Marketing" },
                    { label: "Human Resources (HR)", value: "HR" },
                    { label: "Business Analytics / Digital Marketing", value: "Business Analytics" },
                    { label: "International Business", value: "International Business" },
                    { label: "Other BBA Stream", value: "Other" },
                  ],
                  "B.Com": [
                    { label: "General Commerce", value: "Commerce" },
                    { label: "Accounting & Finance", value: "Finance" },
                    { label: "Computer Applications", value: "IT" },
                    { label: "Banking & Insurance", value: "Banking" },
                    { label: "Taxation & Auditing", value: "Taxation" },
                    { label: "Other B.Com Stream", value: "Other" },
                  ],
                  "B.Arch": [
                    { label: "General Architecture", value: "Architecture" },
                    { label: "Interior Design", value: "Interior Design" },
                    { label: "Landscape Architecture", value: "Landscape" },
                    { label: "Urban Planning & Development", value: "Urban Planning" },
                    { label: "Other Architecture Stream", value: "Other" },
                  ],
                };
                const options = map[degree] || [
                  { label: "Computer Science & Engineering (CSE)", value: "CSE" },
                  { label: "Electronics & Communication Engineering (ECE)", value: "ECE" },
                  { label: "Electrical & Electronics Engineering (EEE)", value: "EEE" },
                  { label: "Information Technology (IT)", value: "IT" },
                  { label: "Artificial Intelligence & Data Science (AI & DS)", value: "AI & DS" },
                  { label: "Cyber Security", value: "Cyber Security" },
                  { label: "Mechanical Engineering", value: "Mechanical" },
                  { label: "Civil Engineering", value: "Civil" },
                  { label: "Chemical Engineering", value: "Chemical" },
                  { label: "Biotechnology", value: "Biotechnology" },
                  { label: "Aerospace Engineering", value: "Aerospace" },
                  { label: "Other Branch", value: "Other" },
                ];
                return options.map((opt) => (
                  <option key={opt.label} value={opt.value}>
                    {opt.label}
                  </option>
                ));
              })(formData.personal.ugDegree || "")}
            </select>
            {validationErrors.branch && <p className="text-xs text-error mt-1 font-semibold">{validationErrors.branch}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Graduation Year</label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
              value={formData.personal.graduationYear}
              onChange={(e) => updatePersonal({ graduationYear: e.target.value })}
              inputMode="numeric"
            >
              <option value="">Select year</option>
              {["2020","2021","2022","2023","2024","2025","2026","2027","2028","2029","2030"].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            {validationErrors.graduationYear && <p className="text-xs text-error mt-1 font-semibold">{validationErrors.graduationYear}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">CGPA (out of 10.0)</label>
            <input
              type="number"
              step="0.01"
              inputMode="decimal"
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
              placeholder="e.g. 8.76"
              value={formData.personal.cgpa}
              onChange={(e) => updatePersonal({ cgpa: e.target.value })}
            />
            {validationErrors.cgpa && <p className="text-xs text-error mt-1 font-semibold">{validationErrors.cgpa}</p>}
          </div>
        </div>

        {/* Optional Education Details (PG, 12th, 10th) */}
        <div className="space-y-4 pt-1">
          {/* PG Option & Details */}
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer p-3.5 rounded-xl border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-colors">
              <input
                type="checkbox"
                className="w-4 h-4 rounded-xs border-border text-primary focus:ring-primary focus:ring-opacity-25 shrink-0"
                checked={formData.personal.hasPG || false}
                onChange={(e) => {
                  updatePersonal({
                    hasPG: e.target.checked,
                    ...(!e.target.checked && { pgDegreeName: "", pgCollegeName: "", pgBranch: "", pgGraduationYear: "", pgCgpa: "" })
                  });
                }}
              />
              <span className="text-sm font-semibold text-text">Add Post Graduation (PG) details <span className="text-text-muted font-normal text-xs ml-1">(Optional)</span></span>
            </label>

            {formData.personal.hasPG && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-primary/5 p-5 rounded-2xl border border-primary/20 mt-2">
                <div className="md:col-span-2">
                  <h4 className="text-xs font-extrabold text-primary uppercase tracking-wider">Post Graduation (PG) Details</h4>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">PG Degree</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm font-medium"
                    value={formData.personal.pgDegreeName || ""}
                    onChange={(e) => updatePersonal({ pgDegreeName: e.target.value })}
                  >
                    <option value="">Select PG degree</option>
                    <option value="M.Tech">M.Tech (Master of Technology)</option>
                    <option value="M.E.">M.E. (Master of Engineering)</option>
                    <option value="MS">MS (Master of Science)</option>
                    <option value="MBA">MBA (Master of Business Administration)</option>
                    <option value="MCA">MCA (Master of Computer Applications)</option>
                    <option value="M.Sc">M.Sc (Master of Science)</option>
                    <option value="Other">Other PG Degree</option>
                  </select>
                  {validationErrors.pgDegreeName && <p className="text-xs text-error mt-1 font-semibold">{validationErrors.pgDegreeName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">PG Branch / Specialization</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
                    placeholder="e.g. Data Science, VLSI Design, MBA Systems"
                    value={formData.personal.pgBranch || ""}
                    onChange={(e) => updatePersonal({ pgBranch: e.target.value })}
                  />
                  {validationErrors.pgBranch && <p className="text-xs text-error mt-1 font-semibold">{validationErrors.pgBranch}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">PG College Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
                    placeholder="e.g. Indian Institute of Technology (IIT), Madras"
                    value={formData.personal.pgCollegeName || ""}
                    onChange={(e) => updatePersonal({ pgCollegeName: e.target.value })}
                  />
                  {validationErrors.pgCollegeName && <p className="text-xs text-error mt-1 font-semibold">{validationErrors.pgCollegeName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">PG Graduation Year</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm font-medium"
                    value={formData.personal.pgGraduationYear || ""}
                    onChange={(e) => updatePersonal({ pgGraduationYear: e.target.value })}
                    inputMode="numeric"
                  >
                    <option value="">Select year</option>
                    {["2020","2021","2022","2023","2024","2025","2026","2027","2028","2029","2030"].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  {validationErrors.pgGraduationYear && <p className="text-xs text-error mt-1 font-semibold">{validationErrors.pgGraduationYear}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">PG CGPA (out of 10.0)</label>
                  <input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
                    placeholder="e.g. 9.12"
                    value={formData.personal.pgCgpa || ""}
                    onChange={(e) => updatePersonal({ pgCgpa: e.target.value })}
                  />
                  {validationErrors.pgCgpa && <p className="text-xs text-error mt-1 font-semibold">{validationErrors.pgCgpa}</p>}
                </div>
              </div>
            )}
          </div>

          {/* 12th Option & Details */}
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer p-3.5 rounded-xl border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-colors">
              <input
                type="checkbox"
                className="w-4 h-4 rounded-xs border-border text-primary focus:ring-primary focus:ring-opacity-25 shrink-0"
                checked={formData.personal.has12th || false}
                onChange={(e) => {
                  updatePersonal({
                    has12th: e.target.checked,
                    ...(!e.target.checked && { school12thName: "", marks12th: "", board12th: "", passYear12th: "" })
                  });
                }}
              />
              <span className="text-sm font-semibold text-text">Add 12th / HSC details <span className="text-text-muted font-normal text-xs ml-1">(Optional)</span></span>
            </label>

            {formData.personal.has12th && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-primary/5 p-5 rounded-2xl border border-primary/20 mt-2">
                <div className="md:col-span-2">
                  <h4 className="text-xs font-extrabold text-primary uppercase tracking-wider">12th / HSC Details</h4>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">School Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
                    placeholder="e.g. St. Joseph's Higher Secondary School"
                    value={formData.personal.school12thName || ""}
                    onChange={(e) => updatePersonal({ school12thName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Board</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
                    value={formData.personal.board12th || ""}
                    onChange={(e) => updatePersonal({ board12th: e.target.value })}
                  >
                    <option value="">Select board</option>
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="State Board">State Board</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Passing Year</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
                    value={formData.personal.passYear12th || ""}
                    onChange={(e) => updatePersonal({ passYear12th: e.target.value })}
                  >
                    <option value="">Select year</option>
                    {["2015","2016","2017","2018","2019","2020","2021","2022","2023","2024","2025"].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Marks / Percentage</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
                    placeholder="e.g. 92.4%"
                    value={formData.personal.marks12th || ""}
                    onChange={(e) => updatePersonal({ marks12th: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 10th Option & Details */}
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer p-3.5 rounded-xl border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-colors">
              <input
                type="checkbox"
                className="w-4 h-4 rounded-xs border-border text-primary focus:ring-primary focus:ring-opacity-25 shrink-0"
                checked={formData.personal.has10th || false}
                onChange={(e) => {
                  updatePersonal({
                    has10th: e.target.checked,
                    ...(!e.target.checked && { school10thName: "", marks10th: "", board10th: "", passYear10th: "" })
                  });
                }}
              />
              <span className="text-sm font-semibold text-text">Add 10th / SSLC details <span className="text-text-muted font-normal text-xs ml-1">(Optional)</span></span>
            </label>

            {formData.personal.has10th && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-primary/5 p-5 rounded-2xl border border-primary/20 mt-2">
                <div className="md:col-span-2">
                  <h4 className="text-xs font-extrabold text-primary uppercase tracking-wider">10th / SSLC Details</h4>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">School Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
                    placeholder="e.g. St. Joseph's High School"
                    value={formData.personal.school10thName || ""}
                    onChange={(e) => updatePersonal({ school10thName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Board</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
                    value={formData.personal.board10th || ""}
                    onChange={(e) => updatePersonal({ board10th: e.target.value })}
                  >
                    <option value="">Select board</option>
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="State Board">State Board</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Passing Year</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
                    value={formData.personal.passYear10th || ""}
                    onChange={(e) => updatePersonal({ passYear10th: e.target.value })}
                  >
                    <option value="">Select year</option>
                    {["2013","2014","2015","2016","2017","2018","2019","2020","2021","2022","2023"].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Marks / Percentage</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
                    placeholder="e.g. 88.6%"
                    value={formData.personal.marks10th || ""}
                    onChange={(e) => updatePersonal({ marks10th: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );


  // Step 2: Skills Form
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-4 text-left">
        <h2 className="text-xl font-bold font-sans">Core Skill Sets</h2>
        <p className="text-sm text-text-muted">Tap on popular items to select or type custom items and press Enter/comma.</p>
      </div>

      <div className="space-y-6">
        {(() => {
          const config = BRANCH_SKILL_CONFIGS[formData.personal.branch] || DEFAULT_BRANCH_CONFIG;
          return config.map((cat) => (
            <TagInput
              key={cat.id}
              label={cat.label}
              value={formData.skills.categories?.[cat.id] || ""}
              onChange={(val) => updateSkills({ categories: { ...(formData.skills.categories || {}), [cat.id]: val } })}
              suggestions={cat.suggestions}
              placeholder={cat.placeholder}
              error={validationErrors[`category_${cat.id}`]}
              required={cat.required}
            />
          ));
        })()}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TagInput
            label="Soft Skills (Optional)"
            value={formData.skills.softSkills}
            onChange={(val) => updateSkills({ softSkills: val })}
            suggestions={SOFT_SKILLS_SUGGESTIONS}
            placeholder="e.g. Technical Writing, Public Speaking, Leadership"
          />

          <TagInput
            label="Certifications (Optional)"
            value={formData.skills.certifications}
            onChange={(val) => updateSkills({ certifications: val })}
            suggestions={CERTIFICATIONS_SUGGESTIONS}
            placeholder="e.g. AWS Certified Cloud Practitioner, NPTEL Algorithms"
          />
        </div>
      </div>
    </div>
  );

  // Step 3: Projects Repeater Form
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans">Engineering Projects</h2>
          <p className="text-sm text-text-muted">Add up to 4 core projects. Describe what you built in plain language.</p>
        </div>
        
        <div className="flex flex-col lg:flex-row items-center lg:items-end gap-3 w-full md:w-auto">
          <div className="flex flex-col items-center sm:items-start gap-1 w-full sm:w-auto">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setFlashProjectModal(prev => ({ ...prev, isOpen: true }))}
                disabled={formData.projects.length >= 4 || formData.options.noProjects}
                className="px-4 py-2 bg-[#facc15]/10 border border-[#facc15]/40 hover:bg-[#facc15]/20 disabled:opacity-50 text-[#ca8a04] font-bold text-xs rounded-full flex items-center space-x-1.5 transition-colors cursor-pointer justify-center whitespace-nowrap"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>+ Flash Project</span>
              </button>
              
              <button
                onClick={addProject}
                disabled={formData.projects.length >= 4 || formData.options.noProjects}
                className="px-4 py-2 bg-primary/10 border border-primary/20 hover:bg-primary/25 disabled:opacity-50 text-primary font-bold text-xs rounded-full flex items-center space-x-1.5 transition-colors cursor-pointer w-full sm:w-auto justify-center whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Add Project ({formData.projects.length}/4)</span>
              </button>
            </div>
            <span className="text-[10px] font-semibold text-text-muted pl-2 mt-0.5">
              (Auto-generated from GitHub Link)
            </span>
          </div>
        </div>
      </div>

      <div className="bg-surface/30 border border-border/60 p-4 rounded-xl flex flex-col space-y-2">
        <label className={`flex items-center space-x-3 w-fit ${formData.projects.length > 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:text-primary"}`} title={formData.projects.length > 0 ? "Remove all projects to check this" : ""}>
          <input 
            type="checkbox" 
            className={`w-4 h-4 rounded-xs border-border text-primary focus:ring-primary ${formData.projects.length > 0 ? "cursor-not-allowed" : "cursor-pointer"}`}
            checked={formData.options.noProjects || false}
            onChange={(e) => updateOptions({ noProjects: e.target.checked })}
            disabled={formData.projects.length > 0}
          />
          <span className="text-sm font-bold text-text">I don't have any projects (skip this section)</span>
        </label>
        
        <p className={`text-xs font-medium ml-7 ${formData.options.noProjects ? "text-warning" : "text-text-muted"}`}>
          <strong className="text-error">Important:</strong> Since you are skipping projects, make sure to add expanded Internships, Work Experience, or extra-curriculars to ensure your resume has enough strong content!
        </p>
      </div>

      {validationErrors.projectsGlobal && !formData.options.noProjects && (
        <div className="p-4 bg-error/10 border border-error/20 text-error text-xs rounded-xl font-semibold">
          {validationErrors.projectsGlobal}
        </div>
      )}

      <div className="space-y-6">
        {formData.projects.map((proj, idx) => {
          // Dynamic classes based on priority & flash status
          let borderLeftColor = "border-l-primary";
          let labelColor = "text-primary";
          let moveUpHover = "hover:bg-primary/10 hover:text-primary";
          let moveDownHover = "hover:bg-primary/10 hover:text-primary";

          if (proj.isFlash) {
            borderLeftColor = "border-l-error";
            labelColor = "text-error";
            moveUpHover = "hover:bg-error/10 hover:text-error";
            moveDownHover = "hover:bg-error/10 hover:text-error";
          } else if (idx >= 2) {
            borderLeftColor = "border-l-warning";
            labelColor = "text-warning";
            moveUpHover = "hover:bg-warning/10 hover:text-warning";
            moveDownHover = "hover:bg-warning/10 hover:text-warning";
          }

          return (
            <div 
              key={idx} 
              id={`project-card-${idx}`}
              className={`border-t border-r border-b border-l-4 border-border/60 ${borderLeftColor} bg-surface/50 rounded-2xl p-6 space-y-4 relative shadow-sm hover:shadow-md transition-all duration-300 ${
                highlightedProjectIdx === idx 
                  ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-surface scale-[1.015] shadow-lg z-10 duration-500" 
                  : "hover:scale-[1.002]"
              }`}
            >
              <div className="flex justify-between items-center pb-2 border-b border-border/30">
                <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                  <span className={`text-xs font-bold ${labelColor} tracking-wider uppercase`}>
                    Priority {idx + 1} ({idx < 2 ? "3 points" : "2 points"})
                  </span>
                  


                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleMoveProjectUp(idx)}
                      disabled={idx === 0}
                      className={`p-1 rounded bg-surface ${moveUpHover} disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-text-muted`}
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveProjectDown(idx)}
                      disabled={idx === formData.projects.length - 1}
                      className={`p-1 rounded bg-surface ${moveDownHover} disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-text-muted`}
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleSendToDraft(idx)}
                  className="text-text-muted hover:text-primary transition-colors p-1"
                  title="Send to Draft"
                >
                  <Archive className="w-4.5 h-4.5" />
                </button>
                <button
                  onClick={() => removeProject(idx)}
                  className="text-text-muted hover:text-error transition-colors p-1"
                  title="Remove Project"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1">Project Title *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface focus:ring-1 focus:ring-primary focus:border-transparent outline-hidden text-xs font-semibold"
                  placeholder="e.g. AI Interview Prep Platform"
                  value={proj.title}
                  onChange={(e) => updateProject(idx, { title: e.target.value })}
                />
                {validationErrors[`proj_${idx}_title`] && (
                  <p className="text-[10px] text-error mt-0.5 font-bold">{validationErrors[`proj_${idx}_title`]}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Technologies Used *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface focus:ring-1 focus:ring-primary focus:border-transparent outline-hidden text-xs font-semibold"
                  placeholder="e.g. Next.js, OpenAI API, Tailwind CSS, PostgreSQL"
                  value={proj.techStack}
                  onChange={(e) => updateProject(idx, { techStack: e.target.value })}
                />
                {validationErrors[`proj_${idx}_tech`] && (
                  <p className="text-[10px] text-error mt-0.5 font-bold">{validationErrors[`proj_${idx}_tech`]}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">GitHub Repo Link <span className="font-normal text-muted">(Optional)</span></label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface focus:ring-1 focus:ring-primary focus:border-transparent outline-hidden text-xs font-semibold"
                  placeholder="e.g. github.com/username/project"
                  value={proj.githubLink ?? proj.link}
                  onChange={(e) => updateProject(idx, { githubLink: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Live Demo Link <span className="font-normal text-muted">(Optional)</span></label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface focus:ring-1 focus:ring-primary focus:border-transparent outline-hidden text-xs font-semibold"
                  placeholder="e.g. myapp.vercel.app"
                  value={proj.liveLink ?? ""}
                  onChange={(e) => updateProject(idx, { liveLink: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Duration (Optional)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface focus:ring-1 focus:ring-primary focus:border-transparent outline-hidden text-xs font-semibold"
                  placeholder="e.g. Jan 2025 – Mar 2025"
                  value={proj.duration}
                  onChange={(e) => updateProject(idx, { duration: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold mb-1">What did you build? *</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface focus:ring-1 focus:ring-primary focus:border-transparent outline-hidden text-xs font-semibold resize-y"
                  placeholder="Explain what the project is and why you built it. Keep it plain and honest."
                  value={proj.description}
                  onChange={(e) => updateProject(idx, { description: e.target.value })}
                />
                <div className="flex justify-between mt-0.5">
                  {validationErrors[`proj_${idx}_desc`] ? (
                    <p className="text-[10px] text-error font-bold">{validationErrors[`proj_${idx}_desc`]}</p>
                  ) : (
                    <div />
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold mb-1">Key Feature or Result *</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface focus:ring-1 focus:ring-primary focus:border-transparent outline-hidden text-xs font-semibold resize-y"
                  placeholder="What was the most interesting technical highlight, feature, or result? (e.g. parsed 500 resumes/sec, integrated LLM with zero latency)"
                  value={proj.keyResult}
                  onChange={(e) => updateProject(idx, { keyResult: e.target.value })}
                />
                <div className="flex justify-between mt-0.5">
                  {validationErrors[`proj_${idx}_result`] ? (
                    <p className="text-[10px] text-error font-bold">{validationErrors[`proj_${idx}_result`]}</p>
                  ) : (
                    <div />
                  )}
                </div>
              </div>
            </div>
          </div>
          );
        })}

        {!formData.options.noProjects && formData.projects.length === 0 && (
          <div className="text-center py-10 border border-dashed border-border rounded-2xl bg-surface/30">
            <Sparkles className="w-8 h-8 text-primary/40 mx-auto mb-3" />
            <p className="text-sm font-semibold text-text-muted mb-2">No projects added yet.</p>
            <button
              onClick={addProject}
              className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-semibold rounded-full inline-flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Project</span>
            </button>
          </div>
        )}

        {formData.options.noProjects && (
          <div className="text-center py-10 border border-border rounded-2xl bg-surface/30">
            <p className="text-sm font-semibold text-text-muted">You have opted to continue without adding projects.</p>
          </div>
        )}
      </div>

      {/* Desktop-only Floating Draft Shelf Semi-circle Trigger */}
      <div 
        onClick={() => setIsDraftOpen(true)}
        className="hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-primary hover:bg-primary/95 text-white rounded-l-full py-4 pl-3 pr-2 shadow-xl flex-col items-center cursor-pointer select-none transition-all hover:pr-3 duration-200 group border-y border-l border-primary/20"
      >
        <Archive className="w-4 h-4 mb-2 group-hover:scale-110 transition-transform" />
        <span className="text-[9px] font-bold tracking-widest uppercase flex flex-col items-center gap-0.5 select-none leading-none mb-1">
          <span>D</span>
          <span>R</span>
          <span>A</span>
          <span>F</span>
          <span>T</span>
        </span>
        <span className="bg-white text-primary text-[10px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs mt-1">
          {draftedProjects.length}
        </span>
      </div>

      {/* Desktop-only Sliding Draft Drawer/Sidebar */}
      {isDraftOpen && (
        <div 
          onClick={() => setIsDraftOpen(false)}
          className="hidden lg:block fixed inset-0 bg-text/25 backdrop-blur-xs z-50 transition-opacity duration-300"
        />
      )}
      <div 
        className={`hidden lg:flex fixed top-0 right-0 h-full w-[320px] bg-surface border-l border-border shadow-2xl z-50 flex-col transition-transform duration-300 ${
          isDraftOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-border flex justify-between items-center bg-surface/30">
          <div className="flex items-center space-x-2">
            <Archive className="w-4.5 h-4.5 text-primary" />
            <h3 className="text-sm font-bold text-text">Drafted Projects</h3>
          </div>
          <button 
            onClick={() => setIsDraftOpen(false)}
            className="p-1 rounded-full hover:bg-border/30 text-text-muted hover:text-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body - List of drafts */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {draftedProjects.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <Archive className="w-8 h-8 text-text-muted/30 mx-auto" />
              <p className="text-xs font-semibold text-text-muted">No drafted projects.</p>
              <p className="text-[10px] text-text-muted leading-relaxed">
                Send projects to the draft shelf to store them safely for later.
              </p>
            </div>
          ) : (
            draftedProjects.map((draftProj, draftIdx) => (
              <div 
                key={draftIdx} 
                className="p-4 rounded-xl border border-border/80 bg-surface/10 space-y-3 hover:border-primary/30 transition-colors"
              >
                <div>
                  <h4 className="text-xs font-bold text-text truncate">
                    {draftProj.title || `Untitled Project`}
                  </h4>
                  {draftProj.techStack && (
                    <p className="text-[10px] text-primary/80 font-medium truncate mt-0.5">
                      {draftProj.techStack}
                    </p>
                  )}
                </div>

                <div className="flex justify-end items-center gap-2 pt-2 border-t border-border/30">
                  <button
                    onClick={() => handleDeleteFromDraft(draftIdx)}
                    className="px-2.5 py-1 text-[10px] font-semibold text-text-muted hover:text-error hover:bg-error/5 rounded-md transition-colors"
                    title="Delete permanently"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleRestoreFromDraft(draftIdx)}
                    disabled={formData.projects.length >= 4 || formData.options.noProjects}
                    className="px-3 py-1 bg-primary/10 border border-primary/20 hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed text-primary text-[10px] font-bold rounded-md transition-colors flex items-center gap-1"
                    title={formData.projects.length >= 4 ? "Active limit (4) reached" : "Restore to active list"}
                  >
                    <Plus className="w-3 h-3" />
                    Restore
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer info */}
        <div className="p-4 border-t border-border bg-surface/30 text-center">
          <p className="text-[9px] text-text-muted font-medium">
            Active limit: {formData.projects.length}/4 projects active
          </p>
        </div>
      </div>
    </div>
  );

  // Step 4: Internships & POR Form
  const renderStep4 = () => (
    <div className="space-y-8">
      {/* Internships Header */}
      <div className="space-y-6">
        <div className="border-b border-border/60 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-xl font-bold font-sans">Work Experience / Internships (Optional)</h2>
            <p className="text-sm text-text-muted">Add up to 3 technical internships. Skip if you don&apos;t have any.</p>
          </div>
          <button
            onClick={addInternship}
            disabled={formData.internships.length >= 3}
            className="px-4 py-2 bg-primary/10 border border-primary/20 hover:bg-primary/25 disabled:opacity-50 text-primary font-bold text-xs rounded-full flex items-center space-x-1.5 transition-colors cursor-pointer w-full md:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Add Internship ({formData.internships.length}/3)</span>
          </button>
        </div>

        <div className="space-y-6">
          {formData.internships.map((intern, idx) => (
            <div key={idx} className="border border-border bg-surface/50 rounded-2xl p-6 space-y-4 relative">
              <div className="flex justify-between items-center pb-2 border-b border-border/30">
                <span className="text-xs font-bold text-primary tracking-wider uppercase">Internship #{idx + 1}</span>
                <button
                  onClick={() => removeInternship(idx)}
                  className="text-text-muted hover:text-error transition-colors p-1"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Company Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface focus:ring-1 focus:ring-primary focus:border-transparent outline-hidden text-xs font-semibold"
                    placeholder="e.g. Cisco, Local Startup"
                    value={intern.company}
                    onChange={(e) => updateInternship(idx, { company: e.target.value })}
                  />
                  {validationErrors[`intern_${idx}_company`] && (
                    <p className="text-[10px] text-error mt-0.5 font-bold">{validationErrors[`intern_${idx}_company`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Position / Role *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface focus:ring-1 focus:ring-primary focus:border-transparent outline-hidden text-xs font-semibold"
                    placeholder="e.g. SDE Intern, Frontend Intern"
                    value={intern.role}
                    onChange={(e) => updateInternship(idx, { role: e.target.value })}
                  />
                  {validationErrors[`intern_${idx}_role`] && (
                    <p className="text-[10px] text-error mt-0.5 font-bold">{validationErrors[`intern_${idx}_role`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Duration * (e.g. Month Year)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface focus:ring-1 focus:ring-primary focus:border-transparent outline-hidden text-xs font-semibold"
                    placeholder="e.g. May 2025 – Jul 2025"
                    value={intern.duration}
                    onChange={(e) => updateInternship(idx, { duration: e.target.value })}
                  />
                  {validationErrors[`intern_${idx}_dur`] && (
                    <p className="text-[10px] text-error mt-0.5 font-bold">{validationErrors[`intern_${idx}_dur`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Technologies/Tools Used</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface focus:ring-1 focus:ring-primary focus:border-transparent outline-hidden text-xs font-semibold"
                    placeholder="e.g. AWS, Git, React, Docker"
                    value={intern.techUsed}
                    onChange={(e) => updateInternship(idx, { techUsed: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold mb-1">What did you work on? * (Max 200 chars)</label>
                  <textarea
                    rows={2}
                    maxLength={200}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface focus:ring-1 focus:ring-primary focus:border-transparent outline-hidden text-xs font-semibold resize-none"
                    placeholder="State the core task you accomplished. Plain language is perfect, we will polish it."
                    value={intern.workDone}
                    onChange={(e) => updateInternship(idx, { workDone: e.target.value })}
                  />
                  <div className="flex justify-between mt-0.5">
                    {validationErrors[`intern_${idx}_work`] ? (
                      <p className="text-[10px] text-error font-bold">{validationErrors[`intern_${idx}_work`]}</p>
                    ) : (
                      <div />
                    )}
                    <span className="text-[10px] text-text-muted font-bold">{intern.workDone.length}/200</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Positions of Responsibility Header */}
      <div className="space-y-6 border-t border-border/40 pt-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-xl font-bold font-sans">Positions of Responsibility (Optional)</h2>
            <p className="text-sm text-text-muted">Club roles, leadership in university chapters (max 2).</p>
          </div>
          <button
            onClick={addPosition}
            disabled={formData.positions.length >= 2}
            className="px-4 py-2 bg-primary/10 border border-primary/20 hover:bg-primary/25 disabled:opacity-50 text-primary font-bold text-xs rounded-full flex items-center space-x-1.5 transition-colors cursor-pointer w-full md:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Add POR ({formData.positions.length}/2)</span>
          </button>
        </div>

        <div className="space-y-6">
          {formData.positions.map((pos, idx) => (
            <div key={idx} className="border border-border bg-surface/50 rounded-2xl p-6 space-y-4 relative">
              <div className="flex justify-between items-center pb-2 border-b border-border/30">
                <span className="text-xs font-bold text-primary tracking-wider uppercase">POR #{idx + 1}</span>
                <button
                  onClick={() => removePosition(idx)}
                  className="text-text-muted hover:text-error transition-colors p-1"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">POR Role / Title *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface focus:ring-1 focus:ring-primary focus:border-transparent outline-hidden text-xs font-semibold"
                    placeholder="e.g. Technical Head, Chapter Chair"
                    value={pos.title}
                    onChange={(e) => updatePosition(idx, { title: e.target.value })}
                  />
                  {validationErrors[`pos_${idx}_title`] && (
                    <p className="text-[10px] text-error mt-0.5 font-bold">{validationErrors[`pos_${idx}_title`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Club / Organization Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface focus:ring-1 focus:ring-primary focus:border-transparent outline-hidden text-xs font-semibold"
                    placeholder="e.g. IEEE Student Chapter, CodeChef Club"
                    value={pos.organization}
                    onChange={(e) => updatePosition(idx, { organization: e.target.value })}
                  />
                  {validationErrors[`pos_${idx}_org`] && (
                    <p className="text-[10px] text-error mt-0.5 font-bold">{validationErrors[`pos_${idx}_org`]}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold mb-1">1-Line Contribution * (Max 150 chars)</label>
                  <input
                    type="text"
                    maxLength={150}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface focus:ring-1 focus:ring-primary focus:border-transparent outline-hidden text-xs font-semibold"
                    placeholder="e.g. Orchestrated a national-level hackathon attracting 500+ participants and managed technical portal."
                    value={pos.description}
                    onChange={(e) => updatePosition(idx, { description: e.target.value })}
                  />
                  {validationErrors[`pos_${idx}_desc`] && (
                    <p className="text-[10px] text-error mt-0.5 font-bold">{validationErrors[`pos_${idx}_desc`]}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements Section */}
      <div className="space-y-6 border-t border-border/40 pt-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-xl font-bold font-sans">Achievements (Optional)</h2>
            <p className="text-sm text-text-muted">Feature competitive coding ranks, hackathons, or academic awards.</p>
          </div>
          <button
            onClick={addAchievement}
            disabled={formData.achievements.length >= 4}
            className="px-4 py-2 bg-primary/10 border border-primary/20 hover:bg-primary/25 disabled:opacity-50 text-primary font-bold text-xs rounded-full flex items-center space-x-1.5 transition-colors cursor-pointer w-full md:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Add Achievement ({formData.achievements.length}/4)</span>
          </button>
        </div>

        <div className="space-y-6">
          {formData.achievements.map((achieve, idx) => (
            <div key={idx} className="border border-border bg-surface/50 rounded-2xl p-6 space-y-4 relative">
              <div className="flex justify-between items-center pb-2 border-b border-border/30">
                <span className="text-xs font-bold text-primary tracking-wider uppercase">Achievement #{idx + 1}</span>
                <button
                  onClick={() => removeAchievement(idx)}
                  className="text-text-muted hover:text-error transition-colors p-1"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Title / Award Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface focus:ring-1 focus:ring-primary focus:border-transparent outline-hidden text-xs font-semibold"
                    placeholder="e.g. 1st Place - Smart India Hackathon"
                    value={achieve.title}
                    onChange={(e) => updateAchievement(idx, { title: e.target.value })}
                  />
                  {validationErrors[`achieve_${idx}_title`] && (
                    <p className="text-[10px] text-error mt-0.5 font-bold">{validationErrors[`achieve_${idx}_title`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Details / Description * (Max 200 chars)</label>
                  <textarea
                    rows={2}
                    maxLength={200}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface focus:ring-1 focus:ring-primary focus:border-transparent outline-hidden text-xs font-semibold resize-none"
                    placeholder="e.g. Led a team of 4 to build an AI-based recruitment portal. Selected from 10,000+ teams."
                    value={achieve.description}
                    onChange={(e) => updateAchievement(idx, { description: e.target.value })}
                  />
                  <div className="flex justify-between mt-0.5">
                    {validationErrors[`achieve_${idx}_desc`] ? (
                      <p className="text-[10px] text-error font-bold">{validationErrors[`achieve_${idx}_desc`]}</p>
                    ) : (
                      <div />
                    )}
                    <span className="text-[10px] text-text-muted font-bold">{achieve.description.length}/200</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 5: Final Options Form
  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-4">
        <h2 className="text-xl font-bold font-sans">ATS &amp; Keyword Optimizations</h2>
        <p className="text-sm text-text-muted">Specify details to align the resume bullets exactly with your target job description.</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2">Paste Job Description (Optional — for keyword matching)</label>
          <textarea
            rows={8}
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm leading-relaxed"
            placeholder="Copy and paste the qualifications, skills, and details from the job advertisement here..."
            value={formData.options.jobDescription}
            onChange={(e) => updateOptions({ jobDescription: e.target.value })}
          />
          {formData.options.noProjects && (
            <p className="text-xs text-text-muted mt-2 font-medium">
              Note: Since you have no projects, the job description will only be used to optimize your skills and summary.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Resume Bullet Tone</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Professional & Formal", desc: "Classic action verbs, measured vocabulary, recruiter standard" },
              { title: "Modern & Concise", desc: "Short, punchy sentences, metric-forward explanations" },
              { title: "Technical & Detailed", desc: "Deep technology focus, tool-stack indexable details" }
            ].map((toneOpt, idx) => (
              <label
                key={idx}
                className={`border p-4 rounded-xl flex flex-col cursor-pointer transition-all ${
                  formData.options.tone === toneOpt.title
                    ? "border-primary bg-primary/5 shadow-xs"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <input
                    type="radio"
                    name="tone"
                    className="accent-primary"
                    checked={formData.options.tone === toneOpt.title}
                    onChange={() => updateOptions({ tone: toneOpt.title as any })}
                  />
                  <span className="font-bold text-sm">{toneOpt.title}</span>
                </div>
                <span className="text-xs text-text-muted leading-relaxed font-medium">{toneOpt.desc}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Step 6: Template & Photo Options
  const renderStep6 = () => {
    const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);

    const processPhotoFile = (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file (JPG, PNG, WEBP)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Photo size must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateOptions({
          hasPhoto: true,
          photoUrl: reader.result as string,
          templateId: (formData.options.templateId === "photo_executive" || formData.options.templateId === "photo_modern") 
            ? formData.options.templateId 
            : "photo_modern"
        });
      };
      reader.readAsDataURL(file);
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processPhotoFile(file);
    };

    const handlePhotoDrop = (e: React.DragEvent<HTMLLabelElement | HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingPhoto(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processPhotoFile(file);
    };

    const handlePhotoDragOver = (e: React.DragEvent<HTMLLabelElement | HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDraggingPhoto) setIsDraggingPhoto(true);
    };

    const handlePhotoDragLeave = (e: React.DragEvent<HTMLLabelElement | HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingPhoto(false);
    };

    const templatesList = [
      {
        id: "modern",
        name: "Professional",
        tag: "Two-Column ATS",
        desc: "A touch of personality with a well-organized resume structure.",
        supportsPhoto: false,
        preview: (
          <div className="w-full aspect-[1/1.38] bg-white text-zinc-800 rounded-lg p-3 shadow-sm border border-zinc-200 flex gap-2.5 overflow-hidden select-none relative">
            {/* Left dark sidebar */}
            <div className="w-1/3 bg-[#01696f] text-white p-2 flex flex-col space-y-1.5 rounded-xs shrink-0">
              <div className="w-6 h-6 rounded-full bg-white/20 border border-white/40 flex items-center justify-center self-center my-0.5">
                <User className="w-3 h-3 text-white" />
              </div>
              <div className="w-3/4 h-1 bg-white/80 rounded-xs self-center" />
              <div className="w-full h-[0.5px] bg-white/30 my-0.5" />
              <div className="w-1/2 h-1 bg-white/60 rounded-xs" />
              <div className="space-y-1">
                <div className="w-full h-0.5 bg-white/40 rounded-xs" />
                <div className="w-4/5 h-0.5 bg-white/40 rounded-xs" />
                <div className="w-3/4 h-0.5 bg-white/40 rounded-xs" />
              </div>
              <div className="w-1/2 h-1 bg-white/60 rounded-xs mt-1" />
              <div className="space-y-1">
                <div className="w-full h-0.5 bg-white/40 rounded-xs" />
                <div className="w-4/5 h-0.5 bg-white/40 rounded-xs" />
              </div>
            </div>
            {/* Right content */}
            <div className="flex-1 flex flex-col space-y-1.5 pt-0.5 min-w-0">
              <div className="w-2/3 h-2 bg-zinc-800 rounded-xs" />
              <div className="w-full h-[0.5px] bg-zinc-200" />
              <div className="w-1/3 h-1.5 bg-[#01696f] rounded-xs" />
              <div className="space-y-1">
                <div className="w-full h-0.5 bg-zinc-300 rounded-xs" />
                <div className="w-full h-0.5 bg-zinc-300 rounded-xs" />
                <div className="w-11/12 h-0.5 bg-zinc-300 rounded-xs" />
              </div>
              <div className="w-1/3 h-1.5 bg-[#01696f] rounded-xs mt-1" />
              <div className="space-y-1">
                <div className="w-full h-0.5 bg-zinc-300 rounded-xs" />
                <div className="w-4/5 h-0.5 bg-zinc-300 rounded-xs" />
              </div>
            </div>
            <div className="absolute bottom-1.5 right-1.5 flex gap-0.5">
              <span className="px-1.5 py-0.5 text-[7px] font-bold bg-zinc-100 text-zinc-500 rounded-2xs border border-zinc-200">PDF</span>
              <span className="px-1.5 py-0.5 text-[7px] font-bold bg-zinc-100 text-zinc-500 rounded-2xs border border-zinc-200">DOCX</span>
            </div>
          </div>
        )
      },
      {
        id: "classic",
        name: "Corporate",
        tag: "Classic Serif",
        desc: "Professional and elegant resume template with clean timeline structure.",
        supportsPhoto: false,
        preview: (
          <div className="w-full aspect-[1/1.38] bg-white text-zinc-800 rounded-lg p-3 shadow-sm border border-zinc-200 flex flex-col items-center space-y-1.5 overflow-hidden select-none relative">
            <div className="w-6 h-6 rounded-full bg-zinc-100 border border-zinc-300 flex items-center justify-center mb-0.5">
              <User className="w-3 h-3 text-zinc-600" />
            </div>
            <div className="w-1/2 h-2.5 bg-zinc-800 rounded-xs text-center" />
            <div className="w-3/4 h-1 bg-zinc-400 rounded-xs" />
            <div className="w-full h-[0.5px] bg-zinc-700 my-0.5" />
            <div className="w-full space-y-1 text-left">
              <div className="w-1/4 h-1.5 bg-zinc-700 rounded-xs" />
              <div className="w-full h-0.5 bg-zinc-300 rounded-xs" />
              <div className="w-full h-0.5 bg-zinc-300 rounded-xs" />
              <div className="w-5/6 h-0.5 bg-zinc-300 rounded-xs" />
            </div>
            <div className="w-full space-y-1 text-left mt-1">
              <div className="w-1/4 h-1.5 bg-zinc-700 rounded-xs" />
              <div className="w-full h-0.5 bg-zinc-300 rounded-xs" />
              <div className="w-4/5 h-0.5 bg-zinc-300 rounded-xs" />
            </div>
            <div className="absolute bottom-1.5 right-1.5 flex gap-0.5">
              <span className="px-1.5 py-0.5 text-[7px] font-bold bg-zinc-100 text-zinc-500 rounded-2xs border border-zinc-200">PDF</span>
              <span className="px-1.5 py-0.5 text-[7px] font-bold bg-zinc-100 text-zinc-500 rounded-2xs border border-zinc-200">DOCX</span>
            </div>
          </div>
        )
      },
      {
        id: "minimal",
        name: "Clear",
        tag: "Header Banner",
        desc: "Striking modern header, professional two column template structure.",
        supportsPhoto: false,
        preview: (
          <div className="w-full aspect-[1/1.38] bg-white text-zinc-800 rounded-lg p-0 shadow-sm border border-zinc-200 flex flex-col overflow-hidden select-none relative">
            <div className="w-full bg-[#10b981] text-white p-2.5 flex items-center space-x-2 shrink-0">
              <div className="w-5 h-5 rounded-full bg-white/30 border border-white flex items-center justify-center shrink-0">
                <User className="w-3 h-3 text-white" />
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="w-3/4 h-2 bg-white rounded-xs" />
                <div className="w-1/2 h-1 bg-white/70 rounded-xs" />
              </div>
            </div>
            <div className="p-2.5 flex gap-2.5 flex-1">
              <div className="w-1/3 border-r border-zinc-200 pr-2 space-y-1">
                <div className="w-2/3 h-1.5 bg-emerald-600 rounded-xs" />
                <div className="w-full h-0.5 bg-zinc-300 rounded-xs" />
                <div className="w-4/5 h-0.5 bg-zinc-300 rounded-xs" />
                <div className="w-2/3 h-1.5 bg-emerald-600 rounded-xs mt-2" />
                <div className="w-full h-0.5 bg-zinc-300 rounded-xs" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="w-1/2 h-1.5 bg-emerald-600 rounded-xs" />
                <div className="w-full h-0.5 bg-zinc-300 rounded-xs" />
                <div className="w-full h-0.5 bg-zinc-300 rounded-xs" />
                <div className="w-11/12 h-0.5 bg-zinc-300 rounded-xs" />
              </div>
            </div>
            <div className="absolute bottom-1.5 right-1.5 flex gap-0.5">
              <span className="px-1.5 py-0.5 text-[7px] font-bold bg-zinc-100 text-zinc-500 rounded-2xs border border-zinc-200">PDF</span>
              <span className="px-1.5 py-0.5 text-[7px] font-bold bg-zinc-100 text-zinc-500 rounded-2xs border border-zinc-200">DOCX</span>
            </div>
          </div>
        )
      },
      {
        id: "photo_modern",
        name: "Balanced",
        tag: "Contrasting Sidebar",
        desc: "Modern and eye-catching resume template. Beautiful contrasting structure.",
        supportsPhoto: true,
        preview: (
          <div className="w-full aspect-[1/1.38] bg-white text-zinc-800 rounded-lg p-2.5 shadow-sm border border-zinc-200 flex gap-2.5 overflow-hidden select-none relative">
            <div className="flex-1 space-y-1.5 pt-0.5">
              <div className="flex items-center space-x-1.5">
                <div className="w-5 h-5 rounded-full bg-zinc-100 border border-zinc-300 flex items-center justify-center shrink-0">
                  <User className="w-3 h-3 text-zinc-600" />
                </div>
                <div className="w-2/3 h-2 bg-zinc-800 rounded-xs" />
              </div>
              <div className="w-full h-[0.5px] bg-zinc-200" />
              <div className="w-1/2 h-1.5 bg-zinc-700 rounded-xs" />
              <div className="space-y-1">
                <div className="w-full h-0.5 bg-zinc-300 rounded-xs" />
                <div className="w-full h-0.5 bg-zinc-300 rounded-xs" />
                <div className="w-4/5 h-0.5 bg-zinc-300 rounded-xs" />
              </div>
            </div>
            <div className="w-1/3 bg-[#1e3a8a] text-white p-2 rounded-xs space-y-1.5 shrink-0">
              <div className="w-full h-1 bg-white/80 rounded-xs" />
              <div className="w-full h-0.5 bg-white/40 rounded-xs" />
              <div className="w-4/5 h-0.5 bg-white/40 rounded-xs" />
              <div className="w-full h-1 bg-white/80 rounded-xs mt-2" />
              <div className="w-full h-0.5 bg-white/40 rounded-xs" />
            </div>
            <div className="absolute bottom-1.5 right-1.5 flex gap-0.5">
              <span className="px-1.5 py-0.5 text-[7px] font-bold bg-zinc-100 text-zinc-500 rounded-2xs border border-zinc-200">PDF</span>
              <span className="px-1.5 py-0.5 text-[7px] font-bold bg-zinc-100 text-zinc-500 rounded-2xs border border-zinc-200">DOCX</span>
            </div>
          </div>
        )
      },
      {
        id: "photo_executive",
        name: "Essential",
        tag: "Fresh Balance",
        desc: "Perfect balance of fresh and functional resume template design.",
        supportsPhoto: true,
        preview: (
          <div className="w-full aspect-[1/1.38] bg-white text-zinc-800 rounded-lg p-3 shadow-sm border border-zinc-200 flex flex-col space-y-1.5 overflow-hidden select-none relative">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-md bg-amber-500/20 border border-amber-600 flex items-center justify-center shrink-0">
                <User className="w-3 h-3 text-amber-700" />
              </div>
              <div className="space-y-0.5">
                <div className="w-20 h-2 bg-zinc-800 rounded-xs" />
                <div className="w-12 h-1 bg-amber-600 rounded-xs" />
              </div>
            </div>
            <div className="w-full h-[0.5px] bg-zinc-200" />
            <div className="flex gap-2">
              <div className="w-1/3 space-y-1">
                <div className="w-full h-1 bg-zinc-700 rounded-xs" />
                <div className="w-full h-0.5 bg-zinc-300 rounded-xs" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="w-full h-1 bg-zinc-700 rounded-xs" />
                <div className="w-full h-0.5 bg-zinc-300 rounded-xs" />
              </div>
            </div>
            <div className="absolute bottom-1.5 right-1.5 flex gap-0.5">
              <span className="px-1.5 py-0.5 text-[7px] font-bold bg-zinc-100 text-zinc-500 rounded-2xs border border-zinc-200">PDF</span>
              <span className="px-1.5 py-0.5 text-[7px] font-bold bg-zinc-100 text-zinc-500 rounded-2xs border border-zinc-200">DOCX</span>
            </div>
          </div>
        )
      },
    ];

    const isPhotoTemplate = formData.options.hasPhoto;
    const filterTab = isPhotoTemplate ? "photo" : "plain";

    const filteredTemplates = templatesList.filter(t => filterTab === "photo" ? t.supportsPhoto : !t.supportsPhoto);

    return (
      <div className="space-y-8">
        <div className="border-b border-border/60 pb-4">
          <h2 className="text-xl font-bold font-sans">Template &amp; Output Customization</h2>
          <p className="text-sm text-text-muted">Choose your template style, photo preferences, and variation count.</p>
        </div>

        {/* ── TOP 2-COLUMN SECTION: CATEGORY & PROJECT VARIATIONS SIDE BY SIDE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left Column Card: Template Category */}
          <div className="bg-surface p-5 rounded-2xl border border-border/80 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="h-4 w-1 rounded-full bg-primary" />
                <h3 className="text-xs font-extrabold text-text uppercase tracking-wider">1. Template Format</h3>
              </div>

              {/* Segmented Switcher */}
              <div className="grid grid-cols-2 p-1 bg-bg-base/80 border border-border/60 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => {
                    updateOptions({
                      hasPhoto: false,
                      templateId: "modern"
                    });
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    filterTab === "plain"
                      ? "bg-primary text-white shadow-xs"
                      : "text-text-muted hover:text-text hover:bg-surface/60"
                  }`}
                >
                  <span>Standard ATS (No Photo)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    updateOptions({
                      hasPhoto: true,
                      templateId: "photo_modern"
                    });
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    filterTab === "photo"
                      ? "bg-primary text-white shadow-xs"
                      : "text-text-muted hover:text-text hover:bg-surface/60"
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 shrink-0" />
                  <span>With Profile Photo</span>
                </button>
              </div>
            </div>

            {/* Photo Upload Panel (embedded cleanly inside Left Card with full Drag & Drop support) */}
            {filterTab === "photo" ? (
              <label
                onDragOver={handlePhotoDragOver}
                onDragLeave={handlePhotoDragLeave}
                onDrop={handlePhotoDrop}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  isDraggingPhoto
                    ? "bg-primary/10 border-2 border-dashed border-primary ring-2 ring-primary/20 scale-[1.01]"
                    : "bg-primary/5 border border-primary/20 hover:border-primary/40"
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  {formData.options.photoUrl ? (
                    <div className="relative shrink-0">
                      <img
                        src={formData.options.photoUrl}
                        alt="Profile preview"
                        className="w-10 h-10 rounded-lg object-cover border-2 border-primary shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateOptions({ photoUrl: "" });
                        }}
                        className="absolute -top-1 -right-1 bg-error text-white p-0.5 rounded-full shadow-xs hover:scale-110 transition-transform cursor-pointer"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg border border-dashed border-primary/40 bg-surface flex items-center justify-center shrink-0">
                      <Camera className="w-4 h-4 text-primary/50" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-primary block truncate">
                      {isDraggingPhoto ? "Drop Image Here..." : "Drag & Drop Headshot"}
                    </span>
                    <span className="text-[10px] text-text-muted block truncate">
                      {isDraggingPhoto ? "Release to upload" : "or click to browse image (Max 5MB)"}
                    </span>
                  </div>
                </div>

                <div className="px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-lg transition-all shadow-2xs shrink-0 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{formData.options.photoUrl ? "Change" : "Browse"}</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </div>
              </label>
            ) : (
              <p className="text-[11px] text-text-muted leading-relaxed px-0.5">
                Standard single/two-column ATS layout optimized for recruiter scanning without photo overhead.
              </p>
            )}
          </div>

          {/* Right Column Card: Project Bullet Variations */}
          <div className="bg-surface p-5 rounded-2xl border border-border/80 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="h-4 w-1 rounded-full bg-primary" />
                <h3 className="text-xs font-extrabold text-text uppercase tracking-wider">2. Project Bullet Variations</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { label: "1 Standard Version", val: "1 version", sub: "All roles" },
                  { label: "3 Tailored Versions (₹99)", val: "3 versions", sub: "Role specific" }
                ].map((opt, idx) => {
                  const isChecked = formData.options.projectVariants === opt.val;
                  return (
                    <label
                      key={idx}
                      className={`flex items-center space-x-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? "border-primary bg-primary/5 text-primary font-bold shadow-2xs"
                          : "border-border/60 hover:border-primary/40 text-text-muted bg-bg-base/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="variants"
                        className="accent-primary w-4 h-4 shrink-0"
                        checked={isChecked}
                        onChange={() => updateOptions({ projectVariants: opt.val as any })}
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold block truncate">{opt.label}</span>
                        <span className="text-[10px] opacity-75 font-normal block truncate">{opt.sub}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {formData.options.projectVariants === "3 versions" ? (
              <div className="space-y-2 pt-2 border-t border-border/40">
                <label className="block text-xs font-bold text-primary">Specify 3 target roles to tailor for:</label>
                {(() => {
                  const branch = formData.personal.branch;
                  const suggestions: Record<string, string[]> = {
                    "CSE": ["Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "Data Scientist", "DevOps Engineer", "Mobile App Developer", "Cloud Engineer", "Site Reliability Engineer (SRE)", "Machine Learning Engineer", "Security Engineer", "QA Engineer", "Database Administrator", "Product Manager", "Business Analyst", "UX/UI Designer"],
                    "IT": ["Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "Data Scientist", "DevOps Engineer", "Cloud Engineer", "Network Engineer", "IT Consultant", "Systems Analyst", "Database Administrator", "Information Security Analyst", "Cloud Architect", "QA Engineer", "Scrum Master", "Product Manager"],
                    "AI & DS": ["Data Scientist", "Machine Learning Engineer", "AI Researcher", "Data Analyst", "Data Engineer", "NLP Engineer", "Computer Vision Engineer", "MLOps Engineer", "Business Intelligence Analyst", "Big Data Engineer", "AI Product Manager", "Deep Learning Engineer", "Robotics Engineer"],
                    "Cyber Security": ["Security Analyst", "Penetration Tester", "Security Engineer", "Ethical Hacker", "Information Security Consultant", "Cyber Security Architect", "Incident Responder", "Cloud Security Engineer", "SOC Analyst", "Cryptographer", "Forensics Investigator", "Vulnerability Assessor", "IAM Engineer"],
                    "ECE": ["Embedded Software Engineer", "VLSI Design Engineer", "Hardware Engineer", "Network Engineer", "Systems Engineer", "Software Engineer", "Telecommunications Engineer", "RF Engineer", "IoT Engineer", "FPGA Engineer", "Application Engineer", "Hardware Verification Engineer", "Field Engineer", "Firmware Engineer"],
                    "EEE": ["Electrical Engineer", "Power Systems Engineer", "Control Systems Engineer", "Electronics Engineer", "Software Engineer", "Renewable Energy Engineer", "Grid Engineer", "Automation Engineer", "Instrumentation Engineer", "Test Engineer", "Project Engineer", "Robotics Engineer", "Design Engineer"],
                    "Mechanical": ["Mechanical Engineer", "Design Engineer", "Manufacturing Engineer", "Thermal Engineer", "Automotive Engineer", "HVAC Engineer", "CAD Designer", "Production Engineer", "Quality Engineer", "Supply Chain Analyst", "Robotics Engineer", "Mechatronics Engineer", "Piping Engineer", "Aerospace Engineer"],
                    "Civil": ["Civil Engineer", "Structural Engineer", "Construction Manager", "Geotechnical Engineer", "Transportation Engineer", "Environmental Engineer", "Urban Planner", "Water Resources Engineer", "Surveying Engineer", "Site Engineer", "CAD Technician", "Estimator", "BIM Engineer"],
                    "Chemical": ["Chemical Engineer", "Process Engineer", "Process Design Engineer", "Production Engineer", "R&D Engineer", "Quality Control Engineer", "Plant Engineer", "Biochemical Engineer", "Materials Engineer", "Safety Engineer", "Petrochemical Engineer", "Energy Engineer"],
                    "Biotechnology": ["Biotechnologist", "Bioinformatics Scientist", "Research Associate", "Clinical Research Associate", "Biomedical Engineer", "Bioprocess Engineer", "Geneticist", "Pharmaceutical Engineer", "Quality Assurance Specialist", "Data Analyst", "Microbiologist", "Regulatory Affairs Specialist"],
                    "Aerospace": ["Aerospace Engineer", "Aerodynamics Engineer", "Propulsion Engineer", "Avionics Engineer", "Flight Test Engineer", "Spacecraft Engineer", "Systems Engineer", "Stress Engineer", "Materials Engineer", "Aircraft Designer", "Quality Engineer", "UAV Engineer"],
                  };
                  const rolesList = suggestions[branch] || ["Software Engineer", "Data Analyst", "Product Manager", "Business Analyst", "System Analyst", "Consultant"];
                  const currentRoles = formData.options.targetRoles || ["", "", ""];

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="relative">
                          <select
                            className="w-full px-2.5 py-1.5 border border-border/50 rounded-lg bg-bg-base focus:ring-1 focus:ring-primary focus:border-transparent outline-none text-xs font-medium appearance-none pr-7 cursor-pointer"
                            value={currentRoles[i] || ""}
                            onChange={(e) => {
                              const newRoles = [...currentRoles];
                              newRoles[i] = e.target.value;
                              updateOptions({ targetRoles: newRoles });
                            }}
                          >
                            <option value="" disabled>Role {i + 1}</option>
                            {rolesList.map(role => {
                              const isDuplicate = currentRoles.includes(role) && currentRoles[i] !== role;
                              return (
                                <option key={role} value={role} disabled={isDuplicate}>
                                  {role} {isDuplicate ? "(Already Selected)" : ""}
                                </option>
                              );
                            })}
                          </select>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                            <ChevronDown className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
                {validationErrors.targetRoles && (
                  <p className="text-xs text-error font-semibold mt-1">{validationErrors.targetRoles}</p>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-text-muted leading-relaxed px-0.5">
                Generates a single high-impact set of bullet points suitable for general applications across all target companies.
              </p>
            )}
          </div>
        </div>

        {/* ── TEMPLATE SELECTION GALLERY ── */}
        <div className="border-t border-border/40 pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-5 w-1 rounded-full bg-primary" />
              <h3 className="text-sm font-extrabold text-text uppercase tracking-wider">
                3. Available {filterTab === "photo" ? "Photo" : "Plain"} Templates
              </h3>
            </div>
            <span className="text-xs text-primary font-bold hidden sm:inline">
              Selected: {templatesList.find(t => t.id === (formData.options.templateId || "modern"))?.name}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredTemplates.map((tmpl) => {
              const isSelected = (formData.options.templateId || "modern") === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => {
                    updateOptions({
                      templateId: tmpl.id,
                      hasPhoto: tmpl.supportsPhoto ? true : false
                    });
                  }}
                  className={`border rounded-2xl p-3.5 cursor-pointer transition-all relative flex flex-col justify-between space-y-3 bg-surface ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/30 shadow-md"
                      : "border-border hover:border-primary/50 hover:shadow-xs"
                  }`}
                >
                  {/* Selected check badge */}
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 bg-primary text-white p-1 rounded-full shadow-md z-10">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}

                  {/* A4 Aspect Ratio Document Preview */}
                  {tmpl.preview}

                  {/* Title & Desc directly inside card */}
                  <div className="px-0.5 space-y-0.5">
                    <h4 className={`text-sm font-bold transition-colors ${isSelected ? "text-primary" : "text-text"}`}>
                      {tmpl.name}
                    </h4>
                    <p className="text-xs text-text-muted leading-relaxed font-normal">
                      {tmpl.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-text-muted font-semibold animate-pulse">Loading workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base text-text flex flex-col font-sans">
      {isParsing && (
        <div className="fixed inset-0 z-50 bg-bg-base/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <h2 className="text-xl font-bold">Auto-filling your Resume...</h2>
          <p className="text-sm font-semibold text-text-muted mt-2">Extracting details using AI. This will just take a moment.</p>
        </div>
      )}
      {/* Header */}
      <header className="sticky top-0 z-40 glass-panel border-b border-border/40 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-surface/90 shadow-2xs">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center justify-center">
            <img src="/logo.png" alt="ATSLift Logo" className="w-8 h-8 rounded-md object-contain logo-rotated" />
          </Link>
          <span className="font-bold text-lg tracking-tight text-text">
            ATS<span className="text-primary font-medium font-serif italic">Lift</span>
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => {
                if (window.confirm("Are you sure you want to reset the form? This will clear all your data.")) {
                  resetForm();
                  goToStep(1);
                }
              }}
              className="relative text-sm text-error transition-all duration-300 ease-in-out font-bold cursor-pointer px-5 py-2.5 rounded-[14px] border border-error/20 flex items-center space-x-2 hover:bg-error/10 hover:-translate-y-0.5"
              title="Reset Form"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="tracking-wide">Reset</span>
            </button>

            <label className={`relative text-sm text-white transition-all duration-300 ease-in-out font-bold cursor-pointer px-6 py-2.5 rounded-[14px] flex items-center space-x-2 shadow-[0_2px_10px_rgba(1,105,111,0.2)] hover:shadow-[0_6px_20px_rgba(1,105,111,0.3)] hover:-translate-y-0.5 ${isParsing ? 'bg-primary/70 cursor-wait' : 'bg-primary hover:bg-[#014e52]'}`} title="Auto-fill form from a PDF or DOCX resume">
              {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span className="tracking-wide">{isParsing ? 'Parsing Document...' : 'Auto-Fill from Resume'}</span>
              <input type="file" accept=".pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleAutoFillUpload} className="hidden" disabled={isParsing} />
            </label>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Server Draft Restore Banner */}
      {showDraftBanner && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm font-semibold text-primary">
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span>A newer draft was found in your account. Restore it to continue where you left off.</span>
          </div>
          <div className="flex items-center space-x-2 shrink-0 ml-4">
            <button
              onClick={async () => {
                const res = await fetch("/api/draft");
                const data = await res.json();
                if (data.draft) {
                  setFullFormData(data.draft.formData);
                  goToStep(data.draft.activeStep || 1);
                }
                setShowDraftBanner(false);
              }}
              className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all cursor-pointer"
            >
              Restore Draft
            </button>
            <button
              onClick={() => setShowDraftBanner(false)}
              className="p-1 text-text-muted hover:text-text transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Layout wrapper */}
      <div className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-73px)] bg-bg-base">
        {/* Mobile horizontal steps (hidden on large screens) */}
        <div className="lg:hidden w-full overflow-x-auto px-4 py-4 hide-scrollbar border-b border-border/40 bg-surface/50">
          <div className="flex items-center justify-between relative min-w-[360px]">
            {/* Progress bar background line */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-border/60 -z-10" />
            
            {[
              { stepNum: 1, name: "Info" },
              { stepNum: 2, name: "Skills" },
              { stepNum: 3, name: "Projects" },
              { stepNum: 4, name: "Other" },
              { stepNum: 5, name: "Optimize" },
              { stepNum: 6, name: "Template" }
            ].map((s) => {
              const isCompleted = activeStep > s.stepNum;
              const isActive = activeStep === s.stepNum;
              return (
                <button
                  key={s.stepNum}
                  onClick={() => handleStepClick(s.stepNum)}
                  className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] p-2 bg-transparent border-0 cursor-pointer focus:outline-hidden group"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center border text-[10px] font-bold transition-all duration-300 ${
                      isCompleted
                        ? "bg-primary border-primary text-white"
                        : isActive
                        ? "bg-surface border-primary text-primary ring-2 ring-primary/20 scale-105"
                        : "bg-surface border-border text-text-muted"
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : s.stepNum}
                  </div>
                  <span
                    className={`text-[8px] font-bold uppercase tracking-wider transition-colors mt-1 ${
                      isActive ? "text-primary" : "text-text-muted"
                    }`}
                  >
                    {s.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop Vertical Sidebar Steps */}
        <aside className="hidden lg:flex w-72 shrink-0 border-r border-border/40 flex-col bg-bg-base">
          <div className="sticky top-[73px] h-[calc(100vh-73px)] flex flex-col overflow-y-auto">
            
            {/* Top brand area */}
            <div className="px-8 pt-10 pb-6">
              <p className="text-[10px] font-bold text-text-muted/60 uppercase tracking-[0.2em] mb-1">Resume Builder</p>
              <h2 className="text-xl font-bold text-text leading-tight">Build your <span className="text-primary font-serif italic">perfect</span> resume</h2>

              {/* Overall progress bar */}
              <div className="mt-5">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Progress</span>
                  <span className="text-[10px] font-bold text-primary">{Math.round(((activeStep - 1) / 5) * 100)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-border/60 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                    style={{ width: `${Math.round(((activeStep - 1) / 5) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="flex-1 px-5 pb-8">
              <div className="relative flex flex-col space-y-1">
                {/* Vertical connecting line */}
                <div className="absolute left-[27px] top-7 bottom-7 w-[1.5px] bg-border/50 -z-10" />

                {[
                  { stepNum: 1, name: "Personal Info", desc: "Basic details & branch", icon: User },
                  { stepNum: 2, name: "Core Skills", desc: "Languages & technologies", icon: Code2 },
                  { stepNum: 3, name: "Projects", desc: "Engineering portfolio", icon: Rocket },
                  { stepNum: 4, name: "Other", desc: "Internships, roles, achievements", icon: Briefcase },
                  { stepNum: 5, name: "Optimize", desc: "ATS & job keywords", icon: Wand2 },
                  { stepNum: 6, name: "Template", desc: "Layout & photo options", icon: Layout },
                ].map((s) => {
                  const isCompleted = activeStep > s.stepNum;
                  const isActive = activeStep === s.stepNum;

                  return (
                    <button
                      key={s.stepNum}
                      onClick={() => handleStepClick(s.stepNum)}
                      className={`relative flex items-center space-x-3.5 w-full text-left cursor-pointer border-none rounded-2xl px-3 py-3.5 transition-all duration-300 group ${
                        isActive
                          ? "bg-primary/8 shadow-sm"
                          : "bg-transparent hover:bg-border/20"
                      }`}
                      style={isActive ? { background: "rgba(1,105,111,0.07)" } : undefined}
                    >
                      {/* Step circle / icon */}
                      <div className={`w-[42px] h-[42px] rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isCompleted
                          ? "bg-primary shadow-sm"
                          : isActive
                          ? "bg-surface border-2 border-primary shadow-md"
                          : "bg-surface border border-border group-hover:border-primary/40"
                      }`}>
                        {isCompleted
                          ? <Check className="w-5 h-5 text-white" />
                          : isActive
                          ? <s.icon className="w-5 h-5 text-primary" strokeWidth={2.5} />
                          : <span className="text-sm font-bold text-text-muted/60">{s.stepNum}</span>
                        }
                      </div>

                      {/* Text */}
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className={`text-sm font-bold transition-colors ${
                          isActive ? "text-primary" : isCompleted ? "text-text" : "text-text-muted"
                        }`}>
                          {s.name}
                        </span>
                        <span className={`text-[11px] font-medium mt-0.5 transition-colors ${
                          isActive ? "text-primary/70" : "text-text-muted/60"
                        }`}>
                          {s.desc}
                        </span>
                      </div>

                      {/* Active indicator dot */}
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 animate-pulse" />
                      )}
                      {isCompleted && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/30 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom tip */}
            <div className="px-5 pb-8">
              <div className="rounded-2xl border border-border/60 bg-surface/60 p-4">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">💡 Pro Tip</p>
                <p className="text-xs text-text-muted leading-relaxed">
                  {activeStep === 1 && "Add your LinkedIn & GitHub links to boost ATS scores by up to 15%."}
                  {activeStep === 2 && "List at least 4–5 core CS concepts — recruiters scan for these first."}
                  {activeStep === 3 && "Every project needs a measurable result. Think: \"reduced load time by 40%\"."}
                  {activeStep === 4 && "Even 1 internship listed can double your shortlisting rate."}
                  {activeStep === 5 && "Paste the actual job description for the highest ATS match score."}
                  {activeStep === 6 && "Select a photo template if applying for creative or executive roles."}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Form Content */}
        <main className="flex-1 min-w-0 bg-bg-base">
          <div className="w-full px-4 md:px-14 lg:px-16 pt-8 md:pt-10 pb-32">
            {activeStep === 1 && renderStep1()}
            {activeStep === 2 && renderStep2()}
            {activeStep === 3 && renderStep3()}
            {activeStep === 4 && renderStep4()}
            {activeStep === 5 && renderStep5()}
            {activeStep === 6 && renderStep6()}
          </div>

          {/* Sticky Footer Nav */}
          <div className="fixed bottom-0 left-0 right-0 lg:left-72 z-30 bg-bg-base/80 backdrop-blur-md border-t border-border/40 px-4 md:px-14 lg:px-16 py-4">
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrev}
                disabled={activeStep === 1}
                className="px-5 py-3 md:py-2.5 border border-border hover:bg-surface disabled:opacity-25 disabled:cursor-not-allowed text-sm font-semibold rounded-full flex items-center space-x-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-xs text-text-muted font-bold tracking-widest uppercase mb-0.5">Step {activeStep} of 6</span>
                  <div className="flex items-center space-x-1.5 text-[10px] font-semibold">
                    {draftStatus === "saving" && (
                      <span className="flex items-center space-x-1 text-text-muted animate-pulse">
                        <Cloud className="w-3 h-3" />
                        <span>Saving...</span>
                      </span>
                    )}
                    {draftStatus === "saved" && (
                      <span className="flex items-center space-x-1 text-success">
                        <Cloud className="w-3 h-3" />
                        <span>Saved</span>
                      </span>
                    )}
                    {draftStatus === "error" && (
                      <span className="flex items-center space-x-1 text-error">
                        <CloudOff className="w-3 h-3" />
                        <span>Save failed</span>
                      </span>
                    )}
                    {draftStatus === "idle" && lastSaved && (
                      <span className="flex items-center space-x-1 text-text-muted/60">
                        <Check className="w-3 h-3" />
                        <span>Draft saved locally</span>
                      </span>
                    )}
                  </div>
                </div>
                {activeStep < 6 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 md:py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-full flex items-center space-x-2 transition-all shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="px-8 py-3 md:py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-full flex items-center space-x-2 transition-all shadow-md hover:shadow-lg cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Resume</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Processing Loader Modal */}
      {isGenerating && (
        <div className="fixed inset-0 bg-text/45 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-surface border border-border rounded-2xl max-w-sm w-full p-8 text-center shadow-2xl relative overflow-hidden">
            {/* Spinning gradient effect */}
            <div className="absolute -top-16 -left-16 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-success/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full border-4 border-border flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-sm">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>

              <h3 className="text-lg font-bold font-sans mb-1 text-text">Analyzing & Rewriting</h3>
              <p className="text-xs text-text-muted max-w-xs leading-relaxed mb-6 font-medium">
                Our AI Agent is optimizing your project bullets with action verbs and target keywords.
              </p>

              {/* Progress step bar indicator */}
              <div className="w-full bg-border/40 h-[4px] rounded-full overflow-hidden mb-4">
                <div
                  className="bg-primary h-full transition-all duration-1500"
                  style={{ width: `${((generationStep + 1) / loadingSteps.length) * 100}%` }}
                />
              </div>

              {/* Dynamic step labels */}
              <p className="text-xs text-primary font-bold animate-pulse h-4">
                {loadingSteps[generationStep]}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Flash Project Modal */}
      {flashProjectModal.isOpen && (
        <div className="fixed inset-0 bg-text/45 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setFlashProjectModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-border/30 text-text-muted hover:text-text transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#facc15]/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#ca8a04] fill-current" />
              </div>
              <h3 className="text-xl font-bold text-text">Flash Project</h3>
            </div>
            <p className="text-sm text-text-muted mb-6">Enter a GitHub repository URL. Our AI will instantly analyze the README and fill out your project details.</p>
            
            <form onSubmit={handleFlashProjectSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-sm font-semibold text-text">GitHub Repository URL *</label>
                <input 
                  type="url" 
                  required
                  value={flashProjectModal.repoUrl}
                  onChange={e => setFlashProjectModal(prev => ({ ...prev, repoUrl: e.target.value }))}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden transition-all"
                  placeholder="https://github.com/username/repo"
                  disabled={flashProjectModal.isLoading}
                />
              </div>
              
              {flashProjectModal.error && (
                <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-xs font-semibold">
                  {flashProjectModal.error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={flashProjectModal.isLoading}
                className="w-full py-3 bg-[#ca8a04] hover:bg-[#a16207] text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-colors disabled:opacity-70 mt-2"
              >
                {flashProjectModal.isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing Repository...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-current" />
                    <span>Auto-Fill Project</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Coding Profile Modal */}
      {isCodingProfileModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-bg-base border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-border/50 shrink-0">
              <h3 className="font-bold text-lg text-text">
                {editingCodingProfileIndex !== null ? "Edit Coding Profile" : "Add Coding Profile"}
              </h3>
              <button 
                onClick={() => {
                  setIsCodingProfileModalOpen(false);
                  setEditingCodingProfileIndex(null);
                }}
                className="text-text-muted hover:bg-surface p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4 overflow-y-auto min-h-0">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Platform *</label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary outline-hidden text-sm appearance-none"
                    value={codingProfileForm.platform}
                    onChange={(e) => setCodingProfileForm({ ...codingProfileForm, platform: e.target.value })}
                  >
                    <option value="LeetCode">LeetCode</option>
                    <option value="HackerRank">HackerRank</option>
                    <option value="CodeChef">CodeChef</option>
                    <option value="Codeforces">Codeforces</option>
                    <option value="GeeksforGeeks">GeeksforGeeks</option>
                    <option value="AtCoder">AtCoder</option>
                    <option value="TopCoder">TopCoder</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-muted">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Handle / Username *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary outline-hidden text-sm"
                  placeholder="e.g. nithin_123"
                  value={codingProfileForm.handle}
                  onChange={(e) => setCodingProfileForm({ ...codingProfileForm, handle: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Problems Solved *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary outline-hidden text-sm"
                  placeholder="e.g. 500+, 250"
                  value={codingProfileForm.problemsSolved}
                  onChange={(e) => setCodingProfileForm({ ...codingProfileForm, problemsSolved: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Rating / Rank <span className="font-normal text-text-muted text-xs">(Optional)</span></label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary outline-hidden text-sm"
                  placeholder="e.g. 1800, Knight, 4 Star"
                  value={codingProfileForm.rating}
                  onChange={(e) => setCodingProfileForm({ ...codingProfileForm, rating: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Profile Link *</label>
                <input
                  type="url"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary outline-hidden text-sm"
                  placeholder="https://leetcode.com/username"
                  value={codingProfileForm.link}
                  onChange={(e) => setCodingProfileForm({ ...codingProfileForm, link: e.target.value })}
                />
              </div>
            </div>

            <div className="p-4 border-t border-border/50 shrink-0 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsCodingProfileModalOpen(false);
                  setEditingCodingProfileIndex(null);
                }}
                className="px-5 py-2.5 rounded-xl font-semibold text-text hover:bg-surface transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCodingProfile}
                disabled={!codingProfileForm.handle || !codingProfileForm.problemsSolved || !codingProfileForm.link}
                className="px-5 py-2.5 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
