"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  FileText, 
  Upload, 
  Plus, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Check, 
  User, 
  GraduationCap, 
  Briefcase, 
  FolderGit2, 
  Code2, 
  Move, 
  Maximize2, 
  ArrowLeft, 
  Save, 
  Download, 
  Type, 
  X, 
  Layers, 
  Edit3, 
  RotateCcw,
  Building2,
  Calendar,
  ExternalLink
} from "lucide-react";
import AppLayout from "@/components/AppLayout";

export interface SavedResumeItem {
  id: string;
  resumeName: string | null;
  targetRole: string | null;
  createdAt: string;
  inputData: string;
}

export interface CanvasBox {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  isBold: boolean;
  color: string;
}

export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  summary: string;
  education: Array<{ id: string; school: string; degree: string; year: string; location: string; gpa: string }>;
  experience: Array<{ id: string; company: string; role: string; duration: string; location: string; points: string[] }>;
  projects: Array<{ id: string; title: string; tech: string; link: string; description: string }>;
  skills: string[];
  certifications: string[];
  canvasBoxes: CanvasBox[];
}

const DEFAULT_RESUME: ResumeData = {
  fullName: "Alex Morgan",
  email: "alex.morgan@example.com",
  phone: "+1 (555) 019-2834",
  location: "San Francisco, CA",
  linkedin: "linkedin.com/in/alexmorgan",
  github: "github.com/alexmorgan",
  summary: "Results-driven Software Engineer with 3+ years of experience building scalable web applications and distributed cloud services.",
  education: [
    {
      id: "edu_1",
      school: "University of California, Berkeley",
      degree: "B.S. in Computer Science",
      year: "2020 – 2024",
      location: "Berkeley, CA",
      gpa: "3.8 / 4.0",
    },
  ],
  experience: [
    {
      id: "exp_1",
      company: "TechCorp Labs",
      role: "Software Engineer",
      duration: "Jun 2024 – Present",
      location: "San Francisco, CA",
      points: [
        "Architected microservices handling over 2M daily requests with 99.99% uptime.",
        "Optimized database queries resulting in a 40% reduction in API response times.",
      ],
    },
  ],
  projects: [
    {
      id: "proj_1",
      title: "ATS Resume Optimizer",
      tech: "Next.js, TypeScript, OpenAI API, Tailwind CSS",
      link: "github.com/alex/ats-resume",
      description: "Built an AI-powered ATS resume parsing engine analyzing job description keywords in real time.",
    },
  ],
  skills: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Docker", "AWS", "Python"],
  certifications: ["AWS Certified Solutions Architect", "Google Cloud Associate Engineer"],
  canvasBoxes: [
    {
      id: "box_1",
      text: "⚡ Top 5% ATS Match Score Guaranteed",
      x: 350,
      y: 20,
      width: 240,
      height: 40,
      fontSize: 11,
      isBold: true,
      color: "#01696f",
    },
  ],
};

type SectionTab = "personal" | "education" | "experience" | "projects" | "skills" | "canvas";

