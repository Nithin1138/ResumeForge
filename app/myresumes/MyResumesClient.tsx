"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  Plus, 
  Search, 
  Calendar, 
  Edit2, 
  CheckCircle2, 
  ChevronRight, 
  Trash2, 
  Sparkles, 
  Tag, 
  Check, 
  Loader2,
  ArrowLeft
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { EditTitle, DeleteButton } from "@/components/DashboardActions";

export interface ResumeItem {
  id: string;
  resumeName?: string | null;
  targetRole?: string | null;
  branch?: string | null;
  cgpa?: string | null;
  college?: string | null;
  createdAt: string;
  paymentStatus: string;
  inputData: string;
  categoryTag?: string | null;
}

const CATEGORIES = [
  { id: "all", label: "All Categories", color: "bg-text-muted/20 text-text border-border" },
  { id: "green", label: "Data Science", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30", dot: "bg-emerald-500" },
  { id: "red", label: "SWE / Software", color: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30", dot: "bg-rose-500" },
  { id: "purple", label: "AI / ML", color: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30", dot: "bg-purple-500" },
  { id: "blue", label: "Product / QA", color: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30", dot: "bg-sky-500" },
  { id: "orange", label: "Frontend / UI", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30", dot: "bg-amber-500" },
];

export default function MyResumesClient({ initialResumes }: { initialResumes: ResumeItem[] }) {
  const [resumes, setResumes] = useState<ResumeItem[]>(initialResumes);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUpdateCategory = async (id: string, newTag: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/resume/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryTag: newTag }),
      });

      if (res.ok) {
        setResumes((prev) =>
          prev.map((r) => (r.id === id ? { ...r, categoryTag: newTag } : r))
        );
      }
    } catch (e) {
      console.error("Failed to update resume category:", e);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredResumes = resumes.filter((r) => {
    const titleMatch = (r.resumeName || r.targetRole || "Engineering Resume")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const branchMatch = (r.branch || "").toLowerCase().includes(searchQuery.toLowerCase());
    const collegeMatch = (r.college || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSearch = titleMatch || branchMatch || collegeMatch;
    const matchesCategory = selectedCategory === "all" || (r.categoryTag || "blue") === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-serif font-bold text-text flex items-center gap-2.5">
              <FileText className="w-8 h-8 text-primary" />
              <span>My Saved Resumes</span>
            </h1>
            <p className="text-xs text-text-muted font-medium">
              Filter by engineering domain, assign category tags, and edit your formatted ATS resumes.
            </p>
          </div>

          <Link
            href="/build"
            className="px-5 py-3 rounded-full bg-primary hover:bg-primary/95 text-white text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-sm shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Build New Resume</span>
          </Link>
        </div>

        {/* Controls Bar: Search & Category Tags Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search resumes by title, role, branch, college..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface border border-border text-text text-xs font-medium focus:outline-none focus:border-primary shadow-2xs"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-primary text-white border-primary shadow-xs"
                    : "bg-surface text-text-muted hover:text-text border-border"
                }`}
              >
                {cat.dot && <span className={`w-2 h-2 rounded-full ${cat.dot}`} />}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Resumes Grid */}
        {filteredResumes.length === 0 ? (
          <div className="p-12 text-center bg-surface border border-border/80 rounded-3xl space-y-4">
            <FileText className="w-12 h-12 text-text-muted/40 mx-auto" />
            <h3 className="text-base font-bold text-text">No Resumes Found</h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              {searchQuery || selectedCategory !== "all"
                ? "No saved resumes match your current filter or search criteria."
                : "You haven't built any resumes yet. Click 'Build New Resume' to create your first ATS-optimized output."}
            </p>
            <Link
              href="/build"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-full shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Resume Now</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredResumes.map((resume) => {
              const currentTag = CATEGORIES.find((c) => c.id === (resume.categoryTag || "blue")) || CATEGORIES[4];

              return (
                <div
                  key={resume.id}
                  className={`bg-surface border-2 rounded-3xl p-6 shadow-xs relative space-y-5 transition-all hover:shadow-md ${
                    currentTag.id === "green"
                      ? "border-emerald-500/40"
                      : currentTag.id === "red"
                      ? "border-rose-500/40"
                      : currentTag.id === "purple"
                      ? "border-purple-500/40"
                      : currentTag.id === "orange"
                      ? "border-amber-500/40"
                      : "border-sky-500/40"
                  }`}
                >
                  {/* Top Bar: Date & Category Color Tag Selector */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-text-muted">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(resume.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Category Tag Selector Dropdown / Pills */}
                    <div className="flex items-center space-x-1 bg-bg-base/60 p-1 rounded-full border border-border/50">
                      {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleUpdateCategory(resume.id, cat.id)}
                          className={`w-4.5 h-4.5 rounded-full transition-all flex items-center justify-center cursor-pointer ${cat.dot} ${
                            (resume.categoryTag || "blue") === cat.id
                              ? "ring-2 ring-text ring-offset-1 scale-110"
                              : "opacity-40 hover:opacity-100"
                          }`}
                          title={`Categorize as ${cat.label}`}
                        >
                          {(resume.categoryTag || "blue") === cat.id && (
                            <Check className="w-2.5 h-2.5 text-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Resume Title & Metadata */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between group">
                      <h3 className="font-bold text-lg text-text">
                        {resume.resumeName || resume.targetRole || "Engineering Resume"}
                      </h3>
                      <EditTitle id={resume.id} currentTitle={resume.resumeName || resume.targetRole || "Untitled Resume"} />
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-text-muted font-medium">
                      {resume.college && <span>College: {resume.college}</span>}
                      {resume.branch && <span>• {resume.branch}</span>}
                      {resume.cgpa && <span>(CGPA: {resume.cgpa})</span>}
                    </div>

                    <div className="pt-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${currentTag.color}`}>
                        {currentTag.label}
                      </span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <DeleteButton id={resume.id} />
                      <Link
                        href={`/build?resumeId=${resume.id}`}
                        className="p-2.5 text-text-muted hover:text-primary border border-border bg-bg-base/30 rounded-full transition-colors cursor-pointer shrink-0"
                        title="Edit Resume Content"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                    </div>

                    <Link
                      href={`/success/${resume.id}?sandbox=true`}
                      className="flex-1 min-h-[42px] px-4 py-2 rounded-full text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-xs bg-success text-white hover:bg-success/90 cursor-pointer"
                    >
                      <span>View Output</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
