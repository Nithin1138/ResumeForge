"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Plus, Sparkles, BookOpen, Trash2, Calendar, FileText, CheckCircle2, ChevronRight, LogOut, Layout } from "lucide-react";
import { getLocalSession } from "@/lib/authClient";

export default function DashboardPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    // Check local session cookie
    const activeSession = getLocalSession();
    if (!activeSession) {
      router.push("/login");
      return;
    }
    setSession(activeSession);

    const loadResumes = async () => {
      try {
        const res = await fetch("/api/user/resumes");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setResumes(data.resumes || []);
      } catch (error) {
        console.error("Failed to load dashboard resumes:", error);
      } finally {
        setLoading(false);
      }
    };
    loadResumes();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" });
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/resume/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setResumes((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base text-text flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-sm font-semibold text-text-muted">Loading your placement workspace...</p>
      </div>
    );
  }

  // Calculate quick stats
  const totalBuilt = resumes.length;
  const totalPaid = resumes.filter((r) => r.paymentStatus === "PAID").length;
  const avgScore = totalBuilt
    ? Math.round(resumes.reduce((acc, curr) => acc + curr.atsScore, 0) / totalBuilt)
    : 0;

  return (
    <div className="min-h-screen bg-bg-base text-text flex flex-col font-sans">
      {/* Navbar */}
      <header className="glass-panel border-b border-border/40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/" className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm tracking-wider cursor-pointer">
            RF
          </Link>
          <span className="font-bold text-lg tracking-tight text-text">
            Resume<span className="text-primary font-medium font-serif italic">Forge</span>
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-xs font-bold text-text hidden sm:flex items-center space-x-1">
            <span>👋 Hello,</span>
            <span className="text-primary font-bold">{session?.name || "Student"}</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 border border-border hover:bg-error/10 hover:text-error text-text-muted rounded-full transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="max-w-5xl mx-auto w-full px-6 py-10 space-y-8 flex-1">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-serif tracking-tight text-text flex items-center gap-2">
              <Layout className="w-7 h-7 text-primary" />
              <span>Candidate Dashboard</span>
            </h1>
            <p className="text-xs text-text-muted font-medium">
              Manage your engineering resume outputs, check ATS score statistics, and run modifications.
            </p>
          </div>
          <Link
            href="/build"
            className="px-6 py-3.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-full inline-flex items-center justify-center space-x-2 transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Build New Resume</span>
          </Link>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Stat 1 */}
          <div className="bg-surface border border-border rounded-2xl p-6 flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Resumes Formatted</span>
              <span className="text-3xl font-black font-sans text-text">{totalBuilt}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          {/* Stat 2 */}
          <div className="bg-surface border border-border rounded-2xl p-6 flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Unlocked Portals</span>
              <span className="text-3xl font-black font-sans text-text">{totalPaid}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-success/10 border border-success/20 flex items-center justify-center text-success">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* Stat 3 */}
          <div className="bg-surface border border-border rounded-2xl p-6 flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Average ATS Rating</span>
              <span className="text-3xl font-black font-sans text-text">{avgScore || "N/A"}{totalBuilt ? "%" : ""}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Resumes Grid */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-text-muted tracking-wider uppercase border-b border-border/40 pb-2">Your Saved Resumes</h2>

          {resumes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resumes.map((resumeItem) => {
                const isPaid = resumeItem.paymentStatus === "PAID";
                const isGood = resumeItem.atsScore >= 80;
                
                // Color-coded ATS scores
                const scoreColor = isGood 
                  ? "bg-success/15 border-success/30 text-success" 
                  : "bg-warning/15 border-warning/30 text-warning";

                return (
                  <div
                    key={resumeItem.id}
                    className="bg-surface border border-border rounded-2xl p-6 flex flex-col justify-between hover:border-primary/55 transition-all duration-300 shadow-xs group"
                  >
                    <div className="space-y-4">
                      {/* Top Row: Date & Status Badge */}
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-text-muted font-bold flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(resumeItem.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </span>
                        
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border tracking-wider uppercase ${scoreColor}`}>
                          ATS: {resumeItem.atsScore}/100
                        </span>
                      </div>

                      {/* Main Data: Target Role */}
                      <div className="space-y-1 text-left">
                        <h3 className="font-bold text-lg text-text group-hover:text-primary transition-colors">{resumeItem.targetRole}</h3>
                        <p className="text-xs text-text-muted leading-relaxed font-semibold">
                          College: {resumeItem.college}
                        </p>
                        <p className="text-xs text-text-muted leading-relaxed font-semibold">
                          Academics: B.Tech (CGPA: {resumeItem.cgpa})
                        </p>
                      </div>
                    </div>

                    {/* Bottom Row: Actions */}
                    <div className="flex items-center justify-between border-t border-border/30 mt-6 pt-4 gap-4">
                      <button
                        onClick={() => handleDelete(resumeItem.id)}
                        disabled={isDeleting === resumeItem.id}
                        className="p-2.5 text-text-muted hover:text-error border border-border bg-bg-base/30 rounded-full transition-colors cursor-pointer"
                        title="Delete Resume"
                      >
                        {isDeleting === resumeItem.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>

                      <Link
                        href={isPaid ? `/success/${resumeItem.id}?sandbox=true` : `/result/${resumeItem.id}`}
                        className={`px-5 py-2.5 rounded-full text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-xs ${
                          isPaid 
                            ? "bg-success text-white hover:bg-success/90" 
                            : "bg-primary text-white hover:bg-primary/90"
                        }`}
                      >
                        <span>{isPaid ? "View Output" : "Unlock Output"}</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty state */
            <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-surface/30">
              <BookOpen className="w-12 h-12 text-primary/30 mx-auto mb-4" />
              <h3 className="font-serif text-xl mb-2 text-text">No Resumes Found</h3>
              <p className="text-sm text-text-muted max-w-sm mx-auto mb-6 font-semibold">
                You haven&apos;t generated any ATS resume content yet. Fill out details and optimize your profile in 2 minutes.
              </p>
              <Link
                href="/build"
                className="px-6 py-3 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-full inline-flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Start Building Now</span>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
