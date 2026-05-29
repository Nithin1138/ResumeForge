"use client";

import { useRef, useEffect, useState } from "react";
import { Lock } from "lucide-react";

// A4 paper at 96 dpi
const NATURAL_W = 794;
const NATURAL_H = 1123;

// ── URL / phone formatters (self-contained) ────────────────────────────────
const fmtLinkedIn = (url: string) => {
  if (!url) return "";
  let c = url.trim().split(/[?#]/)[0].replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/$/, "");
  return c.startsWith("linkedin.com") ? c : `linkedin.com/in/${c}`;
};
const fmtGitHub = (url: string) => {
  if (!url) return "";
  let c = url.trim().split(/[?#]/)[0].replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/$/, "");
  return c.startsWith("github.com/") ? c : `github.com/${c}`;
};
const fmtPhone = (phone: string) => {
  if (!phone) return "";
  const c = phone.trim().replace(/[-\s()]/g, "");
  if (c.length === 10 && /^\d+$/.test(c)) return `+91 ${c.slice(0, 5)} ${c.slice(5)}`;
  if (c.startsWith("91") && c.length === 12) return `+91 ${c.slice(2, 7)} ${c.slice(7)}`;
  return phone;
};

// ── Live-editable data shape ───────────────────────────────────────────────
export interface LiveResumeData {
  summary: string;
  skills: {
    languages: string[];
    frameworks: string[];
    databases: string[];
    tools: string[];
    aiAndData: string[];
    csConcepts: string[];
    concepts: string[];
    softSkills: string[];
  };
  projects: Array<{ title: string; techStack: string; duration: string; bullets: string[] }>;
  experience: Array<{ company: string; role: string; duration: string; bullets: string[] }>;
  positions: Array<{ title: string; organization: string; bullet: string }>;
  achievements: string[];
  education: { institution: string; degree: string; year: string; cgpa: string };
  pgEducation?: { institution: string; degree: string; year: string; cgpa: string } | null;
}

interface Props {
  resume: any;        // raw resume record (for personal info)
  output: any;        // AI output (fallback when liveData not set)
  locked: boolean;    // true = blur below header + show lock
  liveData?: LiveResumeData | null;  // when set, overrides output for preview
  includeSummary?: boolean; // whether to show professional summary
  includeCertifications?: boolean; // whether to show certifications
}

// ── Sub-components ─────────────────────────────────────────────────────────
function Divider() {
  return <div style={{ height: "0.5px", backgroundColor: "#cccccc", margin: "3pt 0 5pt 0" }} />;
}

function SectionTitle({ children }: { children: string }) {
  return (
    <>
      <div style={{ fontSize: "11pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.4px", color: "#1a1a1a", marginBottom: "2pt" }}>
        {children}
      </div>
      <Divider />
    </>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function ResumePreviewPanel({ resume, output, locked, liveData, includeSummary = false, includeCertifications = true }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  // Calculate scale to fit the A4 paper inside the wrapper
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const calc = () => {
      const { width, height } = el.getBoundingClientRect();
      const byW = width / NATURAL_W;
      const byH = height / NATURAL_H;
      setScale(Math.min(byW, byH) * 0.97); // 0.97 = 3% breathing room
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Merge liveData over raw output
  const d = {
    summary: liveData?.summary ?? output?.summary ?? "",
    skills: liveData?.skills ?? output?.skills ?? {},
    projects: liveData?.projects ?? output?.projects ?? [],
    experience: liveData?.experience ?? output?.experience ?? [],
    positions: liveData?.positions ?? output?.positions ?? [],
    achievements: liveData?.achievements ?? output?.achievements ?? [],
    education: liveData?.education ?? output?.education ?? {},
    pgEducation: liveData?.pgEducation ?? output?.pgEducation ?? null,
  };

  const p = resume?.inputData?.personal || {};
  const ip = resume?.inputData || {};

  return (
    <div ref={wrapperRef} className="w-full h-full flex items-start justify-center overflow-hidden">
      {/* 
        A4 paper at NATURAL size, then scaled with CSS transform.
        transformOrigin = top center so it stays pinned to the top.
      */}
      <style>{`
        @media print {
          .print-exact {
            transform: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            border-radius: 0 !important;
            width: 794px !important;
            height: max-content !important; /* Let it wrap content so it doesn't force a 2nd page */
            max-height: none !important;
            overflow: visible !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
      <div
        className="print-exact"
        style={{
          width: NATURAL_W,
          height: NATURAL_H,
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          flexShrink: 0,
          backgroundColor: "white",
          boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
          borderRadius: 3,
          overflow: "hidden",
          position: "relative",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: "10.5pt",
          lineHeight: 1.35,
          color: "#222",
          padding: "64px 72px",
          boxSizing: "border-box",
        }}
      >
        {/* ── HEADER (always clear) ── */}
        <div style={{ textAlign: "center", marginBottom: "13pt" }}>
          <div style={{ fontSize: "22pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "-0.5px", color: "#111", marginBottom: "3pt" }}>
            {p.fullName || "Your Name"}
          </div>
          <div style={{
            fontSize: "8.5pt",
            color: "#444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px 8px",
            flexWrap: "wrap",
            lineHeight: 1.4
          }}>
            {[
              p.location && <span key="location" style={{ whiteSpace: "nowrap" }}>{p.location}</span>,
              p.email && <span key="email" style={{ whiteSpace: "nowrap" }}>{p.email}</span>,
              p.phone && <span key="phone" style={{ whiteSpace: "nowrap" }}>{fmtPhone(p.phone)}</span>,
              p.linkedin && (
                <a key="linkedin" href={`https://${fmtLinkedIn(p.linkedin)}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit", whiteSpace: "nowrap" }}>
                  LinkedIn
                </a>
              ),
              p.github && (
                <a key="github" href={`https://${fmtGitHub(p.github)}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit", whiteSpace: "nowrap" }}>
                  GitHub
                </a>
              )
            ].filter(Boolean).map((node, idx, arr) => (
              <span key={idx} style={{ display: "inline-flex", alignItems: "center" }}>
                {node}
                {idx < arr.length - 1 && <span style={{ color: "#bbb", margin: "0 8px" }}>|</span>}
              </span>
            ))}
          </div>
        </div>

        {/* ── BODY (blurred when locked) ── */}
        <div style={locked ? { filter: "blur(4px)", userSelect: "none", pointerEvents: "none" } : {}}>

          {/* Professional Summary */}
          {includeSummary && d.summary && (
            <div style={{ marginBottom: "13pt" }}>
              <p style={{ fontSize: "10pt", textAlign: "justify", margin: 0, padding: 0 }}>
                {d.summary}
              </p>
            </div>
          )}

          {/* Education */}
          <div style={{ marginBottom: "13pt" }}>
            <SectionTitle>Education</SectionTitle>
            {/* PG */}
            {d.pgEducation && (
              <div style={{ marginBottom: "6pt" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: "10pt", fontWeight: "bold" }}>
                  <span style={{ flex: 1 }}>{d.pgEducation.institution}</span>
                  <span style={{ color: "#555", fontWeight: "normal", flexShrink: 0, fontSize: "9.5pt", textAlign: "right" }}>Graduation: {d.pgEducation.year}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: "9.5pt", color: "#444", marginTop: "1pt" }}>
                  <span style={{ flex: 1 }}>{d.pgEducation.degree}</span>
                  <span style={{ flexShrink: 0, textAlign: "right" }}>CGPA: {d.pgEducation.cgpa}</span>
                </div>
              </div>
            )}
            {/* UG */}
            {d.education?.institution && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: "10pt", fontWeight: "bold" }}>
                  <span style={{ flex: 1 }}>{d.education.institution}</span>
                  <span style={{ color: "#555", fontWeight: "normal", flexShrink: 0, fontSize: "9.5pt", textAlign: "right" }}>Graduation: {d.education.year}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: "9.5pt", color: "#444", marginTop: "1pt" }}>
                  <span style={{ flex: 1 }}>{d.education.degree} ({ip?.personal?.branch || "Engineering"})</span>
                  <span style={{ flexShrink: 0, textAlign: "right" }}>CGPA: {d.education.cgpa}</span>
                </div>
              </div>
            )}
          </div>

          {/* Technical Skills */}
          {d.skills && Object.values(d.skills).some((arr: any) => arr?.length > 0) && (
            <div style={{ marginBottom: "13pt" }}>
              <SectionTitle>Technical Skills</SectionTitle>
              <div style={{ fontSize: "9.5pt", lineHeight: 1.5 }}>
                {d.skills.languages?.length > 0 && <p style={{ margin: "0 0 3pt 0" }}><strong>Languages:</strong> {d.skills.languages.join(", ")}</p>}
                {d.skills.frameworks?.length > 0 && <p style={{ margin: "0 0 3pt 0" }}><strong>Frameworks & Libraries:</strong> {d.skills.frameworks.join(", ")}</p>}
                {d.skills.databases?.length > 0 && <p style={{ margin: "0 0 3pt 0" }}><strong>Databases:</strong> {d.skills.databases.join(", ")}</p>}
                {d.skills.tools?.length > 0 && <p style={{ margin: "0 0 3pt 0" }}><strong>Tools & Technologies:</strong> {d.skills.tools.join(", ")}</p>}
                {d.skills.cloudAndDevops?.length > 0 && <p style={{ margin: "0 0 3pt 0" }}><strong>Cloud & DevOps:</strong> {d.skills.cloudAndDevops.join(", ")}</p>}
                {d.skills.cybersecurity?.length > 0 && <p style={{ margin: "0 0 3pt 0" }}><strong>Cybersecurity:</strong> {d.skills.cybersecurity.join(", ")}</p>}
                {d.skills.embeddedSystems?.length > 0 && <p style={{ margin: "0 0 3pt 0" }}><strong>Embedded Systems:</strong> {d.skills.embeddedSystems.join(", ")}</p>}
                {d.skills.dataEngineering?.length > 0 && <p style={{ margin: "0 0 3pt 0" }}><strong>Data Engineering:</strong> {d.skills.dataEngineering.join(", ")}</p>}
                {d.skills.engineeringSoftware?.length > 0 && <p style={{ margin: "0 0 3pt 0" }}><strong>Engineering Software:</strong> {d.skills.engineeringSoftware.join(", ")}</p>}
                {d.skills.aiAndData?.length > 0 && <p style={{ margin: "0 0 3pt 0" }}><strong>Artificial Intelligence & Data:</strong> {d.skills.aiAndData.join(", ")}</p>}
                {(d.skills.csConcepts?.length > 0 || d.skills.concepts?.length > 0) && <p style={{ margin: "0" }}><strong>Core Concepts:</strong> {(d.skills.csConcepts?.length > 0 ? d.skills.csConcepts : d.skills.concepts).join(", ")}</p>}
              </div>
            </div>
          )}

          {/* Academic Projects */}
          {d.projects?.length > 0 && (
            <div style={{ marginBottom: "13pt" }}>
              <SectionTitle>Academic Projects</SectionTitle>
              {d.projects.map((proj: any, idx: number) => (
                <div key={idx} style={{ marginBottom: idx === d.projects.length - 1 ? 0 : "10pt" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "1pt" }}>
                    <div style={{ fontWeight: "bold", fontSize: "10pt", color: "#111", display: "flex", alignItems: "center", gap: "6px", flex: 1 }}>
                      {proj.title}
                      {proj.link && (
                        <a href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", fontSize: "8.5pt", color: "#666", fontWeight: "normal" }}>
                          [{proj.link.includes("github.com") ? "GitHub" : "Live Demo"}]
                        </a>
                      )}
                    </div>
                    {proj.duration && <span style={{ flexShrink: 0, whiteSpace: "nowrap", fontSize: "9.5pt", color: "#555", textAlign: "right", marginLeft: "10px" }}>{proj.duration}</span>}
                  </div>
                  <div style={{ fontSize: "9.5pt", color: "#555", fontStyle: "italic", marginTop: "1pt" }}>
                    {proj.techStack}
                  </div>
                  <ul style={{ listStyleType: "disc", paddingLeft: "14px", margin: "4pt 0 0 0", fontSize: "9.5pt" }}>
                    {proj.bullets?.map((b: string, bIdx: number) => (
                      <li key={bIdx} style={{ marginBottom: "2pt", lineHeight: 1.35 }}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Experience & Leadership */}
          {(d.experience?.length > 0 || d.positions?.length > 0) && (
            <div style={{ marginBottom: "13pt" }}>
              <SectionTitle>Experience & Leadership</SectionTitle>
              {d.experience?.map((exp: any, idx: number) => (
                <div key={idx} style={{ marginBottom: "7pt" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: "10pt" }}>
                    <div style={{ flex: 1 }}><strong>{exp.company}</strong><span style={{ color: "#555", marginLeft: "5pt", fontSize: "9.5pt" }}>— {exp.role}</span></div>
                    <span style={{ color: "#555", flexShrink: 0, fontSize: "9.5pt", textAlign: "right", marginLeft: "10px" }}>{exp.duration}</span>
                  </div>
                  <ul style={{ listStyleType: "disc", paddingLeft: "14px", margin: "3pt 0 0 0", fontSize: "9.5pt" }}>
                    {exp.bullets?.map((b: string, bIdx: number) => (
                      <li key={bIdx} style={{ marginBottom: "2pt", lineHeight: 1.35 }}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
              {d.positions?.map((pos: any, idx: number) => (
                <div key={idx} style={{ marginBottom: "5pt" }}>
                  <div style={{ fontSize: "10pt" }}><strong>{pos.title}</strong><span style={{ color: "#555", marginLeft: "5pt", fontSize: "9.5pt" }}>({pos.organization})</span></div>
                  <p style={{ fontSize: "9.5pt", margin: "2pt 0 0 14px", lineHeight: 1.35 }}>• {pos.bullet}</p>
                </div>
              ))}
            </div>
          )}

          {/* Key Achievements */}
          {d.achievements?.length > 0 && (
            <div style={{ marginBottom: "13pt" }}>
              <SectionTitle>Key Achievements</SectionTitle>
              <ul style={{ listStyleType: "disc", paddingLeft: "14px", margin: 0, fontSize: "9.5pt" }}>
                {d.achievements.map((ach: string, idx: number) => (
                  <li key={idx} style={{ marginBottom: "2pt", lineHeight: 1.35 }}>{ach}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Certifications */}
          {includeCertifications && ip?.skills?.certifications && (
            <div>
              <SectionTitle>Certifications</SectionTitle>
              <div style={{ fontSize: "9.5pt", lineHeight: 1.5 }}>{ip.skills.certifications}</div>
            </div>
          )}
        </div>

        {/* ── LOCK OVERLAY (only when locked) ── */}
        {locked && (
          <>
            {/* Clear zone at top — lets name + contact show through */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "110px",
              background: "linear-gradient(to bottom, white 50%, transparent 100%)",
              pointerEvents: "none", zIndex: 2,
            }} />
            {/* Bottom fade + lock card */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to bottom, transparent 10%, rgba(255,255,255,0.08) 35%, rgba(255,255,255,0.88) 60%, white 80%)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              zIndex: 3,
            }}>
              <div 
                className="cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.96)", backdropFilter: "blur(12px)",
                  border: "1px solid rgba(0,0,0,0.10)", borderRadius: "24px",
                  padding: "32px 48px", display: "flex", flexDirection: "column", alignItems: "center",
                  gap: "16px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", maxWidth: "380px", textAlign: "center",
              }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(67,122,34,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Lock size={28} color="#437a22" />
                </div>
                <span style={{ fontSize: "14pt", fontWeight: 700, color: "#1a1a1a", lineHeight: 1.3 }}>Unlock Full Resume Preview</span>
                <span style={{ fontSize: "10pt", color: "#666", lineHeight: 1.5 }}>Pay once to view, edit & download your complete ATS resume</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
