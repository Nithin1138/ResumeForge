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

  useEffect(() => {
    getSession().then(setSession);
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

        {/* Scannable Connected Horizontal Comparison Container */}
        {/* Editorial Horizontal Flow - No Vertical Cards */}
        <motion.div 
          className="flex flex-col border border-border/40 rounded-[32px] overflow-hidden shadow-2xl relative z-10 bg-surface/30"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {/* Top Row: The Old Way */}
          <motion.div 
            className="flex flex-col md:flex-row items-stretch border-b border-border/40"
            variants={cardVariants}
          >
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
          </motion.div>

          {/* Bottom Row: The ATSLift Engine */}
          <motion.div 
            className="flex flex-col md:flex-row items-stretch bg-gradient-to-br from-surface to-primary/5 relative overflow-hidden"
            variants={cardVariants}
          >
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
            Most tools generate resumes. <span className="text-primary font-bold">ATSLift</span> optimizes how recruiters perceive technical ability.
          </p>
        </motion.div>

        {/* Uniquely Designed Comparative Positioning Board */}
        <motion.div 
          className="bg-surface/50 border border-border/30 rounded-3xl p-2 max-w-5xl mx-auto mb-16 relative z-10 grid md:grid-cols-3 gap-2 md:gap-0 items-stretch"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {/* Column 1: Generic Resume Builders */}
          <motion.div 
            className="p-8 md:p-10 flex flex-col justify-between md:border-r border-border/20 bg-transparent transition-all duration-300 opacity-70 hover:opacity-90"
            variants={cardVariants}
            whileHover={{ y: -4 }}
          >
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
          </motion.div>

          {/* Column 2: AI Chatbots */}
          <motion.div 
            className="p-8 md:p-10 flex flex-col justify-between md:border-r border-border/20 bg-transparent transition-all duration-300 opacity-85 hover:opacity-100"
            variants={cardVariants}
            whileHover={{ y: -4 }}
          >
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
          </motion.div>

          {/* Column 3: ATSLift (Sleek Floating Column) */}
          <motion.div 
            className="bg-gradient-to-b from-[#ffffff] to-primary/[0.02] border-2 border-primary rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(1,105,111,0.08)] relative md:-translate-y-6 md:scale-[1.04] z-20 flex flex-col justify-between transition-all duration-300 group"
            variants={cardVariants}
            whileHover={{ y: -32, scale: 1.06 }}
          >
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
            ATSLift understands how engineering recruiters evaluate technical ability.
          </p>
        </motion.div>
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
          Takes 2 minutes. Pay ₹49 only if you love the preview.
        </span>
      </section>

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
