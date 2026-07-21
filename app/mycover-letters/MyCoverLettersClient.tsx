"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Mail, 
  Plus, 
  Search, 
  Calendar, 
  ChevronRight, 
  Trash2, 
  Check, 
  Building2, 
  Briefcase 
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { DeleteCoverLetterButton, ViewCoverLetterOutputButton, CoverLetterButton } from "@/components/DashboardActions";

export interface CoverLetterItem {
  id: string;
  companyName: string;
  targetRole: string;
  tone?: string | null;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string | null;
  candidateLocation?: string | null;
  recipient?: string | null;
  subject?: string | null;
  salutation?: string | null;
  openingParagraph: string;
  bodyParagraph: string;
  closingParagraph: string;
  signOff?: string | null;
  createdAt: string;
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

export default function MyCoverLettersClient({ initialLetters }: { initialLetters: CoverLetterItem[] }) {
  const [letters, setLetters] = useState<CoverLetterItem[]>(initialLetters);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleUpdateCategory = async (id: string, newTag: string) => {
    try {
      const res = await fetch(`/api/cover-letter/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryTag: newTag }),
      });

      if (res.ok) {
        setLetters((prev) =>
          prev.map((l) => (l.id === id ? { ...l, categoryTag: newTag } : l))
        );
      }
    } catch (e) {
      console.error("Failed to update cover letter category:", e);
    }
  };

  const filteredLetters = letters.filter((l) => {
    const companyMatch = (l.companyName || "").toLowerCase().includes(searchQuery.toLowerCase());
    const roleMatch = (l.targetRole || "").toLowerCase().includes(searchQuery.toLowerCase());
    const candidateMatch = (l.candidateName || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSearch = companyMatch || roleMatch || candidateMatch;
    const matchesCategory = selectedCategory === "all" || (l.categoryTag || "blue") === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-serif font-bold text-text flex items-center gap-2.5">
              <Mail className="w-8 h-8 text-primary" />
              <span>My Saved Cover Letters</span>
            </h1>
            <p className="text-xs text-text-muted font-medium">
              Manage your tailored company application cover letters and categorize by domain.
            </p>
          </div>

          <CoverLetterButton />
        </div>

        {/* Controls Bar: Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search cover letters by company, role, or candidate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface border border-border text-text text-xs font-medium focus:outline-none focus:border-primary shadow-2xs"
            />
          </div>

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

        {/* Cover Letters Grid */}
        {filteredLetters.length === 0 ? (
          <div className="p-12 text-center bg-surface border border-border/80 rounded-3xl space-y-4">
            <Mail className="w-12 h-12 text-text-muted/40 mx-auto" />
            <h3 className="text-base font-bold text-text">No Cover Letters Found</h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              {searchQuery || selectedCategory !== "all"
                ? "No saved cover letters match your current filter or search criteria."
                : "You haven't built any cover letters yet. Click 'Build Cover Letter' to create one."}
            </p>
            <CoverLetterButton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredLetters.map((letter) => {
              const currentTag = CATEGORIES.find((c) => c.id === (letter.categoryTag || "blue")) || CATEGORIES[4];

              return (
                <div
                  key={letter.id}
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
                  {/* Top Bar: Date & Color Selector */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-text-muted">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(letter.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 bg-bg-base/60 p-1 rounded-full border border-border/50">
                      {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleUpdateCategory(letter.id, cat.id)}
                          className={`w-4.5 h-4.5 rounded-full transition-all flex items-center justify-center cursor-pointer ${cat.dot} ${
                            (letter.categoryTag || "blue") === cat.id
                              ? "ring-2 ring-text ring-offset-1 scale-110"
                              : "opacity-40 hover:opacity-100"
                          }`}
                          title={`Categorize as ${cat.label}`}
                        >
                          {(letter.categoryTag || "blue") === cat.id && (
                            <Check className="w-2.5 h-2.5 text-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Company & Role */}
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-lg text-text flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary shrink-0" />
                      <span>{letter.companyName} — {letter.targetRole}</span>
                    </h3>
                    <p className="text-xs text-text-muted font-medium">
                      Candidate: {letter.candidateName} {letter.candidateLocation ? `• ${letter.candidateLocation}` : ""}
                    </p>
                    <div className="pt-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${currentTag.color}`}>
                        {currentTag.label}
                      </span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-3">
                    <DeleteCoverLetterButton id={letter.id} />
                    <ViewCoverLetterOutputButton letter={letter} />
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
