"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, Copy, Download, RefreshCw, FileText, Printer, ArrowLeft, Check, AlertTriangle, Lock } from "lucide-react";
import confetti from "canvas-confetti";
import { FullResumeOutput } from "@/types/resume";
import { getLocalSession } from "@/lib/authClient";
import ResumePreviewPanel from "@/components/ResumePreviewPanel";

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
  
  // Custom regeneration states
  const [customTone, setCustomTone] = useState<string>("Professional & Formal");
  const [customJD, setCustomJD] = useState<string>("");
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
        }

        // Retry fetch up to 3 times if payment status isn't PAID
        let data = null;
        let retries = 0;
        const maxRetries = 3;
        
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
          
          if (data.paymentStatus === "PAID" || !isSandbox) {
            break;
          }
          
          retries++;
          if (retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        setResume(data);
        if (data.paymentStatus === "PAID" && data.outputFull) {
          setLiveResume(data.outputFull);
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

  const handleRegenerateSection = async (id: string, sectionType: string, currentText: string, onUpdate: (newText: string) => void) => {
    setRegeneratingStates((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch("/api/generate-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionType, currentText }),
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
  if (resume.paymentStatus !== "PAID") {
    return (
      <div className="min-h-screen bg-bg-base text-text flex flex-col items-center justify-center font-sans p-6 text-center">
        <Lock className="w-12 h-12 text-warning mb-4" />
        <h2 className="text-xl font-bold mb-2">Content is Locked</h2>
        <p className="text-sm text-text-muted max-w-md mb-6">
          Payment has not been confirmed for this resume record yet. Please complete checkout to unlock your ATS content.
        </p>
        <Link href={`/result/${resumeId}`} className="px-6 py-3 bg-primary text-white rounded-full font-bold text-sm">
          Go to Checkout page
        </Link>
      </div>
    );
  }

  const output: FullResumeOutput = liveResume || resume.outputFull;
  
  // Format the full plain-text version ready for clean Copy All operations
  const fullPlainTextContent = `
${resume.inputData.personal.fullName.toUpperCase()}
Email: ${resume.inputData.personal.email}${resume.inputData.personal.phone ? ` | Phone: ${resume.inputData.personal.phone}` : ""}${resume.inputData.personal.linkedin ? ` | LinkedIn: ${resume.inputData.personal.linkedin}` : ""}${resume.inputData.personal.github ? ` | GitHub: ${resume.inputData.personal.github}` : ""}
Target: ${resume.inputData.personal.targetRole} ${resume.inputData.personal.branch ? `(${resume.inputData.personal.branch})` : ""}
Education: ${output.pgEducation || resume.inputData.personal.hasPG ? `[PG] ${output.pgEducation?.degree || `${resume.inputData.personal.pgDegreeName} in ${resume.inputData.personal.pgBranch}`} - ${output.pgEducation?.institution || resume.inputData.personal.pgCollegeName} (${output.pgEducation?.year || resume.inputData.personal.pgGraduationYear}) | CGPA: ${output.pgEducation?.cgpa || `${resume.inputData.personal.pgCgpa}/10.0`} ; ` : ""}[UG] ${output.education.degree} - ${output.education.institution} (${output.education.year}) | CGPA: ${output.education.cgpa}

PROFESSIONAL SUMMARY
${output.summary}

TECHNICAL SKILLS
- Languages: ${output.skills.languages.join(", ")}
- Frameworks & Libraries: ${output.skills.frameworks.join(", ")}
- Tools & Platforms: ${output.skills.tools.join(", ")}
- Databases: ${output.skills.databases.join(", ")}
- Core Concepts: ${output.skills.concepts.join(", ")}
${output.skills.softSkills && output.skills.softSkills.length > 0 ? `- Soft Skills: ${output.skills.softSkills.join(", ")}\n` : ""}

PROJECTS
${output.projects.map(proj => `
${proj.title} (${proj.techStack})
${proj.duration ? `Duration: ${proj.duration}\n` : ""}${proj.bullets.map(b => `- ${b}`).join("\n")}
`).join("\n")}
${output.experience.length > 0 ? `
EXPERIENCE
${output.experience.map(exp => `
${exp.company} - ${exp.role} (${exp.duration})
${exp.bullets.map(b => `- ${b}`).join("\n")}
`).join("\n")}
` : ""}${output.positions.length > 0 ? `
POSITIONS OF RESPONSIBILITY
${output.positions.map(pos => `
${pos.title} - ${pos.organization}
- ${pos.bullet}
`).join("\n")}
` : ""}${output.achievements.length > 0 ? `
ACHIEVEMENTS
${output.achievements.map(ach => `- ${ach}`).join("\n")}
` : ""}
  `.trim();

  return (
    <div className="h-auto lg:h-screen lg:overflow-hidden bg-bg-base text-text flex flex-col font-sans print:h-auto print:overflow-visible print:bg-white print:text-black">
      {/* Navbar (hidden during print) */}
      <header className="glass-panel border-b border-border/40 px-6 py-4 flex items-center justify-between print:hidden">
        <div className="flex items-center space-x-2">
          <Link href="/" className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm tracking-wider cursor-pointer">
            RF
          </Link>
          <span className="font-bold text-lg tracking-tight text-text">
            Resume<span className="text-primary font-medium font-serif italic">Forge</span>
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
        </div>
      </header>

      {/* 2-column layout — fills remaining viewport height */}
      <main className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row print:block print:overflow-visible print:h-auto">

        {/* ── LEFT: Fixed-height Resume Preview (never scrolls) ── */}
        <div className="w-full h-[45vh] lg:h-full lg:w-[42%] flex-shrink-0 flex flex-col p-3 md:p-5 pb-2 md:pb-4 border-b lg:border-b-0 lg:border-r border-border/40 print:hidden overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Resume Preview</span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-success bg-success/10 border border-success/25 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Unlocked
              </span>
              <button
                onClick={triggerBrowserPrint}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/10 border border-primary/25 px-2.5 py-1 rounded-full hover:bg-primary/15 transition-colors cursor-pointer"
              >
                <Printer className="w-3 h-3" /> Save PDF
              </button>
            </div>
          </div>
          {/* Preview fills all remaining height */}
          <div className="flex-1 overflow-hidden min-h-0">
            <ResumePreviewPanel resume={resume} output={output} locked={false} />
          </div>
        </div>

        {/* ── RIGHT: Only this column scrolls ── */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-8 print:p-0 print:m-0 print:overflow-visible">

          {/* Page title */}
          <div className="text-center print:hidden space-y-2 pt-1">
            <h1 className="text-2xl md:text-3xl font-serif tracking-tight">🎉 Your Resume Content is Ready!</h1>
            <p className="text-xs text-text-muted max-w-lg mx-auto leading-relaxed font-medium">
              Copy-paste bullet points directly into your resume template.
            </p>
          </div>

        {/* Printable View Stylesheet Injector */}
        <style jsx global>{`
          @page {
            size: letter;
            margin: 0.6in 0.6in 0.6in 0.6in;
            @top-left { content: ""; }
            @top-center { content: ""; }
            @top-right { content: ""; }
            @bottom-left { content: ""; }
            @bottom-center { content: ""; }
            @bottom-right { content: ""; }
          }
          @media print {
            @page {
              size: letter;
              margin: 0.6in 0.6in 0.6in 0.6in !important;
              @top-left { content: ""; }
              @top-center { content: ""; }
              @top-right { content: ""; }
              @bottom-left { content: ""; }
              @bottom-center { content: ""; }
              @bottom-right { content: ""; }
            }
            body {
              background-color: white !important;
              color: #222222 !important;
              padding: 0 !important;
              margin: 0 !important;
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print\:hidden {
              display: none !important;
            }
            .print\:border-none {
              border: none !important;
              box-shadow: none !important;
              background: transparent !important;
              padding: 0 !important;
            }
            a {
              color: #333333 !important;
              text-decoration: none !important;
            }
          }
        `}</style>

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
            className="text-sm font-medium leading-relaxed outline-none focus:bg-white focus:ring-2 focus:ring-primary/40 rounded p-1.5 -m-1.5 transition-all"
            contentEditable 
            suppressContentEditableWarning 
            onBlur={(e) => setLiveResume((prev: any) => ({ ...prev, summary: e.target.textContent || "" }))}
          >
            {output.summary}
          </p>
        </div>

        {/* Section: Skills Badges Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 relative shadow-xs print:hidden">
          <div className="flex justify-between items-center mb-5 border-b border-border/40 pb-3">
            <h3 className="text-xs font-bold text-primary tracking-wider uppercase">Technical Core Skills</h3>
            <button
              onClick={() => {
                const skillsText = `
Languages: ${output.skills.languages.join(", ")}
Frameworks: ${output.skills.frameworks.join(", ")}
Tools: ${output.skills.tools.join(", ")}
Databases: ${output.skills.databases.join(", ")}
Concepts: ${output.skills.concepts.join(", ")}
                `.trim();
                copyToClipboard(skillsText, "skills");
              }}
              className="text-xs font-semibold text-text-muted hover:text-primary transition-colors flex items-center space-x-1 border border-border bg-bg-base/30 px-2.5 py-1.5 rounded-full cursor-pointer"
            >
              {copiedStates["skills"] ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedStates["skills"] ? "Copied!" : "Copy Skills"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: "Programming Languages", data: output.skills.languages },
              { title: "Frameworks & Libraries", data: output.skills.frameworks },
              { title: "Databases & Storage", data: output.skills.databases },
              { title: "Tools & Architectures", data: output.skills.tools },
              { title: "Core CS Concepts", data: output.skills.concepts }
            ].map((cat, idx) => (
              <div key={idx} className="space-y-2">
                <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">{cat.title}</span>
                <div className="flex flex-wrap gap-2">
                  {cat.data.map((skillName, sIdx) => (
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
        <div className="space-y-4 print:hidden">
          <div className="border-b border-border/40 pb-2">
            <h3 className="text-xs font-bold text-text-muted tracking-wider uppercase">ATS Project Bullet Points</h3>
          </div>

          {output.projects.map((proj, idx) => {
            const blockId = `proj_${idx}`;
            const projText = `${proj.title} (${proj.techStack})\n${proj.bullets.map(b => `- ${b}`).join("\n")}`;

            return (
              <div key={idx} className="bg-surface border border-border rounded-2xl p-6 relative shadow-xs">
                <div className="flex justify-between items-center mb-4 border-b border-border/30 pb-2">
                  <div className="text-left">
                    <span className="text-[9px] font-bold text-primary tracking-wider uppercase block">Project #{idx + 1}</span>
                    <h4 
                      className="font-bold text-base text-text outline-none focus:bg-white focus:ring-2 focus:ring-primary/40 rounded px-1 -mx-1"
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
                      onClick={() => handleRegenerateSection(
                        blockId, 
                        `Project Bullet Points for ${proj.title}`, 
                        proj.bullets.join("\n"), 
                        (newText) => {
                          setLiveResume((prev: any) => {
                            const next = JSON.parse(JSON.stringify(prev));
                            next.projects[idx].bullets = newText.split("\n").filter(Boolean);
                            return next;
                          });
                        }
                      )}
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
                    {proj.bullets.map((bulletText: string, bIdx: number) => (
                      <li 
                        key={bIdx}
                        className="outline-none focus:bg-white focus:ring-2 focus:ring-primary/40 rounded p-1 -m-1 transition-all"
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

        {/* Section: Experience (If added) */}
        {output.experience.length > 0 && (
          <div className="space-y-4 print:hidden">
            <div className="border-b border-border/40 pb-2">
              <h3 className="text-xs font-bold text-text-muted tracking-wider uppercase">Internships & Professional Experience</h3>
            </div>

            {output.experience.map((exp, idx) => {
              const blockId = `exp_${idx}`;
              const expText = `${exp.company} - ${exp.role}\n${exp.bullets.map(b => `- ${b}`).join("\n")}`;

              return (
                <div key={idx} className="bg-surface border border-border rounded-2xl p-6 relative shadow-xs">
                  <div className="flex justify-between items-center mb-4 border-b border-border/30 pb-2">
                    <div className="text-left">
                      <span className="text-[9px] font-bold text-primary tracking-wider uppercase block">{exp.duration}</span>
                      <h4 
                        className="font-bold text-base text-text outline-none focus:bg-white focus:ring-2 focus:ring-primary/40 rounded px-1 -mx-1"
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
                          exp.bullets.join("\n"), 
                          (newText) => {
                            setLiveResume((prev: any) => {
                              const next = JSON.parse(JSON.stringify(prev));
                              next.experience[idx].bullets = newText.split("\n").filter(Boolean);
                              return next;
                            });
                          }
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
                      className="text-[10px] font-bold text-primary uppercase outline-none focus:bg-white focus:ring-2 focus:ring-primary/40 rounded px-1 -mx-1 inline-block"
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
                      {exp.bullets.map((bulletText: string, bIdx: number) => (
                        <li 
                          key={bIdx}
                          className="outline-none focus:bg-white focus:ring-2 focus:ring-primary/40 rounded p-1 -m-1 transition-all"
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
        {(output.positions.length > 0 || output.achievements.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
            {output.positions.length > 0 && (
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs">
                <h3 className="text-xs font-bold text-primary tracking-wider uppercase border-b border-border/40 pb-2 mb-4">Leadership / Club POR</h3>
                <div className="space-y-4">
                  {output.positions.map((pos, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span 
                          className="text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-primary/40 rounded px-1 -mx-1"
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
                        className="text-xs text-text-muted leading-relaxed font-medium outline-none focus:bg-white focus:ring-2 focus:ring-primary/40 rounded p-1 -m-1"
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

            {output.achievements.length > 0 && (
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs">
                <h3 className="text-xs font-bold text-primary tracking-wider uppercase border-b border-border/40 pb-2 mb-4">Key Achievements</h3>
                <ul className="list-disc pl-4 space-y-2 text-xs font-medium leading-relaxed text-text-muted">
                  {output.achievements.map((ach: string, idx: number) => (
                    <li 
                      key={idx}
                      className="outline-none focus:bg-white focus:ring-2 focus:ring-primary/40 rounded p-1 -m-1 transition-all"
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
                rows={3}
                className="w-full px-3 py-2 border rounded-lg bg-bg-base focus:ring-1 focus:ring-primary focus:border-transparent outline-hidden text-xs font-medium"
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

        {/* PRINTABLE DRAFT CONTAINER (Only visible when printing / invisible during standard UI scrolling) */}
        <div className="hidden print:block print:border-none print:p-0 print:m-0 text-[#222222]" style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: "10.5pt", lineHeight: "1.3" }}>
          {/* Header */}
          <div className="text-center" style={{ marginBottom: "14pt" }}>
            <h1 style={{ fontSize: "23pt", fontWeight: "bold", textTransform: "uppercase", margin: "0 0 3pt 0", color: "#111111", letterSpacing: "-0.5px" }}>
              {resume.inputData.personal.fullName.toUpperCase()}
            </h1>
            {/* Contact row — 9pt, single line, tighter gap */}
            <div style={{ fontSize: "9pt", color: "#333333", margin: "0", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", flexWrap: "nowrap", whiteSpace: "nowrap" }}>
              <a href={`mailto:${resume.inputData.personal.email}`} style={{ color: "#333333", textDecoration: "none" }}>
                {resume.inputData.personal.email}
              </a>
              {resume.inputData.personal.phone && (
                <>
                  <span style={{ color: "#aaaaaa", margin: "0 1px" }}>|</span>
                  <span>{formatPhone(resume.inputData.personal.phone)}</span>
                </>
              )}
              {resume.inputData.personal.linkedin && (
                <>
                  <span style={{ color: "#aaaaaa", margin: "0 1px" }}>|</span>
                  <a href={getLinkedInUrl(resume.inputData.personal.linkedin)} target="_blank" rel="noopener noreferrer" style={{ color: "#333333", textDecoration: "none" }}>
                    {formatLinkedIn(resume.inputData.personal.linkedin)}
                  </a>
                </>
              )}
              {resume.inputData.personal.github && (
                <>
                  <span style={{ color: "#aaaaaa", margin: "0 1px" }}>|</span>
                  <a href={getGitHubUrl(resume.inputData.personal.github)} target="_blank" rel="noopener noreferrer" style={{ color: "#333333", textDecoration: "none" }}>
                    {formatGitHub(resume.inputData.personal.github)}
                  </a>
                </>
              )}
            </div>
          </div>

          {/* 1. Education Section */}
          <div style={{ marginBottom: "15pt" }}>
            <h3 style={{ fontSize: "13pt", fontWeight: "bold", textTransform: "uppercase", color: "#1a1a1a", margin: "0 0 3pt 0", letterSpacing: "0.4px" }}>
              Education
            </h3>
            <div style={{ height: "0.5px", backgroundColor: "#cccccc", marginBottom: "6pt" }} />
            
            {/* PG Education (If provided) */}
            {(output.pgEducation || resume.inputData.personal.hasPG) && (
              <div style={{ marginBottom: "7pt" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px", fontSize: "10.5pt", fontWeight: "bold" }}>
                  <span style={{ flex: 1 }}>{output.pgEducation?.institution || resume.inputData.personal.pgCollegeName}</span>
                  <span style={{ fontSize: "10pt", fontWeight: "normal", color: "#555555", flexShrink: 0 }}>Graduation: {output.pgEducation?.year || resume.inputData.personal.pgGraduationYear}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px", fontSize: "10pt", color: "#444444", marginTop: "2pt" }}>
                  <span style={{ flex: 1 }}>{output.pgEducation?.degree || `${resume.inputData.personal.pgDegreeName || "Post Graduation"} in ${resume.inputData.personal.pgBranch}`}</span>
                  <span style={{ flexShrink: 0 }}>CGPA: {output.pgEducation?.cgpa || `${resume.inputData.personal.pgCgpa} / 10.0`}</span>
                </div>
              </div>
            )}

            {/* UG Education */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px", fontSize: "10.5pt", fontWeight: "bold" }}>
                <span style={{ flex: 1 }}>{output.education.institution}</span>
                <span style={{ fontSize: "10pt", fontWeight: "normal", color: "#555555", flexShrink: 0 }}>Graduation: {output.education.year}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px", fontSize: "10pt", color: "#444444", marginTop: "2pt" }}>
                <span style={{ flex: 1 }}>{output.education.degree} ({resume.inputData.personal.branch || "Engineering"})</span>
                <span style={{ flexShrink: 0 }}>CGPA: {output.education.cgpa}</span>
              </div>
            </div>
          </div>

          {/* 2. Technical Skills Section */}
          <div style={{ marginBottom: "15pt" }}>
            <h3 style={{ fontSize: "13pt", fontWeight: "bold", textTransform: "uppercase", color: "#1a1a1a", margin: "0 0 3pt 0", letterSpacing: "0.4px" }}>
              Technical Skills
            </h3>
            <div style={{ height: "0.5px", backgroundColor: "#cccccc", marginBottom: "6pt" }} />
            <div style={{ fontSize: "10.5pt", lineHeight: "1.4" }}>
              {output.skills.languages && output.skills.languages.length > 0 && (
                <p style={{ margin: "0 0 4pt 0" }}>
                  <strong>Programming:</strong> {output.skills.languages.join(", ")}
                </p>
              )}
              {output.skills.frameworks && output.skills.frameworks.length > 0 && (
                <p style={{ margin: "0 0 4pt 0" }}>
                  <strong>Frameworks:</strong> {output.skills.frameworks.join(", ")}
                </p>
              )}
              {output.skills.databases && output.skills.databases.length > 0 && (
                <p style={{ margin: "0 0 4pt 0" }}>
                  <strong>Databases:</strong> {output.skills.databases.join(", ")}
                </p>
              )}
              {output.skills.tools && output.skills.tools.length > 0 && (
                <p style={{ margin: "0 0 4pt 0" }}>
                  <strong>Tools:</strong> {output.skills.tools.join(", ")}
                </p>
              )}
              {output.skills.concepts && output.skills.concepts.length > 0 && (
                <p style={{ margin: output.skills.softSkills && output.skills.softSkills.length > 0 ? "0 0 4pt 0" : "0" }}>
                  <strong>Concepts:</strong> {output.skills.concepts.join(", ")}
                </p>
              )}
              {output.skills.softSkills && output.skills.softSkills.length > 0 && (
                <p style={{ margin: "0" }}>
                  <strong>Soft Skills:</strong> {output.skills.softSkills.join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* 3. Academic Projects Section */}
          <div style={{ marginBottom: "15pt" }}>
            <h3 style={{ fontSize: "13pt", fontWeight: "bold", textTransform: "uppercase", color: "#1a1a1a", margin: "0 0 3pt 0", letterSpacing: "0.4px" }}>
              Academic Projects
            </h3>
            <div style={{ height: "0.5px", backgroundColor: "#cccccc", marginBottom: "6pt" }} />
            {output.projects.map((proj, idx) => (
              <div key={idx} style={{ marginBottom: idx === output.projects.length - 1 ? "0" : "11pt" }}>
                {/* Project Title */}
                <div style={{ fontSize: "11pt", fontWeight: "bold", color: "#111111", margin: "0" }}>
                  {proj.title}
                </div>
                
                {/* Tech Stack and Dates Line */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "10px", fontSize: "10pt", color: "#555555", marginTop: "3px", lineHeight: "1.25" }}>
                  <span style={{ fontStyle: "italic", flex: 1 }}>{proj.techStack}</span>
                  <span style={{ whiteSpace: "nowrap", flexShrink: 0 }}>{proj.duration}</span>
                </div>

                {/* Bullets */}
                <ul style={{ listStyleType: "disc", paddingLeft: "15px", margin: "6px 0 0 0", fontSize: "10.5pt", color: "#333333" }}>
                  {proj.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} style={{ marginBottom: bIdx === proj.bullets.length - 1 ? "0" : "5px", lineHeight: "1.35" }}>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* 4. Experience & Leadership Section */}
          {((output.experience && output.experience.length > 0) || (output.positions && output.positions.length > 0)) && (
            <div style={{ marginBottom: "15pt" }}>
              <h3 style={{ fontSize: "13pt", fontWeight: "bold", textTransform: "uppercase", color: "#1a1a1a", margin: "0 0 3pt 0", letterSpacing: "0.4px" }}>
                Experience & Leadership
              </h3>
              <div style={{ height: "0.5px", backgroundColor: "#cccccc", marginBottom: "6pt" }} />
              
              {/* Internships */}
              {output.experience && output.experience.map((exp, idx) => (
                <div key={`exp_${idx}`} style={{ marginBottom: "8pt" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
                    <div style={{ fontSize: "10.5pt", flex: 1 }}>
                      <strong style={{ color: "#111111" }}>{exp.company}</strong>
                      <span style={{ fontSize: "10pt", color: "#444444", marginLeft: "6pt" }}>
                        — {exp.role}
                      </span>
                    </div>
                    <span style={{ fontSize: "10pt", color: "#555555", flexShrink: 0 }}>
                      {exp.duration}
                    </span>
                  </div>
                  <ul style={{ listStyleType: "disc", paddingLeft: "15px", margin: "6pt 0 0 0", fontSize: "10.5pt" }}>
                    {exp.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} style={{ marginBottom: bIdx === exp.bullets.length - 1 ? "0" : "5px", lineHeight: "1.35" }}>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Positions of Responsibility */}
              {output.positions && output.positions.map((pos, idx) => (
                <div key={`pos_${idx}`} style={{ marginBottom: idx === output.positions.length - 1 ? "0" : "6pt" }}>
                  <div style={{ fontSize: "10.5pt" }}>
                    <strong style={{ color: "#111111" }}>{pos.title}</strong>
                    <span style={{ fontSize: "10pt", color: "#555555", marginLeft: "6pt" }}>
                      ({pos.organization})
                    </span>
                  </div>
                  <p style={{ fontSize: "10.5pt", margin: "5px 0 0 15px", lineHeight: "1.35" }}>
                    • {pos.bullet}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* 5. Key Achievements Section */}
          {output.achievements && output.achievements.length > 0 && (
            <div style={{ marginBottom: "15pt" }}>
              <h3 style={{ fontSize: "13pt", fontWeight: "bold", textTransform: "uppercase", color: "#1a1a1a", margin: "0 0 3pt 0", letterSpacing: "0.4px" }}>
                Key Achievements
              </h3>
              <div style={{ height: "0.5px", backgroundColor: "#cccccc", marginBottom: "6pt" }} />
              <ul style={{ listStyleType: "disc", paddingLeft: "15px", margin: "0", fontSize: "10.5pt" }}>
                {output.achievements.map((ach, idx) => (
                  <li key={idx} style={{ marginBottom: idx === output.achievements.length - 1 ? "0" : "5px", lineHeight: "1.35" }}>
                    {ach}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 6. Certifications Section */}
          {resume.inputData.skills.certifications && (
            <div style={{ marginBottom: "0pt" }}>
              <h3 style={{ fontSize: "13pt", fontWeight: "bold", textTransform: "uppercase", color: "#1a1a1a", margin: "0 0 3pt 0", letterSpacing: "0.4px" }}>
                Certifications
              </h3>
              <div style={{ height: "0.5px", backgroundColor: "#cccccc", marginBottom: "6pt" }} />
              <div style={{ fontSize: "10.5pt", lineHeight: "1.4" }}>
                {resume.inputData.skills.certifications}
              </div>
            </div>
          )}
        </div>
        {/* end printable block */}

        </div>
        {/* end right scrollable column */}

      </main>
    </div>
  );
}
