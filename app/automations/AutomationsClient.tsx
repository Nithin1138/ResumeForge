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
  TrendingUp,
  ShieldCheck,
  Check,
  Briefcase,
  Layers,
  Filter,
  SlidersHorizontal,
  Info
} from "lucide-react";
import { formatDateDDMMYYYY } from "@/lib/telegram";

export default function AutomationsClient() {
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
      // Search term filtering
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        p.companyName?.toLowerCase().includes(query) ||
        p.roleTitle?.toLowerCase().includes(query) ||
        p.eligibilityCriteria?.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      // Status pill filtering
      if (filterStatus === "ALL") return true;
      if (filterStatus === "ACTIVE") return p.status === "NEW" || p.status === "NOTIFIED";
      if (filterStatus === "NOT_ELIGIBLE") return p.status === "NOT_ELIGIBLE" || p.eligibilityCheckResult === "not_eligible";
      return p.status === filterStatus;
    });
  }, [postings, filterStatus, searchQuery]);

  // Helper for generating initial background badge
  const getCompanyBadgeColor = (name: string) => {
    const colors = [
      "from-blue-500 to-indigo-600",
      "from-purple-500 to-pink-600",
      "from-emerald-500 to-teal-600",
      "from-amber-500 to-orange-600",
      "from-rose-500 to-red-600",
      "from-cyan-500 to-blue-600",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const getStatusBadge = (status: string, eligResult?: string) => {
    if (status === "APPLIED") {
      return (
        <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center space-x-1 shadow-2xs">
          <CheckCircle2 className="w-3 h-3" />
          <span>Applied</span>
        </span>
      );
    }
    if (status === "NOT_ELIGIBLE" || eligResult === "not_eligible") {
      return (
        <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-red-500/15 text-red-500 border border-red-500/30 flex items-center space-x-1 shadow-2xs">
          <XCircle className="w-3 h-3" />
          <span>Not Eligible</span>
        </span>
      );
    }
    if (status === "SKIPPED") {
      return (
        <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-gray-500/15 text-gray-400 border border-gray-500/30 flex items-center space-x-1 shadow-2xs">
          <SkipForward className="w-3 h-3" />
          <span>Skipped</span>
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center space-x-1 shadow-2xs">
        <Sparkles className="w-3 h-3 text-sky-400 animate-pulse" />
        <span>Active Drive</span>
      </span>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-8 pb-12 max-w-7xl mx-auto">
        {/* Top Header Banner */}
        <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-surface via-surface/90 to-primary/10 border border-border/80 shadow-md">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-extrabold">
                <Zap className="w-3.5 h-3.5 fill-primary" />
                <span>Placement Automation Hub</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text">
                JD Automations & Smart ATS
              </h1>
              <p className="text-sm text-text-muted font-medium leading-relaxed">
                Connect your Telegram bot, sync campus placement emails, run real-time ATS match scoring, and filter non-eligible placement drives automatically.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={handleOpenGeneralAtsCheck}
                className="px-5 py-3 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white text-xs font-extrabold rounded-2xl flex items-center space-x-2 transition-all cursor-pointer shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Target className="w-4 h-4" />
                <span>Run ATS Readiness Audit</span>
              </button>

              <button
                onClick={() => fetchPostings(false)}
                className="px-4 py-3 bg-surface hover:bg-bg-base border border-border/80 text-text text-xs font-bold rounded-2xl flex items-center space-x-2 transition-all shrink-0 cursor-pointer shadow-2xs hover:border-primary/40"
                title="Refresh drive statuses"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : "text-text-muted"}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Counter Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-border/40">
            <div className="p-3.5 bg-bg-base/60 backdrop-blur-md rounded-2xl border border-border/50 space-y-1">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Total Drives</span>
              <div className="text-xl font-extrabold text-text">{stats.total}</div>
            </div>

            <div className="p-3.5 bg-bg-base/60 backdrop-blur-md rounded-2xl border border-border/50 space-y-1">
              <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">Active Drives</span>
              <div className="text-xl font-extrabold text-sky-500">{stats.active}</div>
            </div>

            <div className="p-3.5 bg-bg-base/60 backdrop-blur-md rounded-2xl border border-border/50 space-y-1">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Applied</span>
              <div className="text-xl font-extrabold text-emerald-500">{stats.applied}</div>
            </div>

            <div className="p-3.5 bg-bg-base/60 backdrop-blur-md rounded-2xl border border-border/50 space-y-1">
              <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">Filtered / Ineligible</span>
              <div className="text-xl font-extrabold text-red-500">{stats.ineligible}</div>
            </div>
          </div>
        </div>

        {/* Telegram Link Card */}
        <TelegramLinkCard />

        {/* ATS Readiness & Gap Analysis Master Toggle Control Hub */}
        <div className="p-6 bg-surface/90 border border-border/80 rounded-3xl space-y-4 shadow-sm hover:border-primary/30 transition-all">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-primary/20">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2.5">
                    <h2 className="text-lg font-extrabold text-text">
                      ATS Readiness & Eligibility Engine
                    </h2>
                    {atsCheckEnabled ? (
                      <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Phase 2 Smart Mode ON</span>
                      </span>
                    ) : (
                      <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-gray-500/15 text-text-muted border border-gray-500/30">
                        Phase 1 Mode (All Alerts)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-xs text-text-muted font-medium pl-13 leading-relaxed">
                {atsCheckEnabled
                  ? "⚡ Phase 2 Active: Incoming placement drives are automatically verified against your My Space profile — ineligible drives are filtered out, and inline ATS match scores & top keyword gaps are appended to Telegram notifications."
                  : "🔔 Phase 1 Mode (OFF): All forwarded placement cell emails trigger an immediate Telegram alert without eligibility suppression. Turn ON to enable AI eligibility filtering and inline ATS score audits."}
              </p>
            </div>

            <div className="shrink-0 pl-13 md:pl-0">
              {!hasResumeInMySpace ? (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center space-x-3 text-xs text-amber-600 font-bold shadow-2xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Requires at least 1 built resume or My Space profile data</span>
                  <a
                    href="/my-space"
                    className="px-3.5 py-1.5 bg-amber-500 text-white rounded-xl font-extrabold hover:bg-amber-600 transition-all text-[11px] shrink-0"
                  >
                    Go to My Space →
                  </a>
                </div>
              ) : (
                <button
                  onClick={handleToggleAtsFeature}
                  disabled={togglingAts}
                  className={`px-6 py-3 rounded-2xl text-xs font-extrabold flex items-center space-x-2.5 transition-all cursor-pointer shadow-md ${
                    atsCheckEnabled
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-600 shadow-emerald-500/20"
                      : "bg-surface hover:bg-bg-base border border-border/80 text-text hover:border-primary/40"
                  }`}
                >
                  {togglingAts ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className={`w-4 h-4 ${atsCheckEnabled ? "fill-white" : "text-primary"}`} />
                  )}
                  <span>{atsCheckEnabled ? "Phase 2 Turned ON" : "Turn ON Phase 2 Mode"}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tracked Placement Drives Workspace */}
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-text flex items-center space-x-2.5">
                <Building2 className="w-5 h-5 text-primary" />
                <span>Tracked Placement Drives ({filteredPostings.length})</span>
              </h2>
              <p className="text-xs text-text-muted font-medium">
                Live placement cell drives synced from your personal email alias.
              </p>
            </div>

            {/* Search Bar & Filter Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Bar */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search company or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-surface border border-border/80 rounded-2xl text-xs text-text placeholder:text-text-muted/60 focus:outline-none focus:border-primary/60 transition-all"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
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
                    className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap border ${
                      filterStatus === f.id
                        ? "bg-primary text-white border-primary shadow-xs"
                        : "bg-surface text-text-muted hover:text-text border-border/60 hover:border-border"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-12 bg-surface/80 border border-border/80 rounded-3xl flex items-center justify-center space-x-3 text-text-muted shadow-xs">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="text-xs font-semibold">Fetching tracked placement drives...</span>
            </div>
          ) : filteredPostings.length === 0 ? (
            <div className="p-12 bg-surface/50 border border-border/80 rounded-3xl text-center space-y-4 shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-text">No Matching Placement Drives</h3>
                <p className="text-xs text-text-muted max-w-md mx-auto">
                  {searchQuery
                    ? `No drives match your search query "${searchQuery}". Try clearing your search.`
                    : "Forward your campus placement cell emails to your personal inbound alias or use the 1-click test simulation button above!"}
                </p>
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-2 bg-surface hover:bg-bg-base border border-border text-xs font-bold rounded-xl text-primary"
                >
                  Clear Search Filter
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                const initial = (posting.companyName || "C").charAt(0).toUpperCase();

                return (
                  <div
                    key={posting.id}
                    className={`p-6 border rounded-3xl space-y-4 shadow-sm transition-all flex flex-col justify-between hover:shadow-md ${
                      isNotEligible
                        ? "bg-surface/40 border-red-500/20 opacity-80"
                        : "bg-surface/90 border-border/80 hover:border-primary/40"
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Card Header: Company Logo Avatar & Status */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${getCompanyBadgeColor(posting.companyName)} text-white font-black text-lg flex items-center justify-center shadow-md`}>
                            {initial}
                          </div>
                          <div>
                            <h3 className={`font-extrabold text-base ${isNotEligible ? "text-text-muted" : "text-text"}`}>
                              {posting.companyName}
                            </h3>
                            <p className="text-xs font-extrabold text-primary flex items-center space-x-1">
                              <span>{posting.roleTitle}</span>
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {getStatusBadge(posting.status, posting.eligibilityCheckResult)}
                        </div>
                      </div>

                      {/* Criteria & Details Grid */}
                      <div className="p-4 bg-bg-base/70 rounded-2xl space-y-2.5 text-xs border border-border/50">
                        <div className="flex items-center space-x-2 text-text-muted">
                          <GraduationCap className="w-4 h-4 text-primary shrink-0" />
                          <span><b className="text-text">Branches:</b> {branches}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-text-muted">
                          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                          <span><b className="text-text">CGPA Cutoff:</b> {cgpa}</span>
                        </div>
                        {posting.packageDetails && (
                          <div className="flex items-center space-x-2 text-text-muted">
                            <Briefcase className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span><b className="text-text">Package / Stipend:</b> {posting.packageDetails}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 text-text-muted">
                          <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                          <span><b className="text-text">Deadline:</b> 🗓️ {deadline}</span>
                        </div>
                      </div>

                      {/* Eligibility Reason Callout Banner */}
                      {posting.eligibilityReason && (
                        <div className={`p-3.5 rounded-2xl text-xs font-medium border flex items-start space-x-2.5 ${
                          isNotEligible
                            ? "bg-red-500/10 border-red-500/25 text-red-400"
                            : isUncertain
                            ? "bg-amber-500/10 border-amber-500/25 text-amber-400"
                            : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                        }`}>
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="font-extrabold block uppercase tracking-wider text-[10px]">
                              {isNotEligible ? "Filtered (Not Eligible)" : isUncertain ? "Eligibility Verification Note" : "Eligibility Match"}
                            </span>
                            <span className="text-xs leading-relaxed">{posting.eligibilityReason}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions Area */}
                    <div className="pt-4 border-t border-border/50 space-y-3">
                      {/* Score Resume Button */}
                      <button
                        onClick={() => handleOpenPostingAtsCheck(posting)}
                        className="w-full py-2.5 px-4 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-xs font-extrabold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-2xs hover:scale-[1.01]"
                      >
                        <Target className="w-4 h-4" />
                        <span>Score My Resume Against This JD</span>
                      </button>

                      {/* Status Update Quick Buttons */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider">Update Status:</span>
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => handleUpdateStatus(posting.id, "APPLIED")}
                            disabled={updatingId === posting.id}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all flex items-center space-x-1 cursor-pointer ${
                              posting.status === "APPLIED"
                                ? "bg-emerald-500 text-white shadow-xs"
                                : "bg-bg-base hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Applied</span>
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(posting.id, "NOT_ELIGIBLE")}
                            disabled={updatingId === posting.id}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all flex items-center space-x-1 cursor-pointer ${
                              posting.status === "NOT_ELIGIBLE"
                                ? "bg-red-500 text-white shadow-xs"
                                : "bg-bg-base hover:bg-red-500/20 text-red-500 border border-red-500/30"
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Ineligible</span>
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(posting.id, "SKIPPED")}
                            disabled={updatingId === posting.id}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all flex items-center space-x-1 cursor-pointer ${
                              posting.status === "SKIPPED"
                                ? "bg-gray-500 text-white shadow-xs"
                                : "bg-bg-base hover:bg-gray-500/20 text-text-muted border border-border"
                            }`}
                          >
                            <SkipForward className="w-3.5 h-3.5" />
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
