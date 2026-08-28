"use client";

import { use, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, Copy, Download, RefreshCw, FileText, Printer, ArrowLeft, Check, AlertTriangle, Lock, Zap, Sparkles, RotateCcw, ShieldCheck, Edit3, Plus, Trash2, ArrowUp, ArrowDown, X, GripVertical, ChevronLeft, ChevronRight, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { FullResumeOutput } from "@/types/resume";
import { calculateDynamicMetrics } from "@/lib/atsScoring";
import { getLocalSession } from "@/lib/authClient";
import ResumePreviewPanel, { formatEducationScore } from "@/components/ResumePreviewPanel";
import CoverLetterModal from "@/components/CoverLetterModal";
import AIVerificationSection from "@/components/AIVerificationSection";
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
  const [isCoverLetterModalOpen, setCoverLetterModalOpen] = useState(false);
  const [isVerificationModalOpen, setVerificationModalOpen] = useState(false);
  const [activeProjectVariants, setActiveProjectVariants] = useState<Record<number, number>>({});
  const [scoreMode, setScoreMode] = useState<"resume" | "role">("resume");
  
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState<Record<number, string>>({});
  const [skillInputModes, setSkillInputModes] = useState<Record<number, "single" | "comma">>({});
  const [isEditingEducation, setIsEditingEducation] = useState(false);

  const handleUpdateCategoryName = (catIdx: number, newName: string) => {
    setLiveResume((prev: any) => {
      const baseSkills = prev?.skills ? [...prev.skills] : [...(output?.skills || [])];
      const nextSkills = JSON.parse(JSON.stringify(baseSkills));
      if (nextSkills[catIdx]) {
        nextSkills[catIdx].category = newName;
      }
      return { ...(prev || output), skills: nextSkills };
    });
  };

  const handleAddSkillBadge = (catIdx: number) => {
    const skillToAdd = (newSkillInput[catIdx] || "").trim();
    if (!skillToAdd) return;
    setLiveResume((prev: any) => {
      const baseSkills = prev?.skills ? [...prev.skills] : [...(output?.skills || [])];
      const nextSkills = JSON.parse(JSON.stringify(baseSkills));
      if (nextSkills[catIdx]) {
        if (!Array.isArray(nextSkills[catIdx].skills)) nextSkills[catIdx].skills = [];
        nextSkills[catIdx].skills.push(skillToAdd);
      }
      return { ...(prev || output), skills: nextSkills };
    });
    setNewSkillInput(prev => ({ ...prev, [catIdx]: "" }));
  };

  const handleDeleteSkillBadge = (catIdx: number, skillIdx: number) => {
    setLiveResume((prev: any) => {
      const baseSkills = prev?.skills ? [...prev.skills] : [...(output?.skills || [])];
      const nextSkills = JSON.parse(JSON.stringify(baseSkills));
      if (nextSkills[catIdx] && Array.isArray(nextSkills[catIdx].skills)) {
        nextSkills[catIdx].skills.splice(skillIdx, 1);
      }
      return { ...(prev || output), skills: nextSkills };
    });
  };

  const handleMoveSkillBadge = (catIdx: number, skillIdx: number, direction: "left" | "right") => {
    setLiveResume((prev: any) => {
      const baseSkills = prev?.skills ? [...prev.skills] : [...(output?.skills || [])];
      const nextSkills = JSON.parse(JSON.stringify(baseSkills));
      if (nextSkills[catIdx] && Array.isArray(nextSkills[catIdx].skills)) {
        const targetIdx = direction === "left" ? skillIdx - 1 : skillIdx + 1;
        if (targetIdx < 0 || targetIdx >= nextSkills[catIdx].skills.length) return prev;
        const temp = nextSkills[catIdx].skills[skillIdx];
        nextSkills[catIdx].skills[skillIdx] = nextSkills[catIdx].skills[targetIdx];
        nextSkills[catIdx].skills[targetIdx] = temp;
      }
      return { ...(prev || output), skills: nextSkills };
    });
  };

  const handleAddBulkSkills = (catIdx: number, rawInput: string) => {
    if (!rawInput.trim()) return;
    const newSkills = rawInput
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
    if (newSkills.length === 0) return;

    setLiveResume((prev: any) => {
      const baseSkills = prev?.skills ? [...prev.skills] : [...(output?.skills || [])];
      const nextSkills = JSON.parse(JSON.stringify(baseSkills));
      if (nextSkills[catIdx]) {
        if (!Array.isArray(nextSkills[catIdx].skills)) nextSkills[catIdx].skills = [];
        newSkills.forEach(s => {
          if (!nextSkills[catIdx].skills.includes(s)) {
            nextSkills[catIdx].skills.push(s);
          }
        });
      }
      return { ...(prev || output), skills: nextSkills };
    });
  };

  const handleDeleteCategoryRow = (catIdx: number) => {
    setLiveResume((prev: any) => {
      const baseSkills = prev?.skills ? [...prev.skills] : [...(output?.skills || [])];
      const nextSkills = JSON.parse(JSON.stringify(baseSkills));
      nextSkills.splice(catIdx, 1);
      return { ...(prev || output), skills: nextSkills };
    });
  };

  const handleMoveCategoryRow = (catIdx: number, direction: "up" | "down") => {
    setLiveResume((prev: any) => {
      const baseSkills = prev?.skills ? [...prev.skills] : [...(output?.skills || [])];
      const nextSkills = JSON.parse(JSON.stringify(baseSkills));
      const targetIdx = direction === "up" ? catIdx - 1 : catIdx + 1;
      if (targetIdx < 0 || targetIdx >= nextSkills.length) return prev;
      const temp = nextSkills[catIdx];
      nextSkills[catIdx] = nextSkills[targetIdx];
      nextSkills[targetIdx] = temp;
      return { ...(prev || output), skills: nextSkills };
    });
  };

  const handleAddCategoryRow = () => {
    setLiveResume((prev: any) => {
      const baseSkills = prev?.skills ? [...prev.skills] : [...(output?.skills || [])];
      const nextSkills = JSON.parse(JSON.stringify(baseSkills));
      nextSkills.push({
        category: "New Skill Category",
        skills: ["Skill 1"]
      });
      return { ...(prev || output), skills: nextSkills };
    });
  };

  const [editingProjectIdx, setEditingProjectIdx] = useState<number | null>(null);
  const [projectEditTexts, setProjectEditTexts] = useState<Record<number, { title: string; techStack: string; duration: string; bulletsText: string }>>({});

  const startEditingProject = (idx: number, proj: any) => {
    setEditingProjectIdx(idx);
    setProjectEditTexts((prev) => ({
      ...prev,
      [idx]: {
        title: proj.title || "",
        techStack: proj.techStack || "",
        duration: proj.duration || "",
        bulletsText: (proj.bullets || []).join("\n"),
      },
    }));
  };

  const saveProjectEdit = (idx: number) => {
    const currentEdit = projectEditTexts[idx];
    if (!currentEdit) return;

    const newBullets = currentEdit.bulletsText
      .split(/\n|(?<=\.)\s*[*•]\s*|\s+\*\s+/)
      .map((line) => line.replace(/^[\s•\-\*]+/, "").trim())
      .filter(Boolean);

    setLiveResume((prev: any) => {
      const currentOutput = prev || output;
      const next = JSON.parse(JSON.stringify(currentOutput));
      if (next.projects && next.projects[idx]) {
        next.projects[idx].title = currentEdit.title.trim() || next.projects[idx].title;
        next.projects[idx].techStack = currentEdit.techStack.trim() || next.projects[idx].techStack;
        next.projects[idx].duration = currentEdit.duration.trim() || next.projects[idx].duration;
        next.projects[idx].bullets = newBullets;
      }
      return next;
    });

    setEditingProjectIdx(null);
  };

  const handleDeleteProject = (idx: number) => {
    if (typeof window !== "undefined" && !window.confirm("Are you sure you want to delete this project from your resume?")) {
      return;
    }
    setLiveResume((prev: any) => {
      const currentOutput = prev || output;
      const next = JSON.parse(JSON.stringify(currentOutput));
      if (next.projects && Array.isArray(next.projects)) {
        next.projects.splice(idx, 1);
      }
      return next;
    });
    setProjectEditTexts((prev) => {
      const copy = { ...prev };
      delete copy[idx];
      return copy;
    });
    setEditingProjectIdx(null);
  };
  
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
          const localSaved = typeof window !== "undefined" ? localStorage.getItem(`resume_edit_${resumeId}`) : null;
          let activeData = data.outputFull;
          if (localSaved) {
            try {
              const parsedLocal = JSON.parse(localSaved);
              if (parsedLocal && typeof parsedLocal === "object") {
                activeData = parsedLocal;
              }
            } catch (e) {
              console.error("Failed to parse local resume edit cache", e);
            }
          }
          setLiveResume(activeData);
          const original = typeof activeData === "string" ? JSON.parse(activeData) : activeData;
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

  // Auto-save live edits to localStorage & debounced sync to backend database
  useEffect(() => {
    if (!liveResume || !resumeId) return;

    try {
      localStorage.setItem(`resume_edit_${resumeId}`, JSON.stringify(liveResume));
    } catch (e) {
      console.error("Error saving resume edit to localStorage", e);
    }

    const timer = setTimeout(() => {
      fetch(`/api/resume/${resumeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outputFull: liveResume }),
      }).catch((err) => console.error("Error auto-saving resume edits to server:", err));
    }, 1000);

    return () => clearTimeout(timer);
  }, [liveResume, resumeId]);

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
      <header className="glass-panel border-b border-border/40 px-6 py-3.5 flex items-center justify-between print:hidden">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center justify-center">
            <img src="/logo.png" alt="ATSLift Logo" className="w-8 h-8 rounded-md object-contain logo-rotated" />
          </Link>
          <span className="font-bold text-lg tracking-tight text-text">
            ATS<span className="text-primary font-medium font-serif italic">Lift</span>
          </span>
          <Link href="/myresumes" className="ml-3 text-xs font-bold text-primary hover:underline hidden sm:inline">
            My Resumes
          </Link>
        </div>
        
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Don't trust ATSlift? Verify with any AI button */}
          <button
            onClick={() => setVerificationModalOpen(true)}
            className="hidden md:flex px-3.5 py-1.5 bg-surface/80 hover:bg-surface border border-border/80 text-text text-xs rounded-xl md:rounded-full transition-all items-center space-x-2 shadow-2xs group cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-primary group-hover:scale-110 transition-transform shrink-0" />
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[10px] text-text-muted font-bold tracking-tight">Don't trust ATSlift?</span>
              <span className="text-xs font-extrabold text-primary underline underline-offset-2 decoration-primary/40 group-hover:decoration-primary">Verify with any AI</span>
            </div>
          </button>

          <button
            onClick={() => setCoverLetterModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-primary via-emerald-600 to-primary hover:opacity-95 text-white font-extrabold text-xs rounded-full flex items-center space-x-1.5 shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-pointer ring-2 ring-primary/40"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>✨ Build Cover Letter</span>
            <span className="text-[9px] bg-amber-300 text-zinc-950 font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider ml-1 shadow-xs">
              FREE
            </span>
          </button>
          <div className="hidden sm:flex items-center space-x-2 bg-success/15 border border-success/30 px-3 py-1.5 rounded-full text-xs font-bold text-success">
            <CheckCircle2 className="w-4 h-4" />
            <span>Unlocked ✓</span>
          </div>
          <ThemeToggle />
        </div>
      </header>
         {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto print:block print:overflow-visible print:h-auto">
        <div className="h-auto lg:h-full flex flex-col lg:flex-row w-full overflow-y-auto lg:overflow-hidden">
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

        {/* Section: Professional Summary Editor Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 relative shadow-xs print:hidden space-y-4">
          <div className="flex justify-between items-center border-b border-border/40 pb-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold text-primary tracking-wider uppercase">Professional Summary</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const currentSum = liveResume?.summary !== undefined ? liveResume.summary : (output?.summary || "");
                  handleRegenerateSection("summary", "summary", currentSum, (newSummary) => {
                    setLiveResume((prev: any) => {
                      if (!prev) return { ...output, summary: newSummary };
                      return { ...prev, summary: newSummary };
                    });
                  });
                }}
                disabled={regeneratingStates["summary"]}
                className="text-xs font-semibold text-text-muted hover:text-primary transition-colors flex items-center space-x-1 border border-border bg-bg-base/30 px-2.5 py-1.5 rounded-full cursor-pointer disabled:opacity-50"
              >
                {regeneratingStates["summary"] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-primary" />}
                <span>{regeneratingStates["summary"] ? "Enhancing..." : "AI Re-generate"}</span>
              </button>
              <button
                onClick={() => {
                  const currentSum = liveResume?.summary !== undefined ? liveResume.summary : (output?.summary || "");
                  copyToClipboard(currentSum, "summary");
                }}
                className="text-xs font-semibold text-text-muted hover:text-primary transition-colors flex items-center space-x-1 border border-border bg-bg-base/30 px-2.5 py-1.5 rounded-full cursor-pointer"
              >
                {copiedStates["summary"] ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedStates["summary"] ? "Copied!" : "Copy Summary"}</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">
              Edit Professional Summary (Live Preview Sync)
            </label>
            <textarea
              rows={3}
              value={liveResume?.summary !== undefined ? liveResume.summary : (output?.summary || "")}
              onChange={(e) => {
                const val = e.target.value;
                setLiveResume((prev: any) => {
                  if (!prev) return { ...output, summary: val };
                  return { ...prev, summary: val };
                });
              }}
              placeholder="Write a concise 2-3 sentence professional summary..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-base text-text text-xs font-semibold focus:outline-none focus:border-primary transition-colors leading-relaxed"
            />
            <div className="flex items-center justify-between text-[10px] text-text-muted">
              <span>💡 Keep summary concise (2-3 sentences) for optimal ATS scanning & page density.</span>
              <span>{((liveResume?.summary !== undefined ? liveResume.summary : output?.summary) || "").length} characters</span>
            </div>
          </div>
        </div>

        {/* Section: Education & Qualifications Card (Placed under Professional Summary) */}
        {(() => {
          const edu = liveResume?.education ?? output?.education ?? {};
          const pgEdu = liveResume?.pgEducation ?? output?.pgEducation ?? null;
          const twelfthEdu = liveResume?.twelfthEducation ?? output?.twelfthEducation ?? null;
          const tenthEdu = liveResume?.tenthEducation ?? output?.tenthEducation ?? null;

          const updateEducationState = (updates: any) => {
            setLiveResume((prev: any) => ({
              ...(prev || output),
              ...updates,
            }));
          };

          return (
            <div className="bg-surface border border-border rounded-2xl p-6 relative shadow-xs print:hidden space-y-4">
              <div className="flex justify-between items-center border-b border-border/40 pb-3 flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold text-primary tracking-wider uppercase">Education & Qualifications</h3>
                </div>
                <button
                  onClick={() => setIsEditingEducation(!isEditingEducation)}
                  className={`text-xs font-semibold transition-all flex items-center space-x-1 border px-3 py-1.5 rounded-full cursor-pointer ${
                    isEditingEducation
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "border-border bg-bg-base/30 text-text-muted hover:text-primary hover:border-primary/40"
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingEducation ? "Done Editing" : "Edit Education"}</span>
                </button>
              </div>

              {isEditingEducation ? (
                <div className="space-y-5 animate-fade-in">
                  {/* Main Degree / Undergraduate */}
                  <div className="bg-bg-base/60 border border-border rounded-xl p-4 space-y-3">
                    <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider block">🎓 Main Degree / Undergraduate</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Institution / University</label>
                        <input
                          type="text"
                          value={edu.institution || ""}
                          onChange={(e) => updateEducationState({ education: { ...edu, institution: e.target.value } })}
                          placeholder="e.g. VELLORE INSTITUTE OF TECHNOLOGY - AP"
                          className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs font-bold focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Degree & Branch</label>
                        <input
                          type="text"
                          value={edu.degree || ""}
                          onChange={(e) => updateEducationState({ education: { ...edu, degree: e.target.value } })}
                          placeholder="e.g. B.Tech in Computer Science and Engineering"
                          className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs font-semibold focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Graduation Year / Timeline</label>
                        <input
                          type="text"
                          value={edu.year || ""}
                          onChange={(e) => updateEducationState({ education: { ...edu, year: e.target.value } })}
                          placeholder="e.g. 2021 – 2025"
                          className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs font-semibold focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">CGPA / Percentage</label>
                        <input
                          type="text"
                          value={edu.cgpa || ""}
                          onChange={(e) => updateEducationState({ education: { ...edu, cgpa: e.target.value } })}
                          placeholder="e.g. 9.17 / 10.0"
                          className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs font-semibold focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Postgraduate (PG) */}
                  <div className="bg-bg-base/60 border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider block">🎓 Postgraduate (PG) Degree</span>
                      {!pgEdu ? (
                        <button
                          onClick={() => updateEducationState({ pgEducation: { institution: "", degree: "M.Tech / M.S. in Computer Science", year: "2025 – 2027", cgpa: "9.0" } })}
                          className="text-[10px] font-bold text-primary hover:underline flex items-center space-x-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Enable PG Section</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => updateEducationState({ pgEducation: null })}
                          className="text-[10px] font-bold text-error hover:underline flex items-center space-x-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove PG</span>
                        </button>
                      )}
                    </div>
                    {pgEdu && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">PG Institution</label>
                          <input
                            type="text"
                            value={pgEdu.institution || ""}
                            onChange={(e) => updateEducationState({ pgEducation: { ...pgEdu, institution: e.target.value } })}
                            placeholder="e.g. IIT Madras"
                            className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs font-bold focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">PG Degree</label>
                          <input
                            type="text"
                            value={pgEdu.degree || ""}
                            onChange={(e) => updateEducationState({ pgEducation: { ...pgEdu, degree: e.target.value } })}
                            placeholder="e.g. M.Tech in Artificial Intelligence"
                            className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs font-semibold focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Graduation Year</label>
                          <input
                            type="text"
                            value={pgEdu.year || ""}
                            onChange={(e) => updateEducationState({ pgEducation: { ...pgEdu, year: e.target.value } })}
                            placeholder="e.g. 2025 – 2027"
                            className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs font-semibold focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">PG CGPA</label>
                          <input
                            type="text"
                            value={pgEdu.cgpa || ""}
                            onChange={(e) => updateEducationState({ pgEducation: { ...pgEdu, cgpa: e.target.value } })}
                            placeholder="e.g. 9.2 / 10.0"
                            className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs font-semibold focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Class 12th / Intermediate */}
                  <div className="bg-bg-base/60 border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider block">🏫 Class 12th / Intermediate</span>
                      {!twelfthEdu ? (
                        <button
                          onClick={() => updateEducationState({ twelfthEducation: { institution: "", degree: "Intermediate / Class XII (MPC)", year: "2021", cgpa: "95.4%" } })}
                          className="text-[10px] font-bold text-primary hover:underline flex items-center space-x-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Enable 12th Section</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => updateEducationState({ twelfthEducation: null })}
                          className="text-[10px] font-bold text-error hover:underline flex items-center space-x-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove 12th</span>
                        </button>
                      )}
                    </div>
                    {twelfthEdu && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Junior College / School</label>
                          <input
                            type="text"
                            value={twelfthEdu.institution || ""}
                            onChange={(e) => updateEducationState({ twelfthEducation: { ...twelfthEdu, institution: e.target.value } })}
                            placeholder="e.g. Sri Chaitanya Junior College"
                            className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs font-bold focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Stream / Qualification</label>
                          <input
                            type="text"
                            value={twelfthEdu.degree || ""}
                            onChange={(e) => updateEducationState({ twelfthEducation: { ...twelfthEdu, degree: e.target.value } })}
                            placeholder="e.g. Intermediate / Class XII (MPC)"
                            className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs font-semibold focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Completion Year</label>
                          <input
                            type="text"
                            value={twelfthEdu.year || ""}
                            onChange={(e) => updateEducationState({ twelfthEducation: { ...twelfthEdu, year: e.target.value } })}
                            placeholder="e.g. 2021"
                            className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs font-semibold focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                            {twelfthEdu.scoreType === "CGPA"
                              ? "12th CGPA"
                              : twelfthEdu.scoreType === "Marks"
                              ? "12th Total Marks"
                              : "12th Percentage"}
                          </label>
                          <div className="flex items-center gap-3 py-0.5">
                            {(["CGPA", "Percentage", "Marks"] as const).map((st) => {
                              const isChecked = (twelfthEdu.scoreType || "Percentage") === st;
                              return (
                                <label key={st} className="flex items-center gap-1.5 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => updateEducationState({ twelfthEducation: { ...twelfthEdu, scoreType: st } })}
                                    className="w-3.5 h-3.5 rounded-xs border-border text-primary focus:ring-primary cursor-pointer accent-primary"
                                  />
                                  <span className={`text-[11px] font-bold ${isChecked ? "text-primary font-extrabold" : "text-text-muted"}`}>
                                    {st}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                          <input
                            type="text"
                            value={twelfthEdu.cgpa || ""}
                            onChange={(e) => updateEducationState({ twelfthEducation: { ...twelfthEdu, cgpa: e.target.value } })}
                            placeholder={
                              twelfthEdu.scoreType === "CGPA"
                                ? "e.g. 9.8 / 10.0"
                                : twelfthEdu.scoreType === "Marks"
                                ? "e.g. 980 / 1000"
                                : "e.g. 98.6%"
                            }
                            className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs font-semibold focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Class 10th / SSC */}
                  <div className="bg-bg-base/60 border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider block">🏫 Class 10th / SSC</span>
                      {!tenthEdu ? (
                        <button
                          onClick={() => updateEducationState({ tenthEducation: { institution: "", degree: "Class X (SSC)", year: "2019", cgpa: "10.0 CGPA", scoreType: "CGPA" } })}
                          className="text-[10px] font-bold text-primary hover:underline flex items-center space-x-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Enable 10th Section</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => updateEducationState({ tenthEducation: null })}
                          className="text-[10px] font-bold text-error hover:underline flex items-center space-x-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove 10th</span>
                        </button>
                      )}
                    </div>
                    {tenthEdu && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">School Name</label>
                          <input
                            type="text"
                            value={tenthEdu.institution || ""}
                            onChange={(e) => updateEducationState({ tenthEducation: { ...tenthEdu, institution: e.target.value } })}
                            placeholder="e.g. St. Xaviers High School"
                            className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs font-bold focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Board / Qualification</label>
                          <input
                            type="text"
                            value={tenthEdu.degree || ""}
                            onChange={(e) => updateEducationState({ tenthEducation: { ...tenthEdu, degree: e.target.value } })}
                            placeholder="e.g. Class X (SSC Board)"
                            className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs font-semibold focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Completion Year</label>
                          <input
                            type="text"
                            value={tenthEdu.year || ""}
                            onChange={(e) => updateEducationState({ tenthEducation: { ...tenthEdu, year: e.target.value } })}
                            placeholder="e.g. 2019"
                            className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs font-semibold focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                            {tenthEdu.scoreType === "CGPA"
                              ? "10th CGPA"
                              : tenthEdu.scoreType === "Marks"
                              ? "10th Total Marks"
                              : "10th Percentage"}
                          </label>
                          <div className="flex items-center gap-3 py-0.5">
                            {(["CGPA", "Percentage", "Marks"] as const).map((st) => {
                              const isChecked = (tenthEdu.scoreType || "Percentage") === st;
                              return (
                                <label key={st} className="flex items-center gap-1.5 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => updateEducationState({ tenthEducation: { ...tenthEdu, scoreType: st } })}
                                    className="w-3.5 h-3.5 rounded-xs border-border text-primary focus:ring-primary cursor-pointer accent-primary"
                                  />
                                  <span className={`text-[11px] font-bold ${isChecked ? "text-primary font-extrabold" : "text-text-muted"}`}>
                                    {st}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                          <input
                            type="text"
                            value={tenthEdu.cgpa || ""}
                            onChange={(e) => updateEducationState({ tenthEducation: { ...tenthEdu, cgpa: e.target.value } })}
                            placeholder={
                              tenthEdu.scoreType === "CGPA"
                                ? "e.g. 10.0 / 10.0"
                                : tenthEdu.scoreType === "Marks"
                                ? "e.g. 480 / 500"
                                : "e.g. 92.4%"
                            }
                            className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs font-semibold focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Display View for Education */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {pgEdu && (
                    <div className="p-3 rounded-xl bg-bg-base/40 border border-border flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <span className="font-bold text-text block">{pgEdu.institution || 'Postgraduate'}</span>
                        <span className="text-text-muted">{pgEdu.degree}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-primary block">{pgEdu.cgpa ? `CGPA: ${pgEdu.cgpa}` : ''}</span>
                        <span className="text-text-muted text-[10px]">{pgEdu.year}</span>
                      </div>
                    </div>
                  )}
                  {edu.institution && (
                    <div className="p-3 rounded-xl bg-bg-base/40 border border-border flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <span className="font-bold text-text block">{edu.institution}</span>
                        <span className="text-text-muted">{edu.degree}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-primary block">{edu.cgpa ? `CGPA: ${edu.cgpa}` : ''}</span>
                        <span className="text-text-muted text-[10px]">{edu.year}</span>
                      </div>
                    </div>
                  )}
                  {twelfthEdu && (
                    <div className="p-3 rounded-xl bg-bg-base/40 border border-border flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <span className="font-bold text-text block">{twelfthEdu.institution || 'Class XII / Intermediate'}</span>
                        <span className="text-text-muted">{twelfthEdu.degree}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-primary block">{twelfthEdu.cgpa ? formatEducationScore(twelfthEdu.cgpa, twelfthEdu.scoreType) : ''}</span>
                        <span className="text-text-muted text-[10px]">{twelfthEdu.year}</span>
                      </div>
                    </div>
                  )}
                  {tenthEdu && (
                    <div className="p-3 rounded-xl bg-bg-base/40 border border-border flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <span className="font-bold text-text block">{tenthEdu.institution || 'Class X / SSC'}</span>
                        <span className="text-text-muted">{tenthEdu.degree}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-primary block">{tenthEdu.cgpa ? formatEducationScore(tenthEdu.cgpa, tenthEdu.scoreType) : ''}</span>
                        <span className="text-text-muted text-[10px]">{tenthEdu.year}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* Section: Skills Badges Card */}
        {(() => {
          const activeSkills: Array<{ category: string; skills: string[] }> = liveResume?.skills ?? output?.skills ?? [];

          return (
            <div className="bg-surface border border-border rounded-2xl p-6 relative shadow-xs print:hidden">
              <div className="flex justify-between items-center mb-5 border-b border-border/40 pb-3 flex-wrap gap-2">
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

                  {/* Edit Skills button (placed directly to the LEFT of Smart Order) */}
                  <button
                    onClick={() => setIsEditingSkills(!isEditingSkills)}
                    className={`text-xs font-semibold transition-all flex items-center space-x-1 border px-3 py-1.5 rounded-full cursor-pointer ${
                      isEditingSkills
                        ? "bg-primary text-white border-primary shadow-xs"
                        : "border-border bg-bg-base/30 text-text-muted hover:text-primary hover:border-primary/40"
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditingSkills ? "Done Editing" : "Edit Skills"}</span>
                  </button>

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
                      const skillsText = activeSkills
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

              {isEditingSkills ? (
                /* Interactive Edit Mode for Categories and Badges */
                <div className="space-y-5 animate-fade-in">
                  {activeSkills.map((cat: any, catIdx: number) => (
                    <div key={catIdx} className="bg-bg-base/60 border border-border rounded-xl p-4 relative space-y-3">
                      {/* Row Header with Reorder, Category Name Input, Delete Row */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center space-x-2 flex-1">
                          <div className="flex items-center space-x-1 bg-surface border border-border rounded-lg p-0.5 shrink-0">
                            <button
                              onClick={() => handleMoveCategoryRow(catIdx, "up")}
                              disabled={catIdx === 0}
                              className="p-1 hover:bg-border/40 rounded text-text-muted disabled:opacity-30 cursor-pointer"
                              title="Move Category Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveCategoryRow(catIdx, "down")}
                              disabled={catIdx === activeSkills.length - 1}
                              className="p-1 hover:bg-border/40 rounded text-text-muted disabled:opacity-30 cursor-pointer"
                              title="Move Category Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <input
                            type="text"
                            value={cat.category || ""}
                            onChange={(e) => handleUpdateCategoryName(catIdx, e.target.value)}
                            placeholder="Category Name (e.g. Programming Languages)"
                            className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-surface text-text text-xs font-bold focus:outline-none focus:border-primary"
                          />
                        </div>

                        <button
                          onClick={() => handleDeleteCategoryRow(catIdx)}
                          className="p-1.5 rounded-lg text-error hover:bg-error/10 border border-error/20 transition-colors cursor-pointer shrink-0"
                          title="Delete Category Row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Skill Badges with Reorder [‹] [›] and Delete Buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {(cat.skills || []).map((skillName: string, sIdx: number) => (
                          <span
                            key={sIdx}
                            className="inline-flex items-center gap-1.5 text-xs bg-surface border border-border px-2 py-1 rounded-md font-bold text-text group"
                          >
                            <div className="flex items-center space-x-0.5 opacity-60 hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => handleMoveSkillBadge(catIdx, sIdx, "left")}
                                disabled={sIdx === 0}
                                className="p-0.5 hover:bg-border/40 rounded disabled:opacity-20 cursor-pointer"
                                title="Move Badge Left"
                              >
                                <ChevronLeft className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveSkillBadge(catIdx, sIdx, "right")}
                                disabled={sIdx === (cat.skills || []).length - 1}
                                className="p-0.5 hover:bg-border/40 rounded disabled:opacity-20 cursor-pointer"
                                title="Move Badge Right"
                              >
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                            <span>{skillName}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteSkillBadge(catIdx, sIdx)}
                              className="text-text-muted hover:text-error transition-colors cursor-pointer ml-0.5"
                              title="Remove Skill Badge"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* Dual Input Mode: Single vs Comma Separated */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Add Skills Input Type:</span>
                          <div className="flex items-center space-x-1 bg-surface border border-border rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => setSkillInputModes(prev => ({ ...prev, [catIdx]: "single" }))}
                              className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all cursor-pointer ${
                                (skillInputModes[catIdx] || "single") === "single"
                                  ? "bg-primary text-white shadow-xs"
                                  : "text-text-muted hover:text-text"
                              }`}
                            >
                              Single Skill
                            </button>
                            <button
                              type="button"
                              onClick={() => setSkillInputModes(prev => ({ ...prev, [catIdx]: "comma" }))}
                              className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all cursor-pointer ${
                                skillInputModes[catIdx] === "comma"
                                  ? "bg-primary text-white shadow-xs"
                                  : "text-text-muted hover:text-text"
                              }`}
                            >
                              Comma Separated (Bulk)
                            </button>
                          </div>
                        </div>

                        {skillInputModes[catIdx] === "comma" ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={newSkillInput[catIdx] || ""}
                              onChange={(e) => setNewSkillInput(prev => ({ ...prev, [catIdx]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddBulkSkills(catIdx, newSkillInput[catIdx] || "");
                                }
                              }}
                              placeholder="e.g. Java, Python, React, PostgreSQL, Tailwind CSS..."
                              className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-surface text-text text-xs font-medium focus:outline-none focus:border-primary"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddBulkSkills(catIdx, newSkillInput[catIdx] || "")}
                              className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold flex items-center space-x-1 cursor-pointer shrink-0"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Bulk</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={newSkillInput[catIdx] || ""}
                              onChange={(e) => setNewSkillInput(prev => ({ ...prev, [catIdx]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddSkillBadge(catIdx);
                                }
                              }}
                              placeholder="Add single skill badge..."
                              className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-surface text-text text-xs font-medium focus:outline-none focus:border-primary"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddSkillBadge(catIdx)}
                              className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold flex items-center space-x-1 cursor-pointer shrink-0"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Skill</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Add New Category Row Button */}
                  <button
                    type="button"
                    onClick={handleAddCategoryRow}
                    className="w-full py-3 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary bg-primary/5 text-primary text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Skill Category Row</span>
                  </button>
                </div>
              ) : (
                /* Standard Display View */
                <div className="columns-1 md:columns-2 gap-6 [column-fill:balance]">
                  {activeSkills
                    .filter((cat: any) => cat && Array.isArray(cat.skills) && cat.skills.length > 0)
                    .map((cat: any, idx: number) => (
                      <div key={idx} className="break-inside-avoid inline-block w-full space-y-2 mb-5">
                        <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">{cat.category}</span>
                        <div className="flex flex-wrap gap-2">
                          {(cat.skills || []).map((skillName: string, sIdx: number) => (
                            <span key={sIdx} className="text-xs bg-bg-base border border-border px-2.5 py-1 rounded-md font-bold text-text">
                              {skillName}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          );
        })()}

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
            const isEditingThisProj = editingProjectIdx === idx;

            return (
              <div key={idx} className="bg-surface border border-border rounded-2xl p-6 relative shadow-xs transition-all">
                <div className="flex justify-between items-center mb-4 border-b border-border/30 pb-2">
                  <div className="text-left">
                    <span className="text-[9px] font-bold text-primary tracking-wider uppercase block">Project #{idx + 1}</span>
                    <h4 className="font-bold text-base text-text">
                      {proj.title}
                    </h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        if (isEditingThisProj) {
                          setEditingProjectIdx(null);
                        } else {
                          startEditingProject(idx, proj);
                        }
                      }}
                      className={`text-xs font-semibold transition-all flex items-center space-x-1.5 border px-3 py-1.5 rounded-full cursor-pointer ${
                        isEditingThisProj
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "border-border bg-bg-base/40 text-text-muted hover:text-primary hover:border-primary/40"
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditingThisProj ? "Editing" : "Edit Points"}</span>
                    </button>

                    {isEditingThisProj && (
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(idx)}
                        className="text-xs font-semibold text-error hover:bg-error/10 border border-error/30 transition-all flex items-center space-x-1.5 px-3 py-1.5 rounded-full cursor-pointer"
                        title="Delete this project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    )}

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
                              const rawBullets = newText.split(/\n|(?<=\.)\s*[*•]\s*|\s+\*\s+/).filter(Boolean);
                              next.projects[idx].bullets = rawBullets.map(b => b.replace(/^[\s*•\-–\d\.]+\s*/, "").trim()).filter(Boolean);
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

                {isEditingThisProj ? (
                  /* Bulk Edit Mode for All Bullet Points & Details */
                  <div className="space-y-4 pt-1 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Project Title</label>
                        <input
                          type="text"
                          value={projectEditTexts[idx]?.title || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProjectEditTexts(prev => ({
                              ...prev,
                              [idx]: { ...(prev[idx] || { title: "", techStack: "", duration: "", bulletsText: "" }), title: val }
                            }));
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-border bg-bg-base text-text text-xs font-bold focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Tech Stack</label>
                        <input
                          type="text"
                          value={projectEditTexts[idx]?.techStack || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProjectEditTexts(prev => ({
                              ...prev,
                              [idx]: { ...(prev[idx] || { title: "", techStack: "", duration: "", bulletsText: "" }), techStack: val }
                            }));
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-border bg-bg-base text-text text-xs font-semibold focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Timeline (Month & Year)</label>
                        <input
                          type="text"
                          value={projectEditTexts[idx]?.duration || ""}
                          placeholder="e.g. Jan 2025 – Mar 2025"
                          onChange={(e) => {
                            const val = e.target.value;
                            setProjectEditTexts(prev => ({
                              ...prev,
                              [idx]: { ...(prev[idx] || { title: "", techStack: "", duration: "", bulletsText: "" }), duration: val }
                            }));
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-border bg-bg-base text-text text-xs font-semibold focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                        Edit All Bullet Points (One point per line):
                      </label>
                      <textarea
                        rows={5}
                        value={projectEditTexts[idx]?.bulletsText || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProjectEditTexts(prev => ({
                            ...prev,
                            [idx]: { ...(prev[idx] || { title: "", techStack: "", bulletsText: "" }), bulletsText: val }
                          }));
                        }}
                        placeholder="Bullet point 1...\nBullet point 2...\nBullet point 3..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-base text-text text-xs font-medium focus:outline-none focus:border-primary leading-relaxed"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(idx)}
                        className="px-3.5 py-2 rounded-xl border border-error/30 bg-error/10 text-error hover:bg-error hover:text-white text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Project</span>
                      </button>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setEditingProjectIdx(null)}
                          className="px-4 py-2 rounded-xl border border-border bg-bg-base text-text-muted text-xs font-bold hover:text-text transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => saveProjectEdit(idx)}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Save All Points</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard Normal Display Mode */
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
                        <li key={bIdx}>
                          {bulletText}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:hidden">
          <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col justify-between space-y-3 shadow-xs">
            <div className="text-left space-y-1">
              <h4 className="font-bold text-sm text-text">Download PDF Resume</h4>
              <p className="text-xs text-text-muted font-medium">Generate a clean, print-optimized document preview ready to save as PDF.</p>
            </div>
            <button
              onClick={triggerBrowserPrint}
              className="w-full py-3 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Generate PDF Document</span>
            </button>
          </div>

          <div className="bg-gradient-to-br from-primary/10 via-surface to-primary/5 border border-primary/30 rounded-2xl p-5 flex flex-col justify-between space-y-3 shadow-xs">
            <div className="text-left space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-primary flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> AI Cover Letter Generator
                </h4>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Included Free
                </span>
              </div>
              <p className="text-xs text-text-muted font-medium">Create a matching ATS cover letter tailored for any target company in seconds.</p>
            </div>
            <button
              onClick={() => setCoverLetterModalOpen(true)}
              className="w-full py-3 bg-primary text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-md hover:shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span>✨ Create Cover Letter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>

      <CoverLetterModal isOpen={isCoverLetterModalOpen} onClose={() => setCoverLetterModalOpen(false)} resumeId={resumeId} inputData={resume?.inputData} templateId={resume?.inputData?.options?.templateId || "modern"} />

      {/* AI Verification Modal Popup */}
      {isVerificationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setVerificationModalOpen(false)}
              className="absolute top-4 right-4 p-2 px-3 text-text-muted hover:text-text bg-bg-base hover:bg-border/40 rounded-full transition-all cursor-pointer font-bold text-xs flex items-center gap-1 border border-border"
            >
              ✕ Close
            </button>
            <AIVerificationSection
              handlePayment={() => setVerificationModalOpen(false)}
              isProcessingPayment={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
