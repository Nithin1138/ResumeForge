"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Sparkles, Copy, Check, Printer, Loader2, Building2, Briefcase, Sliders, FileText, User, GraduationCap, ChevronDown, ChevronUp, ArrowRight, MapPin, ArrowLeft } from "lucide-react";
import CoverLetterPreview, { CoverLetterData } from "./CoverLetterPreview";

interface CoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId?: string;
  inputData?: any;
  templateId?: string;
  initialCoverLetter?: CoverLetterData | null;
  initialCandidateName?: string;
  initialCompany?: string;
  initialRole?: string;
  readOnly?: boolean;
}

export default function CoverLetterModal({
  isOpen,
  onClose,
  resumeId,
  inputData,
  templateId = "modern",
  initialCoverLetter = null,
  initialCandidateName,
  initialCompany,
  initialRole,
  readOnly = false,
}: CoverLetterModalProps) {
  const isDirectMode = !resumeId && (!inputData || !inputData?.personal?.fullName);

  // Resume vs Direct Candidate Details (NO hardcoded Aarav Sharma dummy defaults)
  const defaultName = inputData?.personal?.fullName || "";
  const defaultEmail = inputData?.personal?.email || "";
  const defaultPhone = inputData?.personal?.phone || "";
  const defaultLocation = inputData?.personal?.city || inputData?.personal?.location || "";
  const defaultCollege = inputData?.personal?.collegeName || "";
  const defaultBranch = inputData?.personal?.branch || "";
  const defaultRole = inputData?.personal?.targetRole || "";
  const defaultProject = inputData?.projects?.[0]?.title || "";

  // Form State
  const [candidateName, setCandidateName] = useState(defaultName);
  const [candidateEmail, setCandidateEmail] = useState(defaultEmail);
  const [candidatePhone, setCandidatePhone] = useState(defaultPhone);
  const [candidateLocation, setCandidateLocation] = useState(defaultLocation);
  const [candidateCollege, setCandidateCollege] = useState(defaultCollege);
  const [candidateBranch, setCandidateBranch] = useState(defaultBranch);
  const [candidateProject, setCandidateProject] = useState(defaultProject);

  const [companyName, setCompanyName] = useState("");
  const [targetRole, setTargetRole] = useState(defaultRole);
  const [tone, setTone] = useState("Professional & Executive");
  const [jobDescription, setJobDescription] = useState("");
  
  const [activeAccordion, setActiveAccordion] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [coverLetter, setCoverLetter] = useState<CoverLetterData | null>(initialCoverLetter || null);
  const [mounted, setMounted] = useState(false);
  const [zoomScale, setZoomScale] = useState<number>(0.65);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // 1. If viewing/editing a saved cover letter
    if (initialCoverLetter) {
      setCoverLetter(initialCoverLetter);
      if (initialCandidateName) setCandidateName(initialCandidateName);
      if (initialCompany) setCompanyName(initialCompany);
      if (initialRole) setTargetRole(initialRole);
      return;
    }

    // 2. If entered from Resume Builder with inputData
    if (inputData?.personal?.fullName) {
      setCandidateName(inputData.personal.fullName || "");
      setCandidateEmail(inputData.personal.email || "");
      setCandidatePhone(inputData.personal.phone || "");
      setCandidateLocation(inputData.personal.city || inputData.personal.location || "");
      setCandidateCollege(inputData.personal.collegeName || "");
      setCandidateBranch(inputData.personal.branch || "");
      setTargetRole(inputData.personal.targetRole || "");
      if (inputData.projects?.[0]?.title) {
        setCandidateProject(inputData.projects[0].title);
      }
      return;
    }

    // 3. Fetch candidate profile details from My Space API
    fetch("/api/user/my-space")
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        if (data.profile) {
          const p = data.profile;
          setCandidateName((prev: string) => prev || p.fullName || data.userName || "");
          setCandidateEmail((prev: string) => prev || data.userEmail || "");
          setCandidatePhone((prev: string) => prev || p.phone || "");
          setCandidateLocation((prev: string) => prev || p.location || "");
          setCandidateCollege((prev: string) => prev || p.college || "");
          setCandidateBranch((prev: string) => prev || p.branch || "");
          try {
            const projs = JSON.parse(p.projectsJson || "[]");
            if (projs.length > 0 && projs[0].title) {
              setCandidateProject((prev: string) => prev || projs[0].title);
            }
          } catch {}
        } else if (data.userName || data.userEmail) {
          setCandidateName((prev: string) => prev || data.userName || "");
          setCandidateEmail((prev: string) => prev || data.userEmail || "");
        }
      })
      .catch(() => {});
  }, [isOpen, inputData, initialCoverLetter, initialCandidateName, initialCompany, initialRole]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const activeDetails = isDirectMode ? {
        fullName: candidateName.trim() || "Candidate",
        email: candidateEmail.trim() || "",
        phone: candidatePhone.trim() || "",
        location: candidateLocation.trim() || "",
        collegeName: candidateCollege.trim() || "Engineering Institute",
        branch: candidateBranch.trim() || "Engineering",
        topProject: candidateProject.trim() || "Technical Projects",
      } : undefined;

      const res = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId,
          inputData,
          directCandidateDetails: activeDetails,
          companyName: companyName.trim() || "Target Company",
          targetRole: targetRole.trim() || defaultRole || "Software Engineer",
          tone,
          jobDescription: jobDescription.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate cover letter.");
      }

      const data = await res.json();
      if (data.coverLetter) {
        setCoverLetter(data.coverLetter);
      }
    } catch (err: any) {
      alert(err.message || "Failed to generate cover letter. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = () => {
    if (!coverLetter) return;
    const fullText = `${coverLetter.salutation || ""}\n\n${coverLetter.openingParagraph || ""}\n\n${coverLetter.bodyParagraph || ""}\n\n${coverLetter.closingParagraph || ""}\n\n${coverLetter.signOff || ""}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const docNode = document.getElementById("cover-letter-document");
    if (!docNode) return;

    let printTarget = document.getElementById("cover-letter-print-target");
    if (printTarget) {
      printTarget.remove();
    }

    printTarget = document.createElement("div");
    printTarget.id = "cover-letter-print-target";
    printTarget.innerHTML = docNode.outerHTML;
    document.body.appendChild(printTarget);
    document.body.classList.add("printing-cover-letter");

    const originalTitle = document.title;
    document.title = `Cover_Letter_${(companyName || "Application").replace(/[^a-zA-Z0-9]/g, "_")}`;

    const cleanup = () => {
      document.body.classList.remove("printing-cover-letter");
      const target = document.getElementById("cover-letter-print-target");
      if (target) target.remove();
      document.title = originalTitle;
      window.removeEventListener("afterprint", cleanup);
    };

    window.addEventListener("afterprint", cleanup);
    setTimeout(() => {
      window.print();
      setTimeout(cleanup, 2000);
    }, 150);
  };

  if (!isOpen || !mounted) return null;

  if (readOnly) {
    return createPortal(
      <div className="fixed inset-0 bg-bg-base/80 dark:bg-black/75 backdrop-blur-md z-[9999] flex flex-col items-center justify-start p-3 sm:p-6 animate-fade-in font-sans overflow-y-auto">
        {/* Top Sticky Header Bar (Theme-aware with Zoom Controls) */}
        <div className="w-full max-w-4xl bg-surface/90 border border-border/80 text-text px-4 py-3 rounded-2xl flex items-center justify-between shrink-0 shadow-xl mb-4 sticky top-2 z-50 backdrop-blur-md gap-2">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-full bg-bg-base hover:bg-border/40 text-xs font-bold text-text transition-all flex items-center space-x-1.5 border border-border/60 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Interactive Zoom Level Selector */}
            <div className="flex items-center space-x-1 bg-bg-base/80 p-1 rounded-full border border-border/60 text-[11px] font-bold mr-1">
              {[
                { label: "Fit Page", val: 0.65 },
                { label: "75%", val: 0.75 },
                { label: "90%", val: 0.9 },
                { label: "100%", val: 1.0 },
              ].map((z) => (
                <button
                  key={z.val}
                  onClick={() => setZoomScale(z.val)}
                  className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                    zoomScale === z.val
                      ? "bg-primary text-white shadow-xs"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  {z.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopyText}
              disabled={!coverLetter}
              className="px-3.5 py-1.5 rounded-full bg-bg-base hover:bg-border/40 text-xs font-bold text-text transition-all flex items-center space-x-1.5 border border-border/60 cursor-pointer disabled:opacity-40"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? "Copied" : "Copy Text"}</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={!coverLetter}
              className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-md disabled:opacity-40"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-bg-base text-text-muted hover:text-text transition-all cursor-pointer ml-1"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scaled Preview Canvas with Controlled Dynamic Height */}
        <div className="w-full max-w-4xl flex flex-col items-center justify-start pb-12 overflow-visible">
          <div 
            className="flex items-center justify-center transition-all duration-200"
            style={{ height: `${Math.round(297 * zoomScale * 3.78)}px` }}
          >
            <div 
              className="origin-top transition-transform duration-200 shadow-2xl rounded-xs"
              style={{ transform: `scale(${zoomScale})` }}
            >
              <CoverLetterPreview
                data={coverLetter}
                isLoading={isGenerating}
              />
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 z-[9999] animate-fade-in overflow-y-auto">
      <div className="bg-surface border border-border/80 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto relative">

        {/* Header Bar */}
        {!readOnly && (
          <div className="p-4 md:px-6 border-b border-border/60 flex items-center justify-between bg-surface">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif text-lg md:text-xl font-bold text-text">
                  Build Cover Letter
                </h2>
                <p className="text-[10px] md:text-xs text-text-muted font-medium">
                  Generate high-impact ATS cover letters aligned to your candidate profile.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-bg-base text-text-muted hover:text-text transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-border/60">
          {/* Left Form Controls Panel */}
          {!readOnly && (
            <div className="lg:col-span-5 p-4 md:p-6 space-y-4 overflow-y-auto bg-surface/40">
            
            {/* Direct Candidate Details Accordion (If no resume passed) */}
            {isDirectMode && (
              <div className="border border-border/80 rounded-xl bg-bg-base/70 overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === 1 ? 0 : 1)}
                  className="w-full p-3.5 flex items-center justify-between text-left cursor-pointer hover:bg-surface/50 transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center">
                      1
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-text uppercase tracking-wider">Candidate Profile</h3>
                      <p className="text-[10px] text-text-muted font-medium">
                        {candidateName ? `${candidateName} • ${candidateLocation || "India"}` : "Fill your contact & academic details"}
                      </p>
                    </div>
                  </div>
                  {activeAccordion === 1 ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                </button>

                {activeAccordion === 1 && (
                  <div className="p-3.5 border-t border-border/50 space-y-3 bg-surface/30">
                    <div>
                      <label className="block text-[11px] font-bold text-text-muted mb-1">Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Verma"
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-bg-base text-xs focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-text-muted mb-1">Email</label>
                        <input
                          type="email"
                          placeholder="e.g. rahul@example.com"
                          value={candidateEmail}
                          onChange={(e) => setCandidateEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-bg-base text-xs focus:ring-1 focus:ring-primary outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-text-muted mb-1">Phone</label>
                        <input
                          type="text"
                          placeholder="+91 98765 43210"
                          value={candidatePhone}
                          onChange={(e) => setCandidatePhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-bg-base text-xs focus:ring-1 focus:ring-primary outline-none"
                        />
                      </div>
                    </div>

                    {/* Location Input */}
                    <div>
                      <label className="block text-[11px] font-bold text-text-muted mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-primary" /> Location / City
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Bengaluru, KA or New Delhi, India"
                        value={candidateLocation}
                        onChange={(e) => setCandidateLocation(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-bg-base text-xs focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-text-muted mb-1">College Name</label>
                        <input
                          type="text"
                          placeholder="e.g. IIT Bombay"
                          value={candidateCollege}
                          onChange={(e) => setCandidateCollege(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-bg-base text-xs focus:ring-1 focus:ring-primary outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-text-muted mb-1">Branch / Degree</label>
                        <input
                          type="text"
                          placeholder="e.g. CSE / IT"
                          value={candidateBranch}
                          onChange={(e) => setCandidateBranch(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-bg-base text-xs focus:ring-1 focus:ring-primary outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-text-muted mb-1">Key Project / Accomplishment</label>
                      <input
                        type="text"
                        placeholder="e.g. Microservices API backend in Node.js & Docker"
                        value={candidateProject}
                        onChange={(e) => setCandidateProject(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-bg-base text-xs focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveAccordion(2)}
                      className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg border border-primary/25 transition-colors flex items-center justify-center gap-1 cursor-pointer mt-1"
                    >
                      <span>Next: Target Application</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Target Application Details Accordion */}
            <div className="border border-border/80 rounded-xl bg-bg-base/70 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === (isDirectMode ? 2 : 1) ? 0 : (isDirectMode ? 2 : 1))}
                className="w-full p-3.5 flex items-center justify-between text-left cursor-pointer hover:bg-surface/50 transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center">
                    {isDirectMode ? 2 : 1}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-text uppercase tracking-wider">Target Application</h3>
                    <p className="text-[10px] text-text-muted font-medium">
                      {companyName ? `${companyName} • ${targetRole || "Engineering Role"}` : "Specify target company & role"}
                    </p>
                  </div>
                </div>
                {activeAccordion === (isDirectMode ? 2 : 1) ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
              </button>

              {activeAccordion === (isDirectMode ? 2 : 1) && (
                <div className="p-3.5 border-t border-border/50 space-y-3 bg-surface/30">
                  <div>
                    <label className="block text-[11px] font-bold text-text-muted mb-1">Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Google, Swiggy, Microsoft, Flipkart"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-bg-base text-xs focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-text-muted mb-1">Target Role</label>
                    <input
                      type="text"
                      placeholder="e.g. Software Development Engineer (SDE-1)"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-bg-base text-xs focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-text-muted mb-1">
                      Job Description Snippet <span className="text-text-muted font-normal">(Optional)</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Paste key requirements from job posting for enhanced ATS alignment..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-bg-base text-xs focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>

                  {isDirectMode && (
                    <button
                      type="button"
                      onClick={() => setActiveAccordion(3)}
                      className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg border border-primary/25 transition-colors flex items-center justify-center gap-1 cursor-pointer mt-1"
                    >
                      <span>Next: Writing Tone</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Tone & Style Accordion */}
            <div className="border border-border/80 rounded-xl bg-bg-base/70 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === (isDirectMode ? 3 : 2) ? 0 : (isDirectMode ? 3 : 2))}
                className="w-full p-3.5 flex items-center justify-between text-left cursor-pointer hover:bg-surface/50 transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center">
                    {isDirectMode ? 3 : 2}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-text uppercase tracking-wider">Tone & Writing Style</h3>
                    <p className="text-[10px] text-text-muted font-medium">{tone}</p>
                  </div>
                </div>
                {activeAccordion === (isDirectMode ? 3 : 2) ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
              </button>

              {activeAccordion === (isDirectMode ? 3 : 2) && (
                <div className="p-3.5 border-t border-border/50 space-y-2 bg-surface/30">
                  {[
                    "Professional & Executive",
                    "Enthusiastic & High-Energy",
                    "Technical & Data-Driven",
                    "Concise & Direct",
                  ].map((t) => (
                    <label
                      key={t}
                      className={`flex items-center space-x-2.5 p-2 rounded-lg border cursor-pointer transition-colors text-xs font-medium ${
                        tone === t
                          ? "border-primary/50 bg-primary/10 text-primary font-bold"
                          : "border-border/60 bg-bg-base hover:bg-surface text-text-muted"
                      }`}
                    >
                      <input
                        type="radio"
                        name="cover-letter-tone"
                        value={t}
                        checked={tone === t}
                        onChange={() => setTone(t)}
                        className="accent-primary"
                      />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Single-Page Cover Letter...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>✨ Generate Cover Letter</span>
                </>
              )}
            </button>
          </div>
          )}

          {/* Right Document Preview Panel */}
          <div className={`${readOnly ? "lg:col-span-12 max-w-3xl mx-auto w-full" : "lg:col-span-7"} p-4 md:p-6 flex flex-col justify-between bg-bg-base/30 space-y-4`}>
            <div className="flex-1 overflow-y-auto min-h-[420px] flex items-center justify-center">
              <CoverLetterPreview
                data={coverLetter}
                isLoading={isGenerating}
              />
            </div>

            {/* Document Action Footer */}
            <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-3 bg-surface/80 p-3 rounded-xl">
              <span className="text-[11px] text-text-muted font-bold">
                {coverLetter ? "Ready for download" : "Fill parameters to generate"}
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyText}
                  disabled={!coverLetter}
                  className="px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-bold hover:bg-bg-base transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-40"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy Text"}</span>
                </button>

                <button
                  onClick={handlePrint}
                  disabled={!coverLetter}
                  className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs disabled:opacity-40"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Download Single-Page PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
