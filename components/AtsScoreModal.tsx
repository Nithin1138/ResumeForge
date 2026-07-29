"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Target,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ExternalLink,
  History,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Award
} from "lucide-react";

interface AtsScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobPostingId?: string;
  jobPostingTitle?: string;
  companyName?: string;
  hasResumeInMySpace: boolean;
}

export default function AtsScoreModal({
  isOpen,
  onClose,
  jobPostingId,
  jobPostingTitle,
  companyName,
  hasResumeInMySpace,
}: AtsScoreModalProps) {
  const [loading, setLoading] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [activeCheck, setActiveCheck] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dailyCount, setDailyCount] = useState<number>(0);
  const [dailyLimit, setDailyLimit] = useState<number>(10);

  const fetchHistory = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const url = jobPostingId
        ? `/api/user/ats-check?jobPostingId=${jobPostingId}`
        : "/api/user/ats-check";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.checks || []);
        setDailyCount(data.dailyCount || 0);
        setDailyLimit(data.dailyLimit || 10);

        if (data.checks && data.checks.length > 0) {
          setActiveCheck(data.checks[0]);
        } else {
          setActiveCheck(null);
        }
      }
    } catch (err) {
      console.error("Failed to load ATS history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    } else {
      setActiveCheck(null);
      setErrorMsg(null);
    }
  }, [isOpen, jobPostingId]);

  const handleTriggerScoring = async () => {
    setScoring(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/user/ats-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobPostingId: jobPostingId || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "NO_RESUME_FOUND") {
          setErrorMsg("No profile data found. Please add a resume or profile details in My Space first.");
        } else {
          setErrorMsg(data.message || data.error || "Failed to run ATS score check.");
        }
        return;
      }

      if (data.check) {
        setActiveCheck(data.check);
        fetchHistory();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setScoring(false);
    }
  };

  if (!isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 stroke-emerald-500 bg-emerald-500/10 border-emerald-500/30";
    if (score >= 65) return "text-sky-500 stroke-sky-500 bg-sky-500/10 border-sky-500/30";
    return "text-amber-500 stroke-amber-500 bg-amber-500/10 border-amber-500/30";
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl bg-surface border border-border/80 rounded-3xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="p-6 border-b border-border/50 flex items-center justify-between bg-bg-base/40">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-extrabold text-text">
                  ATS Score & Gap Analysis
                </h2>
              </div>
              <p className="text-xs text-text-muted font-medium">
                {companyName ? `${companyName} — ${jobPostingTitle || "Job Drive"}` : "General Engineering ATS Readiness Check"}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-text-muted hover:text-text rounded-xl bg-bg-base hover:bg-border/40 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Gating Banner */}
            {!hasResumeInMySpace ? (
              <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-text">Add a Resume to My Space to Unlock ATS Scoring</h3>
                  <p className="text-xs text-text-muted max-w-md mx-auto">
                    To calculate your ATS score and gap analysis, ATSLift needs your stored profile details or resume data from My Space.
                  </p>
                </div>
                <Link
                  href="/my-space"
                  onClick={onClose}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
                >
                  <span>Go to My Space</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <>
                {/* Error Banner */}
                {errorMsg && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  </div>
                )}

                {/* Main Action Bar */}
                <div className="p-5 bg-bg-base/60 border border-border/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-xs font-extrabold text-text">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>{activeCheck ? "Latest Analysis Result" : "Ready to Audit Your ATS Score"}</span>
                    </div>
                    <p className="text-[11px] text-text-muted">
                      Daily Cap: {dailyCount} / {dailyLimit} checks used today
                    </p>
                  </div>

                  <button
                    onClick={handleTriggerScoring}
                    disabled={scoring || dailyCount >= dailyLimit}
                    className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer shadow-sm shrink-0"
                  >
                    {scoring ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Analyzing Resume & JD...</span>
                      </>
                    ) : (
                      <>
                        <Target className="w-4 h-4" />
                        <span>{activeCheck ? "Re-run ATS Check" : "Run ATS Check"}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Score & Breakdown Cards */}
                {loading ? (
                  <div className="p-12 text-center space-y-3">
                    <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" />
                    <p className="text-xs font-bold text-text-muted">Loading ATS results...</p>
                  </div>
                ) : activeCheck ? (
                  <div className="space-y-6">
                    {/* Score Ring & Overview */}
                    <div className="p-6 bg-surface border border-border/80 rounded-2xl flex flex-col sm:flex-row items-center gap-6 shadow-sm">
                      <div className="relative w-24 h-24 shrink-0">
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            strokeWidth="3.5"
                            className="stroke-border/40"
                          />
                          <motion.path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            className={getScoreColor(activeCheck.overallScore).split(" ")[1]}
                            initial={{ strokeDasharray: "0, 100" }}
                            animate={{ strokeDasharray: `${activeCheck.overallScore}, 100` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-black text-text">{activeCheck.overallScore}</span>
                          <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">/ 100</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-center sm:text-left flex-1">
                        <div className="flex items-center justify-center sm:justify-start space-x-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${getScoreColor(activeCheck.overallScore)}`}>
                            {activeCheck.overallScore >= 80 ? "High Match 🎯" : activeCheck.overallScore >= 65 ? "Moderate Match ⚡" : "Needs Improvement ⚠️"}
                          </span>
                          <span className="text-xs text-text-muted">
                            Audited on {new Date(activeCheck.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-sm font-extrabold text-text">
                          {activeCheck.overallScore >= 80
                            ? "Your profile is strongly aligned with this role!"
                            : "A few key keyword gaps & bullet improvements can significantly boost your ATS match."}
                        </h3>
                      </div>
                    </div>

                    {/* Section 1: Keyword Gaps */}
                    {activeCheck.keywordGaps && activeCheck.keywordGaps.length > 0 && (
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-extrabold text-text flex items-center space-x-2 uppercase tracking-wider">
                          <Target className="w-4 h-4 text-red-500" />
                          <span>Missing JD Keywords ({activeCheck.keywordGaps.length})</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {activeCheck.keywordGaps.map((kw: string, i: number) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-lg"
                            >
                              + {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Section 2: Concrete Actionable Improvements */}
                    {activeCheck.improvements && activeCheck.improvements.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-extrabold text-text flex items-center space-x-2 uppercase tracking-wider">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          <span>Actionable Improvements ({activeCheck.improvements.length})</span>
                        </h4>
                        <div className="space-y-2">
                          {activeCheck.improvements.map((imp: any, i: number) => (
                            <div
                              key={i}
                              className="p-3.5 bg-bg-base/70 border border-border/60 rounded-xl flex items-start space-x-3 text-xs"
                            >
                              <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md font-extrabold shrink-0 mt-0.5">
                                {imp.relatedTo || "General"}
                              </span>
                              <p className="text-text font-medium leading-relaxed">{imp.suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Section 3: Content & Structural Issues */}
                    {((activeCheck.contentIssues && activeCheck.contentIssues.length > 0) ||
                      (activeCheck.structuralIssues && activeCheck.structuralIssues.length > 0)) && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-extrabold text-text flex items-center space-x-2 uppercase tracking-wider">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <span>Formatting & Content Formatting Flags</span>
                        </h4>
                        <div className="space-y-2">
                          {activeCheck.contentIssues?.map((issue: string, i: number) => (
                            <div key={`c-${i}`} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-600 font-medium flex items-center space-x-2">
                              <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                              <span>{issue}</span>
                            </div>
                          ))}
                          {activeCheck.structuralIssues?.map((issue: string, i: number) => (
                            <div key={`s-${i}`} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-600 font-medium flex items-center space-x-2">
                              <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                              <span>{issue}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Section 4: Strengths */}
                    {activeCheck.strengths && activeCheck.strengths.length > 0 && (
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-extrabold text-text flex items-center space-x-2 uppercase tracking-wider">
                          <Award className="w-4 h-4 text-emerald-500" />
                          <span>Key Strengths ({activeCheck.strengths.length})</span>
                        </h4>
                        <div className="space-y-1.5">
                          {activeCheck.strengths.map((str: string, i: number) => (
                            <div key={i} className="flex items-center space-x-2 text-xs text-text font-medium">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              <span>{str}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer CTA to My Space */}
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-text text-center sm:text-left">
                        Want to fix missing keywords or update bullets? Edit your data in My Space.
                      </p>
                      <Link
                        href="/my-space"
                        onClick={onClose}
                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shrink-0 transition-colors shadow-xs"
                      >
                        <span>Edit in My Space</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {/* Score History */}
                    {history.length > 1 && (
                      <div className="pt-4 border-t border-border/50 space-y-3">
                        <h4 className="text-xs font-extrabold text-text flex items-center space-x-2 uppercase tracking-wider">
                          <History className="w-4 h-4 text-text-muted" />
                          <span>Previous Audit Checks</span>
                        </h4>
                        <div className="space-y-2">
                          {history.slice(1).map((h) => (
                            <div
                              key={h.id}
                              onClick={() => setActiveCheck(h)}
                              className="p-3 bg-bg-base hover:bg-border/30 border border-border/50 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-all"
                            >
                              <div className="space-y-0.5">
                                <span className="font-bold text-text">{h.companyName} — {h.roleTitle}</span>
                                <p className="text-[10px] text-text-muted">{new Date(h.createdAt).toLocaleString()}</p>
                              </div>
                              <span className={`px-2.5 py-1 rounded-full font-black text-xs border ${getScoreColor(h.overallScore)}`}>
                                {h.overallScore} / 100
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-10 text-center space-y-3">
                    <Target className="w-10 h-10 text-primary/40 mx-auto" />
                    <h3 className="text-sm font-extrabold text-text">No ATS Check Run Yet</h3>
                    <p className="text-xs text-text-muted max-w-sm mx-auto">
                      Click "Run ATS Check" above to generate a full gap analysis and improvement report.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
