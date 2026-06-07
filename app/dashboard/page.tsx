import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Loader2, Plus, Sparkles, BookOpen, Trash2, Calendar, FileText, CheckCircle2, ChevronRight, Layout } from "lucide-react";
import { LogoutButton, DeleteButton, EditTitle } from "@/components/DashboardActions";
import { ThemeToggle } from "@/components/theme-toggle";

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
    },
  });

  if (!user) {
    redirect("/login?error=SessionExpired");
  }

  const resumes = user.resumes;

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
    <div className="min-h-screen bg-bg-base text-text flex flex-col font-sans">
      {/* Navbar */}
      <header className="glass-panel border-b border-border/40 max-md:px-4 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center justify-center">
            <img src="/logo.png" alt="ATSLift Logo" className="w-8 h-8 rounded-md object-contain logo-rotated" />
          </Link>
          <span className="font-bold text-lg tracking-tight text-text">
            ATS<span className="text-primary font-medium font-serif italic">Lift</span>
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:block text-right">
            <div className="text-sm font-bold text-text">{user.name || session.user.email?.split("@")[0]}</div>
            <div className="text-[10px] text-text-muted font-semibold">{session.user.email}</div>
          </div>
          <div className="max-md:w-11 max-md:h-11 w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm tracking-widest overflow-hidden">
            {session.user.image ? (
              <img src={session.user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
            ) : (
              (user.name || session.user.email || "U").charAt(0).toUpperCase()
            )}
          </div>
          <ThemeToggle />
          <LogoutButton />
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="max-w-5xl mx-auto w-full px-4 md:px-6 py-6 md:py-10 space-y-8 flex-1">
        
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
            className="max-md:hidden px-6 py-3.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-full inline-flex items-center justify-center space-x-2 transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Build New Resume</span>
          </Link>
        </div>

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
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Unlocked Portals</span>
              <span className="text-3xl font-black font-sans text-text">{totalPaid}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-success/10 border border-success/20 flex items-center justify-center text-success">
              <CheckCircle2 className="w-5 h-5" />
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
                try { if (resumeItem.outputFull) { atsScore = JSON.parse(resumeItem.outputFull).atsScore || 85; } } catch {}
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
                      <DeleteButton id={resumeItem.id} />

                      <Link
                        href={isPaid ? `/success/${resumeItem.id}?sandbox=true` : `/result/${resumeItem.id}`}
                        className={`flex-1 min-h-[44px] px-5 py-2.5 rounded-full text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-xs ${
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
                className="max-md:w-full max-md:min-h-[44px] px-6 py-3 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-full inline-flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Start Building Now</span>
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Mobile FAB */}
      <Link
        href="/build"
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(1,105,111,0.4)] z-50 hover:scale-105 active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
}
