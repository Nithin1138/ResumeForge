"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Lock, ShieldCheck, CheckCircle2, ArrowRight, Award, Zap, AlertCircle, Loader2 } from "lucide-react";
import { FullResumeOutput } from "@/types/resume";
import { getLocalSession } from "@/lib/authClient";
import ResumePreviewPanel from "@/components/ResumePreviewPanel";

export default function ResultPage({ params }: { params: Promise<{ resumeId: string }> }) {
  const { resumeId } = use(params);
  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    setSession(getLocalSession());

    const fetchResume = async () => {
      try {
        const res = await fetch(`/api/resume/${resumeId}`);
        if (!res.ok) {
          throw new Error("Failed to load resume details.");
        }
        const data = await res.json();
        setResume(data);
      } catch (err: any) {
        setError(err.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
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

  const output: FullResumeOutput = resume.outputFull;
  const freePreview = output.freeTierPreview || {
    summary: output.summary.split(".")[0] + ".",
    firstProject: {
      title: output.projects[0]?.title || "Academic Project",
      bullet: output.projects[0]?.bullets[0] || "Optimized core features of the system."
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
        <div className="w-full h-[45vh] lg:h-full lg:w-[42%] flex-shrink-0 flex flex-col p-3 md:p-5 pb-2 md:pb-4 border-b lg:border-b-0 lg:border-r border-border/40 overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Resume Preview</span>
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
        {/* ATS Score Header Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center md:justify-between gap-6 shadow-xs">
          <div className="text-center md:text-left space-y-2 max-w-md">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-success/15 border border-success/30 text-xs font-bold text-success uppercase">
              <span>Excellent Structure</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-sans">Your Resume Output is Ready!</h1>
            <p className="text-sm text-text-muted leading-relaxed font-medium">
              We parsed your branch-specific skills and CGPA metrics. Your resume already scores higher than <strong className="text-text">85% of other applicants</strong>.
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
                  strokeDashoffset={301.6 - (301.6 * (output.atsScore || 87)) / 100}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black font-mono leading-none">{output.atsScore || 87}</span>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">ATS Score</span>
              </div>
            </div>
          </div>
        </div>

        {/* ATS Improvement Tips Box */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-base text-primary">ATS Improvement Tips (Included Free)</h2>
          </div>
          <ul className="space-y-3">
            {(output.atsTips || []).map((tip, idx) => (
              <li key={idx} className="flex items-start space-x-2.5 text-xs text-text font-medium leading-relaxed">
                <span className="w-5 h-5 rounded-full bg-primary/10 border border-primary/25 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{tip}</span>
              </li>
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
                <span className="text-[10px] font-extrabold text-primary uppercase block mb-1.5">Programming Languages</span>
                <div className="flex flex-wrap gap-2">
                  {(output.skills.languages || []).map((lang, idx) => (
                    <span key={idx} className="text-xs bg-bg-base border border-border/80 px-2.5 py-1 rounded-md font-semibold text-text">
                      {lang}
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
                    {output.projects[0]?.techStack.split(",").slice(0, 2).join(", ") || "Active Tech"}
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
              {output.projects.length > 1 && (
                <div className="border border-dashed border-border/60 bg-bg-base/10 rounded-xl p-4 opacity-40 blur-[2.5px] select-none">
                  <h4 className="font-bold text-sm text-text-muted">{output.projects[1].title}</h4>
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
        </div>
      </main>

      {/* STICKY BOTTOM CHECKOUT / PAYMENT CARD */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/85 backdrop-blur-md border-t border-border p-4 shadow-xl">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="text-left">
              <div className="flex items-baseline space-x-1.5">
                <span className="text-xl md:text-2xl font-black text-text">₹49</span>
                <span className="text-xs text-text-muted line-through font-semibold">₹199</span>
                <span className="text-[10px] bg-success/15 border border-success/30 px-1.5 py-0.5 rounded-md font-extrabold text-success uppercase">
                  75% OFF
                </span>
              </div>
              <p className="text-[10px] text-text-muted font-bold mt-0.5 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Instant payment via Razorpay. One-time fee.</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Real Checkout Button */}
            <button
              onClick={handlePayment}
              disabled={isProcessingPayment}
              className="px-8 py-3.5 bg-primary hover:bg-primary/95 text-white text-sm font-semibold rounded-full flex items-center justify-center space-x-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 w-full cursor-pointer"
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
          </div>
        </div>
      </div>
    </div>
  );
}
