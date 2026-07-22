"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Copy, Check, Printer, ArrowLeft } from "lucide-react";
import ResumePreviewPanel from "./ResumePreviewPanel";

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: any;
  output: any;
}

export default function ResumeModal({
  isOpen,
  onClose,
  resume,
  output,
}: ResumeModalProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [zoomScale, setZoomScale] = useState<number>(0.65);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted || !resume) return null;

  // Safely parse inputData and output if they are JSON strings
  const rawInputData = typeof resume.inputData === "string"
    ? JSON.parse(resume.inputData)
    : (resume.inputData || {});

  const parsedOutput = typeof output === "string"
    ? JSON.parse(output)
    : (output || (resume.outputFull ? (typeof resume.outputFull === "string" ? JSON.parse(resume.outputFull) : resume.outputFull) : {}));

  const normalizedResume = {
    ...resume,
    inputData: {
      ...rawInputData,
      personal: {
        fullName: rawInputData?.personal?.fullName || resume?.title || "Candidate Name",
        email: rawInputData?.personal?.email || "",
        phone: rawInputData?.personal?.phone || "",
        city: rawInputData?.personal?.city || rawInputData?.personal?.location || "",
        linkedin: rawInputData?.personal?.linkedin || "",
        github: rawInputData?.personal?.github || "",
        targetRole: rawInputData?.personal?.targetRole || resume?.targetRole || "",
        branch: rawInputData?.personal?.branch || "",
        collegeName: rawInputData?.personal?.collegeName || "",
      }
    }
  };

  // Format full plain text for copying
  const fullPlainTextContent = `
${normalizedResume.inputData.personal.fullName.toUpperCase()}
Email: ${normalizedResume.inputData.personal.email}${normalizedResume.inputData.personal.phone ? ` | Phone: ${normalizedResume.inputData.personal.phone}` : ""}
Target: ${normalizedResume.inputData.personal.targetRole} ${normalizedResume.inputData.personal.branch ? `(${normalizedResume.inputData.personal.branch})` : ""}
Education: ${parsedOutput.pgEducation ? `[PG] ${parsedOutput.pgEducation.degree} - ${parsedOutput.pgEducation.institution} (${parsedOutput.pgEducation.year}) | CGPA: ${parsedOutput.pgEducation.cgpa} ; ` : ""}[UG] ${parsedOutput.education?.degree || ""} - ${parsedOutput.education?.institution || ""} (${parsedOutput.education?.year || ""}) | CGPA: ${parsedOutput.education?.cgpa || ""}

PROFESSIONAL SUMMARY
${parsedOutput.summary || ""}

TECHNICAL SKILLS
${(parsedOutput.skills || []).map((s: any) => `- ${s.category}: ${(s.skills || []).join(", ")}`).join("\n")}

PROJECTS
${(parsedOutput.projects || []).map((proj: any) => `
${proj.title} (${proj.techStack})
${proj.duration ? `Duration: ${proj.duration}\n` : ""}${(proj.bullets || []).map((b: string) => `- ${b}`).join("\n")}
`).join("\n")}
${(parsedOutput.experience || []).length > 0 ? `
EXPERIENCE
${(parsedOutput.experience || []).map((exp: any) => `
${exp.company} - ${exp.role} (${exp.duration})
${(exp.bullets || []).map((b: string) => `- ${b}`).join("\n")}
`).join("\n")}
` : ""}
  `.trim();

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(fullPlainTextContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = "";
    window.print();
    setTimeout(() => { document.title = originalTitle; }, 500);
  };

  return createPortal(
    <div className="fixed inset-0 bg-bg-base/80 dark:bg-black/75 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-6 z-[9999] animate-fade-in overflow-y-auto font-sans">
      {/* Floating Top Control Bar (Matching Image 2 pixel-for-pixel) */}
      <div className="w-full max-w-4xl bg-surface/95 border border-border/80 text-text px-4 py-3 rounded-2xl flex items-center justify-between shrink-0 shadow-xl mb-4 backdrop-blur-md gap-2 z-50">
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
          {/* Zoom Level Selector */}
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
            className="px-3.5 py-1.5 rounded-full bg-bg-base hover:bg-border/40 text-xs font-bold text-text transition-all flex items-center space-x-1.5 border border-border/60 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy Text"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-md"
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

      {/* Centered Document Preview Canvas */}
      <div className="w-full flex-1 flex flex-col items-center justify-start overflow-y-auto py-4 px-2 my-auto">
        <div 
          className="relative shadow-2xl rounded-xs bg-white text-black border border-border/40 my-auto transition-all duration-200"
          style={{ 
            width: `${Math.round(794 * zoomScale)}px`,
            height: `${Math.round(1122 * zoomScale)}px`,
          }}
        >
          <ResumePreviewPanel 
            resume={normalizedResume} 
            output={parsedOutput} 
            locked={false} 
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
