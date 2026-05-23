"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle, Flame, ShieldCheck, Sparkles, ChevronDown, Award, XCircle, Eye, TrendingUp } from "lucide-react";
import { getLocalSession } from "@/lib/authClient";
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

  useEffect(() => {
    setSession(getLocalSession());
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
      q: "Is ₹49 a subscription?",
      a: "No. It is a one-time payment of ₹49 per resume generation. No recurring monthly fees, no hidden cards, and no unexpected charges."
    },
    {
      q: "Can I regenerate after paying?",
      a: "Yes! Your payment unlocks the resume, including 3 free regenerations. You can adjust the tone (e.g. make it more technical) or paste a specific Job Description to align keywords."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-bg-base text-text selection:bg-primary/20 font-sans">
      {/* Premium Navbar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-border/40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm tracking-wider">
            RF
          </div>
          <span className="font-bold text-lg tracking-tight font-sans text-text">
            Resume<span className="text-primary font-medium font-serif italic">Forge</span>
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
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

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-16 max-w-5xl mx-auto text-center flex flex-col items-center">
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
            <span>₹49 to unlock full output</span>
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
              <h3 className="font-bold text-sm tracking-wide text-primary mb-4 uppercase">ResumeForge Output</h3>

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
        <motion.div 
          className="text-center mb-16 relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={textVariants}
        >
          <h2 className="text-3xl md:text-5xl font-serif tracking-tight text-text mb-4">
            Why Good Students Still Get Rejected
          </h2>
          <p className="text-sm md:text-base text-text-muted max-w-2xl mx-auto leading-relaxed">
            Most engineering students don’t fail because they lack skills. They fail because recruiters never understand their projects in the first 6 seconds.
          </p>
        </motion.div>

        {/* 3 Horizontally Aligned Cards */}
        <motion.div 
          className="grid md:grid-cols-3 gap-8 mb-16 relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {/* Card 1: Generic Resume */}
          <motion.div 
            className="bg-surface border border-border/50 rounded-2xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 hover:border-error/30 hover:shadow-xs group"
            variants={cardVariants}
            whileHover={{ y: -4 }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-text">Generic Resume</h3>
                <span className="p-2 rounded-lg bg-error/5 text-error">
                  <XCircle className="w-5 h-5" />
                </span>
              </div>
              <ul className="space-y-3 text-sm text-text-muted mb-8">
                <li className="flex items-start space-x-2">
                  <span className="text-error/70 mt-1">•</span>
                  <span>Lists technologies without context</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-error/70 mt-1">•</span>
                  <span>Weak project explanations</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-error/70 mt-1">•</span>
                  <span>No measurable outcomes</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-error/70 mt-1">•</span>
                  <span>Looks identical to thousands of resumes</span>
                </li>
              </ul>
            </div>
            <div className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-error/5 border border-error/10 text-xs font-bold text-error tracking-wide uppercase">
              ATS Visibility: 41%
            </div>
          </motion.div>

          {/* Card 2: Recruiter Reality */}
          <motion.div 
            className="bg-surface border border-border/50 rounded-2xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 hover:border-border hover:shadow-xs group"
            variants={cardVariants}
            whileHover={{ y: -4 }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-text">Recruiter Reality</h3>
                <span className="p-2 rounded-lg bg-text/5 text-text-muted">
                  <Eye className="w-5 h-5" />
                </span>
              </div>
              <ul className="space-y-3 text-sm text-text-muted mb-8">
                <li className="flex items-start space-x-2">
                  <span className="text-text-muted/70 mt-1">•</span>
                  <span>Recruiters scan resumes in seconds</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-text-muted/70 mt-1">•</span>
                  <span>ATS filters missing keywords</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-text-muted/70 mt-1">•</span>
                  <span>Projects matter more than certificates</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-text-muted/70 mt-1">•</span>
                  <span>Generic bullets get ignored instantly</span>
                </li>
              </ul>
            </div>
            <div className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-text-muted/10 border border-border text-xs font-bold text-text-muted tracking-wide uppercase">
              Average Scan Time: 6 Seconds
            </div>
          </motion.div>

          {/* Card 3: ResumeForge Resume */}
          <motion.div 
            className="bg-surface border-2 border-primary rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-xs glow-primary relative md:-translate-y-2 transition-all duration-300 hover:shadow-md hover:border-primary group"
            variants={cardVariants}
            whileHover={{ y: -8 }}
          >
            {/* Spotlight badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold tracking-wider px-3 py-1 rounded-full uppercase shadow-sm">
              Recommended Choice
            </div>
            <div>
              <div className="flex items-center justify-between mb-4 mt-1">
                <h3 className="font-bold text-lg text-text">ResumeForge Resume</h3>
                <span className="p-2 rounded-lg bg-primary/10 text-primary animate-pulse">
                  <TrendingUp className="w-5 h-5" />
                </span>
              </div>
              <ul className="space-y-3 text-sm text-text mb-8 font-medium">
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Converts projects into technical impact</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Creates recruiter-readable bullets</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>ATS-safe formatting structure</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Optimized for engineering placements</span>
                </li>
              </ul>
            </div>
            <div className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold tracking-wide uppercase shadow-xs transition-colors group-hover:bg-primary/95">
              Interview Probability ↑
            </div>
          </motion.div>
        </motion.div>

        {/* Small Centered Recruiter Quote Block */}
        <motion.div 
          className="text-center max-w-xl mx-auto pt-8 border-t border-border/20 relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={quoteVariants}
        >
          <p className="font-serif italic text-lg md:text-xl text-text leading-relaxed mb-2">
            “Most student resumes aren’t weak technically. They’re weak at communicating technical value.”
          </p>
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">
            — Engineering Hiring Perspective
          </span>
        </motion.div>
      </section>

      {/* SECTION 2: Competitive Positioning */}
      <section className="px-6 py-24 max-w-5xl mx-auto w-full border-b border-border/40 relative overflow-hidden">
        {/* Centered Heading & Subtitle */}
        <motion.div 
          className="text-center mb-16 relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={textVariants}
        >
          <h2 className="text-3xl md:text-5xl font-serif tracking-tight text-text mb-4">
            Built For How Engineering Hiring Actually Works
          </h2>
          <p className="text-sm md:text-base text-text-muted max-w-2xl mx-auto leading-relaxed">
            Most tools optimize for appearance or generic writing. ResumeForge optimizes for technical placement conversion.
          </p>
        </motion.div>

        {/* 3-Column Premium Comparison Grid */}
        <motion.div 
          className="grid md:grid-cols-3 gap-8 items-stretch mb-12 relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {/* Column 1: Generic Resume Builders */}
          <motion.div 
            className="bg-surface border border-border/50 rounded-2xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 hover:border-border hover:shadow-xs"
            variants={cardVariants}
            whileHover={{ y: -4 }}
          >
            <div>
              <div className="mb-4">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Standard Tool</span>
                <h3 className="font-bold text-lg text-text">Generic Resume Builders</h3>
              </div>
              <ul className="space-y-4 text-sm text-text-muted mb-8">
                <li className="flex items-start space-x-2">
                  <span className="text-border mt-1.5 w-1.5 h-1.5 rounded-full bg-border" />
                  <span>Template-first approach</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-border mt-1.5 w-1.5 h-1.5 rounded-full bg-border" />
                  <span>Focused mainly on design</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-border mt-1.5 w-1.5 h-1.5 rounded-full bg-border" />
                  <span>Weak technical storytelling</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-border mt-1.5 w-1.5 h-1.5 rounded-full bg-border" />
                  <span>Same structure for every student</span>
                </li>
              </ul>
            </div>
            <div className="border-t border-border/40 pt-4 text-center mt-auto">
              <span className="text-[10px] font-bold tracking-wider text-text-muted uppercase block mb-1">Optimized For</span>
              <span className="text-xs font-bold text-text">Visual Appearance</span>
            </div>
          </motion.div>

          {/* Column 2: AI Chatbots */}
          <motion.div 
            className="bg-surface border border-border/50 rounded-2xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 hover:border-warning/30 hover:shadow-xs"
            variants={cardVariants}
            whileHover={{ y: -4 }}
          >
            <div>
              <div className="mb-4">
                <span className="text-[10px] font-bold text-warning uppercase tracking-wider block mb-1">Raw AI Tool</span>
                <h3 className="font-bold text-lg text-text">AI Chatbots</h3>
              </div>
              <ul className="space-y-4 text-sm text-text-muted mb-8">
                <li className="flex items-start space-x-2">
                  <span className="text-warning/60 mt-1.5 w-1.5 h-1.5 rounded-full bg-warning" />
                  <span>Generic generated bullet points</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-warning/60 mt-1.5 w-1.5 h-1.5 rounded-full bg-warning" />
                  <span>Requires prompt engineering</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-warning/60 mt-1.5 w-1.5 h-1.5 rounded-full bg-warning" />
                  <span>Often creates fake metrics</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-warning/60 mt-1.5 w-1.5 h-1.5 rounded-full bg-warning" />
                  <span>No recruiter-specific optimization</span>
                </li>
              </ul>
            </div>
            <div className="border-t border-border/40 pt-4 text-center mt-auto">
              <span className="text-[10px] font-bold tracking-wider text-warning uppercase block mb-1">Optimized For</span>
              <span className="text-xs font-bold text-warning font-semibold">Text Generation</span>
            </div>
          </motion.div>

          {/* Column 3: ResumeForge */}
          <motion.div 
            className="bg-surface border-2 border-primary rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-xs glow-primary relative md:-translate-y-2 transition-all duration-300 hover:shadow-md hover:border-primary"
            variants={cardVariants}
            whileHover={{ y: -8 }}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold tracking-wider px-3 py-1 rounded-full uppercase shadow-sm">
              The Focused Solution
            </div>
            <div>
              <div className="mb-4 mt-1">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1">Engineered Solution</span>
                <h3 className="font-bold text-lg text-text">ResumeForge</h3>
              </div>
              <ul className="space-y-4 text-sm text-text mb-8 font-medium">
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Built for engineering students</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Converts raw projects into impact</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>ATS-safe and recruiter-readable</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Structured for placement shortlisting</span>
                </li>
              </ul>
            </div>
            <div className="border-t border-primary/20 pt-4 text-center mt-auto bg-primary/5 rounded-b-xl -mx-6 -mb-6 p-4">
              <span className="text-[10px] font-bold tracking-wider text-primary uppercase block mb-1">Optimized For</span>
              <span className="text-sm font-bold text-primary">Technical Placement Conversion</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Additional Microcopy Below Comparison */}
        <motion.div 
          className="text-center max-w-xl mx-auto pt-4 relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={textVariants}
        >
          <p className="text-xs md:text-sm text-text-muted leading-relaxed font-medium">
            ResumeForge understands how engineering recruiters evaluate projects, internships, and ATS relevance.
          </p>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20 max-w-5xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif tracking-tight mb-3">How ResumeForge Works</h2>
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
            <h3 className="font-bold text-lg mb-2">Preview & Pay ₹49</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Check your free teaser output, score rating, and 3 custom improvement tips. Pay a one-time ₹49 to instantly unlock copyable content.
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
            <p className="text-text-muted text-sm">Everything you need to know about ResumeForge.</p>
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
          Takes 2 minutes. Pay ₹49 only if you love the preview.
        </span>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/60 bg-surface px-6 py-12 text-center text-xs text-text-muted font-medium">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm tracking-tight text-text">
              Resume<span className="text-primary font-serif italic">Forge</span>
            </span>
            <span className="text-border">|</span>
            <span>© {new Date().getFullYear()} ResumeForge. All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-4">
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
