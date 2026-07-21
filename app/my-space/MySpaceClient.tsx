"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Database, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Copy, 
  Check, 
  Loader2, 
  User, 
  GraduationCap, 
  Briefcase, 
  Code, 
  Award, 
  ArrowLeft, 
  Bot, 
  Send,
  Building2,
  FileText,
  Layout,
  BookOpen
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/DashboardActions";

interface ProjectItem {
  id: string;
  title: string;
  description: string;
  techStack: string;
}

interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
}

export default function MySpaceClient({ userEmail }: { userEmail: string }) {
  const [activeTab, setActiveTab] = useState<"profile" | "copilot">("profile");

  // Profile Form States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState("");

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCertInput, setNewCertInput] = useState("");
  const [customNotes, setCustomNotes] = useState("");

  // AI Copilot State
  const [companyName, setCompanyName] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedAnswer, setCopiedAnswer] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/my-space");
      const data = await res.json();
      
      if (data.profile) {
        const p = data.profile;
        setFullName(p.fullName || data.userName || "");
        setPhone(p.phone || "");
        setLocation(p.location || "");
        setCollege(p.college || "");
        setBranch(p.branch || "");
        setCgpa(p.cgpa || "");
        setGraduationYear(p.graduationYear || "");
        setSummary(p.summary || "");
        setCustomNotes(p.customNotes || "");

        try { setSkills(JSON.parse(p.skillsJson || "[]")); } catch { setSkills([]); }
        try { setProjects(JSON.parse(p.projectsJson || "[]")); } catch { setProjects([]); }
        try { setExperiences(JSON.parse(p.experiencesJson || "[]")); } catch { setExperiences([]); }
        try { setCertifications(JSON.parse(p.certificationsJson || "[]")); } catch { setCertifications([]); }
      } else {
        setFullName(data.userName || "");
      }
    } catch (e) {
      console.error("Failed to load profile:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/user/my-space", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          location,
          college,
          branch,
          cgpa,
          graduationYear,
          summary,
          skillsJson: JSON.stringify(skills),
          projectsJson: JSON.stringify(projects),
          experiencesJson: JSON.stringify(experiences),
          certificationsJson: JSON.stringify(certifications),
          customNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile");

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Skill Handlers
  const handleAddSkill = () => {
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput("");
    }
  };
  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  // Certification Handlers
  const handleAddCert = () => {
    if (newCertInput.trim() && !certifications.includes(newCertInput.trim())) {
      setCertifications([...certifications, newCertInput.trim()]);
      setNewCertInput("");
    }
  };
  const handleRemoveCert = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  // Project Handlers
  const handleAddProject = () => {
    setProjects([
      ...projects,
      { id: Date.now().toString(), title: "New Project", description: "", techStack: "" },
    ]);
  };
  const handleUpdateProject = (id: string, field: keyof ProjectItem, val: string) => {
    setProjects(projects.map(p => p.id === id ? { ...p, [field]: val } : p));
  };
  const handleRemoveProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  // Experience Handlers
  const handleAddExperience = () => {
    setExperiences([
      ...experiences,
      { id: Date.now().toString(), role: "Intern / Full-time", company: "Company Name", duration: "3 Months", description: "" },
    ]);
  };
  const handleUpdateExperience = (id: string, field: keyof ExperienceItem, val: string) => {
    setExperiences(experiences.map(e => e.id === id ? { ...e, [field]: val } : e));
  };
  const handleRemoveExperience = (id: string) => {
    setExperiences(experiences.filter(e => e.id !== id));
  };

  // AI Generation
  const handleAskAi = async (qPrompt?: string) => {
    const query = qPrompt || question;
    if (!query.trim()) return;

    setIsGenerating(true);
    setAiAnswer("");

    try {
      const res = await fetch("/api/user/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: query,
          companyName,
          jobRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate answer");
      setAiAnswer(data.answer);
    } catch (err: any) {
      setAiAnswer(`Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyAnswer = () => {
    navigator.clipboard.writeText(aiAnswer);
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 2000);
  };

  const presetQuestions = [
    "Why do you want to join our engineering team?",
    "Describe a challenging technical project you built and how you solved it.",
    "What are your top technical strengths and key accomplishments?",
    "How do your academic projects prepare you for this full-time role?",
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base text-text flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs font-bold text-text-muted">Loading My Space Vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base text-text flex flex-col font-sans">
      {/* Header Navbar */}
      <header className="glass-panel border-b border-border/40 max-md:px-4 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/dashboard" className="flex items-center space-x-2 text-text-muted hover:text-text transition-colors text-xs font-bold mr-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Link>
          <div className="h-4 w-px bg-border/60 max-sm:hidden" />
          <Link href="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="ATSLift Logo" className="w-7 h-7 rounded-md object-contain logo-rotated" />
            <span className="font-bold text-base tracking-tight text-text">
              ATS<span className="text-primary font-medium font-serif italic">Lift</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto w-full px-4 md:px-6 py-8 md:py-10 space-y-8 flex-1">
        
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-serif font-bold text-text flex items-center gap-2">
              <Database className="w-8 h-8 text-primary" />
              <span>My Space</span>
            </h1>
            <p className="text-xs text-text-muted font-medium">
              Your central candidate data vault & instant AI application copilot. Fill details once, use everywhere.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-surface border border-border p-1.5 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === "profile" 
                  ? "bg-primary text-white shadow-xs" 
                  : "text-text-muted hover:text-text"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Master Profile Vault</span>
            </button>

            <button
              onClick={() => setActiveTab("copilot")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === "copilot" 
                  ? "bg-primary text-white shadow-xs" 
                  : "text-text-muted hover:text-text"
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>AI Application Copilot</span>
            </button>
          </div>
        </div>

        {/* TAB 1: MASTER PROFILE VAULT */}
        {activeTab === "profile" && (
          <div className="space-y-8">
            
            {/* Top Action Bar */}
            <div className="flex items-center justify-between bg-surface border border-border/60 rounded-2xl p-4">
              <div className="flex items-center space-x-2 text-xs text-text-muted font-semibold">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Auto-synced with ATS Resume Builder & Cover Letter Generators</span>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-full inline-flex items-center space-x-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Vault...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Master Profile</span>
                  </>
                )}
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 text-xs font-bold flex items-center space-x-2">
                <Check className="w-4 h-4" />
                <span>Master Profile Vault saved successfully to PostgreSQL DB!</span>
              </div>
            )}

            {saveError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold">
                {saveError}
              </div>
            )}

            {/* Grid 1: Personal & Academics */}
            <div className="bg-surface border border-border/60 rounded-3xl p-6 space-y-6 shadow-xs">
              <div className="border-b border-border/40 pb-3 flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                <h2 className="font-serif font-bold text-lg text-text">Personal & Academic Details</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Candidate Name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-base text-text text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-base text-text text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Location / City</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Bengaluru, KA"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-base text-text text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2 md:col-span-1">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">College Name</label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="Engineering Institute"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-base text-text text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Branch / Degree</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="Computer Science & Engg"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-base text-text text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">CGPA / Percentage</label>
                  <input
                    type="text"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    placeholder="8.8 / 10"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-base text-text text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Career Bio / Elevator Summary</label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="High-performing Computer Science graduate with hands-on experience building microservice backends and frontend web applications..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-base text-text text-xs font-semibold focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Grid 2: Technical Skills */}
            <div className="bg-surface border border-border/60 rounded-3xl p-6 space-y-4 shadow-xs">
              <div className="border-b border-border/40 pb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Code className="w-5 h-5 text-primary" />
                  <h2 className="font-serif font-bold text-lg text-text">Technical Skills Vault</h2>
                </div>
                <span className="text-xs text-text-muted font-bold">{skills.length} Skills Stored</span>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                  placeholder="Add skill (e.g. React, Node.js, Python, PostgreSQL)"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-border bg-bg-base text-text text-xs font-semibold focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 transition-all cursor-pointer"
                >
                  Add Skill
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold"
                  >
                    <span>{skill}</span>
                    <button onClick={() => handleRemoveSkill(idx)} className="hover:text-red-500 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Grid 3: Projects */}
            <div className="bg-surface border border-border/60 rounded-3xl p-6 space-y-4 shadow-xs">
              <div className="border-b border-border/40 pb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <h2 className="font-serif font-bold text-lg text-text">Key Engineering Projects</h2>
                </div>
                <button
                  onClick={handleAddProject}
                  className="px-3.5 py-1.5 bg-primary/10 border border-primary/30 text-primary text-xs font-bold rounded-full hover:bg-primary/20 transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project</span>
                </button>
              </div>

              <div className="space-y-4">
                {projects.map((proj) => (
                  <div key={proj.id} className="p-4 border border-border rounded-2xl bg-bg-base space-y-3 relative group">
                    <button
                      onClick={() => handleRemoveProject(proj.id)}
                      className="absolute top-4 right-4 text-text-muted hover:text-red-500 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => handleUpdateProject(proj.id, "title", e.target.value)}
                        placeholder="Project Title"
                        className="px-3 py-2 rounded-lg border border-border bg-surface text-text text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={proj.techStack}
                        onChange={(e) => handleUpdateProject(proj.id, "techStack", e.target.value)}
                        placeholder="Tech Stack (e.g. Next.js, Docker, Redis)"
                        className="px-3 py-2 rounded-lg border border-border bg-surface text-text text-xs font-semibold"
                      />
                    </div>

                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={(e) => handleUpdateProject(proj.id, "description", e.target.value)}
                      placeholder="Key achievements, metrics, architectural details..."
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text text-xs font-medium"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Grid 4: Experience & Internships */}
            <div className="bg-surface border border-border/60 rounded-3xl p-6 space-y-4 shadow-xs">
              <div className="border-b border-border/40 pb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <h2 className="font-serif font-bold text-lg text-text">Experience & Internships</h2>
                </div>
                <button
                  onClick={handleAddExperience}
                  className="px-3.5 py-1.5 bg-primary/10 border border-primary/30 text-primary text-xs font-bold rounded-full hover:bg-primary/20 transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Experience</span>
                </button>
              </div>

              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="p-4 border border-border rounded-2xl bg-bg-base space-y-3 relative">
                    <button
                      onClick={() => handleRemoveExperience(exp.id)}
                      className="absolute top-4 right-4 text-text-muted hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-8">
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => handleUpdateExperience(exp.id, "role", e.target.value)}
                        placeholder="Role / Title"
                        className="px-3 py-2 rounded-lg border border-border bg-surface text-text text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleUpdateExperience(exp.id, "company", e.target.value)}
                        placeholder="Company / Organization"
                        className="px-3 py-2 rounded-lg border border-border bg-surface text-text text-xs font-semibold"
                      />
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => handleUpdateExperience(exp.id, "duration", e.target.value)}
                        placeholder="Duration (e.g. May 2025 - Jul 2025)"
                        className="px-3 py-2 rounded-lg border border-border bg-surface text-text text-xs font-medium"
                      />
                    </div>

                    <textarea
                      rows={2}
                      value={exp.description}
                      onChange={(e) => handleUpdateExperience(exp.id, "description", e.target.value)}
                      placeholder="Responsibilities, achievements, impact..."
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text text-xs font-medium"
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: AI APPLICATION QUESTION COPILOT */}
        {activeTab === "copilot" && (
          <div className="space-y-6">
            <div className="bg-surface border border-border/60 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
              
              <div className="border-b border-border/40 pb-4 space-y-1">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-primary/20 text-primary uppercase tracking-wider">
                  Powered by Google Gemini & Master Profile Vault
                </span>
                <h2 className="font-serif font-bold text-2xl text-text flex items-center gap-2">
                  <Bot className="w-6 h-6 text-primary" />
                  <span>Instant Application Question Copilot</span>
                </h2>
                <p className="text-xs text-text-muted font-semibold">
                  Companies asking custom application questions? Paste any question below. Our AI answers directly using your real college, CGPA, projects, and skills stored in My Space.
                </p>
              </div>

              {/* Target Company & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5 text-primary" />
                    <span>Company Name (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Google, Microsoft, Swiggy, Zerodha"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-base text-text text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center space-x-1">
                    <Briefcase className="w-3.5 h-3.5 text-primary" />
                    <span>Target Role (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    placeholder="e.g. Full Stack Engineer, Graduate Trainee"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-base text-text text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Preset Quick Chips */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Sample Application Questions:</span>
                <div className="flex flex-wrap gap-2">
                  {presetQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setQuestion(q);
                        handleAskAi(q);
                      }}
                      className="px-3 py-1.5 bg-bg-base border border-border/80 text-text-muted hover:text-primary hover:border-primary/40 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer"
                    >
                      "{q}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Textarea */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Paste Application Question / Prompt</label>
                <textarea
                  rows={4}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Paste the company's application question here (e.g., 'Describe a time you solved a complex technical challenge using React & PostgreSQL')..."
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-bg-base text-text text-xs font-medium focus:outline-none focus:border-primary"
                />
              </div>

              <button
                onClick={() => handleAskAi()}
                disabled={isGenerating || !question.trim()}
                className="w-full py-3.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-2xl transition-all shadow-xs flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Searching Master Profile & Generating Custom Answer...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Generate Instant AI Answer</span>
                  </>
                )}
              </button>

              {/* Generated Answer Display */}
              {aiAnswer && (
                <div className="p-5 border border-primary/30 rounded-2xl bg-primary/5 space-y-4 relative animate-fade-in">
                  <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                    <span className="text-xs font-extrabold text-primary uppercase tracking-wider flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>Instant Tailored Answer (Ready to Copy)</span>
                    </span>

                    <button
                      onClick={handleCopyAnswer}
                      className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary/90 transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
                    >
                      {copiedAnswer ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Answer</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-xs md:text-sm text-text font-sans leading-relaxed whitespace-pre-line">
                    {aiAnswer}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
