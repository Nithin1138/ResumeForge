"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFormStore } from "@/stores/formStore";
import { ArrowLeft, ArrowRight, Plus, Trash2, Loader2, Sparkles, Check, ChevronDown, X } from "lucide-react";

// Curated popular suggestions for each skill block
const LANGUAGES_SUGGESTIONS = ["JavaScript", "TypeScript", "Python", "Java", "C++", "C", "Go", "Rust", "SQL", "Kotlin", "Swift", "PHP"];
const FRAMEWORKS_SUGGESTIONS = ["React", "Next.js", "Node.js", "Express", "FastAPI", "Django", "Flask", "Spring Boot", "Angular", "Vue", "Tailwind CSS", "Redux", "PyTorch", "TensorFlow"];
const DATABASES_SUGGESTIONS = ["PostgreSQL", "MongoDB", "MySQL", "Redis", "SQLite", "DynamoDB", "Firebase", "Cassandra", "SQL Server"];
const TOOLS_SUGGESTIONS = ["Git", "Docker", "AWS", "Google Cloud (GCP)", "Kubernetes", "Figma", "Postman", "Linux", "Vercel", "GitHub Actions", "Jira"];
const CONCEPTS_SUGGESTIONS = ["Data Structures & Algorithms (DSA)", "Object-Oriented Programming (OOPs)", "Database Management Systems (DBMS)", "Operating Systems (OS)", "Computer Networks", "System Design", "REST APIs", "Machine Learning", "Cloud Computing", "Web Development", "Cybersecurity", "DevOps"];
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

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (activeTags.includes(trimmed)) return;

    const newTags = [...activeTags, trimmed];
    onChange(newTags.join(", "));
    setInputValue("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = activeTags.filter(t => t !== tagToRemove);
    onChange(newTags.join(", "));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && activeTags.length > 0) {
      handleRemoveTag(activeTags[activeTags.length - 1]);
    }
  };

  const handleToggleSuggestion = (sug: string) => {
    if (activeTags.includes(sug)) {
      handleRemoveTag(sug);
    } else {
      handleAddTag(sug);
    }
  };

  const filteredSuggestions = suggestions.filter(
    sug => !activeTags.includes(sug) && sug.toLowerCase().includes(inputValue.toLowerCase())
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
        {activeTags.map((tag) => (
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
    updateOptions,
  } = useFormStore();

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

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
      if (!formData.skills.languages.trim()) errors.languages = "At least one programming language is required";
      if (!formData.skills.concepts.trim()) errors.concepts = "At least one core computer science concept is required";
    }

    if (step === 3) {
      if (formData.projects.length === 0) {
        errors.projectsGlobal = "Please add at least one project to build your resume content";
      } else {
        formData.projects.forEach((proj, idx) => {
          if (!proj.title.trim()) errors[`proj_${idx}_title`] = "Project title is required";
          if (!proj.techStack.trim()) errors[`proj_${idx}_tech`] = "Tech stack is required";
          if (!proj.description.trim()) errors[`proj_${idx}_desc`] = "Description is required";
          if (proj.description.length > 200) errors[`proj_${idx}_desc`] = "Description must be under 200 characters";
          if (!proj.keyResult.trim()) errors[`proj_${idx}_result`] = "Key feature/result is required";
          if (proj.keyResult.length > 150) errors[`proj_${idx}_result`] = "Key feature must be under 150 characters";
        });
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
    if (!validateStep(5)) return;

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
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-4">
        <h2 className="text-xl font-bold font-sans">Personal & Academic details</h2>
        <p className="text-sm text-text-muted">Enter basic information about yourself and your university metrics.</p>
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
          <label className="block text-sm font-semibold mb-2">Branch / Specialization</label>
          <select
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
            value={formData.personal.branch}
            onChange={(e) => updatePersonal({ branch: e.target.value })}
          >
            <option value="">Select branch</option>
            <option value="CSE">Computer Science & Engineering (CSE)</option>
            <option value="ECE">Electronics & Communication Engineering (ECE)</option>
            <option value="EEE">Electrical & Electronics Engineering (EEE)</option>
            <option value="IT">Information Technology (IT)</option>
            <option value="Mechanical">Mechanical Engineering</option>
            <option value="Civil">Civil Engineering</option>
            <option value="Other">Other Branch</option>
          </select>
          {validationErrors.branch && <p className="text-xs text-error mt-1 font-semibold">{validationErrors.branch}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Graduation Year</label>
          <select
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
            value={formData.personal.graduationYear}
            onChange={(e) => updatePersonal({ graduationYear: e.target.value })}
          >
            <option value="">Select year</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
          </select>
          {validationErrors.graduationYear && <p className="text-xs text-error mt-1 font-semibold">{validationErrors.graduationYear}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">CGPA (out of 10.0)</label>
          <input
            type="number"
            step="0.01"
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
            placeholder="e.g. 8.76"
            value={formData.personal.cgpa}
            onChange={(e) => updatePersonal({ cgpa: e.target.value })}
          />
          {validationErrors.cgpa && <p className="text-xs text-error mt-1 font-semibold">{validationErrors.cgpa}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Phone Number</label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
            placeholder="e.g. +91 98765 43210"
            value={formData.personal.phone || ""}
            onChange={(e) => updatePersonal({ phone: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">LinkedIn Profile Link</label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
            placeholder="e.g. linkedin.com/in/username"
            value={formData.personal.linkedin || ""}
            onChange={(e) => updatePersonal({ linkedin: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">GitHub Profile Link</label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
            placeholder="e.g. github.com/username"
            value={formData.personal.github || ""}
            onChange={(e) => updatePersonal({ github: e.target.value })}
          />
        </div>

        <div className="md:col-span-2 border-t border-border/40 pt-4 mt-2">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded-xs border-border text-primary focus:ring-primary focus:ring-opacity-25"
              checked={formData.personal.hasPG || false}
              onChange={(e) => {
                updatePersonal({ 
                  hasPG: e.target.checked,
                  ...(!e.target.checked && {
                    pgDegreeName: "",
                    pgCollegeName: "",
                    pgBranch: "",
                    pgGraduationYear: "",
                    pgCgpa: ""
                  })
                });
              }}
            />
            <span className="text-sm font-semibold text-text">Do you have a Post Graduation (PG) degree?</span>
          </label>
        </div>

        {formData.personal.hasPG && (
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-primary/5 p-5 rounded-2xl border border-primary/20 mt-2">
            <div className="md:col-span-2">
              <h3 className="text-xs font-extrabold text-primary uppercase tracking-wider">Post Graduation (PG) Details</h3>
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
              >
                <option value="">Select year</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
                <option value="2029">2029</option>
              </select>
              {validationErrors.pgGraduationYear && <p className="text-xs text-error mt-1 font-semibold">{validationErrors.pgGraduationYear}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">PG CGPA (out of 10.0)</label>
              <input
                type="number"
                step="0.01"
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
        <TagInput
          label="Programming Languages"
          value={formData.skills.languages}
          onChange={(val) => updateSkills({ languages: val })}
          suggestions={LANGUAGES_SUGGESTIONS}
          placeholder="e.g. Python, Java, C++, TypeScript, SQL"
          error={validationErrors.languages}
          required
        />

        <TagInput
          label="Frameworks & Libraries"
          value={formData.skills.frameworks}
          onChange={(val) => updateSkills({ frameworks: val })}
          suggestions={FRAMEWORKS_SUGGESTIONS}
          placeholder="e.g. React, Next.js, Node.js, FastAPI, Spring Boot"
        />

        <TagInput
          label="Databases"
          value={formData.skills.databases}
          onChange={(val) => updateSkills({ databases: val })}
          suggestions={DATABASES_SUGGESTIONS}
          placeholder="e.g. PostgreSQL, MongoDB, MySQL, Redis"
        />

        <TagInput
          label="Tools & Platforms"
          value={formData.skills.tools}
          onChange={(val) => updateSkills({ tools: val })}
          suggestions={TOOLS_SUGGESTIONS}
          placeholder="e.g. Git, Docker, AWS, Google Cloud, Figma, Postman"
        />

        <TagInput
          label="CS Concepts / Domains"
          value={formData.skills.concepts}
          onChange={(val) => updateSkills({ concepts: val })}
          suggestions={CONCEPTS_SUGGESTIONS}
          placeholder="e.g. Machine Learning, REST APIs, Object-Oriented Programming (OOPs), DSA"
          error={validationErrors.concepts}
          required
        />

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
      <div className="border-b border-border/60 pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold font-sans">Engineering Projects</h2>
          <p className="text-sm text-text-muted">Add up to 4 core projects. Describe what you built in plain language.</p>
        </div>
        <button
          onClick={addProject}
          disabled={formData.projects.length >= 4}
          className="px-4 py-2 bg-primary/10 border border-primary/20 hover:bg-primary/25 disabled:opacity-50 text-primary font-bold text-xs rounded-full flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Project ({formData.projects.length}/4)</span>
        </button>
      </div>

      {validationErrors.projectsGlobal && (
        <div className="p-4 bg-error/10 border border-error/20 text-error text-xs rounded-xl font-semibold">
          {validationErrors.projectsGlobal}
        </div>
      )}

      <div className="space-y-6">
        {formData.projects.map((proj, idx) => (
          <div key={idx} className="border border-border bg-surface/50 rounded-2xl p-6 space-y-4 relative">
            <div className="flex justify-between items-center pb-2 border-b border-border/30">
              <span className="text-xs font-bold text-primary tracking-wider uppercase">Project #{idx + 1}</span>
              <button
                onClick={() => removeProject(idx)}
                className="text-text-muted hover:text-error transition-colors p-1"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
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
                <label className="block text-xs font-bold mb-1">GitHub / Live Demo Link (Optional)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface focus:ring-1 focus:ring-primary focus:border-transparent outline-hidden text-xs font-semibold"
                  placeholder="e.g. github.com/username/project"
                  value={proj.link}
                  onChange={(e) => updateProject(idx, { link: e.target.value })}
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
                <label className="block text-xs font-bold mb-1">What did you build? * (Max 200 chars)</label>
                <textarea
                  rows={2}
                  maxLength={200}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface focus:ring-1 focus:ring-primary focus:border-transparent outline-hidden text-xs font-semibold resize-none"
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
                  <span className="text-[10px] text-text-muted font-bold">{proj.description.length}/200</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold mb-1">Key Feature or Result * (Max 150 chars)</label>
                <textarea
                  rows={2}
                  maxLength={150}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface focus:ring-1 focus:ring-primary focus:border-transparent outline-hidden text-xs font-semibold resize-none"
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
                  <span className="text-[10px] text-text-muted font-bold">{proj.keyResult.length}/150</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {formData.projects.length === 0 && (
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
      </div>
    </div>
  );

  // Step 4: Internships & POR Form
  const renderStep4 = () => (
    <div className="space-y-8">
      {/* Internships Header */}
      <div className="space-y-6">
        <div className="border-b border-border/60 pb-4 flex justify-between items-end">
          <div>
            <h2 className="text-xl font-bold font-sans">Work Experience / Internships (Optional)</h2>
            <p className="text-sm text-text-muted">Add up to 3 technical internships. Skip if you don&apos;t have any.</p>
          </div>
          <button
            onClick={addInternship}
            disabled={formData.internships.length >= 3}
            className="px-4 py-2 bg-primary/10 border border-primary/20 hover:bg-primary/25 disabled:opacity-50 text-primary font-bold text-xs rounded-full flex items-center space-x-1.5 transition-colors cursor-pointer"
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
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl font-bold font-sans">Positions of Responsibility (Optional)</h2>
            <p className="text-sm text-text-muted">Club roles, leadership in university chapters (max 2).</p>
          </div>
          <button
            onClick={addPosition}
            disabled={formData.positions.length >= 2}
            className="px-4 py-2 bg-primary/10 border border-primary/20 hover:bg-primary/25 disabled:opacity-50 text-primary font-bold text-xs rounded-full flex items-center space-x-1.5 transition-colors cursor-pointer"
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
    </div>
  );

  // Step 5: Final Options Form
  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-4">
        <h2 className="text-xl font-bold font-sans">ATS & Keyword Optimizations</h2>
        <p className="text-sm text-text-muted">Specify details to align the resume bullets exactly with your target job description.</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-2">Paste Job Description (Optional — for keyword matching)</label>
          <textarea
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
            placeholder="Copy and paste the qualifications, skills, and details from the job advertisement here..."
            value={formData.options.jobDescription}
            onChange={(e) => updateOptions({ jobDescription: e.target.value })}
          />
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

        {/* Achievements Section */}
        <div className="border-t border-border/40 pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-semibold">Include Achievements Section?</label>
              <p className="text-xs text-text-muted">Feature competitive coding, academic ranks, or hackathons.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.options.includeAchievements}
                onChange={(e) => updateOptions({ includeAchievements: e.target.checked })}
              />
              <div className="w-11 h-6 bg-border peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {formData.options.includeAchievements && (
            <div>
              <label className="block text-xs font-bold mb-2">List Achievements (Comma-separated or bullet list)</label>
              <textarea
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
                placeholder="e.g. Secured Global Rank 230 out of 50,000 in LeetCode Weekly, Won 1st place in Smart India Hackathon 2025"
                value={formData.options.achievements}
                onChange={(e) => updateOptions({ achievements: e.target.value })}
              />
            </div>
          )}
        </div>

        {/* Project Variants */}
        <div className="border-t border-border/40 pt-5">
          <label className="block text-sm font-semibold mb-2">How many variations of project bullets do you want?</label>
          <div className="flex space-x-6">
            {[
              { label: "1 standard version", val: "1 version" },
              { label: "3 versions for different roles", val: "3 versions" }
            ].map((opt, idx) => (
              <label key={idx} className="flex items-center space-x-2 text-sm font-medium cursor-pointer">
                <input
                  type="radio"
                  name="variants"
                  className="accent-primary"
                  checked={formData.options.projectVariants === opt.val}
                  onChange={() => updateOptions({ projectVariants: opt.val as any })}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-base text-text flex flex-col font-sans relative">
      {/* Header */}
      <header className="glass-panel border-b border-border/40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center justify-center">
            <img src="/logo.png" alt="ATSLift Logo" className="w-8 h-8 rounded-md object-contain" />
          </Link>
          <span className="font-bold text-lg tracking-tight text-text">
            ATS<span className="text-primary font-medium font-serif italic">Lift</span>
          </span>
        </div>
        <div className="text-xs text-text-muted font-bold uppercase tracking-wider bg-border/40 px-3 py-1 rounded-full">
          Step {activeStep} of 5
        </div>
      </header>

      {/* Steps indicator chips */}
      <div className="max-w-4xl mx-auto w-full px-6 pt-8 pb-4">
        <div className="flex items-center justify-between relative">
          {/* Progress bar background line */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-border/60 -z-10" />
          
          {[
            { stepNum: 1, name: "Info" },
            { stepNum: 2, name: "Skills" },
            { stepNum: 3, name: "Projects" },
            { stepNum: 4, name: "Experience" },
            { stepNum: 5, name: "Optimize" }
          ].map((s) => {
            const isCompleted = activeStep > s.stepNum;
            const isActive = activeStep === s.stepNum;

            return (
              <button
                key={s.stepNum}
                onClick={() => handleStepClick(s.stepNum)}
                className="flex flex-col items-center space-y-1 bg-transparent border-0 cursor-pointer focus:outline-hidden group"
              >
                <div
                  className={`w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center border text-[10px] md:text-xs font-bold transition-all duration-300 ${
                    isCompleted
                      ? "bg-primary border-primary text-white"
                      : isActive
                      ? "bg-surface border-primary text-primary ring-2 ring-primary/20 scale-105"
                      : "bg-surface border-border text-text-muted group-hover:border-primary/50"
                  }`}
                >
                  {isCompleted ? <Check className="w-4.5 h-4.5" /> : s.stepNum}
                </div>
                <span
                  className={`text-[8px] md:text-[10px] font-bold uppercase tracking-wider transition-colors mt-1 ${
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

      {/* Main Form Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 pb-24 pt-4">
        <div className="bg-surface border border-border rounded-2xl p-4 md:p-8 shadow-xs">
          {activeStep === 1 && renderStep1()}
          {activeStep === 2 && renderStep2()}
          {activeStep === 3 && renderStep3()}
          {activeStep === 4 && renderStep4()}
          {activeStep === 5 && renderStep5()}

          {/* Form Actions Footer */}
          <div className="flex justify-between items-center border-t border-border/40 mt-8 pt-6">
            <button
              onClick={handlePrev}
              disabled={activeStep === 1}
              className="px-4 py-2.5 md:px-6 md:py-3 border border-border hover:bg-bg-base/60 disabled:opacity-30 disabled:hover:bg-transparent text-xs md:text-sm font-semibold rounded-full flex items-center space-x-1 md:space-x-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span>Back</span>
            </button>

            {activeStep < 5 ? (
              <button
                onClick={handleNext}
                className="px-4 py-2.5 md:px-6 md:py-3 bg-primary hover:bg-primary/95 text-white text-xs md:text-sm font-semibold rounded-full flex items-center space-x-1 md:space-x-1.5 transition-all shadow-xs hover:shadow-md cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-4 py-2.5 md:px-8 md:py-3 bg-primary hover:bg-primary/95 text-white text-xs md:text-sm font-semibold rounded-full flex items-center space-x-1 md:space-x-1.5 transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>Generate</span>
              </button>
            )}
          </div>
        </div>
      </main>

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
    </div>
  );
}
