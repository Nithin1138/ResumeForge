"use client";

import { use, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ArrowLeft, Download, FileText, CheckCircle2, ChevronRight, AlertTriangle, Printer, Sparkles, RefreshCw, Zap, Lock, ShieldCheck, ArrowRight, Award, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { FullResumeOutput } from "@/types/resume";
import { calculateDynamicMetrics } from "@/lib/atsScoring";
import { getLocalSession } from "@/lib/authClient";
import ResumePreviewPanel from "@/components/ResumePreviewPanel";
import AIVerificationSection from "@/components/AIVerificationSection";

export default function ResultPage({ params }: { params: Promise<{ resumeId: string }> }) {
  const { resumeId } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [price, setPrice] = useState(49);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [activeRoleIndex, setActiveRoleIndex] = useState(0);
  const [isVerificationModalOpen, setVerificationModalOpen] = useState(false);
  const [scoreMode, setScoreMode] = useState<"resume" | "role">("resume");

  useEffect(() => {
    if (searchParams && searchParams.get("verify") === "true") {
      setVerificationModalOpen(true);
    }
  }, [searchParams]);

  const parsedOutput = resume?.outputFull 
    ? (typeof resume.outputFull === "string" ? JSON.parse(resume.outputFull) : resume.outputFull)
    : {};
  const output = parsedOutput as FullResumeOutput;
  
  // Calculate fully dynamic scores on the client in real-time
  const dynamicMetrics = useMemo(() => {
    if (!output) return null;
    const roleName = output.variantMetrics?.[activeRoleIndex]?.role || resume?.inputData?.personal?.targetRole;
    return calculateDynamicMetrics(output, roleName);
  }, [output, activeRoleIndex, resume?.inputData?.personal?.targetRole]);

  useEffect(() => {
    setSession(getLocalSession());

    // Log paywall view analytics
    try {
      let sid = localStorage.getItem("atslift_session_id");
      if (!sid) {
        sid = "session_" + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("atslift_session_id", sid);
      }
      fetch("/api/analytics/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sid,
          eventType: "PAYWALL_VIEW",
          page: `result_${resumeId}`,
          metadata: { resumeId }
        })
      }).catch(err => console.error("Failed to log paywall view:", err));
    } catch (e) {
      console.error(e);
    }

    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/config");
        if (res.ok) {
          const data = await res.json();
          return data.activePrice || 49;
        }
      } catch (err) {}
      return 49;
    };

    const loadData = async () => {
      try {
        const basePrice = await fetchConfig();
        const res = await fetch(`/api/resume/${resumeId}`);
        if (!res.ok) {
          throw new Error("Failed to load resume details.");
        }
        const data = await res.json();
        setResume(data);

        // Check if user selected 3 versions
        const inputData = typeof data.inputData === 'string' ? JSON.parse(data.inputData) : (data.inputData || {});
        if (inputData?.options?.projectVariants === "3 versions") {
          setPrice(99);
        } else {
          setPrice(basePrice);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [resumeId]);

  const handlePayment = async () => {
    setIsProcessingPayment(true);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId }),
      });

      if (!res.ok) {
        throw new Error("Failed to initialize checkout gateway.");
      }

      const data = await res.json();
      
      // Redirect to Razorpay or Sandbox local bypass URL
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (err: any) {
      alert(err.message || "Payment redirect failed. Please try again.");
      setIsProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base text-text flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-sm font-semibold text-text-muted">Loading your resume score card...</p>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen bg-bg-base text-text flex flex-col items-center justify-center font-sans p-6 text-center">
        <AlertCircle className="w-12 h-12 text-error mb-4" />
        <h2 className="text-xl font-bold mb-2">Error Loading Resume</h2>
        <p className="text-sm text-text-muted max-w-sm mb-6">{error || "The requested resume does not exist."}</p>
        <Link href="/build" className="px-6 py-3 bg-primary text-white rounded-full font-bold text-sm">
          Start Over
        </Link>
      </div>
    );
  }

  // Ensure that if payment is already complete, redirect to success automatically
  if (resume.paymentStatus === "PAID") {
    if (typeof window !== "undefined") {
      window.location.href = `/success/${resumeId}`;
    }
    return null;
  }
  
  const activeVariant = output?.variantMetrics?.[activeRoleIndex];
  
  const displayAtsScore = scoreMode === "role" && activeVariant ? activeVariant.atsScore : (output!.atsScore || dynamicMetrics?.atsScore || 84);
  const displayBreakdown = scoreMode === "role" && activeVariant ? activeVariant.breakdown : (output!.breakdown || dynamicMetrics?.breakdown);
  
  const displayStrengths = scoreMode === "role" && activeVariant?.strengths?.length ? activeVariant.strengths : (output?.strengths?.length ? output.strengths : dynamicMetrics?.strengths || []);
  const displayWeaknesses = scoreMode === "role" && activeVariant?.weaknesses?.length ? activeVariant.weaknesses : (output?.weaknesses?.length ? output.weaknesses : dynamicMetrics?.weaknesses || []);
  const displayImprovements = scoreMode === "role" && activeVariant?.improvements?.length ? activeVariant.improvements : (output?.improvements?.length ? output.improvements : dynamicMetrics?.improvements || []);

  const freePreview = output!.freeTierPreview || {
    summary: (output!.summary || "A highly motivated professional with extensive experience.").split(".")[0] + ".",
    firstProject: {
      title: output!.projects?.[0]?.title || "Academic Project",
      bullet: output!.projects?.[0]?.bullets?.[0] || "Optimized core features of the system."
    }
  };

  return (
    <div className="h-auto lg:h-screen lg:overflow-hidden bg-bg-base text-text flex flex-col font-sans">
      {/* Navbar */}
      <header className="glass-panel border-b border-border/40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center justify-center">
            <img src="/logo.png" alt="ATSLift Logo" className="w-8 h-8 rounded-md object-contain logo-rotated" />
          </Link>
          <span className="font-bold text-lg tracking-tight text-text">
            ATS<span className="text-primary font-medium font-serif italic">Lift</span>
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          {session && (
            <Link href="/dashboard" className="text-xs font-bold text-primary hover:underline">
              Dashboard
            </Link>
          )}
          <div className="flex items-center space-x-3 text-xs font-bold text-success bg-success/10 border border-success/20 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">ATS Analysis Verified</span>
          </div>
        </div>
      </header>

      {/* Main Container — fills remaining height, 2 columns */}
      <main className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row">

        {/* ── LEFT: Fixed-height Locked Resume Preview (never scrolls) ── */}
        <div className={`w-full ${showMobilePreview ? "h-[50vh]" : "h-[56px]"} lg:h-full lg:w-[42%] flex-shrink-0 flex flex-col p-3 md:p-5 pb-2 md:pb-4 border-b lg:border-b-0 lg:border-r border-border/40 overflow-hidden transition-all duration-300`}>
          {/* Panel header */}
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Resume Preview</span>
              <button
                type="button"
                onClick={() => setShowMobilePreview(!showMobilePreview)}
                className="lg:hidden text-[10px] font-bold text-primary bg-primary/10 border border-primary/25 px-2 py-0.5 rounded-md hover:bg-primary/15 transition-colors cursor-pointer"
              >
                {showMobilePreview ? "Hide Preview 👁️" : "Show Preview 👁️"}
              </button>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-warning bg-warning/10 border border-warning/25 px-2.5 py-1 rounded-full">
              <Lock className="w-3 h-3" /> Locked
            </span>
          </div>
          {/* Preview panel — fills remaining height */}
          <div className="flex-1 overflow-hidden min-h-0">
            <ResumePreviewPanel resume={resume} output={output} locked={true} />
          </div>
        </div>

        {/* ── RIGHT: Only this column scrolls ── */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-36 flex flex-col gap-6">
        
        {!isVerificationModalOpen && (
          <>
        {/* Global Role Switcher (Dynamic Metrics) */}
        {scoreMode === "role" && output.variantMetrics && output.variantMetrics.length > 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-wrap items-center gap-3 shadow-xs">
            <span className="text-xs font-bold text-primary uppercase">Select Role:</span>
            {output.variantMetrics.map((variant, vIdx) => {
              const isActive = activeRoleIndex === vIdx;
              return (
                <button
                  key={vIdx}
                  onClick={() => setActiveRoleIndex(vIdx)}
                  className={`text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-full transition-all border cursor-pointer ${
                    isActive 
                      ? "bg-primary text-white border-primary shadow-md shadow-primary/20" 
                      : "bg-bg-base text-text-muted border-border hover:border-primary/50"
                  }`}
                >
                  {variant.role}
                </button>
              );
            })}
          </div>
        )}

        {/* ATS Score Header Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center md:justify-between gap-6 shadow-xs">
          <div className="text-center md:text-left space-y-2 max-w-md">
            <div className="flex flex-col sm:flex-row items-center md:items-start sm:items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold font-sans">ATSLift Score Engine</h1>
              <div className="relative flex bg-primary/10 rounded-full p-1 border border-primary/20 mt-1 sm:mt-0 w-max shrink-0">
                <button 
                  onClick={() => setScoreMode("resume")} 
                  className={`relative text-[10px] font-bold uppercase px-4 py-1.5 rounded-full transition-colors duration-300 whitespace-nowrap cursor-pointer z-10 ${scoreMode === "resume" ? "text-white" : "text-primary hover:text-primary/80"}`}
                >
                  {scoreMode === "resume" && (
                    <motion.div
                      layoutId="scoreModeActivePillResult"
                      className="absolute inset-0 bg-primary rounded-full shadow-sm -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  Resume
                </button>
                <button 
                  onClick={() => setScoreMode("role")} 
                  className={`relative text-[10px] font-bold uppercase px-4 py-1.5 rounded-full transition-colors duration-300 whitespace-nowrap cursor-pointer z-10 ${scoreMode === "role" ? "text-white" : "text-primary hover:text-primary/80"}`}
                >
                  {scoreMode === "role" && (
                    <motion.div
                      layoutId="scoreModeActivePillResult"
                      className="absolute inset-0 bg-primary rounded-full shadow-sm -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  Job Role
                </button>
              </div>
            </div>
            <p className="text-sm text-text-muted leading-relaxed font-medium">
              We have completed a deterministic, category-based evaluation of your resume's technical strength, keyword alignment, and recruiter readability.
            </p>
          </div>

          {/* Circular Score Circle */}
          <div className="flex flex-col items-center">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Ring background */}
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="48" strokeWidth="6" stroke="#d4d1ca" fill="transparent" className="opacity-30" />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  strokeWidth="8"
                  stroke="#437a22"
                  fill="transparent"
                  strokeDasharray="301.6"
                  strokeDashoffset={301.6 - (301.6 * displayAtsScore) / 100}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black font-mono leading-none">{displayAtsScore}</span>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">ATS Score</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Score Breakdown */}
        {displayBreakdown && (
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-base text-text">Category Breakdown</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 bg-bg-base rounded-xl border border-border/50">
                <div className="text-xs text-text-muted font-semibold mb-1">Keyword Match</div>
                <div className="text-lg font-bold text-primary">{displayBreakdown.keywordMatch}/30</div>
              </div>
              <div className="p-3 bg-bg-base rounded-xl border border-border/50">
                <div className="text-xs text-text-muted font-semibold mb-1">ATS Compatibility</div>
                <div className="text-lg font-bold text-primary">{displayBreakdown.atsCompatibility}/25</div>
              </div>
              <div className="p-3 bg-bg-base rounded-xl border border-border/50">
                <div className="text-xs text-text-muted font-semibold mb-1">Technical Strength</div>
                <div className="text-lg font-bold text-primary">{displayBreakdown.technicalStrength}/15</div>
              </div>
              <div className="p-3 bg-bg-base rounded-xl border border-border/50">
                <div className="text-xs text-text-muted font-semibold mb-1">Project Quality</div>
                <div className="text-lg font-bold text-primary">{displayBreakdown.projectQuality}/15</div>
              </div>
              <div className="p-3 bg-bg-base rounded-xl border border-border/50">
                <div className="text-xs text-text-muted font-semibold mb-1">Readability</div>
                <div className="text-lg font-bold text-primary">{displayBreakdown.recruiterReadability}/10</div>
              </div>
              <div className="p-3 bg-bg-base rounded-xl border border-border/50">
                <div className="text-xs text-text-muted font-semibold mb-1">Credibility</div>
                <div className="text-lg font-bold text-primary">{displayBreakdown.experienceCredibility}/5</div>
              </div>
            </div>
          </div>
        )}

        {/* Strengths, Weaknesses, Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-success/5 border border-success/20 rounded-2xl p-6 space-y-3">
            <div className="flex items-center space-x-2 text-success">
              <CheckCircle2 className="w-5 h-5" />
              <h2 className="font-bold text-base">Key Strengths</h2>
            </div>
            <ul className="space-y-2 list-disc pl-5 text-sm text-text font-medium">
              {displayStrengths.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
          
          <div className="bg-warning/5 border border-warning/20 rounded-2xl p-6 space-y-3">
            <div className="flex items-center space-x-2 text-warning">
              <AlertCircle className="w-5 h-5" />
              <h2 className="font-bold text-base">Weaknesses</h2>
            </div>
            <ul className="space-y-2 list-disc pl-5 text-sm text-text font-medium">
              {displayWeaknesses.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 space-y-3">
          <div className="flex items-center space-x-2 text-primary">
            <Zap className="w-5 h-5" />
            <h2 className="font-bold text-base">Actionable Improvements (Free Included)</h2>
          </div>
          <ul className="space-y-2 list-disc pl-5 text-sm text-text font-medium">
            {displayImprovements.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Dynamic Free Previews & Locked Cards */}
        <div className="space-y-6">
          {/* Summary Preview Card */}
          <div className="bg-surface border border-border rounded-2xl p-6 relative overflow-hidden">
            <h3 className="text-xs font-bold text-text-muted tracking-wider uppercase mb-3">Professional Summary</h3>
            <p className="text-sm font-medium leading-relaxed">
              {freePreview.summary}
              <span className="inline-block blur-[3px] select-none text-text-muted/60 pl-1">
                highly competent engineer skilled in developing applications, deploying models, and testing backend systems.
              </span>
            </p>
            {/* Blur locked banner */}
            <div className="absolute inset-0 bg-linear-to-t from-surface via-surface/85 to-transparent flex items-end justify-center pb-2 pointer-events-none" />
          </div>

          {/* Skills Preview Card */}
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-4 relative">
            <h3 className="text-xs font-bold text-text-muted tracking-wider uppercase">Technical Skills</h3>
            
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-extrabold text-primary uppercase block mb-1.5">{output.skills[0]?.category || "Core Skills"}</span>
                <div className="flex flex-wrap gap-2">
                  {(output.skills?.[0]?.skills || []).map((skill, idx) => (
                    <span key={idx} className="text-xs bg-bg-base border border-border/80 px-2.5 py-1 rounded-md font-semibold text-text">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Locked Skills block */}
              <div className="opacity-45 blur-[2.5px] select-none space-y-3">
                <div>
                  <span className="text-[10px] font-extrabold text-text-muted uppercase block mb-1">Frameworks & Libraries</span>
                  <div className="flex gap-2">
                    <span className="text-xs bg-bg-base border px-2 py-0.5 rounded-sm">React</span>
                    <span className="text-xs bg-bg-base border px-2 py-0.5 rounded-sm">FastAPI</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-text-muted uppercase block mb-1">Databases & Tools</span>
                  <div className="flex gap-2">
                    <span className="text-xs bg-bg-base border px-2 py-0.5 rounded-sm">MySQL</span>
                    <span className="text-xs bg-bg-base border px-2 py-0.5 rounded-sm">Docker</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lock overlay banner */}
            <div className="absolute inset-0 bg-linear-to-t from-surface via-surface/60 to-transparent flex items-end justify-center pb-2 pointer-events-none" />
          </div>

          {/* Projects Preview Card */}
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-4 relative">
            <h3 className="text-xs font-bold text-text-muted tracking-wider uppercase">Academic Projects</h3>

            <div className="space-y-4">
              <div className="border border-border/40 bg-bg-base/30 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-primary">{freePreview.firstProject.title}</h4>
                  <span className="text-[10px] bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full font-bold text-primary">
                    {output.projects?.[0]?.techStack?.split(",").slice(0, 2).join(", ") || "Active Tech"}
                  </span>
                </div>
                <ul className="list-disc pl-4 space-y-1.5 text-xs font-medium leading-relaxed">
                  <li>{freePreview.firstProject.bullet}</li>
                  <li className="blur-[3px] select-none text-text-muted/60">
                    Deployed interactive interface using Docker container configurations, increasing system reliability.
                  </li>
                </ul>
              </div>

              {/* Locked Project Cards */}
              {(output.projects || []).length > 1 && (
                <div className="border border-dashed border-border/60 bg-bg-base/10 rounded-xl p-4 opacity-40 blur-[2.5px] select-none">
                  <h4 className="font-bold text-sm text-text-muted">{(output.projects || [])[1]?.title || "Project Title"}</h4>
                  <p className="text-xs mt-1">Locked project bullets optimized for placements...</p>
                </div>
              )}
            </div>

            {/* Lock Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-surface via-surface/60 to-transparent flex items-end justify-center pb-2 pointer-events-none" />
          </div>

          {/* Full Resume Card (Locked Overlay style) */}
          <div className="border-2 border-dashed border-border bg-bg-base/30 rounded-2xl p-8 text-center flex flex-col items-center justify-center relative overflow-hidden h-64">
            {/* Blurred placeholder text */}
            <div className="absolute inset-0 opacity-20 blur-[6px] select-none flex flex-col items-center justify-center space-y-4 px-6">
              <div className="w-full h-8 bg-text rounded-md" />
              <div className="w-5/6 h-8 bg-text rounded-md" />
              <div className="w-4/6 h-8 bg-text rounded-md" />
              <div className="w-full h-8 bg-text rounded-md" />
            </div>

            {/* Premium glass lock module */}
            <div className="relative z-10 glass-panel border border-border p-6 rounded-2xl flex flex-col items-center max-w-sm shadow-md">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 animate-pulse">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm mb-1">Locked Resume Sections</h4>
              <p className="text-[11px] text-text-muted max-w-xs font-semibold leading-relaxed">
                Unlock full optimized bullet points for all remaining projects, internships, leadership roles, achievements, and text copy exports.
              </p>
            </div>
          </div>
          </div>
          </>
          )}

          {isVerificationModalOpen && (
            <AIVerificationSection 
              handlePayment={handlePayment} 
              isProcessingPayment={isProcessingPayment} 
            />
          )}

        </div>
      </main>



      {/* STICKY BOTTOM CHECKOUT / PAYMENT CARD */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/85 backdrop-blur-md border-t border-border p-4 shadow-xl">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="text-left">
              <div className="flex items-baseline space-x-1.5">
                <span className="text-xl md:text-2xl font-black text-text">₹{price}</span>
                <span className="text-xs text-text-muted line-through font-semibold">₹199</span>
                <span className="text-[10px] bg-success/15 border border-success/30 px-1.5 py-0.5 rounded-md font-extrabold text-success uppercase">
                  {Math.round(((199 - price) / 199) * 100)}% OFF
                </span>
              </div>
              <p className="text-[10px] text-text-muted font-bold mt-0.5 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Instant payment via Razorpay. One-time fee.</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row-reverse items-center gap-3 w-full md:w-auto">
            {/* Real Checkout Button (Renders on the right on desktop, top on mobile) */}
            <button
              onClick={handlePayment}
              disabled={isProcessingPayment}
              className="px-8 py-3.5 bg-primary hover:bg-primary/95 text-white text-sm font-semibold rounded-full flex items-center justify-center space-x-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 w-full sm:w-auto cursor-pointer"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  <span>Preparing Checkout...</span>
                </>
              ) : (
                <>
                  <span>Unlock Full ATS Content</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            
            {/* AI Verification Button (Renders on the left on desktop, bottom on mobile) */}
            {isVerificationModalOpen ? (
              <button 
                onClick={() => {
                  setVerificationModalOpen(false);
                  router.replace(`/result/${resumeId}`, { scroll: false });
                }}
                className="px-5 py-3 sm:py-3.5 bg-surface border border-border hover:bg-border/60 text-text text-[11px] sm:text-xs font-bold rounded-full transition-all flex items-center justify-center gap-2 w-full sm:w-auto shadow-xs group cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-text-muted group-hover:-translate-x-1 transition-transform shrink-0" />
                <span>Back to ATS Score</span>
              </button>
            ) : (
              <button 
                onClick={() => {
                  setVerificationModalOpen(true);
                  router.replace(`/result/${resumeId}?verify=true`, { scroll: false });
                }}
                className="px-5 py-3 sm:py-3.5 bg-surface border border-border hover:bg-border/60 text-text text-[11px] sm:text-xs font-bold rounded-full transition-all flex items-center justify-center gap-2 w-full sm:w-auto shadow-xs group cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-primary group-hover:scale-110 transition-transform shrink-0" />
                <span>
                  <span className="text-text-muted font-medium mr-1.5 hidden sm:inline">Don't trust the score?</span>
                  <span className="text-text-muted font-medium mr-1.5 sm:hidden">Not sure?</span>
                  <span className="underline underline-offset-2 decoration-border group-hover:decoration-text-muted">Verify with AI</span>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