export default function EditClient({ savedResumes }: { savedResumes: SavedResumeItem[] }) {
  const [startMode, setStartMode] = useState<"CHOOSE" | "EDITOR">("CHOOSE");
  const [activeTab, setActiveTab] = useState<SectionTab>("personal");
  const [resumeData, setResumeData] = useState<ResumeData>(DEFAULT_RESUME);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);

  // Parsing & File state
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Canvas Drag & Resize state
  const [activeBoxId, setActiveBoxId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; boxX: number; boxY: number; boxW: number; boxH: number }>({
    mouseX: 0,
    mouseY: 0,
    boxX: 0,
    boxY: 0,
    boxW: 0,
    boxH: 0,
  });

  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Start Options Handlers
  const handleStartBlank = () => {
    setResumeData({
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      summary: "",
      education: [],
      experience: [],
      projects: [],
      skills: [],
      certifications: [],
      canvasBoxes: [],
    });
    setSelectedResumeId(null);
    setStartMode("EDITOR");
  };

  const handleSelectSavedResume = (item: SavedResumeItem) => {
    try {
      const parsed = JSON.parse(item.inputData);
      setResumeData({
        fullName: parsed.name || parsed.fullName || "Candidate Resume",
        email: parsed.email || "",
        phone: parsed.phone || "",
        location: parsed.location || "",
        linkedin: parsed.linkedin || "",
        github: parsed.github || "",
        summary: parsed.summary || "",
        education: parsed.education || DEFAULT_RESUME.education,
        experience: parsed.experience || DEFAULT_RESUME.experience,
        projects: parsed.projects || DEFAULT_RESUME.projects,
        skills: parsed.skills ? (Array.isArray(parsed.skills) ? parsed.skills : parsed.skills.split(",")) : DEFAULT_RESUME.skills,
        certifications: parsed.certifications || [],
        canvasBoxes: [],
      });
      setSelectedResumeId(item.id);
      setStartMode("EDITOR");
    } catch {
      setResumeData(DEFAULT_RESUME);
      setStartMode("EDITOR");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setParseError(null);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to parse resume file");

      const data = await res.json();
      setResumeData({
        fullName: data.name || data.fullName || file.name.replace(/\.[^/.]+$/, ""),
        email: data.email || "",
        phone: data.phone || "",
        location: data.location || "",
        linkedin: data.linkedin || "",
        github: data.github || "",
        summary: data.summary || "",
        education: data.education || DEFAULT_RESUME.education,
        experience: data.experience || DEFAULT_RESUME.experience,
        projects: data.projects || DEFAULT_RESUME.projects,
        skills: data.skills || DEFAULT_RESUME.skills,
        certifications: data.certifications || [],
        canvasBoxes: [],
      });
      setStartMode("EDITOR");
    } catch (err: any) {
      setParseError(err.message || "Could not parse file. You can start blank or edit manually.");
    } finally {
      setIsParsing(false);
    }
  };

  // Canvas Drag & Resize Event Handlers
  const handleMouseDownBox = (e: React.MouseEvent, box: CanvasBox, resize: boolean) => {
    e.stopPropagation();
    setActiveBoxId(box.id);
    if (resize) {
      setIsResizing(true);
    } else {
      setIsDragging(true);
    }

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      boxX: box.x,
      boxY: box.y,
      boxW: box.width,
      boxH: box.height,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!activeBoxId) return;

      const deltaX = e.clientX - dragStartRef.current.mouseX;
      const deltaY = e.clientY - dragStartRef.current.mouseY;

      setResumeData((prev) => ({
        ...prev,
        canvasBoxes: prev.canvasBoxes.map((b) => {
          if (b.id !== activeBoxId) return b;

          if (isDragging) {
            return {
              ...b,
              x: Math.max(0, dragStartRef.current.boxX + deltaX),
              y: Math.max(0, dragStartRef.current.boxY + deltaY),
            };
          }

          if (isResizing) {
            return {
              ...b,
              width: Math.max(80, dragStartRef.current.boxW + deltaX),
              height: Math.max(30, dragStartRef.current.boxH + deltaY),
            };
          }

          return b;
        }),
      }));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [activeBoxId, isDragging, isResizing]);

  // Canvas Box Operations
  const addCanvasBox = () => {
    const newBox: CanvasBox = {
      id: "box_" + Date.now(),
      text: "Double-click or edit text",
      x: 40,
      y: 100 + resumeData.canvasBoxes.length * 50,
      width: 200,
      height: 40,
      fontSize: 12,
      isBold: false,
      color: "#01696f",
    };
    setResumeData((prev) => ({ ...prev, canvasBoxes: [...prev.canvasBoxes, newBox] }));
    setActiveBoxId(newBox.id);
  };

  const removeCanvasBox = (id: string) => {
    setResumeData((prev) => ({ ...prev, canvasBoxes: prev.canvasBoxes.filter((b) => b.id !== id) }));
    if (activeBoxId === id) setActiveBoxId(null);
  };

  const updateCanvasBox = (id: string, updates: Partial<CanvasBox>) => {
    setResumeData((prev) => ({
      ...prev,
      canvasBoxes: prev.canvasBoxes.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    }));
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in font-sans">
        {/* =========================================================================
            VIEW 1: STARTER SELECTION MODE (Blank, Select Saved, Upload)
            ========================================================================= */}
        {startMode === "CHOOSE" ? (
          <div className="space-y-8 max-w-4xl mx-auto pt-4 pb-12">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-primary/10 text-primary border border-primary/20 inline-flex items-center space-x-1.5">
                <Edit3 className="w-3.5 h-3.5" />
                <span>Interactive Resume Editor Workspace</span>
              </span>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-text">How would you like to start?</h1>
              <p className="text-xs text-text-muted font-medium max-w-md mx-auto">
                Select an existing saved resume, upload a PDF/Word file to parse, or start with a blank interactive canvas.
              </p>
            </div>

            {/* 3 Starter Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Option A: Start Blank */}
              <div
                onClick={handleStartBlank}
                className="group bg-surface border-2 border-border/80 hover:border-primary rounded-3xl p-6 space-y-4 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-text">Start Blank Canvas</h3>
                  <p className="text-xs text-text-muted">
                    Begin with an empty template canvas and fill in your details section by section.
                  </p>
                </div>
                <button type="button" className="w-full py-2.5 bg-primary/10 group-hover:bg-primary text-primary group-hover:text-white rounded-xl text-xs font-bold transition-all">
                  Create Blank Resume
                </button>
              </div>

              {/* Option B: Select Saved Resume */}
              <div className="bg-surface border-2 border-border/80 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-text">Edit Saved Resume</h3>
                  <p className="text-xs text-text-muted">
                    Select one of your previously saved ATS resumes from your account vault.
                  </p>

                  {savedResumes.length === 0 ? (
                    <p className="text-[11px] text-text-muted italic pt-2">No saved resumes found yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                      {savedResumes.slice(0, 4).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectSavedResume(item)}
                          className="w-full p-2 rounded-xl bg-bg-base hover:bg-primary/10 hover:text-primary text-left text-xs font-bold border border-border/40 transition-all truncate flex items-center justify-between cursor-pointer"
                        >
                          <span className="truncate">{item.resumeName || item.targetRole || "Saved Resume"}</span>
                          <Edit3 className="w-3.5 h-3.5 shrink-0 opacity-60 ml-1" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Option C: Upload & Parse */}
              <label className="group bg-surface border-2 border-dashed border-border/80 hover:border-primary rounded-3xl p-6 space-y-4 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between relative">
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isParsing}
                />
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {isParsing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                  </div>
                  <h3 className="text-lg font-bold text-text">Upload Resume (PDF/Word)</h3>
                  <p className="text-xs text-text-muted">
                    Upload your existing PDF or Word file to automatically parse and load all sections.
                  </p>

                  {parseError && (
                    <p className="text-[11px] font-bold text-rose-500 bg-rose-500/10 p-2 rounded-lg">{parseError}</p>
                  )}
                </div>

                <div className="w-full py-2.5 bg-sky-500/10 group-hover:bg-sky-500 text-sky-600 group-hover:text-white rounded-xl text-xs font-bold transition-all text-center">
                  {isParsing ? "Parsing Resume..." : "Choose File to Upload"}
                </div>
              </label>
            </div>
          </div>
        ) : (
          /* =========================================================================
             VIEW 2: SPLIT-SCREEN INTERACTIVE EDITOR (Left Form / Right Preview)
             ========================================================================= */
          <div className="space-y-4">
            {/* Top Workspace Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setStartMode("CHOOSE")}
                  className="p-2 rounded-xl bg-surface border border-border text-text-muted hover:text-text transition-colors cursor-pointer"
                  title="Back to starter options"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div>
                  <h1 className="text-xl font-serif font-bold text-text flex items-center space-x-2">
                    <span>{resumeData.fullName || "Untitled Resume"}</span>
                  </h1>
                  <span className="text-[11px] text-text-muted font-medium">Split-View Live Canvas Editor</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={addCanvasBox}
                  className="px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Canvas Text Box</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-full bg-primary text-white hover:bg-primary/95 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export PDF</span>
                </button>
              </div>
            </div>

            {/* Horizontal Section Selector Tabs (Top Bar) */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-border/40">
              {[
                { id: "personal", label: "Personal Info", icon: User },
                { id: "education", label: "Education", icon: GraduationCap },
                { id: "experience", label: "Experience", icon: Briefcase },
                { id: "projects", label: "Projects", icon: FolderGit2 },
                { id: "skills", label: "Skills & Certs", icon: Code2 },
                { id: "canvas", label: "Canvas Text Boxes", icon: Layers },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as SectionTab)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
                      isActive
                        ? "bg-primary text-white shadow-xs"
                        : "bg-surface text-text-muted hover:text-text border border-border/60"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Split Screen Grid Layout (50% Form / 50% Live Canvas Preview) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Side (Column 5): Section Input Form */}
              <div className="lg:col-span-5 bg-surface border border-border/80 rounded-3xl p-5 space-y-5 shadow-xs max-h-[80vh] overflow-y-auto">
                {/* Section 1: Personal Info */}
                {activeTab === "personal" && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm text-text border-b border-border/40 pb-2">Personal Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-extrabold uppercase text-text-muted block mb-1">Full Name</label>
                        <input
                          type="text"
                          value={resumeData.fullName}
                          onChange={(e) => setResumeData({ ...resumeData, fullName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-bg-base border border-border text-xs text-text focus:outline-none focus:border-primary font-medium"
                          placeholder="e.g. Alex Morgan"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-extrabold uppercase text-text-muted block mb-1">Email</label>
                          <input
                            type="email"
                            value={resumeData.email}
                            onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-bg-base border border-border text-xs text-text focus:outline-none focus:border-primary font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-extrabold uppercase text-text-muted block mb-1">Phone</label>
                          <input
                            type="text"
                            value={resumeData.phone}
                            onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-bg-base border border-border text-xs text-text focus:outline-none focus:border-primary font-medium"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-extrabold uppercase text-text-muted block mb-1">Location</label>
                          <input
                            type="text"
                            value={resumeData.location}
                            onChange={(e) => setResumeData({ ...resumeData, location: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-bg-base border border-border text-xs text-text focus:outline-none focus:border-primary font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-extrabold uppercase text-text-muted block mb-1">LinkedIn</label>
                          <input
                            type="text"
                            value={resumeData.linkedin}
                            onChange={(e) => setResumeData({ ...resumeData, linkedin: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-bg-base border border-border text-xs text-text focus:outline-none focus:border-primary font-medium"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold uppercase text-text-muted block mb-1">Professional Summary</label>
                        <textarea
                          rows={3}
                          value={resumeData.summary}
                          onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-bg-base border border-border text-xs text-text focus:outline-none focus:border-primary font-medium resize-y"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 2: Education */}
                {activeTab === "education" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <h3 className="font-bold text-sm text-text">Education History</h3>
                      <button
                        type="button"
                        onClick={() =>
                          setResumeData({
                            ...resumeData,
                            education: [
                              ...resumeData.education,
                              { id: "edu_" + Date.now(), school: "University", degree: "B.S. Computer Science", year: "2020 – 2024", location: "City, State", gpa: "3.8" },
                            ],
                          })
                        }
                        className="text-xs font-bold text-primary flex items-center space-x-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Education</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {resumeData.education.map((edu, idx) => (
                        <div key={edu.id} className="p-3 bg-bg-base rounded-2xl border border-border space-y-2 relative">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-extrabold text-primary">School #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setResumeData({
                                  ...resumeData,
                                  education: resumeData.education.filter((e) => e.id !== edu.id),
                                })
                              }
                              className="text-rose-500 hover:text-rose-600 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="School Name"
                            value={edu.school}
                            onChange={(e) =>
                              setResumeData({
                                ...resumeData,
                                education: resumeData.education.map((item) => (item.id === edu.id ? { ...item, school: e.target.value } : item)),
                              })
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs text-text font-semibold"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Degree"
                              value={edu.degree}
                              onChange={(e) =>
                                setResumeData({
                                  ...resumeData,
                                  education: resumeData.education.map((item) => (item.id === edu.id ? { ...item, degree: e.target.value } : item)),
                                })
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs text-text font-medium"
                            />
                            <input
                              type="text"
                              placeholder="Year (e.g. 2020 - 2024)"
                              value={edu.year}
                              onChange={(e) =>
                                setResumeData({
                                  ...resumeData,
                                  education: resumeData.education.map((item) => (item.id === edu.id ? { ...item, year: e.target.value } : item)),
                                })
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs text-text font-medium"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 3: Experience */}
                {activeTab === "experience" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <h3 className="font-bold text-sm text-text">Work Experience</h3>
                      <button
                        type="button"
                        onClick={() =>
                          setResumeData({
                            ...resumeData,
                            experience: [
                              ...resumeData.experience,
                              { id: "exp_" + Date.now(), company: "Company Name", role: "Software Engineer", duration: "2023 - Present", location: "Remote", points: ["Accomplished X resulting in Y."] },
                            ],
                          })
                        }
                        className="text-xs font-bold text-primary flex items-center space-x-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Experience</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {resumeData.experience.map((exp, idx) => (
                        <div key={exp.id} className="p-3 bg-bg-base rounded-2xl border border-border space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-extrabold text-primary">Role #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setResumeData({
                                  ...resumeData,
                                  experience: resumeData.experience.filter((e) => e.id !== exp.id),
                                })
                              }
                              className="text-rose-500 hover:text-rose-600 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Company Name"
                            value={exp.company}
                            onChange={(e) =>
                              setResumeData({
                                ...resumeData,
                                experience: resumeData.experience.map((item) => (item.id === exp.id ? { ...item, company: e.target.value } : item)),
                              })
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs text-text font-semibold"
                          />
                          <input
                            type="text"
                            placeholder="Job Title / Role"
                            value={exp.role}
                            onChange={(e) =>
                              setResumeData({
                                ...resumeData,
                                experience: resumeData.experience.map((item) => (item.id === exp.id ? { ...item, role: e.target.value } : item)),
                              })
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs text-text font-medium"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 4: Projects */}
                {activeTab === "projects" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <h3 className="font-bold text-sm text-text">Key Projects</h3>
                      <button
                        type="button"
                        onClick={() =>
                          setResumeData({
                            ...resumeData,
                            projects: [
                              ...resumeData.projects,
                              { id: "proj_" + Date.now(), title: "Project Title", tech: "React, Node.js", link: "github.com/user/repo", description: "Built full stack web application." },
                            ],
                          })
                        }
                        className="text-xs font-bold text-primary flex items-center space-x-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Project</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {resumeData.projects.map((proj, idx) => (
                        <div key={proj.id} className="p-3 bg-bg-base rounded-2xl border border-border space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-extrabold text-primary">Project #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setResumeData({
                                  ...resumeData,
                                  projects: resumeData.projects.filter((p) => p.id !== proj.id),
                                })
                              }
                              className="text-rose-500 hover:text-rose-600 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Project Title"
                            value={proj.title}
                            onChange={(e) =>
                              setResumeData({
                                ...resumeData,
                                projects: resumeData.projects.map((item) => (item.id === proj.id ? { ...item, title: e.target.value } : item)),
                              })
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs text-text font-semibold"
                          />
                          <input
                            type="text"
                            placeholder="Tech Stack (e.g. Next.js, Python)"
                            value={proj.tech}
                            onChange={(e) =>
                              setResumeData({
                                ...resumeData,
                                projects: resumeData.projects.map((item) => (item.id === proj.id ? { ...item, tech: e.target.value } : item)),
                              })
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs text-text font-medium"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 5: Skills & Certs */}
                {activeTab === "skills" && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm text-text border-b border-border/40 pb-2">Skills & Certifications</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-extrabold uppercase text-text-muted block mb-1">Technical Skills (Comma separated)</label>
                        <textarea
                          rows={3}
                          value={resumeData.skills.join(", ")}
                          onChange={(e) =>
                            setResumeData({
                              ...resumeData,
                              skills: e.target.value.split(",").map((s) => s.trim()),
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-bg-base border border-border text-xs text-text font-medium"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 6: Canvas Text Boxes */}
                {activeTab === "canvas" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <h3 className="font-bold text-sm text-text">Custom Canvas Text Blocks</h3>
                      <button
                        type="button"
                        onClick={addCanvasBox}
                        className="text-xs font-bold text-primary flex items-center space-x-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Block</span>
                      </button>
                    </div>

                    {resumeData.canvasBoxes.length === 0 ? (
                      <p className="text-xs text-text-muted italic text-center py-4">No custom text boxes placed on canvas.</p>
                    ) : (
                      <div className="space-y-3">
                        {resumeData.canvasBoxes.map((box, idx) => (
                          <div
                            key={box.id}
                            onClick={() => setActiveBoxId(box.id)}
                            className={`p-3 rounded-2xl border transition-all space-y-2 cursor-pointer ${
                              activeBoxId === box.id
                                ? "bg-primary/10 border-primary shadow-2xs"
                                : "bg-bg-base border-border hover:border-border/80"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-extrabold text-text">Block #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeCanvasBox(box.id);
                                }}
                                className="text-rose-500 hover:text-rose-600 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={box.text}
                              onChange={(e) => updateCanvasBox(box.id, { text: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs text-text font-medium"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Side (Column 7): Live Canvas Document Preview */}
              <div className="lg:col-span-7 bg-bg-base border border-border rounded-3xl p-6 shadow-sm relative min-h-[680px] flex flex-col items-center">
                <div className="w-full flex items-center justify-between border-b border-border/40 pb-3 mb-4">
                  <span className="text-xs font-extrabold text-text-muted uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span>Live Interactive Template Canvas</span>
                  </span>
                  <span className="text-[10px] text-primary font-bold bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                    Drag & Resize Text Blocks Enabled
                  </span>
                </div>

                {/* Printable Document Paper */}
                <div
                  ref={previewContainerRef}
                  className="w-full max-w-[580px] bg-white text-gray-900 rounded-xl p-8 shadow-xl relative min-h-[720px] font-sans border border-gray-200 select-none overflow-hidden"
                >
                  {/* Header / Name */}
                  <div className="border-b border-gray-300 pb-4 mb-4">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{resumeData.fullName || "Candidate Name"}</h1>
                    <div className="text-[11px] text-gray-600 flex flex-wrap items-center gap-2 pt-1 font-medium">
                      {resumeData.email && <span>{resumeData.email}</span>}
                      {resumeData.phone && <span>• {resumeData.phone}</span>}
                      {resumeData.location && <span>• {resumeData.location}</span>}
                      {resumeData.linkedin && <span>• {resumeData.linkedin}</span>}
                    </div>
                  </div>

                  {/* Summary */}
                  {resumeData.summary && (
                    <div className="mb-4">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-teal-800 border-b border-gray-200 pb-1 mb-1.5">
                        Professional Summary
                      </h2>
                      <p className="text-[11px] text-gray-700 leading-relaxed">{resumeData.summary}</p>
                    </div>
                  )}

                  {/* Experience */}
                  {resumeData.experience.length > 0 && (
                    <div className="mb-4">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-teal-800 border-b border-gray-200 pb-1 mb-2">
                        Work Experience
                      </h2>
                      <div className="space-y-2.5">
                        {resumeData.experience.map((exp) => (
                          <div key={exp.id} className="space-y-0.5">
                            <div className="flex justify-between items-baseline">
                              <span className="text-xs font-bold text-gray-900">{exp.role}</span>
                              <span className="text-[10px] text-gray-500 font-medium">{exp.duration}</span>
                            </div>
                            <div className="text-[11px] font-semibold text-teal-700">{exp.company}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {resumeData.education.length > 0 && (
                    <div className="mb-4">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-teal-800 border-b border-gray-200 pb-1 mb-2">
                        Education
                      </h2>
                      <div className="space-y-2">
                        {resumeData.education.map((edu) => (
                          <div key={edu.id} className="flex justify-between items-baseline">
                            <div>
                              <span className="text-xs font-bold text-gray-900">{edu.school}</span>
                              <span className="text-[11px] text-gray-600 block">{edu.degree}</span>
                            </div>
                            <span className="text-[10px] text-gray-500 font-medium">{edu.year}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {resumeData.skills.length > 0 && (
                    <div className="mb-4">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-teal-800 border-b border-gray-200 pb-1 mb-1.5">
                        Skills
                      </h2>
                      <div className="flex flex-wrap gap-1">
                        {resumeData.skills.map((skill, i) => (
                          <span key={i} className="text-[10px] bg-gray-100 text-gray-800 px-2 py-0.5 rounded-md font-semibold">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interactive Draggable & Resizable Canvas Text Blocks Overlay */}
                  {resumeData.canvasBoxes.map((box) => {
                    const isSelected = activeBoxId === box.id;

                    return (
                      <div
                        key={box.id}
                        onMouseDown={(e) => handleMouseDownBox(e, box, false)}
                        style={{
                          left: `${box.x}px`,
                          top: `${box.y}px`,
                          width: `${box.width}px`,
                          height: `${box.height}px`,
                          fontSize: `${box.fontSize}px`,
                          color: box.color,
                        }}
                        className={`absolute rounded-xl p-2 border-2 transition-shadow cursor-move flex items-center justify-between ${
                          isSelected
                            ? "border-primary bg-primary/10 shadow-lg ring-2 ring-primary/30 z-30"
                            : "border-dashed border-primary/40 bg-white/90 hover:border-primary/80 z-20"
                        }`}
                      >
                        <div className="flex items-center space-x-1.5 overflow-hidden w-full">
                          <Move className="w-3 h-3 text-primary shrink-0 opacity-60" />
                          <span className="font-extrabold truncate text-xs">{box.text}</span>
                        </div>

                        {/* Delete Handle */}
                        {isSelected && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeCanvasBox(box.id);
                            }}
                            className="text-rose-500 hover:text-rose-700 p-0.5 shrink-0"
                            title="Delete Box"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}

                        {/* Resize Handle at Bottom Right */}
                        <div
                          onMouseDown={(e) => handleMouseDownBox(e, box, true)}
                          className="absolute right-0 bottom-0 w-4 h-4 bg-primary text-white rounded-tl-md rounded-br-md cursor-se-resize flex items-center justify-center z-40"
                          title="Drag to resize box"
                        >
                          <Maximize2 className="w-2.5 h-2.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
