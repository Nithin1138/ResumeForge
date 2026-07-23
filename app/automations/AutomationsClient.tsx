"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { TelegramLinkCard } from "@/components/TelegramLinkCard";
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
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AutomationsClient() {
  const [postings, setPostings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchPostings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/job-postings");
      if (res.ok) {
        const data = await res.json();
        setPostings(data.jobPostings || []);
      }
    } catch (err) {
      console.error("Failed to fetch job postings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostings();
  }, []);

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

  const filteredPostings = postings.filter((p) => {
    if (filterStatus === "ALL") return true;
    if (filterStatus === "ACTIVE") return p.status === "NEW" || p.status === "NOTIFIED";
    return p.status === filterStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPLIED":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Applied ✅</span>;
      case "NOT_ELIGIBLE":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-500/10 text-red-500 border border-red-500/20">Not Eligible ❌</span>;
      case "SKIPPED":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-gray-500/10 text-gray-400 border border-gray-500/20">Skipped ⏭️</span>;
      case "MANUAL_REVIEW":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-500 border border-amber-500/20">Manual Review ⚠️</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-sky-500/10 text-sky-500 border border-sky-500/20">Active Drive 🎯</span>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-text">
                JD Automations & Telegram Bot
              </h1>
            </div>
            <p className="text-xs text-text-muted font-medium">
              Manage Telegram bot linking, personal email alias, and tracked campus placement drives.
            </p>
          </div>

          <button
            onClick={fetchPostings}
            className="px-4 py-2 bg-surface hover:bg-bg-base border border-border/80 text-text text-xs font-bold rounded-xl flex items-center space-x-2 transition-all shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Drives</span>
          </button>
        </div>

        {/* Telegram Bot Connection & Alias Card */}
        <TelegramLinkCard />

        {/* Tracked Placement Drives Section */}
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg font-extrabold text-text flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-primary" />
              <span>Tracked Placement Drives ({filteredPostings.length})</span>
            </h2>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {[
                { id: "ALL", label: "All Drives" },
                { id: "ACTIVE", label: "Active" },
                { id: "APPLIED", label: "Applied" },
                { id: "NOT_ELIGIBLE", label: "Not Eligible" },
                { id: "SKIPPED", label: "Skipped" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                    filterStatus === f.id
                      ? "bg-primary text-white shadow-xs"
                      : "bg-surface text-text-muted hover:text-text border border-border/60"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-8 bg-surface border border-border/80 rounded-3xl flex items-center justify-center space-x-3 text-text-muted">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="text-xs font-semibold">Fetching tracked job postings...</span>
            </div>
          ) : filteredPostings.length === 0 ? (
            <div className="p-10 bg-surface/60 border border-border/80 rounded-3xl text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-extrabold text-text">No Placement Drives Found</h3>
              <p className="text-xs text-text-muted max-w-md mx-auto">
                Forward your campus placement cell emails to your personal inbound alias or use the 1-click test simulation button above to populate placement drives!
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
                const deadline = posting.applicationDeadline
                  ? new Date(posting.applicationDeadline).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })
                  : "Not Specified";

                return (
                  <div
                    key={posting.id}
                    className="p-5 bg-surface/90 border border-border/80 rounded-3xl space-y-4 shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-extrabold text-base text-text">
                            {posting.companyName}
                          </h3>
                          <p className="text-xs font-bold text-primary">
                            {posting.roleTitle}
                          </p>
                        </div>
                        {getStatusBadge(posting.status)}
                      </div>

                      <div className="p-3.5 bg-bg-base/70 rounded-2xl space-y-2 text-xs border border-border/50">
                        <div className="flex items-center space-x-2 text-text-muted">
                          <GraduationCap className="w-4 h-4 text-primary shrink-0" />
                          <span><b>Branches:</b> {branches}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-text-muted">
                          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                          <span><b>CGPA:</b> {cgpa}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-text-muted">
                          <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                          <span><b>Deadline:</b> 🗓️ {deadline}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Update Actions */}
                    <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-1.5">
                      <span className="text-[10px] font-extrabold text-text-muted uppercase">Status:</span>
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleUpdateStatus(posting.id, "APPLIED")}
                          disabled={updatingId === posting.id}
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold transition-all flex items-center space-x-1 cursor-pointer ${
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
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold transition-all flex items-center space-x-1 cursor-pointer ${
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
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold transition-all flex items-center space-x-1 cursor-pointer ${
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
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
