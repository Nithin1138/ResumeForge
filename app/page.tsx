"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle, Flame, ShieldCheck, Sparkles, ChevronDown, Award, XCircle, Eye, TrendingUp } from "lucide-react";
import { getSession } from "next-auth/react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 90,
      damping: 14,
    },
  },
};

const textVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.215, 0.610, 0.355, 1.000] as const,
    },
  },
};

const quoteVariants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.215, 0.610, 0.355, 1.000] as const,
    },
  },
};

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [session, setSession] = useState<any>(null);
  const [price, setPrice] = useState(49);
  const [bannerText, setBannerText] = useState("🚀 Placement Season Hack: Get 20% off unlocked copyable resume formats today only!");
  const [isBannerActive, setIsBannerActive] = useState(true);
  const [landingVariant, setLandingVariant] = useState<"minimal" | "dashboard">("minimal");
  
  // Interactive Variant B (Dashboard) States
  const [bActiveTab, setBActiveTab] = useState<"details" | "projects" | "skills">("projects");
  const [bQuantified, setBQuantified] = useState(true);
  const [bKeywords, setBKeywords] = useState(true);
  const [bNoCanva, setBNoCanva] = useState(true);

  useEffect(() => {
    getSession().then(setSession);
    
    // Fetch active config dynamically from database
    fetch("/api/config")
      .then(res => res.json())
      .then(data => {
        if (data.activePrice) setPrice(data.activePrice);
        if (data.bannerText) setBannerText(data.bannerText);
        if (data.isBannerActive !== undefined) setIsBannerActive(data.isBannerActive);
        if (data.landingVariant) setLandingVariant(data.landingVariant);
      }).catch(err => console.error("Failed to load config", err));
  }, []);

  const faqs = [
    {
      q: "Is this a full resume template?",
      a: "No. We generate the written content (summary, bullets, skills, formatting strings). You paste it into standard Word, Google Docs, or Overleaf templates. This ensures 100% compliance with ATS parsers that choke on visual Canva designs."
    },
    {
      q: "Will it work for non-CS branches?",
      a: "Yes! The AI has been trained on engineering domains spanning CSE, ECE, EEE, Mechanical, Civil, Chemical, and more. It aligns technical course projects and core engineering concepts perfectly to recruiter keywords."
    },
    {
      q: "What if I have no internships?",
      a: "No problem at all. Most Indian engineering students apply for their first internships using this tool. We emphasize your academic projects, course laboratory work, and technical skills to make you stand out."
    },
    {
      q: `Is ₹${price} a subscription?`,
      a: `No. It is a one-time payment of ₹${price} per resume generation. No recurring monthly fees, no hidden cards, and no unexpected charges.`
    },
    {
      q: "Can I regenerate after paying?",
      a: "Yes! Your payment unlocks the resume, including 3 free regenerations. You can adjust the tone (e.g. make it more technical) or paste a specific Job Description to align keywords."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-bg-base text-text selection:bg-primary/20 font-sans">
      {isBannerActive && (
        <div className="w-full bg-primary/10 border-b border-primary/20 text-primary text-center py-2 px-4 text-xs font-bold font-sans flex items-center justify-center gap-2 relative z-50">
          <span>{bannerText}</span>
        </div>
      )}
      {/* Premium Navbar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-border/40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="ATSLift Logo" className="w-8 h-8 rounded-md object-contain logo-rotated" />
          <span className="font-bold text-lg tracking-tight font-sans text-text">
            ATS<span className="text-primary font-medium font-serif italic">Lift</span>
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link href="/ats-check" className="text-xs font-bold text-text-muted hover:text-primary transition-colors hidden sm:block">
            ATS Check
          </Link>
          {session ? (
            <Link href="/dashboard" className="text-xs font-bold text-primary hover:underline">
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className="text-xs font-bold text-text-muted hover:text-text transition-colors">
              Log In
            </Link>
          )}
          <Link
            href="/build"
            className="px-4 py-2 md:px-5 md:py-2 bg-primary hover:bg-primary/95 text-white text-xs md:text-sm font-medium rounded-full transition-all duration-300 shadow-sm hover:shadow-md flex items-center space-x-1"
          >
            <span>Start Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {landingVariant === "dashboard" ? (
        <div className="flex-1 w-full bg-[#080b0c] text-[#eae9e5] min-h-screen py-12 flex flex-col gap-16 relative overflow-hidden font-sans">
          {/* Futuristic ambient background glows */}
          <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/3 right-10 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-2/3 left-10 w-[250px] h-[250px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

          {/* ── SECTION 1: PREMIUM HERO & DESTRUCTURING HEADLINE ── */}
          <div className="text-center space-y-5 max-w-4xl mx-auto pt-8 md:pt-14 relative z-10 px-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-[10px] font-black tracking-widest text-[#00e1ec] shadow-[0_0_15px_rgba(0,225,236,0.1)] uppercase">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#00e1ec]" />
              <span>SDE Placement Intelligence Workbench</span>
            </div>
            <h1 className="text-3xl md:text-6xl font-serif tracking-tight text-white leading-tight font-light">
              Beat Campus Shortlisting. <br />
              <span className="text-primary italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#00e1ec]">Optimize SDE Signal</span> Instantly.
            </h1>
            <p className="text-sm md:text-base text-[#9f9d98] leading-relaxed max-w-2xl mx-auto font-medium">
              See how our custom engineering-trained parser refactors basic student projects into high-density, quantified SDE bullet points that bypass standard screening systems.
            </p>
          </div>

          {/* ── SECTION 2: INTERACTIVE ATS WORKSPACE SIMULATOR ── */}
          <div className="max-w-6xl mx-auto w-full px-4 md:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-[#111618]/90 border border-primary/20 rounded-3xl p-4 md:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
              
              {/* Left Column: Mock Workbench inputs (5 cols) */}
              <div className="lg:col-span-5 bg-[#0a0d0e]/60 border border-[#20292b] rounded-2xl p-5 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#20292b] pb-3 flex-wrap gap-2">
                    <span className="text-[10px] font-black text-[#00e1ec] tracking-widest uppercase">Student Workbench</span>
                    <div className="flex gap-1.5 text-[9px] font-bold uppercase tracking-wider">
                      {["details", "projects", "skills"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setBActiveTab(tab as any)}
                          className={`px-2.5 py-1.5 rounded-md border transition-all cursor-pointer ${
                            bActiveTab === tab
                              ? "bg-primary text-white border-primary shadow-[0_0_10px_rgba(1,105,111,0.4)]"
                              : "bg-[#111618] border-[#20292b] text-[#9f9d98] hover:border-primary/50"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tab content 1: Details */}
                  {bActiveTab === "details" && (
                    <div className="space-y-3.5 text-left animate-fadeIn">
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-extrabold text-[#7a7974] uppercase">Target SDE Role</span>
                        <div className="w-full h-9 px-3 rounded-lg border border-[#20292b] bg-[#111618] text-xs font-semibold text-[#eae9e5] flex items-center">
                          Software Development Engineer
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-extrabold text-[#7a7974] uppercase">Core Engineering Branch</span>
                        <div className="w-full h-9 px-3 rounded-lg border border-[#20292b] bg-[#111618] text-xs font-semibold text-[#eae9e5] flex items-center">
                          Computer Science & Engineering (CSE)
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-extrabold text-[#7a7974] uppercase">CGPA / 10.0</span>
                        <div className="w-full h-9 px-3 rounded-lg border border-[#20292b] bg-[#111618] text-xs font-semibold text-[#eae9e5] flex items-center font-mono">
                          8.32
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab content 2: Projects */}
                  {bActiveTab === "projects" && (
                    <div className="space-y-3.5 text-left animate-fadeIn">
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-extrabold text-[#7a7974] uppercase">Academic Project Title</span>
                        <div className="w-full h-9 px-3 rounded-lg border border-[#20292b] bg-[#111618] text-xs font-semibold text-[#eae9e5] flex items-center">
                          AI Customer Support Agent
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-extrabold text-[#7a7974] uppercase">Your Project Description (What you built)</span>
                        <textarea
                          readOnly
                          value="I created a chatbot using OpenAI API and Python. I set up a server in FastAPI to run queries. It helps answer standard customer support questions fast."
                          className="w-full h-20 p-3 rounded-lg border border-[#20292b] bg-[#111618] text-xs font-medium text-[#9f9d98] outline-hidden resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  )}

                  {/* Tab content 3: Skills */}
                  {bActiveTab === "skills" && (
                    <div className="space-y-3.5 text-left animate-fadeIn">
                      <div className="space-y-2">
                        <span className="text-[9px] font-extrabold text-[#7a7974] uppercase block">Core Programming languages</span>
                        <div className="flex flex-wrap gap-1.5">
                          {["Python", "TypeScript", "C++", "SQL"].map((l) => (
                            <span key={l} className="px-2 py-1 bg-[#111618] border border-[#20292b] rounded text-[10px] font-semibold text-[#eae9e5]">
                              {l}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[9px] font-extrabold text-[#7a7974] uppercase block">Frameworks & Tools</span>
                        <div className="flex flex-wrap gap-1.5">
                          {["FastAPI", "React.js", "Docker", "LangChain", "Git"].map((f) => (
                            <span key={f} className="px-2 py-1 bg-[#111618] border border-[#20292b] rounded text-[10px] font-semibold text-[#eae9e5]">
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Workbench foot actions */}
                <div className="border-t border-[#20292b] pt-4 text-left">
                  <span className="text-[9px] font-black text-[#7a7974] uppercase tracking-wider block mb-2">Workspace Controls</span>
                  <Link
                    href="/build"
                    className="w-full h-11 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>Build Your Resume Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Live ATS scorecard & grader (7 cols) */}
              <div className="lg:col-span-7 border border-[#20292b] bg-[#0a0d0e]/60 rounded-2xl p-5 flex flex-col justify-between space-y-6 relative overflow-hidden">
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-[#20292b] pb-3">
                    <div className="text-left">
                      <span className="text-[9px] font-extrabold text-success tracking-widest uppercase block">Live ATS Restructuring Preview</span>
                      <h3 className="text-sm font-bold text-white">AI Placement Scorecard</h3>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#00e1ec] bg-[#00e1ec]/10 border border-[#00e1ec]/30 px-2.5 py-1 rounded-full uppercase">
                      <Sparkles className="w-3 h-3 animate-spin" /> Interactive Demo
                    </span>
                  </div>

                  {/* Circle and Stats row */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 justify-between bg-[#111618]/70 border border-[#20292b] rounded-xl p-4">
                    {/* Circle */}
                    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" strokeWidth="5" stroke="#1d2527" fill="transparent" />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          strokeWidth="6"
                          stroke={
                            (48 + (bQuantified ? 15 : 0) + (bKeywords ? 16 : 0) + (bNoCanva ? 20 : 0)) >= 85
                              ? "#10b981"
                              : "#f59e0b"
                          }
                          fill="transparent"
                          strokeDasharray="251.2"
                          strokeDashoffset={251.2 - (251.2 * (48 + (bQuantified ? 15 : 0) + (bKeywords ? 16 : 0) + (bNoCanva ? 20 : 0))) / 100}
                          className="transition-all duration-500 ease-out"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-xl font-black font-mono leading-none text-white">
                          {48 + (bQuantified ? 15 : 0) + (bKeywords ? 16 : 0) + (bNoCanva ? 20 : 0)}
                        </span>
                        <span className="text-[7.5px] font-bold text-[#9f9d98] uppercase tracking-wider mt-0.5">ATS Score</span>
                      </div>
                    </div>

                    {/* Optimization checklist interactive toggles */}
                    <div className="space-y-2 text-left flex-1">
                      <span className="text-[8.5px] font-black text-[#7a7974] uppercase tracking-widest block">Interactive Enhancements</span>
                      <div className="space-y-1.5 text-xs font-semibold text-[#eae9e5]">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={bQuantified}
                            onChange={(e) => setBQuantified(e.target.checked)}
                            className="w-4 h-4 text-primary accent-primary rounded cursor-pointer shrink-0"
                          />
                          <span>Add quantified outcomes (+15 pts)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={bKeywords}
                            onChange={(e) => setBKeywords(e.target.checked)}
                            className="w-4 h-4 text-primary accent-primary rounded cursor-pointer shrink-0"
                          />
                          <span>Inject high-signal tech stack keywords (+16 pts)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={bNoCanva}
                            onChange={(e) => setBNoCanva(e.target.checked)}
                            className="w-4 h-4 text-primary accent-primary rounded cursor-pointer shrink-0"
                          />
                          <span>Remove legacy Canva parser blocks (+20 pts)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Transformed Resume preview block */}
                  <div className="space-y-2 text-left bg-[#111618]/50 border border-[#20292b] rounded-xl p-4 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-extrabold text-[#00e1ec] uppercase">Transformed SDE Bullet Output</span>
                      <span className="text-[9px] font-mono font-bold text-[#9f9d98] bg-[#0a0d0e] border border-[#20292b] px-1.5 py-0.5 rounded">
                        PDF preview
                      </span>
                    </div>
                    
                    {/* Dynamic bullet text depending on toggles */}
                    <div className="text-xs md:text-sm font-medium leading-relaxed min-h-12 flex items-center justify-start text-[#eae9e5] border border-dashed border-[#20292b] p-3 rounded-lg bg-[#0a0d0e] font-mono">
                      {bQuantified && bKeywords ? (
                        <p>
                          • Architected an AI customer support agent using <strong className="text-[#00e1ec] font-bold">FastAPI</strong>, <strong className="text-[#00e1ec] font-bold">Python</strong>, and <strong className="text-[#00e1ec] font-bold">OpenAI GPT-4</strong> API, reducing query response latencies by <strong className="text-success underline font-bold">40%</strong> and managing 200+ active sessions.
                        </p>
                      ) : bQuantified ? (
                        <p>
                          • Developed a customer support agent in Python using OpenAI API, managing queries efficiently and improving overall response latency by <strong className="text-success underline font-bold">40%</strong>.
                        </p>
                      ) : bKeywords ? (
                        <p>
                          • Designed an AI chatbot platform using <strong className="text-[#00e1ec] font-bold">FastAPI</strong> and <strong className="text-[#00e1ec] font-bold">OpenAI API</strong> to automate support question resolving.
                        </p>
                      ) : (
                        <p className="text-[#7a7974] italic">
                          • I created a chatbot using OpenAI API and Python to answer customer support questions.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Free Teaser details */}
                <div className="text-left text-[10px] text-[#9f9d98] font-bold flex items-center justify-between border-t border-[#20292b] pt-4 flex-wrap gap-2">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-success" /> 
                    <span>₹{price} to unlock full output</span>
                  </span>
                  <span>• 3 Free AI Regenerations included</span>
                  <span>• Direct UPI / Razorpay Pay</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── SECTION 3: WHY EXTREMELY POPULAR RESUME BUILDERS FAIL SDE ATS SCREENERS ── */}
          <div className="max-w-5xl mx-auto w-full px-4 md:px-6 py-4 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-4xl font-serif tracking-tight text-white mb-3">
                Why Standard Resumes Fail SDE Screenings
              </h2>
              <p className="text-xs md:text-sm text-[#9f9d98] max-w-xl mx-auto leading-relaxed">
                Standard design builders like Canva block screeners using multi-column tables, hidden text vectors, and zero metric indexing.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto font-medium">
              {/* Canvas Resume */}
              <div className="border border-[#20292b] bg-[#111618]/30 rounded-2xl p-5 relative">
                <div className="absolute top-4 right-4 inline-block text-[9px] font-extrabold tracking-wider text-error bg-error/10 px-2.5 py-1 rounded-full uppercase">
                  Canva / Docx Legacy
                </div>
                <h3 className="font-bold text-xs tracking-wide text-error mb-4 uppercase">Generic Parser Output</h3>
                
                <div className="space-y-4 text-left text-xs">
                  <div className="p-4 bg-[#0a0d0e]/60 rounded-xl border border-[#20292b]">
                    <span className="font-bold block text-[10px] text-[#7a7974] mb-1">PROJECT PARSING</span>
                    <p className="text-error font-mono leading-relaxed italic">
                      [Parser Blocked: Multi-column Table detected. Text skipped or corrupted into gibberish ASCII bytes.]
                    </p>
                  </div>
                  <div className="p-4 bg-[#0a0d0e]/60 rounded-xl border border-[#20292b]">
                    <span className="font-bold block text-[10px] text-[#7a7974] mb-1">EXPERIENCE SIGNAL</span>
                    <p className="text-[#eae9e5] italic">
                      &quot;Worked at a local startup coding backend APIs in Node.js and SQL.&quot; (Zero metrics, low signal)
                    </p>
                  </div>
                </div>
              </div>

              {/* ATSLift Optimized */}
              <div className="border-2 border-primary bg-[#111618]/50 rounded-2xl p-5 relative shadow-[0_0_30px_rgba(1,105,111,0.2)]">
                <div className="absolute top-4 right-4 inline-block text-[9px] font-extrabold tracking-wider text-success bg-success/10 px-2.5 py-1 rounded-full uppercase">
                  ATSLift Refactored
                </div>
                <h3 className="font-bold text-xs tracking-wide text-[#00e1ec] mb-4 uppercase">100% Parser Compliant</h3>

                <div className="space-y-4 text-left text-xs">
                  <div className="p-4 bg-[#0a0d0e]/60 rounded-xl border border-primary/20">
                    <span className="font-bold block text-[10px] text-primary mb-1">OPTIMIZED SYSTEM METRICS</span>
                    <p className="text-[#eae9e5]">
                      • Refactored relational schemas in <strong className="text-[#00e1ec] font-bold">PostgreSQL</strong> during 2-month backend internship, reducing query latencies by <strong className="text-success font-bold">35%</strong>.
                    </p>
                  </div>
                  <div className="p-4 bg-[#0a0d0e]/60 rounded-xl border border-primary/20">
                    <span className="font-bold block text-[10px] text-primary mb-1">quantified projects</span>
                    <p className="text-[#eae9e5]">
                      • Deployed containerized microservices using <strong className="text-[#00e1ec] font-bold">Docker</strong> and <strong className="text-[#00e1ec] font-bold">FastAPI</strong>, streamlining builds for <strong className="text-success font-bold">5,000+</strong> users.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── SECTION 4: REAL-TIME CAMPUS TECH STACK DENSITY ── */}
          <div className="max-w-5xl mx-auto w-full px-4 md:px-6 py-4 relative z-10">
            <div className="bg-[#111618]/50 border border-[#20292b] rounded-3xl p-6 md:p-8 space-y-6">
              <div className="text-center md:text-left border-b border-[#20292b] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-serif italic text-white">Parsed Engineering Stack Density</h3>
                  <p className="text-xs text-[#9f9d98] mt-1 font-semibold">
                    Real-time visual density of parsed frameworks currently spike-trending across active VIT/BITS/NIT cohorts.
                  </p>
                </div>
                <div className="bg-[#00e1ec]/10 border border-[#00e1ec]/20 px-3 py-1 rounded-full text-[10px] font-black uppercase text-[#00e1ec] tracking-wider shrink-0 w-fit">
                  Campus Spike Metrics
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs font-semibold">
                {[
                  { name: "Python / PyTorch AI Stack", density: 92, status: "Very High Density 🔥", color: "bg-[#00e1ec]" },
                  { name: "FastAPI / Node.js Backend", density: 78, status: "Active Spike 📈", color: "bg-primary" },
                  { name: "React.js / Next.js Frontend", density: 84, status: "Stable Demand 👔", color: "bg-primary" },
                  { name: "Docker / Kubernetes DevOps", density: 64, status: "Premium Signal ⭐", color: "bg-success" },
                  { name: "PostgreSQL / Redis SQL Systems", density: 74, status: "Core Required 📚", color: "bg-success" },
                  { name: "LangChain / LLM Agents", density: 56, status: "Trending Spike 🚀", color: "bg-[#00e1ec]" }
                ].map((item, idx) => (
                  <div key={idx} className="bg-[#0a0d0e]/60 border border-[#20292b] rounded-xl p-4 space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-[#eae9e5]">
                      <span>{item.name}</span>
                      <span className="font-mono">{item.density}%</span>
                    </div>
                    <div className="w-full bg-[#111618] h-1.5 rounded-full overflow-hidden">
                      <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.density}%` }} />
                    </div>
                    <div className="flex justify-between items-center text-[8.5px] font-black tracking-wider uppercase text-[#7a7974]">
                      <span>Spike Ratio</span>
                      <span>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── SECTION 5: PREMIUM CHECKOUT OUTCOMES & RISK-FREE GUARANTEES ── */}
          <div className="max-w-5xl mx-auto w-full px-4 md:px-6 py-4 relative z-10 text-center">
            <div className="bg-gradient-to-b from-[#111618]/90 to-[#0a0d0e] border border-primary/20 rounded-3xl p-8 md:p-12 space-y-8 relative overflow-hidden">
              <div className="space-y-4 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-1.5 bg-success/15 border border-success/30 px-3 py-1.5 rounded-full text-[9px] font-extrabold uppercase text-[#10b981] tracking-widest shadow-xs mx-auto mb-2">
                  <ShieldCheck className="w-4 h-4" /> 100% Risk Free Guarantee
                </div>
                <h2 className="text-2xl md:text-4xl font-serif italic text-white leading-tight">
                  One small payment. <br />
                  A lifetime of placement signal return.
                </h2>
                <p className="text-xs md:text-sm text-[#9f9d98] font-medium max-w-md mx-auto leading-relaxed">
                  Join 12,000+ engineering students who bypassed automatic CV filters. Pay ₹{price} once you preview the scorecard.
                </p>
              </div>

              {/* standard vs premium grid */}
              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left text-xs font-semibold">
                <div className="border border-[#20292b] bg-[#0a0d0e]/60 rounded-2xl p-5 space-y-3.5">
                  <span className="text-[10px] font-black text-[#7a7974] tracking-widest uppercase">FREE PREVIEW TEASER</span>
                  <ul className="space-y-2 text-[#9f9d98]">
                    <li className="flex items-center gap-2">❌ High-signal copyable PDF text</li>
                    <li className="flex items-center gap-2">❌ Unlimited post-unlock AI variations</li>
                    <li className="flex items-center gap-2">❌ Real-time JD Keyword Sync tools</li>
                    <li className="flex items-center gap-2">✓ Circular ATS score compatability rating</li>
                    <li className="flex items-center gap-2">✓ Basic structural formatting checklist</li>
                  </ul>
                </div>

                <div className="border-2 border-primary bg-[#111618] rounded-2xl p-5 space-y-3.5 shadow-[0_0_25px_rgba(1,105,111,0.25)] relative">
                  <div className="absolute top-4 right-4 inline-block text-[8px] font-black tracking-widest text-[#00e1ec] uppercase">
                    WINNING OPTION
                  </div>
                  <span className="text-[10px] font-black text-[#00e1ec] tracking-widest uppercase">ATSLIFT PREMIUM UNLOCK</span>
                  <ul className="space-y-2 text-[#eae9e5]">
                    <li className="flex items-center gap-2 text-success">✓ Complete optimized, copyable PDF structures</li>
                    <li className="flex items-center gap-2 text-success">✓ 3 AI regenerations to match specific jobs</li>
                    <li className="flex items-center gap-2 text-success">✓ High-signal technical stacks & keywords</li>
                    <li className="flex items-center gap-2 text-success">✓ Direct UPI Razorpay paywall checkouts</li>
                    <li className="flex items-center gap-2 text-success">✓ Money-back compliance guarantee</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 max-w-md mx-auto">
                <Link
                  href="/build"
                  className="w-full h-12 bg-primary hover:bg-primary/95 text-white font-bold text-sm rounded-full transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-[0_4px_15px_rgba(1,105,111,0.3)]"
                >
                  <span>Optimize Your Resume Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <span className="text-[9px] font-bold text-[#7a7974] uppercase tracking-wider block mt-3">
                  ₹{price} One-time Fee • Secure Checkout • direct email delivery
                </span>
              </div>
            </div>
          </div>

          {/* ── SECTION 6: SDE CAMPUS PLACEMENTS FAQS ── */}
          <div className="max-w-3xl mx-auto w-full px-4 md:px-6 py-4 relative z-10 text-left">
            <h3 className="text-xl md:text-2xl font-serif text-white text-center mb-8">
              Frequently Asked Questions
            </h3>
            
            <div className="space-y-4">
              {[
                {
                  q: "How does the SDE keyword optimization work?",
                  a: "Our AI model analyzes your project summary and maps generic descriptions to high-density frameworks (like LangChain, FastAPI, Docker). This aligns your descriptions with industry recruiter demands."
                },
                {
                  q: "Why should I avoid standard Canva resume designs?",
                  a: "Many ATS systems struggle to read multi-column layouts, custom icons, or graphic blocks common in Canva templates. Our single-column, plain text output is 100% compliant with standard corporate parsers."
                },
                {
                  q: "What is the ₹" + price + " fee for?",
                  a: "The one-time fee unlocks the full, copy-pasteable optimized text, provides 3 additional free custom variations, and includes high-scoring keywords matching specific Job Descriptions."
                }
              ].map((faqItem, idx) => (
                <div key={idx} className="border border-[#20292b] bg-[#111618]/30 rounded-2xl p-5">
                  <h4 className="font-bold text-xs md:text-sm text-white mb-2">{faqItem.q}</h4>
                  <p className="text-xs text-[#9f9d98] leading-relaxed font-semibold">{faqItem.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Hero Section */}
          <section className="relative px-6 py-12 md:py-20 w-full max-w-5xl mx-auto text-center flex flex-col items-center justify-center min-h-[calc(100dvh-75px)]">
            {/* Decorative background glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

            {/* Dynamic Badge */}
            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-border bg-surface text-xs font-semibold tracking-wide text-primary shadow-xs mb-8 uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Built for Indian Engineering Students</span>
            </div>

            {/* Hero Title */}
            <h1 className="text-4xl md:text-7xl font-serif tracking-tight text-text leading-[1.08] max-w-3xl mb-6">
              Your Projects Are Gold.<br />
              <span className="text-primary italic font-normal">Your Resume</span> Doesn&apos;t Show It.
            </h1>

            {/* Subtitle */}
            <p className="text-base md:text-lg text-text-muted max-w-xl mb-10 leading-relaxed">
              Turn your CGPA, branch-specific skills, and raw projects into ATS-ready, recruiter-approved resume content in 2 minutes. Trained on modern Indian tech hiring patterns.
            </p>

            {/* CTA Area */}
            <div className="flex flex-col items-center space-y-4 mb-12">
              <Link
                href="/build"
                className="group px-8 py-4 bg-primary hover:bg-primary/95 text-white text-base font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center space-x-2"
              >
                <span>Build My Resume Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <div className="text-xs text-text-muted flex flex-wrap justify-center gap-x-3 gap-y-1 font-medium">
                <span>₹{price} to unlock full output</span>
                <span className="text-border">•</span>
                <span>No account needed</span>
                <span className="text-border">•</span>
                <span>Takes only 2 min</span>
              </div>
            </div>

            {/* Trust Badge Grid */}
            <div className="w-full border-t border-b border-border/60 py-5 flex flex-wrap items-center justify-around gap-6 text-sm text-text-muted font-medium bg-surface/30 rounded-2xl px-6">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🎓</span>
                <span>Built for VIT, BITS, NIT & IIIT Students</span>
              </div>
              <div className="h-4 w-[1px] bg-border/60 hidden md:block" />
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-success" />
                <span>100% ATS Parser Safe</span>
              </div>
              <div className="h-4 w-[1px] bg-border/60 hidden md:block" />
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-warning animate-pulse" />
                <span>2 Minute Average Generation</span>
              </div>
            </div>
          </section>

          {/* Before / After Showcase */}
          <section className="px-6 py-16 bg-surface border-t border-b border-border/50">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-serif tracking-tight mb-3">
                  The Recruiters&apos; Lens
                </h2>
                <p className="text-text-muted max-w-md mx-auto text-sm md:text-base">
                  See how raw student inputs are instantly transformed into quantified, high-impact bullet points that bypass ATS screenings.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Left Card: Input */}
                <div className="border border-border bg-bg-base/60 rounded-2xl p-4 md:p-6 relative">
                  <div className="md:absolute static mb-4 md:mb-0 md:top-4 md:right-4 inline-block text-xs font-bold tracking-wider text-text-muted bg-border/40 px-2.5 py-1 rounded-full uppercase">
                    What you write
                  </div>
                  <h3 className="font-bold text-sm tracking-wide text-text-muted mb-4 uppercase">Raw Input</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-surface rounded-xl border border-border/40 text-sm">
                      <span className="font-bold block text-xs text-text-muted mb-1">PROJECT DESCRIPTION</span>
                      <p className="text-text italic font-medium">
                        &quot;I made a chatbot project using Python. It uses OpenAI and helps users get answers to customer support questions.&quot;
                      </p>
                    </div>

                    <div className="p-4 bg-surface rounded-xl border border-border/40 text-sm">
                      <span className="font-bold block text-xs text-text-muted mb-1">INTERNSHIP EXPERIENCE</span>
                      <p className="text-text italic font-medium">
                        &quot;I did a 2-month internship at a local startup where I wrote database queries and improved speed of loading.&quot;
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Card: Output */}
                <div className="border-2 border-primary bg-surface rounded-2xl p-4 md:p-6 relative shadow-md glow-primary">
                  <div className="md:absolute static mb-4 md:mb-0 md:top-4 md:right-4 inline-flex items-center space-x-1.5 bg-success/15 border border-success/30 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    <span className="text-[10px] font-extrabold tracking-wider text-success uppercase">ATS Score: 94/100</span>
                  </div>
                  <h3 className="font-bold text-sm tracking-wide text-primary mb-4 uppercase">ATSLift Output</h3>

                  <div className="space-y-4">
                    <div className="p-4 bg-bg-base rounded-xl border border-border/60 text-sm">
                      <span className="font-bold block text-xs text-primary mb-1.5">OPTIMIZED PROJECTS</span>
                      <ul className="list-disc pl-4 space-y-1.5 text-text font-medium leading-relaxed">
                        <li>Architected an AI-powered customer support chatbot using <strong className="text-primary font-bold">Python</strong>, <strong className="text-primary font-bold">FastAPI</strong>, and <strong className="text-primary font-bold">LangChain</strong>, reducing inquiry response times by <span className="underline decoration-primary font-bold">40%</span>.</li>
                        <li>Integrated OpenAI GPT models with a custom vector storage solution, seamlessly handling <span className="underline decoration-primary font-bold">200+ concurrent sessions</span> without latency drops.</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-bg-base rounded-xl border border-border/60 text-sm">
                      <span className="font-bold block text-xs text-primary mb-1.5">OPTIMIZED EXPERIENCE</span>
                      <ul className="list-disc pl-4 space-y-1.5 text-text font-medium leading-relaxed">
                        <li>Engineered and optimized relational schema indexes in <strong className="text-primary font-bold">PostgreSQL</strong>, decreasing query execution latency by <span className="underline decoration-primary font-bold">35%</span>.</li>
                        <li>Refactored critical API endpoints during a 2-month engineering internship, improving platform page-load performance for <span className="underline decoration-primary font-bold">5,000+ daily active users</span>.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 1: Why Good Students Still Get Rejected */}
          <section className="px-6 py-24 max-w-5xl mx-auto w-full border-b border-border/40 relative overflow-hidden">
            {/* Decorative subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/2 rounded-full blur-[100px] pointer-events-none" />

            {/* Centered Heading & Subtitle */}
            <div className="text-center mb-16 relative z-10">
              <h2 className="text-3xl md:text-5xl font-serif tracking-tight text-text mb-4">
                Why Good Students Still Get Rejected
              </h2>
              <p className="text-sm md:text-base text-text-muted max-w-2xl mx-auto leading-relaxed">
                Most engineering students don’t fail because they lack skills. They fail because recruiters never understand their projects in the first 6 seconds.
              </p>
            </div>

            {/* Scannable Connected Horizontal Comparison Container */}
            {/* Editorial Horizontal Flow - No Vertical Cards */}
            <div className="flex flex-col border border-border/40 rounded-[32px] overflow-hidden shadow-2xl relative z-10 bg-surface/30">
              {/* Top Row: The Old Way */}
              <div className="flex flex-col md:flex-row items-stretch border-b border-border/40">
                <div className="md:w-[40%] p-8 md:p-12 bg-surface/80 flex flex-col justify-center border-b md:border-b-0 md:border-r border-border/40">
                  <div className="inline-flex items-center space-x-2 text-error/80 mb-4">
                    <XCircle className="w-5 h-5" />
                    <span className="font-bold tracking-widest text-[10px] uppercase">The Standard Way</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-serif text-text-muted mb-3">Lost in the noise</h3>
                  <p className="text-sm md:text-base text-text-muted/70 leading-relaxed">
                    Recruiters spend an average of 6 seconds scanning a resume. Standard templates list technologies but fail to show actual engineering competence, resulting in immediate rejection.
                  </p>
                </div>
                
                <div className="md:w-[60%] p-8 md:p-12 bg-bg-base flex flex-col justify-center space-y-4 relative">
                  {/* Feature list horizontally structured */}
                  <div className="bg-surface/50 p-4 rounded-2xl border border-border/30 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-error/50 shrink-0 hidden sm:block" />
                    <div className="flex-1">
                      <span className="text-error/80 text-xs font-bold block mb-1">Vague Bullet Points</span>
                      <span className="text-text-muted text-sm font-medium">Describes effort, not outcomes. Missing critical metrics.</span>
                    </div>
                  </div>
                  <div className="bg-surface/50 p-4 rounded-2xl border border-border/30 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-error/50 shrink-0 hidden sm:block" />
                    <div className="flex-1">
                      <span className="text-error/80 text-xs font-bold block mb-1">ATS Parsing Failures</span>
                      <span className="text-text-muted text-sm font-medium">Visual templates from Canva choke legacy recruitment software.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row: The ATSLift Engine */}
              <div className="flex flex-col md:flex-row items-stretch bg-gradient-to-br from-surface to-primary/5 relative overflow-hidden">
                {/* Ambient Glow */}
                <div className="absolute right-0 top-0 w-96 h-96 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
                
                <div className="md:w-[40%] p-8 md:p-12 flex flex-col justify-center border-b md:border-b-0 md:border-r border-primary/10 relative z-10">
                  <div className="inline-flex items-center space-x-2 text-primary mb-4">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    <span className="font-bold tracking-widest text-[10px] uppercase">The ATSLift Engine</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-serif text-text mb-3">Hiring signal amplified</h3>
                  <p className="text-sm md:text-base text-text-muted leading-relaxed mb-6">
                    We restructure your raw experience into the exact format tech recruiters and automated parsers search for.
                  </p>
                  <div className="w-fit inline-flex items-center px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white text-xs font-bold tracking-widest uppercase shadow-sm transition-all duration-300">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    <span>Higher Selection Rate</span>
                  </div>
                </div>
                
                <div className="md:w-[60%] p-8 md:p-12 flex flex-col justify-center space-y-4 relative z-10">
                  <div className="bg-surface p-5 rounded-2xl border border-primary/20 shadow-[0_8px_30px_rgba(1,105,111,0.06)] flex items-start sm:items-center space-x-4 transition-transform hover:-translate-y-1 duration-300">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-primary text-xs font-bold uppercase tracking-wider block mb-1">Quantified Impact & Outcomes</span>
                      <span className="text-text text-sm font-medium">Metrics, scale, and engineering decisions are extracted and highlighted.</span>
                    </div>
                  </div>
                  <div className="bg-surface p-5 rounded-2xl border border-primary/20 shadow-[0_8px_30px_rgba(1,105,111,0.06)] flex items-start sm:items-center space-x-4 transition-transform hover:-translate-y-1 duration-300">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-primary text-xs font-bold uppercase tracking-wider block mb-1">Recruiter-Optimized Structure</span>
                      <span className="text-text text-sm font-medium">Reordered to show your strongest technical signals in the first 6 seconds.</span>
                    </div>
                  </div>
                  <div className="bg-surface p-5 rounded-2xl border border-primary/20 shadow-[0_8px_30px_rgba(1,105,111,0.06)] flex items-start sm:items-center space-x-4 transition-transform hover:-translate-y-1 duration-300">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-primary text-xs font-bold uppercase tracking-wider block mb-1">100% Parser Safe Output</span>
                      <span className="text-text text-sm font-medium">Clean, structured output that passes all legacy and modern ATS filters.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Small Centered Recruiter Quote Block */}
            <div className="text-center max-w-xl mx-auto pt-8 border-t border-border/20 relative z-10">
              <p className="font-serif italic text-lg md:text-xl text-text leading-relaxed mb-2">
                “Most student resumes aren’t weak technically. They’re weak at communicating technical value.”
              </p>
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                — Engineering Hiring Perspective
              </span>
            </div>
          </section>

          {/* SECTION 2: Competitive Positioning */}
          <section className="px-6 py-24 max-w-5xl mx-auto w-full border-b border-border/40 relative overflow-hidden">
            {/* Centered Heading & Subtitle */}
            <div className="text-center mb-16 relative z-10">
              <h2 className="text-3xl md:text-5xl font-serif tracking-tight text-text mb-4">
                Built For How Engineering Hiring Actually Works
              </h2>
              <p className="text-sm md:text-base text-text-muted max-w-2xl mx-auto leading-relaxed">
                Most tools generate resumes. <span className="text-primary font-bold">ATSLift</span> optimizes how recruiters perceive technical ability.
              </p>
            </div>

            {/* Uniquely Designed Comparative Positioning Board */}
            <div className="bg-surface/50 border border-border/30 rounded-3xl p-2 max-w-5xl mx-auto mb-16 relative z-10 grid md:grid-cols-3 gap-2 md:gap-0 items-stretch">
              {/* Column 1: Generic Resume Builders */}
              <div className="p-8 md:p-10 flex flex-col justify-between md:border-r border-border/20 bg-transparent transition-all duration-300 opacity-70 hover:opacity-90">
                <div>
                  <div className="mb-6">
                    <span className="text-[10px] font-bold text-text-muted/80 uppercase tracking-widest block mb-1">Standard Tool</span>
                    <h3 className="font-bold text-xl text-text-muted font-serif italic">Generic Builders</h3>
                  </div>
                  <ul className="space-y-4 text-sm text-text-muted/80 mb-8">
                    <li className="flex items-start space-x-2.5">
                      <span className="text-border/40 mt-1.5 w-1.5 h-1.5 rounded-full bg-border shrink-0" />
                      <span>Template-first approach</span>
                    </li>
                    <li className="flex items-start space-x-2.5">
                      <span className="text-border/40 mt-1.5 w-1.5 h-1.5 rounded-full bg-border shrink-0" />
                      <span>Focused mainly on design</span>
                    </li>
                    <li className="flex items-start space-x-2.5">
                      <span className="text-border/40 mt-1.5 w-1.5 h-1.5 rounded-full bg-border shrink-0" />
                      <span>Weak technical storytelling</span>
                    </li>
                    <li className="flex items-start space-x-2.5">
                      <span className="text-border/40 mt-1.5 w-1.5 h-1.5 rounded-full bg-border shrink-0" />
                      <span>Same structure for every student</span>
                    </li>
                  </ul>
                </div>
                <div className="border-t border-border/15 pt-4 text-center mt-auto">
                  <span className="text-[10px] font-bold tracking-wider text-text-muted/60 uppercase block mb-1">Optimized For</span>
                  <span className="text-xs font-bold text-text-muted/90">Visual Appearance</span>
                </div>
              </div>

              {/* Column 2: AI Chatbots */}
              <div className="p-8 md:p-10 flex flex-col justify-between md:border-r border-border/20 bg-transparent transition-all duration-300 opacity-85 hover:opacity-100">
                <div>
                  <div className="mb-6">
                    <span className="text-[10px] font-bold text-warning/80 uppercase tracking-widest block mb-1">Raw AI Tool</span>
                    <h3 className="font-bold text-xl text-text font-serif italic">AI Chatbots</h3>
                  </div>
                  <ul className="space-y-4 text-sm text-text-muted mb-8">
                    <li className="flex items-start space-x-2.5">
                      <span className="text-warning/45 mt-1.5 w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
                      <span>Generic generated bullet points</span>
                    </li>
                    <li className="flex items-start space-x-2.5">
                      <span className="text-warning/45 mt-1.5 w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
                      <span>Requires prompt engineering</span>
                    </li>
                    <li className="flex items-start space-x-2.5">
                      <span className="text-warning/45 mt-1.5 w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
                      <span>Often creates fake metrics</span>
                    </li>
                    <li className="flex items-start space-x-2.5">
                      <span className="text-warning/45 mt-1.5 w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
                      <span>No recruiter-specific optimization</span>
                    </li>
                  </ul>
                </div>
                <div className="border-t border-border/15 pt-4 text-center mt-auto">
                  <span className="text-[10px] font-bold tracking-wider text-warning/80 uppercase block mb-1">Optimized For</span>
                  <span className="text-xs font-bold text-warning/90 font-semibold">Text Generation</span>
                </div>
              </div>

              {/* Column 3: ATSLift (Sleek Floating Column) */}
              <div className="bg-gradient-to-b from-[#ffffff] to-primary/[0.02] border-2 border-primary rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(1,105,111,0.08)] relative md:-translate-y-6 md:scale-[1.04] z-20 flex flex-col justify-between transition-all duration-300 group">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] font-extrabold tracking-widest px-4 py-1.5 rounded-full uppercase shadow-md border border-white/20 whitespace-nowrap">
                  High Signal Format
                </div>
                <div>
                  <div className="flex items-center justify-between mb-8 mt-1">
                    <div>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">What Recruiters Actually Notice</span>
                      <h3 className="font-bold text-xl md:text-2xl text-text leading-tight">
                        ATSLift
                      </h3>
                    </div>
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-inner">
                      <CheckCircle className="w-5 h-5 animate-pulse" />
                    </div>
                  </div>
                  <ul className="space-y-4 text-sm text-text mb-8 leading-relaxed font-medium">
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <span>Highlights technical depth clearly</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <span>Converts vague work into hiring signals</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <span>Prioritizes recruiter scan behavior</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <span>Structured for fast shortlisting</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-auto">
                  {/* Premium grey centered italic microcopy */}
                  <span className="text-[11px] md:text-xs text-text-muted/80 text-center font-serif italic block mb-4">
                    “Most recruiters evaluate visible impact, not effort.”
                  </span>
                  
                  <div className="border-t border-primary/20 pt-5 text-center bg-primary/5 rounded-b-3xl -mx-8 -mb-8 md:-mx-10 md:-mb-10 p-5 md:p-6">
                    <span className="text-[10px] font-bold tracking-wider text-primary uppercase block mb-1">Optimized For</span>
                    <span className="text-sm font-bold text-primary">Shortlisting Signals</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Microcopy Below Comparison */}
            <div className="text-center max-w-xl mx-auto pt-4 relative z-10">
              <p className="text-xs md:text-sm text-text-muted leading-relaxed font-medium">
                ATSLift understands how engineering recruiters evaluate technical ability.
              </p>
            </div>
          </section>

          {/* How it works */}
          <section className="px-6 py-20 max-w-5xl mx-auto w-full">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif tracking-tight mb-3">How ATSLift Works</h2>
              <p className="text-text-muted text-sm md:text-base max-w-md mx-auto">
                From empty text areas to recruiting-ready summaries in three steps. No credentials or login required to start.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="flex flex-col items-start p-6 bg-surface border border-border/50 rounded-2xl relative hover:border-primary/50 transition-colors duration-300">
                <span className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center text-sm mb-4">
                  1
                </span>
                <h3 className="font-bold text-lg mb-2">Fill in your details</h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  Enter your CGPA, core branch, projects, and internships. Plain, unedited student descriptions are perfect. Takes 2 minutes.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-start p-6 bg-surface border border-border/50 rounded-2xl relative hover:border-primary/50 transition-colors duration-300">
                <span className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center text-sm mb-4">
                  2
                </span>
                <h3 className="font-bold text-lg mb-2">AI-Recruiter Processing</h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  Our backend translates academic work and libraries into action verbs, technical achievements, and job-aligned indexable keywords.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-start p-6 bg-surface border border-border/50 rounded-2xl relative hover:border-primary/50 transition-colors duration-300">
                <span className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center text-sm mb-4">
                  3
                </span>
                <h3 className="font-bold text-lg mb-2">Preview & Pay ₹{price}</h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  Check your free teaser output, score rating, and 3 custom improvement tips. Pay a one-time ₹{price} to instantly unlock copyable content.
                </p>
              </div>
            </div>
          </section>

          {/* Social Proof Stats */}
          <section className="px-6 py-12 bg-primary text-white text-center">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-around gap-8">
              <div>
                <h4 className="text-4xl md:text-5xl font-serif italic mb-1">500+</h4>
                <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">Resumes Formatted</p>
              </div>
              <div className="h-[1px] w-12 md:w-[1px] md:h-12 bg-white/20" />
              <div className="max-w-md">
                <p className="font-serif text-lg md:text-xl italic leading-relaxed text-white/95">
                  &quot;Built by an engineering student who faced the exact same campus placement portals, for engineering students.&quot;
                </p>
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section className="px-6 py-20 bg-surface/30 border-t border-border/50">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-serif tracking-tight mb-3">Frequently Asked Questions</h2>
                <p className="text-text-muted text-sm">Everything you need to know about ATSLift.</p>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="border border-border rounded-xl bg-surface overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full text-left px-6 py-5 flex justify-between items-center font-bold text-base hover:text-primary transition-colors focus:outline-hidden"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-text-muted transition-transform duration-300 ${
                          openFaq === index ? "rotate-180 text-primary" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`transition-all duration-300 ease-in-out ${
                        openFaq === index ? "max-h-48 border-t border-border/40" : "max-h-0"
                      }`}
                    >
                      <p className="px-6 py-5 text-sm text-text-muted leading-relaxed font-medium">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="px-6 py-24 text-center max-w-4xl mx-auto flex flex-col items-center">
            <h2 className="text-3xl md:text-6xl font-serif tracking-tight text-text mb-6 leading-tight">
              Ready to beat the <span className="italic text-primary font-normal">Placement Portal</span>?
            </h2>
            <p className="text-base text-text-muted max-w-lg mb-8 leading-relaxed">
              Don&apos;t let poorly written bullets stand between you and a technical interview. Create an optimized resume in under two minutes.
            </p>
            <Link
              href="/build"
              className="px-8 py-4 bg-primary hover:bg-primary/95 text-white text-base font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Start Building Free
            </Link>
            <span className="text-xs text-text-muted mt-3 font-semibold">
              Takes 2 minutes. Pay ₹{price} only if you love the preview.
            </span>
          </section>
        </>
      )}
      
      {/* Footer */}
      <footer className="mt-auto border-t border-border/60 bg-surface px-6 py-12 text-center text-xs text-text-muted font-medium">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="ATSLift Logo" className="w-5 h-5 object-contain logo-rotated" />
            <span className="font-bold text-sm tracking-tight text-text">
              ATS<span className="text-primary font-serif italic">Lift</span>
            </span>
            <span className="text-border">|</span>
            <span>© {new Date().getFullYear()} ATSLift. All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/ats-check" className="hover:text-primary transition-colors">
              ATS Score
            </Link>
            <span className="text-border">•</span>
            <Link href="/about" className="hover:text-primary transition-colors">
              About
            </Link>
            <span className="text-border">•</span>
            <span>One-time secure payments via Razorpay</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
