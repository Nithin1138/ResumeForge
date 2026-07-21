import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Loader2, Plus, Sparkles, BookOpen, Trash2, Edit2, Calendar, FileText, CheckCircle2, ChevronRight, Layout, Mail, User, Database, Bot, ArrowRight } from "lucide-react";
import { LogoutButton, DeleteButton, EditTitle, CoverLetterButton, DeleteCoverLetterButton, ViewCoverLetterOutputButton, EditCoverLetterButton } from "@/components/DashboardActions";
import { ThemeToggle } from "@/components/theme-toggle";
import WalletCard from "@/components/WalletCard";
import HeaderWalletBadge from "@/components/HeaderWalletBadge";
import AppLayout from "@/components/AppLayout";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      resumes: {
        orderBy: { createdAt: "desc" },
      },
      coverLetters: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/login?error=SessionExpired");
  }

  const resumes = user.resumes;
  const coverLetters = user.coverLetters || [];

  // Calculate quick stats
  const totalBuilt = resumes.length;
  const totalPaid = resumes.filter((r) => r.paymentStatus === "PAID").length;
  const avgScore = totalBuilt
    ? Math.round(resumes.reduce((acc, curr) => {
        let score = 85;
        try {
          if (curr.outputFull) {
            score = JSON.parse(curr.outputFull).atsScore || 85;
          }
        } catch {}
        return acc + score;
      }, 0) / totalBuilt)
    : 0;

  return (
    <AppLayout>
      <div className="space-y-8">
        
        {/* Header Block: Cover Letter Button directly to the left of Build New Resume */}
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

          <div className="flex items-center gap-3">
            <CoverLetterButton variant="header" />
            <Link
              href="/build"
              className="px-6 py-3.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-full inline-flex items-center justify-center space-x-2 transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Build New Resume</span>
            </Link>
          </div>
        </div>

        {/* MY SPACE & AI COPILOT HERO BANNER CARD */}
        <div className="bg-gradient-to-r from-primary/10 via-surface to-surface border border-primary/20 rounded-3xl p-6 md:p-8 space-y-4 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-primary/20 text-primary uppercase tracking-wider">
                  New Feature
                </span>
                <span className="text-xs text-text-muted font-bold flex items-center space-x-1">
                  <Database className="w-3.5 h-3.5 text-primary" />
                  <span>Personal Data Vault & AI Copilot</span>
                </span>
              </div>
              <h2 className="font-serif font-bold text-2xl text-text">
                My Space & Application Answer Assistant
              </h2>
              <p className="text-xs text-text-muted font-medium leading-relaxed">
                All your college details, CGPA, projects, and skills are stored in your private vault. Company asking additional application questions? Ask our AI assistant right here—it answers instantly using your real profile.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/my-space"
                className="px-5 py-3 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-full inline-flex items-center space-x-2 transition-all shadow-xs cursor-pointer"
              >
                <Database className="w-4 h-4" />
                <span>Open My Space Vault</span>
              </Link>
              <Link
                href="/my-space?tab=copilot"
                className="px-5 py-3 bg-surface border border-primary/40 text-primary hover:bg-primary/5 text-xs font-bold rounded-full inline-flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                <span>Ask AI Assistant</span>
              </Link>
            </div>
          </div>
        </div>

        {/* CANDIDATE WALLET COMPONENT */}
        <WalletCard />

        {/* Quick Stats Grid */}
        <div className="max-sm:flex max-sm:overflow-x-auto max-sm:snap-x max-sm:snap-mandatory max-sm:gap-4 max-sm:-mx-4 max-sm:px-4 max-sm:pb-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="max-sm:min-w-[75vw] max-sm:snap-start bg-surface border border-border rounded-2xl p-6 flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Resumes Formatted</span>
              <span className="text-3xl font-black font-sans text-text">{totalBuilt}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="max-sm:min-w-[75vw] max-sm:snap-start bg-surface border border-border rounded-2xl p-6 flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Cover Letters Built</span>
              <span className="text-3xl font-black font-sans text-text">{coverLetters.length}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
              <Mail className="w-5 h-5" />
            </div>
          </div>

          {/* Stat 3 */}
          <div className="max-sm:min-w-[75vw] max-sm:snap-start bg-surface border border-border rounded-2xl p-6 flex items-center justify-between shadow-xs">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
              {resumes.map((resumeItem) => {
                const isPaid = resumeItem.paymentStatus === "PAID";
                let atsScore = 85;
                try {
                  if (resumeItem.outputFull) { atsScore = JSON.parse(resumeItem.outputFull).atsScore || 85; }
                } catch {}
                const isGood = atsScore >= 80;
                
                // Color-coded ATS scores
                const scoreColor = isGood 
                  ? "bg-success/15 border-success/30 text-success" 
                  : "bg-warning/15 border-warning/30 text-warning";

                return (
                  <div
                    key={resumeItem.id}
                    className="bg-surface border border-border rounded-2xl p-4 md:p-6 flex flex-col justify-between hover:border-primary/55 transition-all duration-300 shadow-xs group"
                  >
                    <div className="space-y-4">
                      {/* Top Row: Date & Status Badge */}
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-text-muted font-bold flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(resumeItem.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </span>
                        
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border tracking-wider uppercase ${scoreColor}`}>
                          ATS: {atsScore}/100
                        </span>
                      </div>

                      {/* Main Data: Target Role */}
                      <div className="space-y-1 text-left mt-2 md:mt-0">
                        <EditTitle id={resumeItem.id} currentTitle={resumeItem.resumeName || resumeItem.targetRole || "Untitled Resume"} />
                        <p className="max-md:hidden text-xs text-text-muted leading-relaxed font-semibold">
                          College: {resumeItem.college}
                        </p>
                        <p className="max-md:hidden text-xs text-text-muted leading-relaxed font-semibold">
                          Academics: B.Tech (CGPA: {resumeItem.cgpa})
                        </p>
                      </div>
                    </div>

                    {/* Bottom Row: Actions */}
                    <div className="flex flex-row items-center justify-between border-t border-border/30 mt-4 md:mt-6 pt-3 md:pt-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <DeleteButton id={resumeItem.id} />
                        <Link
                          href={`/build?resumeId=${resumeItem.id}`}
                          className="p-2.5 text-text-muted hover:text-primary border border-border bg-bg-base/30 rounded-full transition-colors cursor-pointer shrink-0"
                          title="Edit Resume Settings"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                      </div>

                      <Link
                        href={`/success/${resumeItem.id}?sandbox=true`}
                        className="flex-1 min-h-[44px] px-5 py-2.5 rounded-full text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-xs bg-primary text-white hover:bg-primary/90 cursor-pointer"
                      >
                        <span>View Output</span>
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
              <div className="flex items-center justify-center gap-3">
                <CoverLetterButton variant="header" />
                <Link
                  href="/build"
                  className="px-6 py-3.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-full inline-flex items-center justify-center space-x-2 transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start Building Resume</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Saved Cover Letters Section */}
        {coverLetters.length > 0 && (
          <div className="space-y-4 pt-4">
            <h2 className="text-xs font-bold text-text-muted tracking-wider uppercase border-b border-border/40 pb-2">Your Saved Cover Letters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
              {coverLetters.map((letter) => (
                <div
                  key={letter.id}
                  className="bg-surface border border-border rounded-2xl p-4 md:p-6 flex flex-col justify-between hover:border-emerald-500/50 transition-all duration-300 shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-text-muted font-bold flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(letter.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </span>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border tracking-wider uppercase bg-emerald-500/15 border-emerald-500/30 text-emerald-600">
                        {letter.tone || "Professional"}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-base md:text-lg text-text line-clamp-1">
                        {letter.companyName} — {letter.targetRole}
                      </h3>
                      <p className="text-xs text-text-muted font-medium mt-1">
                        Candidate: {letter.candidateName} • {letter.candidateLocation || "India"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-row items-center justify-between border-t border-border/30 mt-4 md:mt-6 pt-3 md:pt-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <DeleteCoverLetterButton id={letter.id} />
                      <EditCoverLetterButton letter={letter} />
                    </div>
                    <ViewCoverLetterOutputButton letter={letter} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
