"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import { TelegramLinkCard } from "@/components/TelegramLinkCard";
import AtsScoreModal from "@/components/AtsScoreModal";
import { 
  Bot, 
  Building2, 
  Calendar, 
  GraduationCap, 
  CheckCircle2, 
  XCircle, 
  SkipForward, 
  AlertTriangle, 
  Clock, 
  Loader2, 
  Sparkles, 
  RefreshCw,
  FileText,
  Target,
  ArrowRight,
  Search,
  Zap,
  Check,
  Briefcase,
  SlidersHorizontal,
  Settings,
  ListFilter,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Copy
} from "lucide-react";
import { formatDateDDMMYYYY } from "@/lib/telegram";

export default function AutomationsClient() {
  const [activeTab, setActiveTab] = useState<"drives" | "settings">("drives");
  const [postings, setPostings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // ATS Scoring Modal & Toggle State
  const [isAtsModalOpen, setIsAtsModalOpen] = useState(false);
  const [selectedPostingId, setSelectedPostingId] = useState<string | undefined>(undefined);
  const [selectedPostingTitle, setSelectedPostingTitle] = useState<string | undefined>(undefined);
  const [selectedCompanyName, setSelectedCompanyName] = useState<string | undefined>(undefined);
  const [hasResumeInMySpace, setHasResumeInMySpace] = useState<boolean>(true);
  const [atsCheckEnabled, setAtsCheckEnabled] = useState<boolean>(false);
  const [togglingAts, setTogglingAts] = useState<boolean>(false);

  const fetchPostings = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await fetch("/api/user/job-postings");
      if (res.ok) {
        const data = await res.json();
        setPostings(data.jobPostings || []);
      }
    } catch (err) {
      console.error("Failed to fetch job postings:", err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  const fetchAtsCheckMetadata = useCallback(async () => {
    try {
      const res = await fetch("/api/user/ats-check");
      if (res.ok) {
        const data = await res.json();
        setHasResumeInMySpace(!!data.hasResumeInMySpace);
        setAtsCheckEnabled(!!data.atsCheckEnabled);
      }
    } catch (err) {
      console.error("Failed to fetch ATS metadata:", err);
    }
  }, []);

  useEffect(() => {
    fetchPostings(false);
    fetchAtsCheckMetadata();

    // Deep link handler from Telegram Update Resume button
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const postingId = urlParams.get("openAtsCheck");
      if (postingId) {
        setSelectedPostingId(postingId);
        setIsAtsModalOpen(true);
      }
    }

    // Auto-poll every 4 seconds so Telegram inline button clicks reflect dynamically on site!
    const interval = setInterval(() => {
      fetchPostings(true);
    }, 4000);

    const onFocus = () => {
      fetchPostings(true);
      fetchAtsCheckMetadata();
    };

    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchPostings, fetchAtsCheckMetadata]);

  const handleToggleAtsFeature = async () => {
    if (!hasResumeInMySpace) return;
    setTogglingAts(true);
    try {
      const res = await fetch("/api/user/ats-check", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !atsCheckEnabled }),
      });
      if (res.ok) {
        const data = await res.json();
        setAtsCheckEnabled(!!data.atsCheckEnabled);
      }
    } catch (err) {
      console.error("Failed to toggle ATS feature:", err);
    } finally {
      setTogglingAts(false);
    }
  };

  const handleUpdateStatus = async (postingId: string, newStatus: string) => {
    setUpdatingId(postingId);
    try {
      const res = await fetch("/api/user/job-postings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postingId, status: newStatus }),
      });
      if (res.ok) {
        setPostings((prev) =>
          prev.map((p) => (p.id === postingId ? { ...p, status: newStatus } : p))
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenGeneralAtsCheck = () => {
    if (!atsCheckEnabled && hasResumeInMySpace) {
      handleToggleAtsFeature();
    }
    setSelectedPostingId(undefined);
    setSelectedPostingTitle(undefined);
    setSelectedCompanyName(undefined);
    setIsAtsModalOpen(true);
  };

  const handleOpenPostingAtsCheck = (posting: any) => {
    if (!atsCheckEnabled && hasResumeInMySpace) {
      handleToggleAtsFeature();
    }
    setSelectedPostingId(posting.id);
    setSelectedPostingTitle(posting.roleTitle);
    setSelectedCompanyName(posting.companyName);
    setIsAtsModalOpen(true);
  };

  // Metrics computation
  const stats = useMemo(() => {
    const total = postings.length;
    const active = postings.filter((p) => p.status === "NEW" || p.status === "NOTIFIED").length;
    const applied = postings.filter((p) => p.status === "APPLIED").length;
    const ineligible = postings.filter((p) => p.status === "NOT_ELIGIBLE" || p.eligibilityCheckResult === "not_eligible").length;
    return { total, active, applied, ineligible };
  }, [postings]);

  // Search & Filtered Job Postings
  const filteredPostings = useMemo(() => {
    return postings.filter((p) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        p.companyName?.toLowerCase().includes(query) ||
        p.roleTitle?.toLowerCase().includes(query) ||
        p.eligibilityCriteria?.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (filterStatus === "ALL") return true;
      if (filterStatus === "ACTIVE") return p.status === "NEW" || p.status === "NOTIFIED";
      if (filterStatus === "NOT_ELIGIBLE") return p.status === "NOT_ELIGIBLE" || p.eligibilityCheckResult === "not_eligible";
      return p.status === filterStatus;
    });
  }, [postings, filterStatus, searchQuery]);

  const getCompanyAvatar = (name: string) => {
    const gradients = [
      "bg-gradient-to-br from-indigo-500 to-purple-600",
      "bg-gradient-to-br from-blue-500 to-cyan-600",
      "bg-gradient-to-br from-emerald-500 to-teal-600",
      "bg-gradient-to-br from-amber-500 to-orange-600",
      "bg-gradient-to-br from-rose-500 to-pink-600",
    ];
    let hash = 0;
    for (let i = 0; i < (name || "").length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const grad = gradients[Math.abs(hash) % gradients.length];
    const initial = (name || "C").charAt(0).toUpperCase();
    return { grad, initial };
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Top Header & Navigation Hub */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center font-extrabold shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-text">
                  Automation & Placement Drives
                </h1>
                <p className="text-xs text-text-muted font-medium">
                  Track campus drives, AI eligibility filtering, and instant ATS score audits.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Segmented Workspace Tab Switcher */}
            <div className="p-1 bg-surface border border-border/80 rounded-2xl flex items-center space-x-1 shadow-xs">
              <button
                onClick={() => setActiveTab("drives")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === "drives"
                    ? "bg-primary text-white shadow-xs"
                    : "text-text-muted hover:text-text"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Placement Drives ({stats.total})</span>
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === "settings"
                    ? "bg-primary text-white shadow-xs"
                    : "text-text-muted hover:text-text"
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Bot & Settings</span>
              </button>
            </div>

            {/* Quick Audit CTA */}
            <button
              onClick={handleOpenGeneralAtsCheck}
              className="px-4 py-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white text-xs font-extrabold rounded-2xl flex items-center space-x-2 transition-all cursor-pointer shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] shrink-0"
            >
              <Target className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Score Resume</span>
            </button>
          </div>
        </div>

        {/* TAB 1: PLACEMENT DRIVES WORKSPACE */}
        {activeTab === "drives" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-surface/90 border border-border/80 rounded-2xl space-y-1 shadow-2xs">
                <span className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">Total Synced</span>
                <div className="text-2xl font-black text-text">{stats.total}</div>
              </div>

              <div className="p-4 bg-surface/90 border border-border/80 rounded-2xl space-y-1 shadow-2xs">
                <span className="text-[11px] font-extrabold text-sky-400 uppercase tracking-wider">Active Drives</span>
                <div className="text-2xl font-black text-sky-500">{stats.active}</div>
              </div>

              <div className="p-4 bg-surface/90 border border-border/80 rounded-2xl space-y-1 shadow-2xs">
                <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider">Applied</span>
                <div className="text-2xl font-black text-emerald-500">{stats.applied}</div>
              </div>

              <div className="p-4 bg-surface/90 border border-border/80 rounded-2xl space-y-1 shadow-2xs">
                <span className="text-[11px] font-extrabold text-red-400 uppercase tracking-wider">Filtered Out</span>
                <div className="text-2xl font-black text-red-500">{stats.ineligible}</div>
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-surface/80 border border-border/80 rounded-2xl shadow-2xs">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by company, role, or skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-bg-base/80 border border-border/60 rounded-xl text-xs text-text placeholder:text-text-muted/60 focus:outline-none focus:border-primary/60 transition-all"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                {[
                  { id: "ALL", label: `All (${postings.length})` },
                  { id: "ACTIVE", label: `Active (${stats.active})` },
                  { id: "APPLIED", label: `Applied (${stats.applied})` },
                  { id: "NOT_ELIGIBLE", label: `Filtered (${stats.ineligible})` },
                  { id: "SKIPPED", label: "Skipped" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilterStatus(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap border ${
                      filterStatus === f.id
                        ? "bg-primary text-white border-primary shadow-2xs"
                        : "bg-bg-base text-text-muted hover:text-text border-border/50"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Drives Grid */}
            {loading ? (
              <div className="p-12 bg-surface/60 border border-border/80 rounded-3xl flex items-center justify-center space-x-3 text-text-muted">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <span className="text-xs font-semibold">Loading placement drives...</span>
              </div>
            ) : filteredPostings.length === 0 ? (
              <div className="p-12 bg-surface/40 border border-border/80 rounded-3xl text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-extrabold text-text">No Drives Found</h3>
                <p className="text-xs text-text-muted max-w-sm mx-auto">
                  {searchQuery
                    ? `No placement drives match "${searchQuery}".`
                    : "Forward campus placement emails to your personal inbound alias to track drives here!"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPostings.map((posting) => {
                  let criteria: any = {};
                  try {
                    criteria = JSON.parse(posting.eligibilityCriteria || "{}");
                  } catch (e) {}

                  const branches = criteria.branches?.join(", ") || "All Engineering Branches";
                  const cgpa = criteria.cgpaCutoff || "No Cutoff Specified";
                  const deadline = formatDateDDMMYYYY(posting.applicationDeadline || posting.driveDate);
                  const isNotEligible = posting.status === "NOT_ELIGIBLE" || posting.eligibilityCheckResult === "not_eligible";
                  const isUncertain = posting.eligibilityCheckResult === "uncertain";
                  const avatar = getCompanyAvatar(posting.companyName);

                  return (
                    <div
                      key={posting.id}
                      className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 shadow-2xs hover:shadow-sm ${
                        isNotEligible
                          ? "bg-surface/50 border-red-500/20 opacity-85"
                          : "bg-surface border-border/80 hover:border-primary/40"
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Company Avatar & Status Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-2xl ${avatar.grad} text-white font-black text-base flex items-center justify-center shadow-xs shrink-0`}>
                              {avatar.initial}
                            </div>
                            <div>
                              <h3 className="font-extrabold text-base text-text">
                                {posting.companyName}
                              </h3>
                              <p className="text-xs font-bold text-primary">
                                {posting.roleTitle}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {posting.status === "APPLIED" ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                                Applied ✅
                              </span>
                            ) : isNotEligible ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-500/15 text-red-500 border border-red-500/30">
                                Not Eligible ❌
                              </span>
                            ) : posting.status === "SKIPPED" ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-gray-500/15 text-gray-400 border border-gray-500/30">
                                Skipped ⏭️
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                                Active Drive 🎯
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Criteria Grid */}
                        <div className="p-3.5 bg-bg-base/70 rounded-2xl space-y-2 text-xs border border-border/50">
                          <div className="flex items-center space-x-2 text-text-muted">
                            <GraduationCap className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span><b>Branches:</b> {branches}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-text-muted">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span><b>CGPA:</b> {cgpa}</span>
                          </div>
                          {posting.packageDetails && (
                            <div className="flex items-center space-x-2 text-text-muted">
                              <Briefcase className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span><b>Package:</b> {posting.packageDetails}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2 text-text-muted">
                            <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <span><b>Deadline:</b> 🗓️ {deadline}</span>
                          </div>
                        </div>

                        {/* Eligibility Reason Callout */}
                        {posting.eligibilityReason && (
                          <div className={`p-3 rounded-xl text-xs font-medium border flex items-start space-x-2 ${
                            isNotEligible
                              ? "bg-red-500/10 border-red-500/20 text-red-400"
                              : isUncertain
                              ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          }`}>
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className="font-bold block text-[10px] uppercase">
                                {isNotEligible ? "Filtered from Telegram: " : isUncertain ? "Verification Note: " : "Eligibility Match: "}
                              </span>
                              <span>{posting.eligibilityReason}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-3 border-t border-border/50 space-y-2.5">
                        <button
                          onClick={() => handleOpenPostingAtsCheck(posting)}
                          className="w-full py-2 px-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-xs font-extrabold flex items-center justify-center space-x-2 transition-all cursor-pointer"
                        >
                          <Target className="w-3.5 h-3.5" />
                          <span>Score Resume Against This JD</span>
                        </button>

                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[10px] font-extrabold text-text-muted uppercase">Status:</span>
                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => handleUpdateStatus(posting.id, "APPLIED")}
                              disabled={updatingId === posting.id}
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition-all flex items-center space-x-1 cursor-pointer ${
                                posting.status === "APPLIED"
                                  ? "bg-emerald-500 text-white"
                                  : "bg-bg-base hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                              }`}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Applied</span>
                            </button>

                            <button
                              onClick={() => handleUpdateStatus(posting.id, "NOT_ELIGIBLE")}
                              disabled={updatingId === posting.id}
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition-all flex items-center space-x-1 cursor-pointer ${
                                posting.status === "NOT_ELIGIBLE"
                                  ? "bg-red-500 text-white"
                                  : "bg-bg-base hover:bg-red-500/20 text-red-500 border border-red-500/30"
                              }`}
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Ineligible</span>
                            </button>

                            <button
                              onClick={() => handleUpdateStatus(posting.id, "SKIPPED")}
                              disabled={updatingId === posting.id}
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition-all flex items-center space-x-1 cursor-pointer ${
                                posting.status === "SKIPPED"
                                  ? "bg-gray-500 text-white"
                                  : "bg-bg-base hover:bg-gray-500/20 text-text-muted border border-border"
                              }`}
                            >
                              <SkipForward className="w-3 h-3" />
                              <span>Skip</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BOT & AUTOMATION SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Telegram Bot Link Card */}
            <TelegramLinkCard />

            {/* AI Eligibility & ATS Automation Master Toggle Card */}
            <div className="p-6 bg-surface border border-border/80 rounded-3xl space-y-4 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                      <Zap className="w-5 h-5 fill-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-text flex items-center space-x-2">
                        <span>Phase 2 Smart AI Automation Engine</span>
                        {atsCheckEnabled ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                            Active ON ✅
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gray-500/15 text-text-muted border border-gray-500/30">
                            Phase 1 Mode (OFF)
                          </span>
                        )}
                      </h2>
                    </div>
                  </div>
                  <p className="text-xs text-text-muted font-medium pl-13 leading-relaxed">
                    {atsCheckEnabled
                      ? "Phase 2 Active: Incoming JDs are checked against your My Space profile — ineligible drives are filtered out, and inline ATS match scores are sent to Telegram."
                      : "Phase 1 Mode (OFF): All placement drives trigger immediate Telegram alerts without eligibility filtering. Turn ON to enable filtering & ATS score alerts."}
                  </p>
                </div>

                <div className="shrink-0 pl-13 md:pl-0">
                  {!hasResumeInMySpace ? (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center space-x-3 text-xs text-amber-600 font-bold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Requires built resume or My Space profile</span>
                      <a
                        href="/my-space"
                        className="px-3 py-1.5 bg-amber-500 text-white rounded-xl font-extrabold hover:bg-amber-600 transition-all text-[11px] shrink-0"
                      >
                        Go to My Space →
                      </a>
                    </div>
                  ) : (
                    <button
                      onClick={handleToggleAtsFeature}
                      disabled={togglingAts}
                      className={`px-6 py-2.5 rounded-2xl text-xs font-extrabold flex items-center space-x-2 transition-all cursor-pointer shadow-xs ${
                        atsCheckEnabled
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-600"
                          : "bg-surface hover:bg-bg-base border border-border/80 text-text"
                      }`}
                    >
                      {togglingAts ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Zap className={`w-4 h-4 ${atsCheckEnabled ? "fill-white" : "text-primary"}`} />
                      )}
                      <span>{atsCheckEnabled ? "Feature Turned ON" : "Turn ON Feature"}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ATS Score Checker Modal */}
      <AtsScoreModal
        isOpen={isAtsModalOpen}
        onClose={() => setIsAtsModalOpen(false)}
        jobPostingId={selectedPostingId}
        jobPostingTitle={selectedPostingTitle}
        companyName={selectedCompanyName}
        hasResumeInMySpace={hasResumeInMySpace}
      />
    </AppLayout>
  );
}
