"use client";

import React from "react";
import { TEMPLATES_CONFIG, TemplateDefinition } from "@/lib/templatesConfig";

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
  data: CoverLetterData;
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
  candidateName = "Aarav Sharma",
  candidateEmail = "aarav.sharma@tech.in",
  candidatePhone = "+91 98765 43210",
  candidateLocation = "Bengaluru, KA",
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
    if (onChange) {
      onChange({ ...data, [field]: val });
    }
  };

  return (
    <div
      id="cover-letter-document"
      className="w-full bg-white text-zinc-900 shadow-2xl border border-zinc-200 rounded-lg p-6 sm:p-9 flex flex-col justify-between font-sans text-xs leading-relaxed relative select-text min-h-[640px]"
    >
      {/* ── TOP HEADER (Matching Resume Template Accent & Header Style) ── */}
      <div>
        <div className="border-b pb-3 mb-5" style={{ borderColor: `${accent}30` }}>
          <h1
            className="text-xl sm:text-2xl font-black uppercase tracking-tight"
            style={{ color: accent }}
          >
            {candidateName}
          </h1>
          <p className="text-zinc-600 font-medium text-xs mt-1">
            {[candidateEmail, candidatePhone, candidateLocation].filter(Boolean).join(" • ")}
          </p>
        </div>

        {/* ── DATE & RECIPIENT BLOCK ── */}
        <div className="space-y-2.5 mb-5 text-zinc-700 text-xs">
          <p className="font-semibold text-zinc-500 text-xs">{currentDate}</p>

          <div className="space-y-0.5 font-medium">
            <p className="font-bold text-zinc-900">{data.recipient || "Hiring Manager"}</p>
            <p className="text-zinc-700">{data.company || "Target Company"}</p>
          </div>

          {/* Subject Line */}
          {data.subject && (
            <div className="pt-1.5">
              <p
                className="font-bold uppercase tracking-wide text-xs px-3 py-1.5 rounded-md border inline-block"
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
        <div className="mb-3.5 font-bold text-zinc-900 text-xs sm:text-sm">
          {data.salutation || `Dear Hiring Team at ${data.company || "Company"},`}
        </div>

        {/* ── BODY PARAGRAPHS (Clean Document Paper Format) ── */}
        <div className="space-y-3.5 text-zinc-800 text-xs sm:text-[13px] leading-relaxed">
          {/* Paragraph 1: Opening Hook */}
          {isEditable ? (
            <textarea
              className="w-full p-2.5 border border-zinc-300 rounded-md focus:ring-2 focus:ring-primary outline-none text-xs"
              rows={3}
              value={data.openingParagraph || ""}
              onChange={(e) => handleFieldChange("openingParagraph", e.target.value)}
            />
          ) : (
            <p className="text-left font-normal">{data.openingParagraph}</p>
          )}

          {/* Paragraph 2: High Impact Engineering & Project Highlights */}
          {isEditable ? (
            <textarea
              className="w-full p-2.5 border border-zinc-300 rounded-md focus:ring-2 focus:ring-primary outline-none text-xs"
              rows={4}
              value={data.bodyParagraph || ""}
              onChange={(e) => handleFieldChange("bodyParagraph", e.target.value)}
            />
          ) : (
            <p className="text-left font-normal">{data.bodyParagraph}</p>
          )}

          {/* Paragraph 3: Closing & Call to Action */}
          {isEditable ? (
            <textarea
              className="w-full p-2.5 border border-zinc-300 rounded-md focus:ring-2 focus:ring-primary outline-none text-xs"
              rows={3}
              value={data.closingParagraph || ""}
              onChange={(e) => handleFieldChange("closingParagraph", e.target.value)}
            />
          ) : (
            <p className="text-left font-normal">{data.closingParagraph}</p>
          )}
        </div>
      </div>

      {/* ── SIGN OFF & FOOTER ── */}
      <div className="pt-5 border-t border-zinc-100 mt-6 shrink-0 space-y-3">
        <div className="space-y-1">
          <p className="text-zinc-600 font-medium text-xs">{data.signOff ? data.signOff.split("\n")[0] : "Sincerely,"}</p>
          <p className="font-extrabold text-sm text-zinc-900" style={{ color: accent }}>
            {candidateName}
          </p>
        </div>

        {/* Small watermark/badge */}
        <div className="flex justify-between items-center text-[10px] text-zinc-400 font-medium pt-1">
          <span>Formatted with ATSLift matching engine</span>
          <span className="uppercase font-bold tracking-wider" style={{ color: accent }}>
            {tmpl.name} Style
          </span>
        </div>
      </div>
    </div>
  );
}
