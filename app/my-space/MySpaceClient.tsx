"use client";

import React, { useState, useEffect, useDeferredValue, useCallback, useMemo } from "react";
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
  Eye,
  Search,
  PlusCircle,
  Globe,
  ExternalLink,
  Clock,
  Tag,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Layers,
  Menu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/DashboardActions";
import HeaderWalletBadge from "@/components/HeaderWalletBadge";
import AppLayout from "@/components/AppLayout";

interface ProjectItem {
  id: string;
  title: string;
  description: string;
  techStack: string;
  link?: string;
}

interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
}

interface CustomFieldItem {
  id: string;
  key: string;
  value: string;
}

export default function MySpaceClient({ userEmail }: { userEmail: string }) {
  const [activeTab, setActiveTab] = useState<"profile" | "copilot">("profile");
  const [viewMode, setViewMode] = useState<"view" | "edit">("view");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isNavCollapsed, setIsNavCollapsed] = useState<boolean>(false);

  // Profile Form States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("");

  const [leetcode, setLeetcode] = useState("");
  const [codeforces, setCodeforces] = useState("");
  const [codechef, setCodechef] = useState("");
  const [hackerrank, setHackerrank] = useState("");
  const [gfg, setGfg] = useState("");

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
  const [achievements, setAchievements] = useState<string[]>([]);
  const [newAchievementInput, setNewAchievementInput] = useState("");
  
  const [customFields, setCustomFields] = useState<CustomFieldItem[]>([]);
  const [newCustomKey, setNewCustomKey] = useState("");
  const [newCustomVal, setNewCustomVal] = useState("");
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

    const handleProfileUpdate = () => {
      fetchProfile();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("masterProfileUpdated", handleProfileUpdate);
      window.addEventListener("storage", handleProfileUpdate);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("masterProfileUpdated", handleProfileUpdate);
        window.removeEventListener("storage", handleProfileUpdate);
      }
    };
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/my-space");
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      
      if (data && data.profile) {
        const p = data.profile;
        setFullName(p.fullName || data.userName || "");
        setPhone(p.phone || "");
        setLocation(p.location || "");
        setGithub(p.github || "");
        setLinkedin(p.linkedin || "");
        setPortfolio(p.portfolio || "");
        setNoticePeriod(p.noticePeriod || "Immediate / 15 Days");

        setLeetcode(p.leetcode || "");
        setCodeforces(p.codeforces || "");
        setCodechef(p.codechef || "");
        setHackerrank(p.hackerrank || "");
        setGfg(p.gfg || "");

        setCollege(p.college || "");
        setBranch(p.branch || "");
        setCgpa(p.cgpa || "");
        setGraduationYear(p.graduationYear || "");
        setSummary(p.summary || "");
        setCustomNotes(p.customNotes || "");

        try {
          const s = JSON.parse(p.skillsJson || "[]");
          if (Array.isArray(s)) {
            setSkills(s);
          } else if (s && typeof s === "object") {
            const extracted: string[] = [];
            if (s.categories && typeof s.categories === "object") {
              Object.values(s.categories).forEach((val: any) => {
                if (Array.isArray(val)) extracted.push(...val);
                else if (typeof val === "string") extracted.push(...val.split(",").map((v: string) => v.trim()));
              });
            }
            if (s.softSkills && typeof s.softSkills === "string") {
              extracted.push(...s.softSkills.split(",").map((v: string) => v.trim()));
            }
            setSkills(extracted.filter(Boolean));
          } else {
            setSkills([]);
          }
        } catch {
          setSkills([]);
        }

        try {
          const pr = JSON.parse(p.projectsJson || "[]");
          setProjects(Array.isArray(pr) ? pr : []);
        } catch {
          setProjects([]);
        }

        try {
          const ex = JSON.parse(p.experiencesJson || "[]");
          setExperiences(Array.isArray(ex) ? ex : []);
        } catch {
          setExperiences([]);
        }

        try {
          const cr = JSON.parse(p.certificationsJson || "[]");
          if (Array.isArray(cr)) {
            setCertifications(cr);
          } else if (typeof cr === "string") {
            setCertifications(cr.split(",").map((c: string) => c.trim()).filter(Boolean));
          } else {
            setCertifications([]);
          }
        } catch {
          setCertifications([]);
        }

        try {
          const ac = JSON.parse(p.achievementsJson || "[]");
          if (Array.isArray(ac)) {
            setAchievements(ac);
          } else if (typeof ac === "string") {
            setAchievements(ac.split("\n").map((a: string) => a.trim()).filter(Boolean));
          } else {
            setAchievements([]);
          }
        } catch {
          setAchievements([]);
        }
        
        try {
          const parsedCF = JSON.parse(p.customFieldsJson || "[]");
          if (Array.isArray(parsedCF)) {
            setCustomFields(parsedCF.map((item: any, idx: number) => ({
              id: item.id || idx.toString(),
              key: item.key || item.name || "Custom Detail",
              value: item.value || item.val || "",
            })));
          } else {
            setCustomFields([]);
          }
        } catch {
          setCustomFields([]);
        }
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
          github,
          linkedin,
          portfolio,
          noticePeriod,
          leetcode,
          codeforces,
          codechef,
          hackerrank,
          gfg,
          college,
          branch,
          cgpa,
          graduationYear,
          summary,
          skillsJson: JSON.stringify(skills),
          projectsJson: JSON.stringify(projects),
          experiencesJson: JSON.stringify(experiences),
          certificationsJson: JSON.stringify(certifications),
          achievementsJson: JSON.stringify(achievements),
          customFieldsJson: JSON.stringify(customFields),
          customNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile");

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("masterProfileUpdated", { detail: data.profile }));
        localStorage.setItem("masterProfileLastUpdated", Date.now().toString());
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, keyName: string) => {
    if (!text || typeof window === "undefined") return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyFullVault = () => {
    if (typeof window === "undefined" || !navigator?.clipboard?.writeText) return;
    const lines = [
      `=========================================`,
      `CANDIDATE MASTER PROFILE VAULT`,
      `=========================================`,
      fullName ? `Name: ${fullName}` : null,
      userEmail ? `Email: ${userEmail}` : null,
      phone ? `Phone: ${phone}` : null,
      location ? `Location: ${location}` : null,
      github ? `GitHub: ${github}` : null,
      linkedin ? `LinkedIn: ${linkedin}` : null,
      noticePeriod ? `Notice Period: ${noticePeriod}` : null,
      ``,
      (leetcode || codeforces || codechef || hackerrank || gfg) ? `--- CODING & PROBLEM-SOLVING PROFILES ---` : null,
      leetcode ? `LeetCode: ${leetcode}` : null,
      codeforces ? `Codeforces: ${codeforces}` : null,
      codechef ? `CodeChef: ${codechef}` : null,
      hackerrank ? `HackerRank: ${hackerrank}` : null,
      gfg ? `GeeksforGeeks: ${gfg}` : null,
      ``,
      college || branch || cgpa ? `--- ACADEMIC & BIO ---` : null,
      college ? `College: ${college}` : null,
      branch ? `Branch/Degree: ${branch}` : null,
      cgpa ? `CGPA: ${cgpa}` : null,
      graduationYear ? `Graduation Year: ${graduationYear}` : null,
      summary ? `Bio Summary: ${summary}` : null,
      ``,
      skills.length ? `--- SKILLS ---` : null,
      skills.length ? skills.join(", ") : null,
      ``,
      certifications.length ? `--- CERTIFICATIONS ---` : null,
      certifications.length ? certifications.map(c => `- ${c}`).join("\n") : null,
      ``,
      achievements.length ? `--- ACHIEVEMENTS & AWARDS ---` : null,
      achievements.length ? achievements.map(a => `- ${a}`).join("\n") : null,
      ``,
      projects.length ? `--- PROJECTS ---` : null,
      projects.length ? projects.map(p => `- ${p.title} (${p.techStack}): ${p.description}`).join("\n") : null,
      ``,
      experiences.length ? `--- EXPERIENCE ---` : null,
      experiences.length ? experiences.map(e => `- ${e.company} | ${e.role} (${e.duration}): ${e.description}`).join("\n") : null,
    ].filter(line => line !== null).join("\n");

    navigator.clipboard.writeText(lines);
    setCopiedKey("FULL_VAULT");
    setTimeout(() => setCopiedKey(null), 2500);
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

  // Achievement Handlers
  const handleAddAchievement = () => {
    const trimmed = newAchievementInput.trim();
    if (!trimmed) return;
    if (!achievements.includes(trimmed)) {
      setAchievements(prev => [...prev, trimmed]);
    }
    setNewAchievementInput("");
  };

  const handleRemoveAchievement = (idx: number) => {
    setAchievements(prev => prev.filter((_, i) => i !== idx));
  };

  // Custom Field Handlers
  const handleAddCustomField = () => {
    if (newCustomKey.trim() && newCustomVal.trim()) {
      setCustomFields([
        ...customFields,
        { id: Date.now().toString(), key: newCustomKey.trim(), value: newCustomVal.trim() },
      ]);
      setNewCustomKey("");
      setNewCustomVal("");
    }
  };
  const handleRemoveCustomField = (id: string) => {
    setCustomFields(customFields.filter(cf => cf.id !== id));
  };
  const handleUpdateCustomField = (id: string, key: string, value: string) => {
    setCustomFields(customFields.map(cf => cf.id === id ? { ...cf, key, value } : cf));
  };

  // Project Handlers
  const handleAddProject = () => {
    setProjects([
      ...projects,
      { id: Date.now().toString(), title: "New Engineering Project", description: "", techStack: "" },
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
      { id: Date.now().toString(), role: "Software Intern", company: "Company Name", duration: "3 Months", description: "" },
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

  const deferredSearchQuery = useDeferredValue(searchQuery);

  const matchesSearch = useCallback((text: string) => {
    if (!deferredSearchQuery.trim()) return true;
    return text.toLowerCase().includes(deferredSearchQuery.toLowerCase());
  }, [deferredSearchQuery]);

  const presetQuestions = [
    "Why do you want to join our engineering team?",
    "Describe a challenging technical project you built and how you solved it.",
    "What are your top technical strengths and key accomplishments?",
    "How do your academic projects prepare you for this full-time role?",
  ];

  const calculateVaultCompletion = () => {
    let completed = 0;
    const total = 8;
    if (fullName && (userEmail || phone)) completed++;
    if (leetcode || codeforces || codechef || hackerrank || gfg) completed++;
    if (college || branch) completed++;
    if (skills.length > 0) completed++;
    if (certifications.length > 0) completed++;
    if (achievements.length > 0) completed++;
    if (projects.length > 0) completed++;
    if (experiences.length > 0) completed++;
    return Math.round((completed / total) * 100);
  };
  const completionPercentage = calculateVaultCompletion();

  const navCategories = [
    { id: "all", label: "Overview & All Vault", icon: Layers, count: null, isTab: "profile" },
    { id: "personal", label: "Personal & Contact", icon: User, count: null, isTab: "profile" },
    { id: "coding", label: "Coding Profiles", icon: Code, count: [leetcode, codeforces, codechef, hackerrank, gfg].filter(Boolean).length, isTab: "profile" },
    { id: "academic", label: "Academics & Bio", icon: GraduationCap, count: null, isTab: "profile" },
    { id: "skills", label: "Skills Vault", icon: Sparkles, count: skills.length, isTab: "profile" },
    { id: "certifications", label: "Certifications", icon: FileText, count: certifications.length, isTab: "profile" },
    { id: "achievements", label: "Achievements & Awards", icon: Award, count: achievements.length, isTab: "profile" },
    { id: "projects", label: "Projects Vault", icon: Briefcase, count: projects.length, isTab: "profile" },
    { id: "experience", label: "Experience Vault", icon: Building2, count: experiences.length, isTab: "profile" },
    { id: "custom", label: "Custom Fields Vault", icon: Tag, count: customFields.length, isTab: "profile" },
    { id: "copilot", label: "AI Application Copilot", icon: Bot, count: null, isTab: "copilot" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* ─── COMPACT HEADER ─── */}
        <div className="flex flex-col gap-5">
          {/* Row 1: Identity + Actions */}
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-serif font-bold text-text truncate">
                {fullName || "My Space"}
              </h1>
              <p className="text-[13px] text-text-muted font-medium mt-0.5">
                {userEmail}{location ? ` · ${location}` : ""}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Completion Ring */}
              <div className="relative w-10 h-10" title={`${completionPercentage}% complete`}>
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" strokeWidth="3" className="stroke-border/40" />
                  <motion.path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-primary"
                    initial={{ strokeDasharray: "0, 100" }}
                    animate={{ strokeDasharray: `${completionPercentage}, 100` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-text">
                  {completionPercentage}
                </span>
              </div>

              <button
                onClick={handleCopyFullVault}
                className="h-10 px-3.5 rounded-xl border border-border bg-surface hover:bg-bg-base text-text text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copy full profile as text"
              >
                {copiedKey === "FULL_VAULT" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copiedKey === "FULL_VAULT" ? "Copied" : "Copy All"}</span>
              </button>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="h-10 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>{saving ? "Saving" : "Save"}</span>
              </button>
            </div>
          </div>

          {/* Row 2: Mode Toggle + Search */}
          <div className="flex items-center gap-3">
            {/* Segmented Control */}
            <div className="flex items-center bg-bg-base border border-border/80 p-1 rounded-xl relative shrink-0">
              {[
                { id: "view" as const, label: "View", icon: Eye },
                { id: "edit" as const, label: "Edit", icon: Edit3 },
              ].map((mode) => {
                const isActive = activeTab === "profile" && viewMode === mode.id;
                const ModeIcon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => { setActiveTab("profile"); setViewMode(mode.id); }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all relative z-10 cursor-pointer ${
                      isActive ? "text-white" : "text-text-muted hover:text-text"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="modeToggle"
                        className="absolute inset-0 bg-primary rounded-lg -z-10"
                        transition={{ type: "spring", stiffness: 500, damping: 32 }}
                      />
                    )}
                    <ModeIcon className="w-3.5 h-3.5" />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search anything…"
                className="w-full pl-9 pr-7 py-2 rounded-xl border border-border/80 bg-bg-base text-text text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-text-muted/60"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer">
                  <span className="text-xs font-bold">✕</span>
                </button>
              )}
            </div>
          </div>

          {/* Row 3: Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar -mx-1 px-1">
            {[
              { id: "all", label: "All", isTab: "profile" as const },
              { id: "personal", label: "Personal", isTab: "profile" as const },
              { id: "coding", label: "Coding", isTab: "profile" as const },
              { id: "academic", label: "Academics", isTab: "profile" as const },
              { id: "skills", label: `Skills${skills.length ? ` · ${skills.length}` : ""}`, isTab: "profile" as const },
              { id: "certifications", label: `Certs${certifications.length ? ` · ${certifications.length}` : ""}`, isTab: "profile" as const },
              { id: "achievements", label: `Awards${achievements.length ? ` · ${achievements.length}` : ""}`, isTab: "profile" as const },
              { id: "projects", label: `Projects${projects.length ? ` · ${projects.length}` : ""}`, isTab: "profile" as const },
              { id: "experience", label: `Experience${experiences.length ? ` · ${experiences.length}` : ""}`, isTab: "profile" as const },
              { id: "custom", label: "Custom", isTab: "profile" as const },
              { id: "copilot", label: "AI Copilot", isTab: "copilot" as const },
            ].map((cat) => {
              const isActive = cat.isTab === "copilot" ? activeTab === "copilot" : (activeTab === "profile" && categoryFilter === cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (cat.isTab === "copilot") { setActiveTab("copilot"); }
                    else { setActiveTab("profile"); setCategoryFilter(cat.id); }
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer relative z-10 ${
                    isActive
                      ? "text-white"
                      : "text-text-muted hover:text-text hover:bg-bg-base"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="categoryPill"
                      className="absolute inset-0 bg-primary rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 500, damping: 32 }}
                    />
                  )}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── STATUS BANNERS ─── */}
        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 text-xs font-semibold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Profile saved and synced across all pages.</span>
            </motion.div>
          )}
        </AnimatePresence>

        {saveError && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-semibold">
            {saveError}
          </div>
        )}

        {/* ─── PROFILE CONTENT ─── */}
        {activeTab === "profile" && (
          <div className="space-y-8">

            {/* SECTION 1: PERSONAL & SOCIAL PROFILES */}
            {(categoryFilter === "all" || categoryFilter === "personal") && (
              <div className="bg-surface border border-border/60 rounded-2xl p-5 md:p-6 space-y-5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/8 text-primary">
                    <User className="w-4 h-4" />
                  </div>
                  <h2 className="font-semibold text-[15px] text-text">Personal & Social</h2>
                </div>

                {viewMode === "edit" ? (
                  /* EDIT MODE */
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

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center space-x-1">
                        <Globe className="w-3.5 h-3.5 text-primary" />
                        <span>GitHub Profile</span>
                      </label>
                      <input
                        type="text"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        placeholder="github.com/username"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-base text-text text-xs font-semibold focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center space-x-1">
                        <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                        <span>LinkedIn Profile</span>
                      </label>
                      <input
                        type="text"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="linkedin.com/in/username"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-base text-text text-xs font-semibold focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Notice Period / Availability</span>
                      </label>
                      <input
                        type="text"
                        value={noticePeriod}
                        onChange={(e) => setNoticePeriod(e.target.value)}
                        placeholder="Immediate / 15 Days"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-base text-text text-xs font-semibold focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                ) : (
                  /* READ / COPY MODE */
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    {[
                      { key: "Full Name", val: fullName, icon: User },
                      { key: "Email", val: userEmail, icon: Mail },
                      { key: "Phone", val: phone, icon: Phone },
                      { key: "Location", val: location, icon: MapPin },
                      { key: "GitHub", val: github, icon: Globe },
                      { key: "LinkedIn", val: linkedin, icon: ExternalLink },
                      { key: "Notice Period", val: noticePeriod, icon: Clock },
                    ].filter(item => matchesSearch(item.key) || matchesSearch(item.val)).map((item, idx) => {
                      const IconComp = item.icon;
                      return (
                        <div
                          key={idx}
                          onClick={() => item.val && copyToClipboard(item.val, item.key)}
                          className={`p-3.5 md:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group relative ${
                            item.val
                              ? "bg-bg-base border-border/80 hover:border-primary/50 hover:shadow-sm"
                              : "bg-bg-base/40 border-border/30 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0 pr-2 flex-1">
                            <div className={`p-2.5 rounded-xl shrink-0 ${item.val ? "bg-primary/10 text-primary" : "bg-bg-base text-text-muted"}`}>
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div className="space-y-0.5 min-w-0 flex-1">
                              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">{item.key}</span>
                              <span className={`text-xs font-bold block truncate ${item.val ? "text-text" : "text-text-muted italic"}`}>
                                {item.val || "Not provided"}
                              </span>
                            </div>
                          </div>

                          {item.val && (
                            <div className="shrink-0 pl-1">
                              {copiedKey === item.key ? (
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md flex items-center space-x-1">
                                  <Check className="w-3 h-3" />
                                  <span>Copied</span>
                                </span>
                              ) : (
                                <span className="p-1.5 rounded-lg text-text-muted group-hover:text-primary group-hover:bg-primary/10 transition-all flex items-center gap-1 text-[11px] font-semibold">
                                  <Copy className="w-3.5 h-3.5" />
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* SECTION: CODING & PROBLEM SOLVING PROFILES */}
            {(categoryFilter === "all" || categoryFilter === "coding") && (
              <div className="bg-surface border border-border/60 rounded-2xl p-5 md:p-6 space-y-5">
                <div className="border-b border-border/40 pb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                      <Code className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-serif font-bold text-lg text-text">Coding Profiles & Competitive Programming</h2>
                      <p className="text-xs text-text-muted font-medium">Platform handles, competitive programming ratings, and coding profiles</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                    {[leetcode, codeforces, codechef, hackerrank, gfg].filter(Boolean).length} Active Profiles
                  </span>
                </div>

                {viewMode === "edit" ? (
                  /* EDIT MODE */
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span>LeetCode Profile / Username</span>
                      </label>
                      <input
                        type="text"
                        value={leetcode}
                        onChange={(e) => setLeetcode(e.target.value)}
                        placeholder="leetcode.com/u/username"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-base text-text text-xs font-semibold focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span>Codeforces Profile / Username</span>
                      </label>
                      <input
                        type="text"
                        value={codeforces}
                        onChange={(e) => setCodeforces(e.target.value)}
                        placeholder="codeforces.com/profile/username"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-base text-text text-xs font-semibold focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-amber-700"></span>
                        <span>CodeChef Profile / Username</span>
                      </label>
                      <input
                        type="text"
                        value={codechef}
                        onChange={(e) => setCodechef(e.target.value)}
                        placeholder="codechef.com/users/username"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-base text-text text-xs font-semibold focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>HackerRank Profile / Username</span>
                      </label>
                      <input
                        type="text"
                        value={hackerrank}
                        onChange={(e) => setHackerrank(e.target.value)}
                        placeholder="hackerrank.com/username"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-base text-text text-xs font-semibold focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2 md:col-span-1">
                      <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-green-600"></span>
                        <span>GeeksforGeeks Profile / Username</span>
                      </label>
                      <input
                        type="text"
                        value={gfg}
                        onChange={(e) => setGfg(e.target.value)}
                        placeholder="geeksforgeeks.org/user/username"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-base text-text text-xs font-semibold focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                ) : (
                  /* READ / COPY MODE */
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    {[
                      { key: "LeetCode", val: leetcode, platform: "LeetCode", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
                      { key: "Codeforces", val: codeforces, platform: "Codeforces", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
                      { key: "CodeChef", val: codechef, platform: "CodeChef", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20" },
                      { key: "HackerRank", val: hackerrank, platform: "HackerRank", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
                      { key: "GeeksforGeeks", val: gfg, platform: "GeeksforGeeks", color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
                    ].filter(item => matchesSearch(item.key) || matchesSearch(item.val) || matchesSearch(item.platform)).map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => item.val && copyToClipboard(item.val, item.key)}
                        className={`p-3.5 md:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group relative ${
                          item.val
                            ? "bg-bg-base border-border/80 hover:border-primary/50 hover:shadow-sm"
                            : "bg-bg-base/40 border-border/30 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0 pr-2 flex-1">
                          <div className={`p-2.5 rounded-xl border shrink-0 font-extrabold text-xs ${item.color}`}>
                            <Code className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">{item.platform}</span>
                            <span className={`text-xs font-bold block truncate ${item.val ? "text-text" : "text-text-muted italic"}`}>
                              {item.val || "Not provided"}
                            </span>
                          </div>
                        </div>

                        {item.val && (
                          <div className="shrink-0 pl-1 flex items-center space-x-1">
                            {copiedKey === item.key ? (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md flex items-center space-x-1">
                                <Check className="w-3 h-3" />
                                <span>Copied</span>
                              </span>
                            ) : (
                              <span className="p-1.5 rounded-lg text-text-muted group-hover:text-primary group-hover:bg-primary/10 transition-all flex items-center gap-1 text-[11px] font-semibold">
                                <Copy className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SECTION 2: ACADEMICS & CAREER BIO */}
            {(categoryFilter === "all" || categoryFilter === "academic") && (
              <div className="bg-surface border border-border/60 rounded-2xl p-5 md:p-6 space-y-5">
                <div className="border-b border-border/40 pb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-serif font-bold text-lg text-text">Academics & Career Bio</h2>
                      <p className="text-xs text-text-muted font-medium">Educational background, graduation metrics, and elevator pitch</p>
                    </div>
                  </div>
                  <span className="text-xs text-text-muted font-bold bg-bg-base border border-border px-3 py-1 rounded-full">College & Background</span>
                </div>

                {viewMode === "edit" ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1 sm:col-span-2">
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

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Career Bio / Elevator Summary</label>
                      <textarea
                        rows={3}
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder="High-performing Computer Science graduate with hands-on experience building microservice backends..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-base text-text text-xs font-semibold focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                      {[
                        { key: "College", val: college, icon: Building2 },
                        { key: "Branch / Degree", val: branch, icon: GraduationCap },
                        { key: "CGPA", val: cgpa, icon: Award },
                        { key: "Graduation Year", val: graduationYear, icon: Clock },
                      ].filter(item => matchesSearch(item.key) || matchesSearch(item.val)).map((item, idx) => {
                        const IconComp = item.icon;
                        return (
                          <div
                            key={idx}
                            onClick={() => item.val && copyToClipboard(item.val, item.key)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group relative ${
                              item.val
                                ? "bg-bg-base border-border/80 hover:border-primary/50 hover:shadow-sm"
                                : "bg-bg-base/40 border-border/30 opacity-60 hover:opacity-100"
                            }`}
                          >
                            <div className="flex items-center space-x-3 min-w-0 pr-2 flex-1">
                              <div className={`p-2.5 rounded-xl shrink-0 ${item.val ? "bg-primary/10 text-primary" : "bg-bg-base text-text-muted"}`}>
                                <IconComp className="w-4 h-4" />
                              </div>
                              <div className="space-y-0.5 min-w-0 flex-1">
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">{item.key}</span>
                                <span className={`text-xs font-bold block truncate ${item.val ? "text-text" : "text-text-muted italic"}`}>
                                  {item.val || "Not provided"}
                                </span>
                              </div>
                            </div>

                            {item.val && (
                              <div className="shrink-0 pl-1">
                                {copiedKey === item.key ? (
                                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md flex items-center space-x-1">
                                    <Check className="w-3 h-3" />
                                    <span>Copied</span>
                                  </span>
                                ) : (
                                  <span className="p-1.5 rounded-lg text-text-muted group-hover:text-primary group-hover:bg-primary/10 transition-all flex items-center gap-1 text-[11px] font-semibold">
                                    <Copy className="w-3.5 h-3.5" />
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {summary && (
                      <div
                        onClick={() => copyToClipboard(summary, "Career Bio")}
                        className="p-4 border border-border/80 rounded-2xl bg-bg-base hover:border-primary/50 transition-all cursor-pointer space-y-1.5 group relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Career Bio / Summary</span>
                          {copiedKey === "Career Bio" ? (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md flex items-center space-x-1">
                              <Check className="w-3 h-3" />
                              <span>Copied</span>
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-text-muted group-hover:text-primary flex items-center gap-1">
                              <Copy className="w-3.5 h-3.5" />
                              <span>Click to copy bio</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-text leading-relaxed whitespace-pre-wrap">{summary}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SECTION 3: TECHNICAL SKILLS */}
            {(categoryFilter === "all" || categoryFilter === "skills") && (
              <div className="bg-surface border border-border/60 rounded-2xl p-5 md:p-6 space-y-5">
                <div className="border-b border-border/40 pb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Code className="w-5 h-5 text-primary" />
                    <h2 className="font-serif font-bold text-lg text-text">Technical Skills Vault</h2>
                  </div>
                  <span className="text-xs text-text-muted font-bold">{skills.length} Skills Stored</span>
                </div>

                {viewMode === "edit" && (
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
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  {(Array.isArray(skills) ? skills : []).filter(s => matchesSearch(s)).map((skill, idx) => (
                    <span
                      key={idx}
                      onClick={() => copyToClipboard(skill, `Skill-${skill}`)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold cursor-pointer hover:bg-primary/20 transition-all"
                      title="Click to copy skill"
                    >
                      <span>{skill}</span>
                      {viewMode === "edit" && (
                        <button onClick={(e) => { e.stopPropagation(); handleRemoveSkill(idx); }} className="hover:text-red-500 cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CERTIFICATIONS & LICENSES VAULT */}
            {(categoryFilter === "all" || categoryFilter === "certifications") && (
              <div className="bg-surface border border-border/60 rounded-2xl p-5 md:p-6 space-y-5">
                <div className="border-b border-border/40 pb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-emerald-500" />
                    <h2 className="font-serif font-bold text-lg text-text">Certifications & Licenses Vault</h2>
                  </div>
                  <span className="text-xs text-text-muted font-bold">{certifications.length} Certifications Stored</span>
                </div>

                {viewMode === "edit" && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newCertInput}
                      onChange={(e) => setNewCertInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCert())}
                      placeholder="Add certification (e.g. AWS Certified Solutions Architect, Google Cloud Professional)"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-border bg-bg-base text-text text-xs font-semibold focus:outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={handleAddCert}
                      className="px-4 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 transition-all cursor-pointer"
                    >
                      Add Certification
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  {(Array.isArray(certifications) ? certifications : []).filter(c => matchesSearch(c)).map((cert, idx) => (
                    <span
                      key={idx}
                      onClick={() => copyToClipboard(cert, `Cert-${cert}`)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold cursor-pointer hover:bg-emerald-500/20 transition-all"
                      title="Click to copy certification"
                    >
                      <Award className="w-3.5 h-3.5 shrink-0" />
                      <span>{cert}</span>
                      {viewMode === "edit" && (
                        <button onClick={(e) => { e.stopPropagation(); handleRemoveCert(idx); }} className="hover:text-red-500 cursor-pointer ml-1">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      )}
                    </span>
                  ))}
                  {certifications.length === 0 && (
                    <p className="text-xs text-text-muted italic">No certifications stored yet. Click "Edit Profile Vault" to add your professional certificates.</p>
                  )}
                </div>
              </div>
            )}

            {/* ACHIEVEMENTS & AWARDS VAULT */}
            {(categoryFilter === "all" || categoryFilter === "achievements") && (
              <div className="bg-surface border border-border/60 rounded-2xl p-5 md:p-6 space-y-5">
                <div className="border-b border-border/40 pb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h2 className="font-serif font-bold text-lg text-text">Achievements & Awards Vault</h2>
                  </div>
                  <span className="text-xs text-text-muted font-bold">{achievements.length} Achievements Stored</span>
                </div>

                {viewMode === "edit" && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newAchievementInput}
                      onChange={(e) => setNewAchievementInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddAchievement())}
                      placeholder="Add achievement (e.g. 1st Rank in Smart India Hackathon 2025, Published IEEE paper)"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-border bg-bg-base text-text text-xs font-semibold focus:outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={handleAddAchievement}
                      className="px-4 py-2.5 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-400 transition-all cursor-pointer"
                    >
                      Add Achievement
                    </button>
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  {(Array.isArray(achievements) ? achievements : []).filter(a => matchesSearch(a)).map((ach, idx) => (
                    <div
                      key={idx}
                      onClick={() => copyToClipboard(ach, `Ach-${idx}`)}
                      className="p-3 border border-border/80 rounded-2xl bg-bg-base hover:border-amber-500/50 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="text-xs font-bold text-text truncate">{ach}</span>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        {copiedKey === `Ach-${idx}` ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-md">
                            Copied
                          </span>
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-text-muted group-hover:text-amber-500" />
                        )}

                        {viewMode === "edit" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveAchievement(idx);
                            }}
                            className="p-1 text-text-muted hover:text-red-500 transition-colors cursor-pointer"
                            title="Delete Achievement"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {achievements.length === 0 && (
                    <p className="text-xs text-text-muted italic">No achievements stored yet. Click "Edit Profile Vault" to add your hackathons, ranks, awards, and publications.</p>
                  )}
                </div>
              </div>
            )}

            {/* SECTION 4: CUSTOM FIELDS VAULT (ADD ANY CUSTOM DETAIL) */}
            {(categoryFilter === "all" || categoryFilter === "custom") && (
              <div className="bg-surface border border-border/60 rounded-2xl p-5 md:p-6 space-y-5">
                <div className="border-b border-border/40 pb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Tag className="w-5 h-5 text-primary" />
                    <h2 className="font-serif font-bold text-lg text-text">Custom Information Vault (Key-Value Pairs)</h2>
                  </div>
                  <span className="text-xs text-text-muted font-bold">{customFields.length} Custom Fields</span>
                </div>

                {/* Add Custom Detail Form - Edit mode only */}
                {viewMode === "edit" && (
                  <div className="p-4 border border-primary/30 rounded-2xl bg-primary/5 space-y-3">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center space-x-1">
                      <PlusCircle className="w-4 h-4" />
                      <span>Add Custom Detail Field (e.g., Preferred CTC, Portfolio, Achievements)</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                      <input
                        type="text"
                        value={newCustomKey}
                        onChange={(e) => setNewCustomKey(e.target.value)}
                        placeholder="Field Name (e.g., Target CTC)"
                        className="sm:col-span-2 px-3.5 py-2 rounded-xl border border-border bg-bg-base text-text text-xs font-bold focus:outline-none"
                      />
                      <input
                        type="text"
                        value={newCustomVal}
                        onChange={(e) => setNewCustomVal(e.target.value)}
                        placeholder="Field Value (e.g., 12-15 LPA)"
                        className="sm:col-span-2 px-3.5 py-2 rounded-xl border border-border bg-bg-base text-text text-xs font-semibold focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomField}
                        className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 transition-all cursor-pointer"
                      >
                        + Add Field
                      </button>
                    </div>
                  </div>
                )}

                {/* Custom Fields List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(Array.isArray(customFields) ? customFields : []).filter(cf => matchesSearch(cf.key) || matchesSearch(cf.value)).map((cf) => (
                    <div
                      key={cf.id}
                      onClick={() => copyToClipboard(cf.value, cf.key)}
                      className="p-3.5 border border-border/80 rounded-2xl bg-bg-base hover:border-primary/50 transition-all cursor-pointer flex items-center justify-between group relative"
                    >
                      <div className="space-y-0.5 min-w-0 pr-2 flex-1">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">{cf.key}</span>
                        <span className="text-xs font-bold text-text truncate block">{cf.value}</span>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        {copiedKey === cf.key ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-md">
                            Copied
                          </span>
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-text-muted group-hover:text-primary" />
                        )}

                        {viewMode === "edit" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveCustomField(cf.id);
                            }}
                            className="p-1 text-text-muted hover:text-red-500 transition-colors"
                            title="Delete Custom Field"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 5: PROJECTS */}
            {(categoryFilter === "all" || categoryFilter === "projects") && (
              <div className="bg-surface border border-border/60 rounded-2xl p-5 md:p-6 space-y-5">
                <div className="border-b border-border/40 pb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 className="font-serif font-bold text-lg text-text">Key Engineering Projects</h2>
                  </div>
                  {viewMode === "edit" && (
                    <button
                      onClick={handleAddProject}
                      className="px-3.5 py-1.5 bg-primary/10 border border-primary/30 text-primary text-xs font-bold rounded-full hover:bg-primary/20 transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Project</span>
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {(Array.isArray(projects) ? projects : []).filter(p => matchesSearch(p.title) || matchesSearch(p.techStack) || matchesSearch(p.description)).map((proj) => (
                    <div key={proj.id} className="p-4 border border-border rounded-2xl bg-bg-base space-y-3 relative group">
                      {viewMode === "edit" && (
                        <button
                          onClick={() => handleRemoveProject(proj.id)}
                          className="absolute top-4 right-4 text-text-muted hover:text-red-500 transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      {viewMode === "edit" ? (
                        <div className="space-y-3 pr-8">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      ) : (
                        <div
                          onClick={() => copyToClipboard(`${proj.title} (${proj.techStack}): ${proj.description}`, proj.title)}
                          className="space-y-1 cursor-pointer pr-8"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-sm text-text flex items-center space-x-2">
                              <span>{proj.title}</span>
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                {proj.techStack}
                              </span>
                            </h3>
                            <Copy className="w-3.5 h-3.5 text-text-muted group-hover:text-primary" />
                          </div>
                          <p className="text-xs text-text-muted font-medium">{proj.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 6: EXPERIENCE & INTERNSHIPS */}
            {(categoryFilter === "all" || categoryFilter === "experience") && (
              <div className="bg-surface border border-border/60 rounded-2xl p-5 md:p-6 space-y-5">
                <div className="border-b border-border/40 pb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    <h2 className="font-serif font-bold text-lg text-text">Experience & Internships</h2>
                  </div>
                  {viewMode === "edit" && (
                    <button
                      onClick={handleAddExperience}
                      className="px-3.5 py-1.5 bg-primary/10 border border-primary/30 text-primary text-xs font-bold rounded-full hover:bg-primary/20 transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Experience</span>
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {(Array.isArray(experiences) ? experiences : []).filter(e => matchesSearch(e.role) || matchesSearch(e.company) || matchesSearch(e.description)).map((exp) => (
                    <div key={exp.id} className="p-4 border border-border rounded-2xl bg-bg-base space-y-3 relative group">
                      {viewMode === "edit" && (
                        <button
                          onClick={() => handleRemoveExperience(exp.id)}
                          className="absolute top-4 right-4 text-text-muted hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      {viewMode === "edit" ? (
                        <div className="space-y-3 pr-8">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                      ) : (
                        <div
                          onClick={() => copyToClipboard(`${exp.role} at ${exp.company} (${exp.duration}): ${exp.description}`, exp.role)}
                          className="space-y-1 cursor-pointer pr-8"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-sm text-text">
                              {exp.role} <span className="text-primary font-normal">at {exp.company}</span>
                              <span className="text-xs text-text-muted font-normal ml-2">({exp.duration})</span>
                            </h3>
                            <Copy className="w-3.5 h-3.5 text-text-muted group-hover:text-primary" />
                          </div>
                          <p className="text-xs text-text-muted font-medium">{exp.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                  Companies asking custom application questions? Paste any question below. Our AI answers directly using your real college, CGPA, projects, skills, and custom fields stored in My Space.
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
                      onClick={() => {
                        navigator.clipboard.writeText(aiAnswer);
                        setCopiedAnswer(true);
                        setTimeout(() => setCopiedAnswer(false), 2000);
                      }}
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

      </div>
    </AppLayout>
  );
}
