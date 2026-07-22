"use client";

import React from "react";
import { TEMPLATES_CONFIG, TemplateDefinition } from "@/lib/templatesConfig";
import { Loader2, FileText, Sparkles } from "lucide-react";

export interface CoverLetterData {
  recipient?: string;
  company?: string;
  subject?: string;
  salutation?: string;
  openingParagraph?: string;
  bodyParagraph?: string;
  closingParagraph?: string;
  signOff?: string;
}

interface CoverLetterPreviewProps {
  data?: CoverLetterData | null;
  isLoading?: boolean;
  candidateName?: string;
  candidateEmail?: string;
  candidatePhone?: string;
  candidateLocation?: string;
  templateId?: string;
  isEditable?: boolean;
  onChange?: (updated: CoverLetterData) => void;
}

export default function CoverLetterPreview({
  data,
  isLoading = false,
  candidateName,
  candidateEmail,
  candidatePhone,
  candidateLocation,
  templateId = "modern",
  isEditable = false,
  onChange,
}: CoverLetterPreviewProps) {
  const tmpl: TemplateDefinition =
    TEMPLATES_CONFIG.find((t) => t.id === templateId) || TEMPLATES_CONFIG[1];
  const accent = tmpl.accentColor || "#1e293b";

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleFieldChange = (field: keyof CoverLetterData, val: string) => {
    if (onChange && data) {
      onChange({ ...data, [field]: val });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white text-zinc-900 shadow-2xl border border-zinc-200 rounded-lg p-12 flex flex-col items-center justify-center min-h-[640px] text-center space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <h3 className="font-serif text-lg font-bold text-zinc-800">Generating Single-Page Cover Letter...</h3>
        <p className="text-xs text-zinc-500 max-w-sm">
          Aligning target role, company requirements, and candidate background...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full bg-white/70 text-zinc-700 border-2 border-dashed border-zinc-300 rounded-lg p-12 flex flex-col items-center justify-center min-h-[640px] text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <FileText className="w-7 h-7" />
        </div>
        <h3 className="font-serif text-xl font-bold text-zinc-800">Cover Letter Preview</h3>
        <p className="text-xs text-zinc-500 max-w-sm font-medium leading-relaxed">
          Fill your target application details and click <span className="font-bold text-primary">"Generate Cover Letter"</span> to construct your ATS-aligned single-page document.
        </p>
      </div>
    );
  }

  const nameDisplay = candidateName || "Candidate Name";
  const contactParts = [candidateEmail, candidatePhone, candidateLocation].filter(Boolean);
  const contactDisplay = contactParts.length > 0 ? contactParts.join(" • ") : "email@example.com • +91 98765 43210 • Location";

  return (
    <div
      id="cover-letter-document"
      className="w-full max-w-[210mm] aspect-[210/297] min-h-[297mm] bg-white text-zinc-900 shadow-2xl border border-zinc-200/90 rounded-sm p-8 sm:p-12 md:p-14 flex flex-col justify-between font-sans text-xs leading-relaxed relative select-text mx-auto my-0 box-border"
    >
      {/* ── TOP HEADER (Matching Resume Template Accent & Header Style) ── */}
      <div>
        <div className="border-b pb-3 mb-6" style={{ borderColor: `${accent}30` }}>
          <h1
            className="text-xl sm:text-2xl font-black uppercase tracking-tight"
            style={{ color: accent }}
          >
            {nameDisplay}
          </h1>
          <p className="text-zinc-600 font-medium text-xs mt-1">
            {contactDisplay}
          </p>
        </div>

        {/* ── DATE & RECIPIENT BLOCK ── */}
        <div className="space-y-2 mb-6 text-zinc-700 text-xs">
          <p className="font-semibold text-zinc-500 text-xs">{currentDate}</p>

          <div className="space-y-0.5 font-medium pt-1">
            <p className="font-bold text-zinc-900">{data.recipient || "Hiring Manager"}</p>
            <p className="text-zinc-700">{data.company || "Target Company"}</p>
          </div>

          {/* Subject Line */}
          {data.subject && (
            <div className="pt-2">
              <p
                className="font-bold uppercase tracking-wide text-xs px-3.5 py-2 rounded-lg border inline-block max-w-full leading-snug"
                style={{
                  color: accent,
                  borderColor: `${accent}40`,
                  backgroundColor: `${accent}08`,
                }}
              >
                Subject: {data.subject}
              </p>
            </div>
          )}
        </div>

        {/* ── SALUTATION ── */}
        <div className="mb-4 font-bold text-zinc-900 text-xs sm:text-sm">
          {data.salutation || "Dear Hiring Manager,"}
        </div>

        {/* ── PARAGRAPHS ── */}
        <div className="space-y-4 text-zinc-800 text-xs leading-relaxed text-left font-sans">
          {isEditable ? (
            <>
              <textarea
                rows={3}
                value={data.openingParagraph || ""}
                onChange={(e) => handleFieldChange("openingParagraph", e.target.value)}
                className="w-full p-2 border border-zinc-300 rounded focus:border-zinc-500 outline-none text-xs"
              />
              <textarea
                rows={5}
                value={data.bodyParagraph || ""}
                onChange={(e) => handleFieldChange("bodyParagraph", e.target.value)}
                className="w-full p-2 border border-zinc-300 rounded focus:border-zinc-500 outline-none text-xs"
              />
              <textarea
                rows={3}
                value={data.closingParagraph || ""}
                onChange={(e) => handleFieldChange("closingParagraph", e.target.value)}
                className="w-full p-2 border border-zinc-300 rounded focus:border-zinc-500 outline-none text-xs"
              />
            </>
          ) : (
            <>
              <p className="leading-relaxed">{data.openingParagraph}</p>
              <p className="leading-relaxed">{data.bodyParagraph}</p>
              <p className="leading-relaxed">{data.closingParagraph}</p>
            </>
          )}
        </div>
      </div>

      {/* ── SIGN-OFF BLOCK ── */}
      <div className="mt-8 pt-4 border-t border-zinc-200">
        <p className="font-semibold text-zinc-700">{data.signOff || "Sincerely,"}</p>
        <p className="font-bold text-zinc-900 text-sm mt-1">{nameDisplay}</p>
      </div>
    </div>
  );
}
