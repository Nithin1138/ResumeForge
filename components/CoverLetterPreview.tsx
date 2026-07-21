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
      className="w-full aspect-[1/1.41] bg-white text-zinc-900 shadow-xl border border-zinc-200 rounded-lg p-5 sm:p-7 flex flex-col justify-between font-sans text-xs leading-relaxed relative overflow-hidden select-text"
    >
      {/* ── TOP HEADER (Matching Resume Template Accent & Header Style) ── */}
      <div className="flex-1 flex flex-col justify-start min-h-0">
        <div className="border-b pb-2.5 mb-3.5" style={{ borderColor: `${accent}30` }}>
          <h1
            className="text-lg sm:text-xl font-black uppercase tracking-tight"
            style={{ color: accent }}
          >
            {candidateName}
          </h1>
          <p className="text-zinc-600 font-medium text-[11px] mt-0.5">
            {candidateEmail} • {candidatePhone} • {candidateLocation}
          </p>
        </div>

        {/* ── DATE & RECIPIENT BLOCK ── */}
        <div className="space-y-2 mb-3.5 text-zinc-700 text-xs">
          <p className="font-semibold text-zinc-500 text-[11px]">{currentDate}</p>

          <div className="space-y-0.5 font-medium">
            <p className="font-bold text-zinc-900">{data.recipient || "Hiring Manager"}</p>
            <p className="text-zinc-700">{data.company || "Target Company"}</p>
          </div>

          {/* Subject Line */}
          {data.subject && (
            <div className="pt-1">
              <p
                className="font-bold uppercase tracking-wide text-[10px] sm:text-[11px] px-2.5 py-1 rounded-md border inline-block"
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
        <div className="mb-2.5 font-bold text-zinc-900 text-xs sm:text-sm">
          {data.salutation || `Dear Hiring Team at ${data.company || "Company"},`}
        </div>

        {/* ── BODY PARAGRAPHS ── */}
        <div className="space-y-2.5 text-zinc-800 text-[11px] sm:text-xs leading-relaxed overflow-y-auto pr-1 flex-1">
          {/* Paragraph 1: Opening Hook */}
          {isEditable ? (
            <textarea
              className="w-full p-2 border border-zinc-300 rounded focus:ring-2 focus:ring-primary outline-none text-xs"
              rows={3}
              value={data.openingParagraph || ""}
              onChange={(e) => handleFieldChange("openingParagraph", e.target.value)}
            />
          ) : (
            <p className="text-justify">{data.openingParagraph}</p>
          )}

          {/* Paragraph 2: High Impact Engineering & Project Highlights */}
          {isEditable ? (
            <textarea
              className="w-full p-2 border border-zinc-300 rounded focus:ring-2 focus:ring-primary outline-none text-xs"
              rows={4}
              value={data.bodyParagraph || ""}
              onChange={(e) => handleFieldChange("bodyParagraph", e.target.value)}
            />
          ) : (
            <p className="text-justify">{data.bodyParagraph}</p>
          )}

          {/* Paragraph 3: Closing & Call to Action */}
          {isEditable ? (
            <textarea
              className="w-full p-2 border border-zinc-300 rounded focus:ring-2 focus:ring-primary outline-none text-xs"
              rows={3}
              value={data.closingParagraph || ""}
              onChange={(e) => handleFieldChange("closingParagraph", e.target.value)}
            />
          ) : (
            <p className="text-justify">{data.closingParagraph}</p>
          )}
        </div>
      </div>

      {/* ── SIGN OFF & FOOTER ── */}
      <div className="pt-3 border-t border-zinc-100 mt-3 shrink-0 space-y-2">
        <div className="space-y-0.5">
          <p className="text-zinc-600 font-medium text-[11px]">{data.signOff ? data.signOff.split("\n")[0] : "Sincerely,"}</p>
          <p className="font-extrabold text-xs text-zinc-900" style={{ color: accent }}>
            {candidateName}
          </p>
        </div>

        {/* Small watermark/badge */}
        <div className="flex justify-between items-center text-[9px] text-zinc-400 font-medium pt-1">
          <span>Formatted with ATSLift matching engine</span>
          <span className="uppercase font-bold tracking-wider" style={{ color: accent }}>
            {tmpl.name} Style
          </span>
        </div>
      </div>
    </div>
  );
}
