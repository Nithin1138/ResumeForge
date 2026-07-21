"use client";

import React, { useState } from "react";
import { X, Sparkles, Copy, Check, Printer, Loader2, Building2, Briefcase, Sliders, FileText, User, GraduationCap, ChevronDown, ChevronUp } from "lucide-react";
import CoverLetterPreview, { CoverLetterData } from "./CoverLetterPreview";

interface CoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId?: string;
  inputData?: any;
  templateId?: string;
}

export default function CoverLetterModal({
  isOpen,
  onClose,
  resumeId,
  inputData,
  templateId = "modern",
}: CoverLetterModalProps) {
  const isDirectMode = !resumeId && (!inputData || !inputData?.personal?.fullName);

  // Resume vs Direct Candidate Details
  const defaultName = inputData?.personal?.fullName || "Aarav Sharma";
  const defaultEmail = inputData?.personal?.email || "aarav.sharma@tech.in";
  const defaultPhone = inputData?.personal?.phone || "+91 98765 43210";
  const defaultLocation = inputData?.personal?.city || inputData?.personal?.location || "Bengaluru, KA";
  const defaultCollege = inputData?.personal?.collegeName || "Engineering Institute";
  const defaultBranch = inputData?.personal?.branch || "Computer Science & Engineering";
  const defaultRole = inputData?.personal?.targetRole || "Software Engineer";

  // Form State
  const [candidateName, setCandidateName] = useState(defaultName);
  const [candidateEmail, setCandidateEmail] = useState(defaultEmail);
  const [candidatePhone, setCandidatePhone] = useState(defaultPhone);
  const [candidateLocation, setCandidateLocation] = useState(defaultLocation);
  const [candidateCollege, setCandidateCollege] = useState(defaultCollege);
  const [candidateBranch, setCandidateBranch] = useState(defaultBranch);
  const [candidateProject, setCandidateProject] = useState("High-throughput microservice backend in Node.js & Docker");

  const [companyName, setCompanyName] = useState("");
  const [targetRole, setTargetRole] = useState(defaultRole);
  const [tone, setTone] = useState("Professional & Executive");
  const [jobDescription, setJobDescription] = useState("");
  
  const [showPersonalDetails, setShowPersonalDetails] = useState(isDirectMode);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [coverLetter, setCoverLetter] = useState<CoverLetterData | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const activeDetails = isDirectMode ? {
        fullName: candidateName.trim() || "Aarav Sharma",
        email: candidateEmail.trim() || "aarav.sharma@tech.in",
        phone: candidatePhone.trim() || "+91 98765 43210",
        location: candidateLocation.trim() || "Bengaluru, KA",
        collegeName: candidateCollege.trim() || "Engineering Institute",
        branch: candidateBranch.trim() || "Computer Science",
        topProject: candidateProject.trim() || "Software Engineering Projects",
      } : undefined;

      const res = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId,
          inputData,
          directCandidateDetails: activeDetails,
          companyName: companyName.trim() || "Target Company",
          targetRole: targetRole.trim() || defaultRole,
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
    window.print();
  };

  const activeCandidateName = isDirectMode ? candidateName : defaultName;
  const activeCandidateEmail = isDirectMode ? candidateEmail : defaultEmail;
  const activeCandidatePhone = isDirectMode ? candidatePhone : defaultPhone;
  const activeCandidateLocation = isDirectMode ? candidateLocation : defaultLocation;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-surface border border-border/80 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-surface/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-text flex items-center gap-2">
                AI Cover Letter Generator
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {isDirectMode ? "Standalone Mode" : "Matching Theme"}
                </span>
              </h3>
              <p className="text-xs text-text-muted">
                {isDirectMode
                  ? "Enter your candidate details & target company to generate an ATS-tailored cover letter."
                  : "Generate a 100% matching, ATS-optimized cover letter using your resume profile."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border overflow-y-auto flex-1">
          {/* Left Form Panel */}
          <div className="lg:col-span-5 p-5 space-y-4 bg-surface/50 overflow-y-auto">
            
            {/* Direct Mode / Collapsible Personal Info Section */}
            {isDirectMode && (
              <div className="border border-border/80 rounded-xl bg-bg-base/60 p-3.5 space-y-3">
                <button
                  type="button"
                  onClick={() => setShowPersonalDetails(!showPersonalDetails)}
                  className="w-full flex items-center justify-between text-xs font-bold text-text uppercase tracking-wider text-left cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 text-primary">
                    <User className="w-4 h-4" /> Candidate Details
                  </span>
                  {showPersonalDetails ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                </button>

                {showPersonalDetails && (
                  <div className="space-y-3 pt-2 border-t border-border/40">
                    <div>
                      <label className="block text-[11px] font-bold text-text-muted mb-1">Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Aarav Sharma"
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-xs focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-text-muted mb-1">Email</label>
                        <input
                          type="email"
                          placeholder="aarav@gmail.com"
                          value={candidateEmail}
                          onChange={(e) => setCandidateEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-xs focus:ring-1 focus:ring-primary outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-text-muted mb-1">Phone</label>
                        <input
                          type="text"
                          placeholder="+91 98765 43210"
                          value={candidatePhone}
                          onChange={(e) => setCandidatePhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-xs focus:ring-1 focus:ring-primary outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-text-muted mb-1">College Name</label>
                        <input
                          type="text"
                          placeholder="e.g. IIT Bombay"
                          value={candidateCollege}
                          onChange={(e) => setCandidateCollege(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-xs focus:ring-1 focus:ring-primary outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-text-muted mb-1">Branch / Degree</label>
                        <input
                          type="text"
                          placeholder="e.g. CSE / IT"
                          value={candidateBranch}
                          onChange={(e) => setCandidateBranch(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-xs focus:ring-1 focus:ring-primary outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-text-muted mb-1">Key Accomplishment / Project</label>
                      <input
                        type="text"
                        placeholder="e.g. Built high-throughput microservice backend in Node.js & Docker"
                        value={candidateProject}
                        onChange={(e) => setCandidateProject(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-xs focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Target Application Settings */}
            <div>
              <label className="block text-xs font-bold text-text uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-primary" /> Target Company Name
              </label>
              <input
                type="text"
                placeholder="e.g. Google, Flipkart, TCS, Accenture"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-base text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-primary" /> Target Job Role
              </label>
              <input
                type="text"
                placeholder="e.g. Software Development Engineer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-base text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-primary" /> Tone & Writing Style
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-base text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="Professional & Executive">Professional & Executive</option>
                <option value="Technical & Impact-Driven">Technical & Impact-Driven</option>
                <option value="Enthusiastic & Startup Ready">Enthusiastic & Startup Ready</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" /> Job Description Highlights (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Paste key requirements or job description text here for extra keyword matching..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-border bg-bg-base text-xs focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3.5 px-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Tailored Cover Letter...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {coverLetter ? "Regenerate Cover Letter" : "Generate Cover Letter"}
                </>
              )}
            </button>
          </div>

          {/* Right Live Preview Panel */}
          <div className="lg:col-span-7 p-4 sm:p-5 bg-bg-base flex flex-col justify-start items-center overflow-y-auto">
            {coverLetter ? (
              <div className="w-full space-y-4 flex flex-col items-center">
                <div className="w-full flex items-center justify-between gap-2 border-b border-border/40 pb-3 shrink-0">
                  <span className="text-xs font-bold text-text-muted">
                    Document Preview ({templateId} theme)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyText}
                      className="px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-bold text-text hover:border-primary transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-text-muted" />}
                      {copied ? "Copied!" : "Copy Text"}
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print / Save PDF
                    </button>
                  </div>
                </div>

                <div className="w-full max-w-lg shadow-2xl rounded-lg overflow-hidden border border-border/40">
                  <CoverLetterPreview
                    data={coverLetter}
                    candidateName={activeCandidateName}
                    candidateEmail={activeCandidateEmail}
                    candidatePhone={activeCandidatePhone}
                    candidateLocation={activeCandidateLocation}
                    templateId={templateId}
                    onChange={(updated) => setCoverLetter(updated)}
                  />
                </div>
              </div>
            ) : (
              <div className="w-full h-full min-h-[380px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-border/60 rounded-2xl bg-surface/30 my-auto">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-text mb-1">No Cover Letter Generated Yet</h4>
                <p className="text-xs text-text-muted max-w-xs mb-4">
                  {isDirectMode
                    ? "Enter candidate details & target company on the left, then click Generate."
                    : "Enter target company name on the left and click Generate to create a custom ATS cover letter."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
