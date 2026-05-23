"use client";

import { Lock } from "lucide-react";

interface ResumePreviewPanelProps {
  resume: any;
  output: any;
  locked: boolean;
  formatLinkedIn?: (url: string) => string;
  formatGitHub?: (url: string) => string;
  formatPhone?: (phone: string) => string;
}

// Inline helpers so this component is self-contained
const _fmtLinkedIn = (url: string) => {
  if (!url) return "";
  let c = url.trim().replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/$/, "");
  return c.startsWith("linkedin.com") ? c : `linkedin.com/in/${c}`;
};
const _fmtGitHub = (url: string) => {
  if (!url) return "";
  let c = url.trim().replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/$/, "");
  return c.startsWith("github.com/") ? c : `github.com/${c}`;
};
const _fmtPhone = (phone: string) => {
  if (!phone) return "";
  const c = phone.trim().replace(/[-\s()]/g, "");
  if (c.length === 10 && /^\d+$/.test(c)) return `+91 ${c.slice(0, 5)} ${c.slice(5)}`;
  if (c.startsWith("91") && c.length === 12) return `+91 ${c.slice(2, 7)} ${c.slice(7)}`;
  return phone;
};

/** A scaled, paper-style resume HTML preview */
export default function ResumePreviewPanel({
  resume,
  output,
  locked,
}: ResumePreviewPanelProps) {
  const p = resume?.inputData?.personal || {};

  // Build flat "line groups" so we can decide which ones are clear vs blurred
  // The first 3 line-groups (header + education block) are always clear.
  const CLEAR_LINES = 3; // header name, contact row, divider = clear zone

  return (
    <div className="relative w-full h-full flex flex-col" style={{ minHeight: 0 }}>
      {/* Paper container */}
      <div
        className="relative flex-1 overflow-hidden rounded-xl border border-border/60 bg-white shadow-lg"
        style={{ minHeight: 0 }}
      >
        {/* Scaled resume content */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ transformOrigin: "top left" }}
        >
          {/* Inner scroll area — only in unlocked mode */}
          <div
            className={locked ? "overflow-hidden" : "overflow-y-auto h-full"}
            style={{ height: "100%" }}
          >
            {/* The actual resume markup, scaled down to fit the panel */}
            <div
              style={{
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: "7.8pt",
                lineHeight: 1.3,
                color: "#222",
                padding: "24px 28px",
                minWidth: "480px",
              }}
            >
              {/* ── NAME ── */}
              <div style={{ textAlign: "center", marginBottom: "10pt" }}>
                <div
                  style={{
                    fontSize: "15pt",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "-0.3px",
                    color: "#111",
                    marginBottom: "3pt",
                  }}
                >
                  {p.fullName || "Your Name"}
                </div>
                {/* Contact row */}
                <div
                  style={{
                    fontSize: "6.5pt",
                    color: "#444",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    flexWrap: "nowrap",
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.email && <span>{p.email}</span>}
                  {p.phone && (
                    <>
                      <span style={{ color: "#aaa" }}>|</span>
                      <span>{_fmtPhone(p.phone)}</span>
                    </>
                  )}
                  {p.linkedin && (
                    <>
                      <span style={{ color: "#aaa" }}>|</span>
                      <span>{_fmtLinkedIn(p.linkedin)}</span>
                    </>
                  )}
                  {p.github && (
                    <>
                      <span style={{ color: "#aaa" }}>|</span>
                      <span>{_fmtGitHub(p.github)}</span>
                    </>
                  )}
                </div>
              </div>

              {/* ── BLURRED BODY — everything below header ── */}
              <div style={{ position: "relative" }}>
                {/* The content (blurred or clear depending on lock state) */}
                <div style={locked ? { filter: "blur(3.5px)", userSelect: "none", pointerEvents: "none" } : {}}>
                  {/* Education */}
                  <PreviewSection title="Education">
                    {output?.education && (
                      <div style={{ marginBottom: "5pt" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "7.5pt", fontWeight: "bold" }}>
                          <span style={{ flex: 1 }}>{output.education.institution}</span>
                          <span style={{ color: "#555", fontWeight: "normal", flexShrink: 0 }}>Graduation: {output.education.year}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "7pt", color: "#444", marginTop: "1pt" }}>
                          <span style={{ flex: 1 }}>{output.education.degree} ({p.branch || "Engineering"})</span>
                          <span style={{ flexShrink: 0 }}>CGPA: {output.education.cgpa}</span>
                        </div>
                      </div>
                    )}
                  </PreviewSection>

                  {/* Technical Skills */}
                  {output?.skills && (
                    <PreviewSection title="Technical Skills">
                      {output.skills.languages?.length > 0 && (
                        <p style={{ margin: "0 0 2pt 0" }}>
                          <strong>Programming:</strong>{" "}
                          <span style={{ color: "#444" }}>{output.skills.languages.join(", ")}</span>
                        </p>
                      )}
                      {output.skills.frameworks?.length > 0 && (
                        <p style={{ margin: "0 0 2pt 0" }}>
                          <strong>Frameworks:</strong>{" "}
                          <span style={{ color: "#444" }}>{output.skills.frameworks.join(", ")}</span>
                        </p>
                      )}
                      {output.skills.databases?.length > 0 && (
                        <p style={{ margin: "0 0 2pt 0" }}>
                          <strong>Databases:</strong>{" "}
                          <span style={{ color: "#444" }}>{output.skills.databases.join(", ")}</span>
                        </p>
                      )}
                      {output.skills.tools?.length > 0 && (
                        <p style={{ margin: "0 0 2pt 0" }}>
                          <strong>Tools:</strong>{" "}
                          <span style={{ color: "#444" }}>{output.skills.tools.join(", ")}</span>
                        </p>
                      )}
                      {output.skills.softSkills?.length > 0 && (
                        <p style={{ margin: "0" }}>
                          <strong>Soft Skills:</strong>{" "}
                          <span style={{ color: "#444" }}>{output.skills.softSkills.join(", ")}</span>
                        </p>
                      )}
                    </PreviewSection>
                  )}

                  {/* Projects */}
                  {output?.projects?.length > 0 && (
                    <PreviewSection title="Academic Projects">
                      {output.projects.map((proj: any, idx: number) => (
                        <div key={idx} style={{ marginBottom: idx === output.projects.length - 1 ? 0 : "7pt" }}>
                          <div style={{ fontWeight: "bold", fontSize: "7.8pt", color: "#111" }}>{proj.title}</div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "7pt", color: "#666", marginTop: "1pt" }}>
                            <span style={{ fontStyle: "italic", flex: 1 }}>{proj.techStack}</span>
                            {proj.duration && <span style={{ flexShrink: 0, whiteSpace: "nowrap" }}>{proj.duration}</span>}
                          </div>
                          <ul style={{ listStyleType: "disc", paddingLeft: "12px", margin: "3pt 0 0 0" }}>
                            {proj.bullets.map((b: string, bIdx: number) => (
                              <li key={bIdx} style={{ marginBottom: "1pt", lineHeight: 1.3 }}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </PreviewSection>
                  )}

                  {/* Experience */}
                  {output?.experience?.length > 0 && (
                    <PreviewSection title="Experience & Leadership">
                      {output.experience.map((exp: any, idx: number) => (
                        <div key={idx} style={{ marginBottom: "5pt" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "7.5pt" }}>
                            <div style={{ flex: 1 }}>
                              <strong>{exp.company}</strong>
                              <span style={{ color: "#555", marginLeft: "4pt" }}>— {exp.role}</span>
                            </div>
                            <span style={{ color: "#777", flexShrink: 0, fontSize: "7pt" }}>{exp.duration}</span>
                          </div>
                          <ul style={{ listStyleType: "disc", paddingLeft: "12px", margin: "2pt 0 0 0" }}>
                            {exp.bullets.map((b: string, bIdx: number) => (
                              <li key={bIdx} style={{ marginBottom: "1pt", lineHeight: 1.3 }}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </PreviewSection>
                  )}

                  {/* Achievements */}
                  {output?.achievements?.length > 0 && (
                    <PreviewSection title="Key Achievements">
                      <ul style={{ listStyleType: "disc", paddingLeft: "12px", margin: 0 }}>
                        {output.achievements.map((ach: string, idx: number) => (
                          <li key={idx} style={{ marginBottom: "1pt", lineHeight: 1.3 }}>{ach}</li>
                        ))}
                      </ul>
                    </PreviewSection>
                  )}
                </div>

                {/* Lock gradient + icon overlay — only when locked */}
                {locked && (
                  <>
                    {/* Top fade — first ~35px stays readable, then fades into blur */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "72px",
                        background: "linear-gradient(to bottom, white 0%, white 30%, transparent 100%)",
                        pointerEvents: "none",
                        zIndex: 2,
                      }}
                    />
                    {/* Bottom full lock overlay */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.15) 38%, rgba(255,255,255,0.92) 62%, white 100%)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        paddingBottom: "24px",
                        zIndex: 3,
                      }}
                    >
                      <div
                        style={{
                          background: "rgba(255,255,255,0.92)",
                          backdropFilter: "blur(8px)",
                          border: "1px solid rgba(0,0,0,0.1)",
                          borderRadius: "14px",
                          padding: "14px 20px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "6px",
                          boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
                          maxWidth: "200px",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: "rgba(67,122,34,0.12)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Lock size={15} color="#437a22" />
                        </div>
                        <span style={{ fontSize: "7pt", fontWeight: 700, color: "#222", lineHeight: 1.3 }}>
                          Unlock Full Resume Preview
                        </span>
                        <span style={{ fontSize: "6pt", color: "#888", lineHeight: 1.4 }}>
                          Pay once to see & download your complete ATS resume
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Mini section block reused inside the preview */
function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "9pt" }}>
      <div
        style={{
          fontSize: "8.5pt",
          fontWeight: "bold",
          textTransform: "uppercase",
          color: "#1a1a1a",
          letterSpacing: "0.3px",
          marginBottom: "2pt",
        }}
      >
        {title}
      </div>
      <div style={{ height: "0.5px", backgroundColor: "#ccc", marginBottom: "4pt" }} />
      <div style={{ fontSize: "7pt", color: "#333" }}>{children}</div>
    </div>
  );
}
