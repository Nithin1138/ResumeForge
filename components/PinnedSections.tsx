"use client";

import React, { useState, useEffect } from "react";
import { motion, Reorder } from "framer-motion";
import { 
  Pin, 
  User, 
  Code, 
  GraduationCap, 
  Sparkles, 
  Award, 
  FileText, 
  Briefcase, 
  Tag, 
  Copy, 
  Check, 
  ExternalLink,
  MapPin,
  Mail,
  Phone,
  Clock,
  Globe,
  GripVertical
} from "lucide-react";

interface PinnedCardItem {
  id: string;
  index: number;
  item: any;
}

interface PinnedSectionsProps {
  profile: any;
}

export default function PinnedSections({ profile }: PinnedSectionsProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  let initialPinned: string[] = [];
  try {
    initialPinned = JSON.parse(profile?.pinnedSectionsJson || "[]");
  } catch {}

  const [pinnedIds, setPinnedIds] = useState<string[]>(initialPinned);

  useEffect(() => {
    try {
      const updated = JSON.parse(profile?.pinnedSectionsJson || "[]");
      setPinnedIds(Array.isArray(updated) ? updated : []);
    } catch {}
  }, [profile?.pinnedSectionsJson]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newOrder = [...expandedPinnedIds];
    const [movedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, movedItem);

    setDraggedIndex(null);
    setDragOverIndex(null);
    savePinnedOrder(newOrder);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (!profile) return null;

  const savePinnedOrder = async (newOrder: string[]) => {
    setPinnedIds(newOrder);
    try {
      await fetch("/api/user/my-space", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: profile.fullName,
          email: profile.email,
          collegeEmail: profile.collegeEmail,
          dateOfBirth: profile.dateOfBirth,
          phone: profile.phone,
          location: profile.location,
          github: profile.github,
          linkedin: profile.linkedin,
          portfolio: profile.portfolio,
          noticePeriod: profile.noticePeriod,
          leetcode: profile.leetcode,
          codeforces: profile.codeforces,
          codechef: profile.codechef,
          hackerrank: profile.hackerrank,
          gfg: profile.gfg,
          codingProfilesJson: profile.codingProfilesJson,
          college: profile.college,
          branch: profile.branch,
          cgpa: profile.cgpa,
          graduationYear: profile.graduationYear,
          educationJson: profile.educationJson,
          summary: profile.summary,
          skillsJson: profile.skillsJson,
          projectsJson: profile.projectsJson,
          experiencesJson: profile.experiencesJson,
          certificationsJson: profile.certificationsJson,
          achievementsJson: profile.achievementsJson,
          customFieldsJson: profile.customFieldsJson,
          pinnedSectionsJson: JSON.stringify(newOrder),
          customNotes: profile.customNotes,
        }),
      });
    } catch (err) {
      console.error("Failed to save pinned order:", err);
    }
  };

  const handleUnpin = (idToUnpin: string) => {
    const updated = pinnedIds.filter(id => id !== idToUnpin);
    savePinnedOrder(updated);
  };

  const copyToClipboard = (text: string, keyName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const openLink = (url: string) => {
    if (!url) return;
    let targetUrl = url;
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = `https://${targetUrl}`;
    }
    window.open(targetUrl, "_blank");
  };

  // Parsers
  let codingProfiles: any[] = [];
  let educationList: any[] = [];
  let skills: string[] = [];
  let certifications: any[] = [];
  let achievements: string[] = [];
  let projects: any[] = [];
  let experiences: any[] = [];
  let customFields: any[] = [];

  try { codingProfiles = JSON.parse(profile.codingProfilesJson || "[]"); } catch {}
  try { educationList = JSON.parse(profile.educationJson || "[]"); } catch {}
  try { skills = JSON.parse(profile.skillsJson || "[]"); } catch {}
  try { certifications = JSON.parse(profile.certificationsJson || "[]"); } catch {}
  try { achievements = JSON.parse(profile.achievementsJson || "[]"); } catch {}
  try { projects = JSON.parse(profile.projectsJson || "[]"); } catch {}
  try { experiences = JSON.parse(profile.experiencesJson || "[]"); } catch {}
  try { 
    const rawCF = JSON.parse(profile.customFieldsJson || "[]");
    if (Array.isArray(rawCF)) {
      customFields = rawCF.map((item: any, idx: number) => ({
        id: item.id ? item.id.toString() : idx.toString(),
        key: item.key || item.name || "Custom Detail",
        value: item.value || item.val || "",
        ...(item.link ? { link: item.link } : {})
      }));
    }
  } catch {}

  const getSectionContent = (id: string) => {
    if (id === "personal") {
      return {
        title: "Personal & Contact Details",
        icon: User,
        color: "text-primary bg-primary/10 border-primary/20",
        content: (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { label: "Full Name", value: profile.fullName, icon: User },
              { label: "Email Address", value: profile.email, icon: Mail },
              { label: "College Email", value: profile.collegeEmail, icon: Mail },
              { label: "Phone Number", value: profile.phone, icon: Phone },
              { label: "Date of Birth", value: profile.dateOfBirth, icon: Clock },
              { label: "Location", value: profile.location, icon: MapPin },
              { label: "GitHub Profile", value: profile.github, icon: Globe, isLink: true },
              { label: "LinkedIn Profile", value: profile.linkedin, icon: ExternalLink, isLink: true },
              { label: "Notice Period", value: profile.noticePeriod, icon: Clock }
            ].filter(item => item.value).map((item, idx) => (
              <div 
                key={idx}
                onClick={() => copyToClipboard(item.value, `personal-${item.label}`)}
                className="p-2.5 rounded-xl border border-border/50 bg-bg-base/40 hover:border-primary/30 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <item.icon className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">{item.label}</span>
                    <span className="text-xs font-bold text-text truncate block">{item.value}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 shrink-0 pl-1">
                  {item.isLink && (
                    <button
                      onClick={(e) => { e.stopPropagation(); openLink(item.value); }}
                      className="p-1 rounded hover:bg-primary/10 text-text-muted hover:text-primary transition-all cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                  {copiedKey === `personal-${item.label}` ? (
                    <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-all shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      };
    }

    if (id === "coding") {
      return {
        title: "Coding Profiles",
        icon: Code,
        color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        content: (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {codingProfiles.filter(p => p.username).map((p, idx) => (
              <div 
                key={idx}
                onClick={() => copyToClipboard(p.username, `coding-${p.platform}`)}
                className="p-2.5 rounded-xl border border-border/50 bg-bg-base/40 hover:border-amber-500/30 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <span className="text-[9px] text-amber-600 font-bold uppercase tracking-wider block">{p.platform}</span>
                  <span className="text-xs font-bold text-text truncate block">{p.username}</span>
                  {(p.rating || p.solvedCount) && (
                    <span className="text-[9px] text-text-muted mt-0.5 block">
                      {p.rating ? `Rating: ${p.rating}` : ""}{p.rating && p.solvedCount ? " · " : ""}{p.solvedCount ? `Solved: ${p.solvedCount}` : ""}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1 shrink-0">
                  {p.url && (
                    <button
                      onClick={(e) => { e.stopPropagation(); openLink(p.url); }}
                      className="p-1 rounded hover:bg-amber-500/15 text-text-muted hover:text-amber-600 transition-all cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                  {copiedKey === `coding-${p.platform}` ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-text-muted group-hover:text-amber-500 transition-all" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      };
    }

    if (id === "academic") {
      return {
        title: "Academic History",
        icon: GraduationCap,
        color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        content: (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {educationList.filter(e => e.institution).map((e, idx) => (
              <div 
                key={idx}
                onClick={() => copyToClipboard(`${e.institution} - CGPA/Score: ${e.cgpaOrPercentage}`, `academic-${e.type}`)}
                className="p-2.5 rounded-xl border border-border/50 bg-bg-base/40 hover:border-blue-500/30 transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div className="flex justify-between items-center border-b border-border/20 pb-1.5 mb-1.5">
                  <span className="text-[9px] text-blue-600 font-bold uppercase tracking-wider">{e.type} Education</span>
                  {copiedKey === `academic-${e.type}` ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-text-muted group-hover:text-blue-500 transition-all" />
                  )}
                </div>
                <h4 className="text-xs font-bold text-text truncate">{e.institution}</h4>
                <p className="text-[10px] text-text-muted font-medium mt-0.5 truncate">
                  {e.degree}{e.branch ? ` · ${e.branch}` : ""}
                </p>
                <div className="flex justify-between items-center mt-1.5 text-[9px] text-text-muted font-bold">
                  <span>Score: {e.cgpaOrPercentage}</span>
                  <span>Grad: {e.graduationYear}</span>
                </div>
              </div>
            ))}
          </div>
        )
      };
    }

    if (id === "skills") {
      return {
        title: "Technical Skills",
        icon: Sparkles,
        color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
        content: (
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill, idx) => (
              <span
                key={idx}
                onClick={() => copyToClipboard(skill, `skill-${skill}`)}
                className="px-2.5 py-1 rounded-lg bg-bg-base/60 border border-border/60 text-text text-[11px] font-bold cursor-pointer hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all flex items-center space-x-1"
              >
                <span>{skill}</span>
                {copiedKey === `skill-${skill}` ? (
                  <Check className="w-2.5 h-2.5 text-emerald-500" />
                ) : (
                  <Copy className="w-2.5 h-2.5 text-text-muted" />
                )}
              </span>
            ))}
          </div>
        )
      };
    }

    if (id === "certifications") {
      return {
        title: "Certifications & Credentials",
        icon: Award,
        color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        content: (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {certifications.map((c, idx) => (
              <div 
                key={idx}
                onClick={() => copyToClipboard(c.name, `cert-${idx}`)}
                className="p-2.5 rounded-xl border border-border/50 bg-bg-base/40 hover:border-emerald-500/30 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <span className="text-xs font-bold text-text truncate block">{c.name}</span>
                  {c.year && <span className="text-[9px] text-text-muted mt-0.5 block">Issued: {c.year}</span>}
                </div>
                <div className="shrink-0 flex items-center space-x-1">
                  {copiedKey === `cert-${idx}` ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-text-muted group-hover:text-emerald-500 transition-all" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      };
    }

    if (id === "achievements") {
      return {
        title: "Achievements & Accomplishments",
        icon: Sparkles,
        color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
        content: (
          <div className="space-y-2">
            {achievements.map((ach, idx) => (
              <div 
                key={idx}
                onClick={() => copyToClipboard(ach, `ach-${idx}`)}
                className="p-2.5 rounded-xl border border-border/50 bg-bg-base/40 hover:border-purple-500/30 transition-all flex items-center justify-between cursor-pointer group"
              >
                <p className="text-xs font-medium text-text leading-relaxed flex-1 pr-3">{ach}</p>
                {copiedKey === `ach-${idx}` ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-text-muted group-hover:text-purple-500 transition-all shrink-0" />
                )}
              </div>
            ))}
          </div>
        )
      };
    }

    if (id === "projects") {
      return {
        title: "Engineering Projects",
        icon: Briefcase,
        color: "text-sky-500 bg-sky-500/10 border-sky-500/20",
        content: (
          <div className="space-y-3">
            {projects.map((proj, idx) => (
              <div 
                key={idx}
                className="p-3 border border-border/50 rounded-xl bg-bg-base/30 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-text">{proj.title}</h4>
                    <p className="text-[10px] text-text-muted font-semibold mt-0.5">Tech Stack: {proj.techStack}</p>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {proj.githubLink && (
                      <button 
                        onClick={() => openLink(proj.githubLink)}
                        className="p-1 rounded bg-bg-base border border-border text-[9px] font-bold text-primary flex items-center gap-1 cursor-pointer"
                      >
                        <Globe className="w-3 h-3" />
                        <span>Code</span>
                      </button>
                    )}
                    {proj.hostLink && (
                      <button 
                        onClick={() => openLink(proj.hostLink)}
                        className="p-1 rounded bg-bg-base border border-border text-[9px] font-bold text-emerald-600 flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Live</span>
                      </button>
                    )}
                    <button
                      onClick={() => copyToClipboard(`${proj.title}: ${proj.description}`, `proj-${idx}`)}
                      className="p-1 rounded hover:bg-sky-500/10 text-text-muted hover:text-sky-600 transition-all cursor-pointer"
                    >
                      {copiedKey === `proj-${idx}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed font-semibold">{proj.description}</p>
              </div>
            ))}
          </div>
        )
      };
    }

    if (id === "experience") {
      return {
        title: "Work Experience & Internships",
        icon: Briefcase,
        color: "text-teal-500 bg-teal-500/10 border-teal-500/20",
        content: (
          <div className="space-y-3">
            {experiences.map((exp, idx) => (
              <div 
                key={idx}
                className="p-3 border border-border/50 rounded-xl bg-bg-base/30 space-y-2"
              >
                <div className="flex justify-between items-start border-b border-border/20 pb-1.5">
                  <div>
                    <h4 className="text-xs font-bold text-text">{exp.role}</h4>
                    <p className="text-[10px] text-text-muted font-bold mt-0.5">{exp.company} · {exp.duration}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(`${exp.role} at ${exp.company} (${exp.duration}): ${exp.description}`, `exp-${idx}`)}
                    className="p-1 rounded hover:bg-teal-500/10 text-text-muted hover:text-teal-600 transition-all cursor-pointer"
                  >
                    {copiedKey === `exp-${idx}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed font-semibold">{exp.description}</p>
              </div>
            ))}
          </div>
        )
      };
    }

    // Individual Custom Field Card: custom-field-${id}
    if (id.startsWith("custom-field-")) {
      const fieldId = id.replace("custom-field-", "");
      let cf = customFields.find((f, idx) => 
        f.id === fieldId || 
        f.id?.toString() === fieldId || 
        idx.toString() === fieldId ||
        (f.key && f.key.toLowerCase() === fieldId.toLowerCase()) ||
        (f.key && `key-${f.key.toLowerCase().replace(/\s+/g, "_")}` === fieldId)
      );

      if (!cf && (fieldId === "undefined" || fieldId === "") && customFields.length > 0) {
        cf = customFields[0];
      }

      if (!cf) return null;

      const hasLink = cf.link || cf.value?.startsWith("http://") || cf.value?.startsWith("https://") || cf.value?.includes("github.com") || cf.value?.includes("linkedin.com");

      return {
        title: cf.key || "Custom Detail",
        icon: Tag,
        color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
        content: (
          <div 
            onClick={() => copyToClipboard(cf.value, `custom-${cf.key}`)}
            className="p-3.5 rounded-xl border border-border/60 bg-bg-base/40 hover:border-rose-500/40 transition-all flex items-center justify-between cursor-pointer group"
          >
            <div className="min-w-0 flex-1 pr-3">
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">{cf.key}</span>
              <span className="text-sm font-bold text-text truncate block mt-0.5">{cf.value}</span>
            </div>
            <div className="flex items-center space-x-1.5 shrink-0">
              {hasLink && (
                <button
                  onClick={(e) => { e.stopPropagation(); openLink(cf.link || cf.value); }}
                  className="p-1.5 rounded-lg hover:bg-rose-500/15 text-text-muted hover:text-rose-600 transition-all cursor-pointer"
                  title="Open Link"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
              {copiedKey === `custom-${cf.key}` ? (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-md">
                  Copied
                </span>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); copyToClipboard(cf.value, `custom-${cf.key}`); }}
                  className="p-1.5 rounded-lg hover:bg-rose-500/15 text-text-muted hover:text-rose-600 transition-all cursor-pointer"
                  title="Copy Custom Value"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )
      };
    }

    // Section Custom fallback (if user pinned the whole custom section previously)
    if (id === "custom") {
      return {
        title: "Custom Information Vault",
        icon: Tag,
        color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
        content: (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {customFields.map((cf, idx) => (
              <div 
                key={idx}
                onClick={() => copyToClipboard(cf.value, `custom-${cf.key}`)}
                className="p-2.5 rounded-xl border border-border/50 bg-bg-base/40 hover:border-rose-500/30 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <span className="text-[9px] text-rose-500 font-bold uppercase tracking-wider block">{cf.key}</span>
                  <span className="text-xs font-bold text-text truncate block">{cf.value}</span>
                </div>
                <div className="flex items-center space-x-1 shrink-0">
                  {(cf.link || cf.value?.startsWith("http://") || cf.value?.startsWith("https://") || cf.value?.includes("github.com") || cf.value?.includes("linkedin.com")) && (
                    <button
                      onClick={(e) => { e.stopPropagation(); openLink(cf.link || cf.value); }}
                      className="p-1 rounded hover:bg-rose-500/15 text-text-muted hover:text-rose-600 transition-all cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                  {copiedKey === `custom-${cf.key}` ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-text-muted group-hover:text-rose-500 transition-all" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      };
    }

    return null;
  };

  // Expand "custom" to individual custom field IDs if stored as generic "custom"
  let expandedPinnedIds: string[] = [];
  pinnedIds.forEach(id => {
    if (id === "custom") {
      customFields.forEach(cf => {
        const itemKey = `custom-field-${cf.id}`;
        if (!expandedPinnedIds.includes(itemKey)) {
          expandedPinnedIds.push(itemKey);
        }
      });
    } else {
      if (!expandedPinnedIds.includes(id)) {
        expandedPinnedIds.push(id);
      }
    }
  });

  // Separate valid pinned cards into Custom Cards vs Normal Section Card
  const customItems: PinnedCardItem[] = [];
  const sectionCards: PinnedCardItem[] = [];

  expandedPinnedIds.forEach((id, index) => {
    const item = getSectionContent(id);
    if (!item) return;

    if (id.startsWith("custom-field-") || id === "custom") {
      if (customItems.length < 2) {
        customItems.push({ id, index, item });
      }
    } else {
      if (sectionCards.length < 1) {
        sectionCards.push({ id, index, item });
      }
    }
  });

  const sectionCardItem = sectionCards.length > 0 ? sectionCards[0] : null;
  const totalCardsCount = customItems.length + (sectionCardItem ? 1 : 0);

  if (totalCardsCount === 0) {
    return (
      <div className="border-t border-border/30 pt-4 mt-2">
        <div className="p-4 rounded-2xl bg-bg-base/40 border border-dashed border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
              <Pin className="w-4 h-4 fill-amber-500" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-text">No Cards Pinned Yet</h4>
              <p className="text-[11px] text-text-muted font-medium">Pin profile details or custom fields in My Space to keep them handy on your dashboard.</p>
            </div>
          </div>
          <a
            href="/my-space"
            className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer shrink-0"
          >
            Pin Cards in My Space
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-border/30 pt-4 mt-4 space-y-3">
      <div className="flex items-center justify-between pb-0.5">
        <div className="flex items-center space-x-2">
          <Pin className="w-4 h-4 text-amber-500 fill-amber-500" />
          <h3 className="text-xs font-bold text-text-muted tracking-wider uppercase">
            Pinned Vault Cards ({totalCardsCount})
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        {/* LEFT COLUMN: Up to 2 Custom Detail Cards (Combined Height = Right Section Card Height) */}
        <div className="flex flex-col gap-3.5 justify-between h-full">
          {customItems.map(({ id, item }) => {
            const SecIcon = item.icon;

            return (
              <div 
                key={id} 
                className="bg-surface border border-border/80 rounded-2xl p-4 space-y-2.5 shadow-xs relative hover:shadow-md hover:border-border transition-all flex-1 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between border-b border-border/30 pb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-lg border ${item.color}`}>
                      <SecIcon className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="font-serif font-bold text-sm text-text">{item.title}</h4>
                  </div>

                  <button
                    onClick={() => handleUnpin(id)}
                    className="p-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 transition-all cursor-pointer"
                    title="Unpin Card"
                  >
                    <Pin className="w-3.5 h-3.5 fill-amber-500 hover:fill-none" />
                  </button>
                </div>

                <div className="flex-1 flex flex-col justify-center my-auto">
                  {item.content}
                </div>
              </div>
            );
          })}

          {customItems.length === 0 && (
            <div className="border border-dashed border-border/60 rounded-2xl p-4 text-center text-text-muted text-xs flex flex-col items-center justify-center space-y-1 h-full min-h-[160px]">
              <Tag className="w-4 h-4 text-text-muted/60 mb-0.5" />
              <p className="font-bold text-text-muted">No Custom Card Pinned</p>
              <p className="text-[11px]">Pin up to 2 custom detail cards in My Space</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: 1 Big Profile Section Card */}
        <div className="flex flex-col h-full">
          {sectionCardItem ? (
            <div 
              key={sectionCardItem.id} 
              className="bg-surface border border-border/80 rounded-2xl p-4 md:p-5 space-y-4 relative shadow-xs hover:shadow-md hover:border-border transition-all h-full flex flex-col justify-between"
            >
              <div className="flex items-center justify-between border-b border-border/30 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className={`p-2 rounded-xl border ${sectionCardItem.item.color}`}>
                    {React.createElement(sectionCardItem.item.icon as React.ElementType, { className: "w-4 h-4" })}
                  </div>
                  <h4 className="font-serif font-bold text-[15px] text-text">{sectionCardItem.item.title}</h4>
                </div>

                <button
                  onClick={() => handleUnpin(sectionCardItem.id)}
                  className="p-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 transition-all cursor-pointer"
                  title="Unpin Card"
                >
                  <Pin className="w-3.5 h-3.5 fill-amber-500 hover:fill-none" />
                </button>
              </div>

              <div className="flex-1">
                {sectionCardItem.item.content}
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-border/60 rounded-2xl p-6 text-center text-text-muted text-xs flex flex-col items-center justify-center space-y-1 h-full min-h-[220px]">
              <User className="w-5 h-5 text-text-muted/60 mb-1" />
              <p className="font-bold text-text-muted">No Section Card Pinned</p>
              <p className="text-[11px]">Pin a profile section (e.g. Personal Details) in My Space</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
