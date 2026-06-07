"use client";

import { use, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, Copy, Download, RefreshCw, FileText, Printer, ArrowLeft, Check, AlertTriangle, Lock, Zap, Sparkles, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { FullResumeOutput } from "@/types/resume";
import { calculateDynamicMetrics } from "@/lib/atsScoring";
import { getLocalSession } from "@/lib/authClient";
import ResumePreviewPanel from "@/components/ResumePreviewPanel";
import { ThemeToggle } from "@/components/theme-toggle";

export const dynamic = 'force-dynamic';

// Helper functions to format URLs for print view
const formatLinkedIn = (url: string) => {
  if (!url) return "";
  let cleaned = url.trim();
  cleaned = cleaned.replace(/^(https?:\/\/)?(www\.)?/, "");
  cleaned = cleaned.replace(/\/$/, "");
  if (cleaned.startsWith("linkedin.com/in/")) {
    return cleaned;
  } else if (cleaned.includes("linkedin.com")) {
    return cleaned;
  } else {
    return `linkedin.com/in/${cleaned}`;
  }
};

const formatGitHub = (url: string) => {
  if (!url) return "";
  let cleaned = url.trim();
  cleaned = cleaned.replace(/^(https?:\/\/)?(www\.)?/, "");
  cleaned = cleaned.replace(/\/$/, "");
  if (cleaned.startsWith("github.com/")) {
    return cleaned;
  } else {
    return `github.com/${cleaned}`;
  }
};

const getLinkedInUrl = (url: string) => {
  if (!url) return "";
  let cleaned = url.trim();
  if (/^https?:\/\//i.test(cleaned)) {
    return cleaned;
  }
  if (cleaned.includes("linkedin.com")) {
    return `https://${cleaned}`;
  }
  return `https://linkedin.com/in/${cleaned}`;
};

const getGitHubUrl = (url: string) => {
  if (!url) return "";
  let cleaned = url.trim();
  if (/^https?:\/\//i.test(cleaned)) {
    return cleaned;
  }
  if (cleaned.includes("github.com")) {
    return `https://${cleaned}`;
  }
  return `https://github.com/${cleaned}`;
};

const formatPhone = (phone: string) => {
  if (!phone) return "";
  let cleaned = phone.trim().replace(/[-\s()]/g, "");
  if (cleaned.length === 10 && /^\d+$/.test(cleaned)) {
    return `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
  }
  if (cleaned.startsWith("91") && cleaned.length === 12 && /^\d+$/.test(cleaned)) {
    return `+91 ${cleaned.substring(2, 7)} ${cleaned.substring(7)}`;
  }
  if (cleaned.startsWith("+91") && cleaned.length === 13) {
    return `+91 ${cleaned.substring(3, 8)} ${cleaned.substring(8)}`;
  }
  return phone;
};

export default function SuccessPage({ params }: { params: Promise<{ resumeId: string }> }) {
  const { resumeId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSandbox = searchParams.get("sandbox") === "true";

  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [regeneratingStates, setRegeneratingStates] = useState<Record<string, boolean>>({});
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerationsCount, setRegenerationsCount] = useState(1);
  const [session, setSession] = useState<any>(null);
  const [liveResume, setLiveResume] = useState<any>(null);
  const [includeSummary, setIncludeSummary] = useState(false);
  const [includeCertifications, setIncludeCertifications] = useState(true);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [activeProjectVariants, setActiveProjectVariants] = useState<Record<number, number>>({});
  const [scoreMode, setScoreMode] = useState<"resume" | "role">("resume");
  
  const [density, setDensity] = useState<"concise" | "normal" | "expand">("normal");
  const [isAdjustingDensity, setIsAdjustingDensity] = useState(false);
  const [densityCache, setDensityCache] = useState<Record<string, any>>({});

  const [customTone, setCustomTone] = useState<string>("Professional & Formal");
  const [customJD, setCustomJD] = useState<string>("");
  const [isSmartOrdering, setIsSmartOrdering] = useState<boolean>(false);

  const handleDensityChange = async (newDensity: "concise" | "normal" | "expand") => {
    if (newDensity === density) return;
    
    // Save current version to cache first
    const currentResume = liveResume || output;
    setDensityCache(prev => ({ ...prev, [density]: currentResume }));
    
    if (densityCache[newDensity]) {
      setLiveResume(densityCache[newDensity]);
      setDensity(newDensity);
      return;
    }
    
    setIsAdjustingDensity(true);
    try {
      const res = await fetch("/api/adjust-density", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: currentResume,
          density: newDensity
        })
      });
      
      if (!res.ok) throw new Error("Failed to adjust text density");
      
      const data = await res.json();
      
      // Merge rewritten sections into our current state
      const nextLive = {
        ...currentResume,
        projects: currentResume.projects.map((p: any, idx: number) => ({
          ...p,
          bullets: data.projects?.[idx]?.bullets || p.bullets
        })),
        experience: currentResume.experience.map((e: any, idx: number) => ({
          ...e,
          bullets: data.experience?.[idx]?.bullets || e.bullets
        })),
        achievements: data.achievements || currentResume.achievements
      };
      
      setDensityCache(prev => ({ ...prev, [newDensity]: nextLive }));
      setLiveResume(nextLive);
      setDensity(newDensity);
    } catch (err) {
      console.error(err);
      alert("Could not adjust resume text density. Please try again.");
    } finally {
      setIsAdjustingDensity(false);
    }
  };

  const parsedOutput = liveResume 
    ? (typeof liveResume === "string" ? JSON.parse(liveResume) : liveResume)
    : (resume?.outputFull 
        ? (typeof resume.outputFull === "string" ? JSON.parse(resume.outputFull) : resume.outputFull)
        : {});
  const output = parsedOutput as FullResumeOutput;
  const activeRoleIndex = activeProjectVariants?.[0] || 0;

  const isSkillsReordered = useMemo(() => {
    if (!resume?.outputFull || !liveResume) return false;
    const originalOutput = typeof resume.outputFull === "string" ? JSON.parse(resume.outputFull) : resume.outputFull;
    const originalSkillsStr = JSON.stringify(originalOutput?.skills || []);
    const currentSkillsStr = JSON.stringify(output?.skills || []);
    return originalSkillsStr !== currentSkillsStr;
  }, [resume?.outputFull, liveResume, output?.skills]);
  
  // Calculate fully dynamic scores on the client in real-time
  const dynamicMetrics = useMemo(() => {
    if (!output) return null;
    const roleName = output.variantMetrics?.[activeRoleIndex]?.role || resume?.inputData?.personal?.targetRole;
    return calculateDynamicMetrics(output, roleName);
  }, [output, activeRoleIndex, resume?.inputData?.personal?.targetRole]);
  useEffect(() => {
    setSession(getLocalSession());

    const fetchOrUnlockResume = async () => {
      try {
        if (isSandbox) {
          // Trigger local webhook simulation to mark resume as PAID in SQLite
          await fetch("/api/payment/webhook", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "payment_link.paid",
              payload: {
                payment_link: {
                  entity: {
                    notes: { resumeId },
                    amount_paid: 4900,
                  },
                },
                payment: {
                  entity: {
                    id: `pay_mock_${Math.random().toString(36).substr(2, 9)}`,
                  },
                },
              },
            }),
          });
          // Increased delay and retry mechanism for database sync
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          // Manual Verification Fallback: If Razorpay redirected us here with a payment ID,
          // manually verify it immediately. This handles cases where webhooks are delayed
          // or failed entirely (e.g. testing on localhost without ngrok).
          const paymentId = searchParams.get("razorpay_payment_id");
          if (paymentId) {
            try {
              await fetch("/api/payment/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentId, resumeId })
              });
            } catch (verifyErr) {
              console.warn("Manual verification error:", verifyErr);
            }
          }
        }

        // Retry fetch up to 10 times if payment status isn't PAID (only if returning from checkout)
        let data = null;
        let retries = 0;
        
        // If they have a paymentId, they just returned from checkout, so wait up to 12s for webhook.
        // Otherwise, just check once and fail fast.
        const hasPaymentId = !!searchParams.get("razorpay_payment_id");
        const maxRetries = (hasPaymentId || isSandbox) ? 12 : 1; 
        
        while (retries < maxRetries) {
          const res = await fetch(`/api/resume/${resumeId}`, {
            cache: "no-store",
            headers: { "Cache-Control": "no-cache, no-store, must-revalidate" }
          });
          if (!res.ok) {
            throw new Error("Failed to load unlocked resume.");
          }
          data = await res.json();
          console.log(`[Success Page] Fetch attempt ${retries + 1}: paymentStatus=${data.paymentStatus}`);
          
          if (data.paymentStatus === "PAID") {
            break;
          }
          
          retries++;
          if (retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        setResume(data);
        if (data.paymentStatus === "PAID" && data.outputFull) {
          setLiveResume(data.outputFull);
          const original = typeof data.outputFull === "string" ? JSON.parse(data.outputFull) : data.outputFull;
          setDensityCache({ normal: original });
          if (data.inputData?.options?.jobDescription) {
            setCustomJD(data.inputData.options.jobDescription);
          }
        }
        
        // Launch confetti if successfully paid
        if (data.paymentStatus === "PAID") {
          triggerConfetti();
        }
      } catch (err: any) {
        setError(err.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrUnlockResume();
  }, [resumeId, isSandbox]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [id]: false }));
    }, 1500);
  };

  const handleRegenerateSection = async (
    id: string, 
    sectionType: string, 
    currentText: string, 
    onUpdate: (newText: string) => void,
    expectedBulletCount?: number,
    projectContext?: { title?: string; techStack?: string; description?: string; keyResult?: string }
  ) => {
    setRegeneratingStates((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch("/api/generate-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionType, currentText, expectedBulletCount, projectContext, density }),
      });
      if (!res.ok) throw new Error("Failed to regenerate section");
      const data = await res.json();
      onUpdate(data.newText);
    } catch (err: any) {
      alert("Error regenerating section: " + err.message);
    } finally {
      setRegeneratingStates((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleSmartOrder = async () => {
    if (!customJD || !customJD.trim()) {
      const jdElement = document.getElementById("jobDescriptionInput");
      if (jdElement) {
        jdElement.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          jdElement.focus();
          jdElement.classList.add("ring-2", "ring-primary", "animate-pulse");
          setTimeout(() => {
            jdElement.classList.remove("ring-2", "ring-primary", "animate-pulse");
          }, 2000);
        }, 500);
      }
      return;
    }

    setIsSmartOrdering(true);
    try {
      const res = await fetch("/api/reorder-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: output.skills,
          jobDescription: customJD
        })
      });

      if (!res.ok) {
        throw new Error("Failed to re-order skills.");
      }

      const data = await res.json();
      if (data.skills && Array.isArray(data.skills)) {
        const validatedSkills = data.skills
          .filter((s: any) => s && typeof s === "object" && typeof s.category === "string")
          .map((s: any) => ({
            category: s.category,
            skills: Array.isArray(s.skills) ? s.skills.map((x: any) => String(x).trim()).filter(Boolean) : []
          }));

        setLiveResume((prev: any) => {
          const current = typeof prev === "string" ? JSON.parse(prev) : prev;
          const next = JSON.parse(JSON.stringify(current));
          next.skills = validatedSkills;
          return next;
        });
      } else {
        throw new Error("Invalid skills data format returned from API.");
      }
    } catch (err: any) {
      alert("Error optimizing skills: " + err.message);
    } finally {
      setIsSmartOrdering(false);
    }
  };

  const handleRevertSkills = () => {
    if (!resume?.outputFull) return;
    const originalOutput = typeof resume.outputFull === "string" ? JSON.parse(resume.outputFull) : resume.outputFull;
    if (originalOutput?.skills) {
      setLiveResume((prev: any) => {
        const current = typeof prev === "string" ? JSON.parse(prev) : prev;
        const next = JSON.parse(JSON.stringify(current));
        next.skills = originalOutput.skills;
        return next;
      });
    }
  };

  const handleRegenerate = async () => {
    if (regenerationsCount >= 3) {
      alert("You have reached the limit of 3 regenerations for this resume.");
      return;
    }
    
    setIsRegenerating(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: resume.sessionId,
          formData: {
            ...resume.inputData,
            options: {
              ...resume.inputData.options,
              tone: customTone,
              jobDescription: customJD
            }
          }
        }),
      });

      if (!response.ok) {
        throw new Error("Regeneration request failed.");
      }

      const data = await response.json();
      
      // Simulate webhook automatic checkout for regenerated resume ID
      await fetch("/api/payment/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "payment_link.paid",
          payload: {
            payment_link: {
              entity: {
                notes: { resumeId: data.resumeId },
                amount_paid: 4900,
              },
            },
            payment: {
              entity: {
                id: `pay_regen_${Math.random().toString(36).substr(2, 9)}`,
              },
            },
          },
        }),
      });

      setRegenerationsCount((prev) => prev + 1);
      // Wait for database to sync before navigating
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push(`/success/${data.resumeId}?sandbox=true`);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || "Failed to regenerate content.");
      setIsRegenerating(false);
    }
  };

  const triggerBrowserPrint = () => {
    // Temporarily blank the document title so the browser doesn't show it
    // in the print header area.  Restore the original title afterward.
    const originalTitle = document.title;
    document.title = "";
    window.print();
    // Restore asynchronously – the print dialog blocks the JS thread in most
    // browsers, so this runs after the user dismisses the dialog.
    setTimeout(() => { document.title = originalTitle; }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base text-text flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-sm font-semibold text-text-muted">Unlocking full resume content...</p>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen bg-bg-base text-text flex flex-col items-center justify-center font-sans p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-error mb-4" />
        <h2 className="text-xl font-bold mb-2">Verification Failed</h2>
        <p className="text-sm text-text-muted max-w-sm mb-6">{error || "This resume content remains locked."}</p>
        <Link href={`/result/${resumeId}`} className="px-6 py-3 bg-primary text-white rounded-full font-bold text-sm">
          Return to Score Card
        </Link>
      </div>
    );
  }

  // Handle case where user tries to access success page directly without payment
  if (resume.paymentStatus !== "PAID" && !isSandbox) {
    return (
      <div className="min-h-screen bg-bg-base text-text flex flex-col items-center justify-center font-sans p-6 text-center">
        <Lock className="w-12 h-12 text-warning mb-4" />
        <h2 className="text-xl font-bold mb-2">Resume Locked</h2>
        <p className="text-sm text-text-muted max-w-sm mb-6">You need to complete payment to view your full resume.</p>
        <Link href={`/result/${resumeId}`} className="px-6 py-3 bg-primary text-white rounded-full font-bold text-sm">
          Go to Checkout
        </Link>
      </div>
    );
  }

  const activeVariant = output?.variantMetrics?.[activeRoleIndex];
  
  const displayAtsScore = scoreMode === "role" && activeVariant ? activeVariant.atsScore : (output!.atsScore || dynamicMetrics?.atsScore || 84);
  const displayBreakdown = scoreMode === "role" && activeVariant ? activeVariant.breakdown : (output!.breakdown || dynamicMetrics?.breakdown);
  
  const displayStrengths = scoreMode === "role" && activeVariant?.strengths?.length ? activeVariant.strengths : (output?.strengths?.length ? output.strengths : dynamicMetrics?.strengths || []);
  const displayWeaknesses = scoreMode === "role" && activeVariant?.weaknesses?.length ? activeVariant.weaknesses : (output?.weaknesses?.length ? output.weaknesses : dynamicMetrics?.weaknesses || []);
  const displayImprovements = scoreMode === "role" && activeVariant?.improvements?.length ? activeVariant.improvements : (output?.improvements?.length ? output.improvements : dynamicMetrics?.improvements || []);

  // Format the full plain-text version ready for clean Copy All operations
  const fullPlainTextContent = `
${resume.inputData.personal.fullName.toUpperCase()}
Email: ${resume.inputData.personal.email}${resume.inputData.personal.phone ? ` | Phone: ${resume.inputData.personal.phone}` : ""}${resume.inputData.personal.linkedin ? ` | LinkedIn: ${resume.inputData.personal.linkedin}` : ""}${resume.inputData.personal.github ? ` | GitHub: ${resume.inputData.personal.github}` : ""}
Target: ${resume.inputData.personal.targetRole} ${resume.inputData.personal.branch ? `(${resume.inputData.personal.branch})` : ""}
Education: ${output.pgEducation || resume.inputData.personal.hasPG ? `[PG] ${output.pgEducation?.degree || `${resume.inputData.personal.pgDegreeName} in ${resume.inputData.personal.pgBranch}`} - ${output.pgEducation?.institution || resume.inputData.personal.pgCollegeName} (${output.pgEducation?.year || resume.inputData.personal.pgGraduationYear}) | CGPA: ${output.pgEducation?.cgpa || `${resume.inputData.personal.pgCgpa}/10.0`} ; ` : ""}[UG] ${output.education.degree} - ${output.education.institution} (${output.education.year}) | CGPA: ${output.education.cgpa}

PROFESSIONAL SUMMARY
${output.summary}

TECHNICAL SKILLS
${(output.skills || []).map(s => `- ${s.category}: ${(s.skills || []).join(", ")}`).join("\n")}

PROJECTS
${(output.projects || []).map(proj => `
${proj.title} (${proj.techStack})
${proj.duration ? `Duration: ${proj.duration}\n` : ""}${proj.bullets.map(b => `- ${b}`).join("\n")}
`).join("\n")}
${(output.experience || []).length > 0 ? `
EXPERIENCE
${(output.experience || []).map(exp => `
${exp.company} - ${exp.role} (${exp.duration})
${(exp.bullets || []).map(b => `- ${b}`).join("\n")}
`).join("\n")}
` : ""}${(output.positions || []).length > 0 ? `
POSITIONS OF RESPONSIBILITY
${(output.positions || []).map(pos => `
${pos.title} - ${pos.organization}
- ${pos.bullet}
`).join("\n")}
` : ""}${(output.achievements || []).length > 0 ? `
ACHIEVEMENTS
${(output.achievements || []).map(ach => `- ${ach}`).join("\n")}
` : ""}
  `.trim();

  return (
    <div className="h-auto lg:h-screen lg:overflow-hidden bg-bg-base text-text flex flex-col font-sans print:block print:h-auto print:overflow-visible print:bg-white print:text-black">
      {/* Navbar (hidden during print) */}
      <header className="glass-panel border-b border-border/40 px-6 py-4 flex items-center justify-between print:hidden">
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
          <div className="flex items-center space-x-2 bg-success/15 border border-success/30 px-3 py-1.5 rounded-full text-xs font-bold text-success">
            <CheckCircle2 className="w-4 h-4" />
            <span>Payment Confirmed ✓</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* 2-column layout — fills remaining viewport height */}
      <main className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row print:block print:overflow-visible print:h-auto">

        {/* ── LEFT: Fixed-height Resume Preview (never scrolls) ── */}
        <div className={`w-full ${showMobilePreview ? "h-[50vh]" : "h-[56px]"} lg:h-full lg:w-[42%] flex-shrink-0 flex flex-col p-3 md:p-5 pb-2 md:pb-4 border-b lg:border-b-0 lg:border-r border-border/40 print:w-full print:h-auto print:border-none print:p-0 print:overflow-visible overflow-hidden transition-all duration-300`}>
          {/* Panel header */}
          <div className="flex items-center justify-between mb-3 flex-shrink-0 print:hidden">
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
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-success bg-success/10 border border-success/25 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Unlocked
              </span>

              {/* Density Control Segmented Pill */}
              <div className="flex bg-primary/5 border border-primary/20 rounded-full p-0.5 shrink-0 select-none">
                {(["concise", "normal", "expand"] as const).map((dOpt) => {
                  const isActive = density === dOpt;
                  return (
                    <button
                      key={dOpt}
                      onClick={() => handleDensityChange(dOpt)}
                      disabled={isAdjustingDensity}
                      className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full transition-all cursor-pointer disabled:opacity-50 ${
                        isActive 
                          ? "bg-primary text-white shadow-sm" 
                          : "text-text-muted hover:text-primary"
                      }`}
                    >
                      {dOpt}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={triggerBrowserPrint}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/10 border border-primary/25 px-2.5 py-1 rounded-full hover:bg-primary/15 transition-colors cursor-pointer"
              >
                <Printer className="w-3 h-3" /> Save PDF
              </button>
            </div>
          </div>
          {/* Preview fills all remaining height */}
          <div className="flex-1 overflow-hidden min-h-0 print:overflow-visible relative">
            <ResumePreviewPanel 
              resume={resume} 
              output={output} 
              locked={false} 
              liveData={liveResume} 
              includeSummary={includeSummary} 
              includeCertifications={includeCertifications}
            />
            {isAdjustingDensity && (
              <div className="absolute inset-0 bg-white/70 dark:bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center z-50">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                <p className="text-xs font-bold text-text-muted">Adjusting resume density...</p>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Only this column scrolls ── */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-8 print:hidden">

          {/* Page title */}
          <div className="text-center print:hidden space-y-2 pt-1">
            <h1 className="text-2xl md:text-3xl font-serif tracking-tight">🎉 Your Resume Content is Ready!</h1>
            <p className="text-xs text-text-muted max-w-lg mx-auto leading-relaxed font-medium">
              Copy-paste bullet points directly into your resume template.
            </p>
          </div>



          {/* ATS Score Header Card */}
          <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center md:justify-between gap-6 shadow-xs print:hidden">
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
                      layoutId="scoreModeActivePill"
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
                      layoutId="scoreModeActivePill"
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
            <div className="bg-surface border border-border rounded-2xl p-6 space-y-4 print:hidden">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
            <div className="bg-success/5 border border-success/20 rounded-2xl p-6 space-y-3">
              <div className="flex items-center space-x-2 text-success">
                <CheckCircle2 className="w-5 h-5" />
                <h2 className="font-bold text-base">Key Strengths</h2>
              </div>
              <ul className="space-y-2 list-disc pl-5 text-sm text-text font-medium">
                {displayStrengths.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-warning/5 border border-warning/20 rounded-2xl p-6 space-y-3">
              <div className="flex items-center space-x-2 text-warning">
                <AlertTriangle className="w-5 h-5" />
                <h2 className="font-bold text-base">Weaknesses</h2>
              </div>
              <ul className="space-y-2 list-disc pl-5 text-sm text-text font-medium">
                {displayWeaknesses.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 space-y-4 print:hidden">
            <div className="flex items-center space-x-2 text-primary">
              <Zap className="w-5 h-5" />
              <h2 className="font-bold text-base">ATS Improvement Tips (Included Free)</h2>
            </div>
            <ul className="space-y-3">
              {displayImprovements.map((tip: string, idx: number) => (
                <li key={idx} className="flex items-start space-x-2.5 text-xs text-text font-medium leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-primary/10 border border-primary/25 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

        {/* Section: Summary Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 relative shadow-xs print:hidden">
          <div className="flex justify-between items-center mb-4 border-b border-border/40 pb-3">
            <h3 className="text-xs font-bold text-primary tracking-wider uppercase">Professional Summary</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => handleRegenerateSection(
                  "summary", 
                  "Professional Summary", 
                  output.summary, 
                  (newText) => setLiveResume((prev: any) => ({ ...prev, summary: newText }))
                )}
                disabled={regeneratingStates["summary"]}
                className="text-xs font-semibold text-text-muted hover:text-primary transition-colors flex items-center space-x-1 border border-border bg-bg-base/30 px-2.5 py-1.5 rounded-full cursor-pointer disabled:opacity-50"
              >
                {regeneratingStates["summary"] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Regenerate</span>
              </button>
              <button
                onClick={() => copyToClipboard(output.summary, "summary")}
                className="text-xs font-semibold text-text-muted hover:text-primary transition-colors flex items-center space-x-1 border border-border bg-bg-base/30 px-2.5 py-1.5 rounded-full cursor-pointer"
              >
                {copiedStates["summary"] ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copiedStates["summary"] ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          </div>
          <p 
            className="text-sm font-medium leading-relaxed outline-none focus:bg-surface focus:ring-2 focus:ring-primary/40 rounded p-1.5 -m-1.5 transition-all"
            contentEditable 
            suppressContentEditableWarning 
            onBlur={(e) => setLiveResume((prev: any) => ({ ...prev, summary: e.target.textContent || "" }))}
          >
            {output.summary}
          </p>
          <div className="mt-5 flex items-center space-x-3 bg-bg-base p-3 rounded-lg border border-border/50">
            <input 
              type="checkbox" 
              id="includeSummary" 
              checked={includeSummary} 
              onChange={(e) => setIncludeSummary(e.target.checked)} 
              className="w-4 h-4 text-primary accent-primary rounded cursor-pointer"
            />
            <label htmlFor="includeSummary" className="text-xs font-semibold text-text cursor-pointer select-none">
              Include Professional Summary in PDF
              <span className="block text-[10px] text-text-muted font-medium mt-0.5">(Recommended for professionals with {">"}3 years experience)</span>
            </label>
          </div>
        </div>

        {/* Section: Skills Badges Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 relative shadow-xs print:hidden">
          <div className="flex justify-between items-center mb-5 border-b border-border/40 pb-3">
            <h3 className="text-xs font-bold text-primary tracking-wider uppercase">Technical Core Skills</h3>
            <div className="flex items-center space-x-2">
              {isSkillsReordered && (
                <button
                  onClick={handleRevertSkills}
                  className="text-xs font-semibold text-text-muted hover:text-primary transition-colors flex items-center space-x-1 border border-border bg-bg-base/30 px-2.5 py-1.5 rounded-full cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Revert Order</span>
                </button>
              )}
              <button
                onClick={handleSmartOrder}
                disabled={isSmartOrdering}
                className="text-xs font-semibold text-text-muted hover:text-primary transition-colors flex items-center space-x-1 border border-border bg-bg-base/30 px-2.5 py-1.5 rounded-full cursor-pointer disabled:opacity-50"
              >
                {isSmartOrdering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-primary" />}
                <span>{isSmartOrdering ? "Ordering..." : "Smart Order"}</span>
              </button>
              <button
                onClick={() => {
                  const skillsText = (output.skills || [])
                    .filter(s => s && Array.isArray(s.skills) && s.skills.length > 0)
                    .map(s => `${s.category}: ${s.skills.join(", ")}`)
                    .join("\n");
                  copyToClipboard(skillsText, "skills");
                }}
                className="text-xs font-semibold text-text-muted hover:text-primary transition-colors flex items-center space-x-1 border border-border bg-bg-base/30 px-2.5 py-1.5 rounded-full cursor-pointer"
              >
                {copiedStates["skills"] ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedStates["skills"] ? "Copied!" : "Copy Skills"}</span>
              </button>
            </div>
          </div>

          <div className="columns-1 md:columns-2 gap-6 [column-fill:balance]">
            {(output.skills || [])
              .filter(cat => cat && Array.isArray(cat.skills) && cat.skills.length > 0)
              .map((cat, idx) => (
                <div key={idx} className="break-inside-avoid inline-block w-full space-y-2 mb-5">
                  <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">{cat.category}</span>
                  <div className="flex flex-wrap gap-2">
                    {(cat.skills || []).map((skillName, sIdx) => (
                      <span key={sIdx} className="text-xs bg-bg-base border border-border px-2.5 py-1 rounded-md font-bold text-text">
                        {skillName}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Section: Academic Projects */}
        {output.projects && output.projects.length > 0 && (
          <div className="space-y-4 print:hidden">
            <div className="border-b border-border/40 pb-2">
              <h3 className="text-xs font-bold text-text-muted tracking-wider uppercase">ATS Project Bullet Points</h3>
            </div>

            {resume.inputData?.options?.projectVariants === "3 versions" && output.projects[0]?.variants && output.projects[0].variants.length > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-primary uppercase">Global Role Switcher:</span>
                {output.projects[0].variants.map((variant: any, vIdx: number) => {
                  const isGloballyActive = activeRoleIndex === vIdx;
                  return (
                    <button
                      key={vIdx}
                      onClick={() => {
                        const newActive: Record<number, number> = {};
                        const nextLive = JSON.parse(JSON.stringify(liveResume));
                        const originalOutput = resume.outputFull ? (typeof resume.outputFull === 'string' ? JSON.parse(resume.outputFull) : resume.outputFull) : null;
                        
                        (output.projects || []).forEach((_: any, idx: number) => {
                          newActive[idx] = vIdx;
                          if (originalOutput && originalOutput.projects[idx] && originalOutput.projects[idx].variants[vIdx]) {
                            nextLive.projects[idx].bullets = [...originalOutput.projects[idx].variants[vIdx].bullets];
                          } else if (nextLive.projects[idx].variants && nextLive.projects[idx].variants[vIdx]) {
                            nextLive.projects[idx].bullets = [...nextLive.projects[idx].variants[vIdx].bullets];
                          }
                        });
                        
                        setActiveProjectVariants(newActive);
                        setLiveResume(nextLive);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        isGloballyActive 
                          ? "bg-primary text-white shadow-xs" 
                          : "bg-surface border border-border text-text-muted hover:bg-border/30 hover:text-text"
                      }`}
                    >
                      {variant.role}
                    </button>
                  );
                })}
                <button
                  onClick={() => {
                    setActiveProjectVariants({});
                    const nextLive = JSON.parse(JSON.stringify(liveResume));
                    const originalOutput = resume.outputFull ? (typeof resume.outputFull === 'string' ? JSON.parse(resume.outputFull) : resume.outputFull) : null;
                    (output.projects || []).forEach((_: any, idx: number) => {
                      if (originalOutput && originalOutput.projects[idx]) {
                        nextLive.projects[idx].bullets = [...originalOutput.projects[idx].bullets];
                      }
                    });
                    setLiveResume(nextLive);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    Object.keys(activeProjectVariants).length === 0
                      ? "bg-text text-bg-base shadow-xs"
                      : "bg-surface border border-border text-text-muted hover:bg-border/30 hover:text-text"
                  }`}
                >
                  Standard (All)
                </button>
              </div>
            )}

          {(output.projects || []).map((proj, idx) => {
            const blockId = `proj_${idx}`;
            const projText = `${proj.title} (${proj.techStack})\n${(proj.bullets || []).map(b => `- ${b}`).join("\n")}`;

            return (
              <div key={idx} className="bg-surface border border-border rounded-2xl p-6 relative shadow-xs">
                <div className="flex justify-between items-center mb-4 border-b border-border/30 pb-2">
                  <div className="text-left">
                    <span className="text-[9px] font-bold text-primary tracking-wider uppercase block">Project #{idx + 1}</span>
                    <h4 
                      className="font-bold text-base text-text outline-none focus:bg-surface focus:ring-2 focus:ring-primary/40 rounded px-1 -mx-1"
                      contentEditable 
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        setLiveResume((prev: any) => {
                          const next = JSON.parse(JSON.stringify(prev));
                          next.projects[idx].title = e.target.textContent || "";
                          return next;
                        });
                      }}
                    >
                      {proj.title}
                    </h4>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        const inputProj = resume?.inputData?.projects?.[idx];
                        handleRegenerateSection(
                          blockId, 
                          `Project Bullet Points for ${proj.title}`, 
                          (proj.bullets || []).join("\n"), 
                          (newText) => {
                            setLiveResume((prev: any) => {
                              const next = JSON.parse(JSON.stringify(prev));
                              next.projects[idx].bullets = newText.split("\n").filter(Boolean);
                              return next;
                            });
                          },
                          idx < 2 ? 3 : 2,
                          {
                            title: proj.title,
                            techStack: proj.techStack,
                            description: inputProj?.description || "",
                            keyResult: inputProj?.keyResult || "",
                          }
                        );
                      }}
                      disabled={regeneratingStates[blockId]}
                      className="text-xs font-semibold text-text-muted hover:text-primary transition-colors flex items-center space-x-1 border border-border bg-bg-base/30 px-2.5 py-1.5 rounded-full cursor-pointer disabled:opacity-50"
                    >
                      {regeneratingStates[blockId] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">Regenerate</span>
                    </button>
                    <button
                      onClick={() => copyToClipboard(projText, blockId)}
                      className="text-xs font-semibold text-text-muted hover:text-primary transition-colors flex items-center space-x-1 border border-border bg-bg-base/30 px-2.5 py-1.5 rounded-full cursor-pointer"
                    >
                      {copiedStates[blockId] ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{copiedStates[blockId] ? "Copied!" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-[10px] font-bold text-text-muted">
                    <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-md uppercase">Tech Stack</span>
                    <span>{proj.techStack}</span>
                    {proj.duration && (
                      <>
                        <span>•</span>
                        <span>{proj.duration}</span>
                      </>
                    )}
                  </div>


                  <ul className="list-disc pl-5 space-y-2 text-sm font-medium leading-relaxed">
                    {(proj.bullets || []).map((bulletText: string, bIdx: number) => (
                      <li 
                        key={bIdx}
                        className="outline-none focus:bg-surface focus:ring-2 focus:ring-primary/40 rounded p-1 -m-1 transition-all"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          setLiveResume((prev: any) => {
                            const next = JSON.parse(JSON.stringify(prev));
                            next.projects[idx].bullets[bIdx] = e.target.textContent || "";
                            return next;
                          });
                        }}
                      >
                        {bulletText}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* Section: Experience (If added) */}
        {output.experience && output.experience.length > 0 && (
          <div className="space-y-4 print:hidden">
            <div className="border-b border-border/40 pb-2">
              <h3 className="text-xs font-bold text-text-muted tracking-wider uppercase">Internships & Professional Experience</h3>
            </div>

            {output.experience.map((exp, idx) => {
              const blockId = `exp_${idx}`;
              const expText = `${exp.company} - ${exp.role}\n${(exp.bullets || []).map(b => `- ${b}`).join("\n")}`;

              return (
                <div key={idx} className="bg-surface border border-border rounded-2xl p-6 relative shadow-xs">
                  <div className="flex justify-between items-center mb-4 border-b border-border/30 pb-2">
                    <div className="text-left">
                      <span className="text-[9px] font-bold text-primary tracking-wider uppercase block">{exp.duration}</span>
                      <h4 
                        className="font-bold text-base text-text outline-none focus:bg-surface focus:ring-2 focus:ring-primary/40 rounded px-1 -mx-1"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          setLiveResume((prev: any) => {
                            const next = JSON.parse(JSON.stringify(prev));
                            next.experience[idx].company = e.target.textContent || "";
                            return next;
                          });
                        }}
                      >
                        {exp.company}
                      </h4>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRegenerateSection(
                          blockId, 
                          `Experience Bullet Points for ${exp.role} at ${exp.company}`, 
                          (exp.bullets || []).join("\n"), 
                          (newText) => {
                            setLiveResume((prev: any) => {
                              const next = JSON.parse(JSON.stringify(prev));
                              next.experience[idx].bullets = newText.split("\n").filter(Boolean);
                              return next;
                            });
                          },
                          (exp.bullets || []).length || 3,
                          { title: `${exp.role} at ${exp.company}` }
                        )}
                        disabled={regeneratingStates[blockId]}
                        className="text-xs font-semibold text-text-muted hover:text-primary transition-colors flex items-center space-x-1 border border-border bg-bg-base/30 px-2.5 py-1.5 rounded-full cursor-pointer disabled:opacity-50"
                      >
                        {regeneratingStates[blockId] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">Regenerate</span>
                      </button>
                      <button
                        onClick={() => copyToClipboard(expText, blockId)}
                        className="text-xs font-semibold text-text-muted hover:text-primary transition-colors flex items-center space-x-1 border border-border bg-bg-base/30 px-2.5 py-1.5 rounded-full cursor-pointer"
                      >
                        {copiedStates[blockId] ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{copiedStates[blockId] ? "Copied!" : "Copy"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div 
                      className="text-[10px] font-bold text-primary uppercase outline-none focus:bg-surface focus:ring-2 focus:ring-primary/40 rounded px-1 -mx-1 inline-block"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        setLiveResume((prev: any) => {
                          const next = JSON.parse(JSON.stringify(prev));
                          next.experience[idx].role = e.target.textContent || "";
                          return next;
                        });
                      }}
                    >
                      {exp.role}
                    </div>
                    <ul className="list-disc pl-5 space-y-2 text-sm font-medium leading-relaxed">
                      {(exp.bullets || []).map((bulletText: string, bIdx: number) => (
                        <li 
                          key={bIdx}
                          className="outline-none focus:bg-surface focus:ring-2 focus:ring-primary/40 rounded p-1 -m-1 transition-all"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            setLiveResume((prev: any) => {
                              const next = JSON.parse(JSON.stringify(prev));
                              next.experience[idx].bullets[bIdx] = e.target.textContent || "";
                              return next;
                            });
                          }}
                        >
                          {bulletText}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Section: POR & Achievements */}
        {((output.positions && output.positions.length > 0) || (output.achievements && output.achievements.length > 0) || resume.inputData.skills?.certifications) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
            {output.positions && output.positions.length > 0 && (
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs">
                <h3 className="text-xs font-bold text-primary tracking-wider uppercase border-b border-border/40 pb-2 mb-4">Leadership / Club POR</h3>
                <div className="space-y-4">
                  {output.positions.map((pos, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span 
                          className="text-xs font-bold outline-none focus:bg-surface focus:ring-2 focus:ring-primary/40 rounded px-1 -mx-1"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            setLiveResume((prev: any) => {
                              const next = JSON.parse(JSON.stringify(prev));
                              next.positions[idx].title = e.target.textContent || "";
                              return next;
                            });
                          }}
                        >
                          {pos.title}
                        </span>
                        <span className="text-[9px] font-bold text-text-muted">{pos.organization}</span>
                      </div>
                      <p 
                        className="text-xs text-text-muted leading-relaxed font-medium outline-none focus:bg-surface focus:ring-2 focus:ring-primary/40 rounded p-1 -m-1"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          setLiveResume((prev: any) => {
                            const next = JSON.parse(JSON.stringify(prev));
                            next.positions[idx].bullet = e.target.textContent || "";
                            return next;
                          });
                        }}
                      >
                        {pos.bullet}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {output.achievements && output.achievements.length > 0 && (
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs">
                  <h3 className="text-xs font-bold text-primary tracking-wider uppercase border-b border-border/40 pb-2 mb-4">Key Achievements</h3>
                  <ul className="list-disc pl-4 space-y-2 text-xs font-medium leading-relaxed text-text-muted">
                    {output.achievements.map((ach: string, idx: number) => (
                      <li 
                        key={idx}
                        className="outline-none focus:bg-surface focus:ring-2 focus:ring-primary/40 rounded p-1 -m-1 transition-all"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          setLiveResume((prev: any) => {
                            const next = JSON.parse(JSON.stringify(prev));
                            next.achievements[idx] = e.target.textContent || "";
                            return next;
                          });
                        }}
                      >
                        {ach}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {resume.inputData.skills?.certifications && (
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs">
                  <h3 className="text-xs font-bold text-primary tracking-wider uppercase border-b border-border/40 pb-2 mb-4">Certifications</h3>
                  <div className="text-xs text-text-muted leading-relaxed font-medium outline-none focus:bg-surface focus:ring-2 focus:ring-primary/40 rounded p-1 -m-1 transition-all">
                    {resume.inputData.skills.certifications}
                  </div>
                  
                  <div className="mt-5 flex items-center space-x-3 bg-bg-base p-3 rounded-lg border border-border/50">
                    <input 
                      type="checkbox" 
                      id="includeCertifications" 
                      checked={includeCertifications} 
                      onChange={(e) => setIncludeCertifications(e.target.checked)} 
                      className="w-4 h-4 text-primary accent-primary rounded cursor-pointer"
                    />
                    <label htmlFor="includeCertifications" className="text-xs font-semibold text-text cursor-pointer select-none">
                      Include Certifications in PDF
                    </label>
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Dynamic Regeneration & Job Description Alignment Options */}
        <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 space-y-6 shadow-xs print:hidden">
          <div className="border-b border-border/40 pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">Regenerate and Align Keywords</h3>
              <p className="text-xs text-text-muted font-medium">Fine-tune the output by altering tone or aligning with a specific job description.</p>
            </div>
            <span className="text-xs font-bold bg-border/40 px-3 py-1 rounded-full">
              Used: {regenerationsCount} / 3
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold mb-2">Adjust Tone</label>
              <select
                className="w-full px-3 py-2 border rounded-lg bg-bg-base focus:ring-1 focus:ring-primary focus:border-transparent outline-hidden text-xs font-semibold"
                value={customTone}
                onChange={(e) => setCustomTone(e.target.value)}
              >
                <option value="Professional & Formal">Professional & Formal (Recruiter standard)</option>
                <option value="Modern & Concise">Modern & Concise (Punchy metrics)</option>
                <option value="Technical & Detailed">Technical & Detailed (Tech-heavy focus)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-2">Align with a Job Description</label>
              <textarea
                id="jobDescriptionInput"
                rows={3}
                className="w-full px-3 py-2 border rounded-lg bg-bg-base focus:ring-1 focus:ring-primary focus:border-transparent outline-hidden text-xs font-medium transition-all"
                placeholder="Paste the target job qualifications here to inject key verbs..."
                value={customJD}
                onChange={(e) => setCustomJD(e.target.value)}
              />
            </div>

            <button
              onClick={handleRegenerate}
              disabled={isRegenerating || regenerationsCount >= 3}
              className="px-6 py-3.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-full inline-flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Alignment...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Re-Generate Content</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Plain Text Full Export Panel */}
        <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 space-y-4 shadow-xs print:hidden">
          <div className="flex justify-between items-center border-b border-border/40 pb-3">
            <div>
              <h3 className="font-bold text-base">Full Plain-Text Export</h3>
              <p className="text-[11px] text-text-muted font-semibold mt-0.5">This format parses with 100% correctness inside standard ATS portals.</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => copyToClipboard(fullPlainTextContent, "fullPlain")}
                className="text-xs font-semibold text-text-muted hover:text-primary transition-colors flex items-center space-x-1 border border-border bg-bg-base/30 px-3 py-1.5 rounded-full cursor-pointer"
              >
                {copiedStates["fullPlain"] ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedStates["fullPlain"] ? "Copied!" : "Copy All"}</span>
              </button>
              
              <button
                onClick={() => {
                  const blob = new Blob([fullPlainTextContent], { type: "text/plain;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `ATSLift_${resume.inputData.personal.fullName.replace(/\s+/g, "_")}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="text-xs font-semibold text-text-muted hover:text-primary transition-colors flex items-center space-x-1 border border-border bg-bg-base/30 px-3 py-1.5 rounded-full cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>.txt File</span>
              </button>
            </div>
          </div>

          <textarea
            readOnly
            rows={10}
            className="w-full p-4 rounded-xl border border-border bg-bg-base/80 font-mono text-[11px] leading-relaxed text-text outline-hidden focus:ring-1 focus:ring-primary"
            value={fullPlainTextContent}
          />
        </div>

        {/* PRINT PREVIEW TRIGGER BANNER */}
        <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs print:hidden">
          <div className="text-left space-y-1">
            <h4 className="font-bold text-sm">Download PDF Resume Document</h4>
            <p className="text-xs text-text-muted font-medium">Generate a clean, print-optimized document preview ready to save as PDF.</p>
          </div>
          <button
            onClick={triggerBrowserPrint}
            className="px-6 py-3.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-full flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4.5 h-4.5" />
            <span>Generate PDF Document</span>
          </button>
        </div>

        </div>
        {/* end right scrollable column */}

      </main>
    </div>
  );
}
