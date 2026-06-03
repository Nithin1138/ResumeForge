"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle, Flame, ShieldCheck, Sparkles, ChevronDown, Award, XCircle, Eye, TrendingUp, Check, Menu, X } from "lucide-react";
import { getLocalSession } from "@/lib/authClient";
import { motion, AnimatePresence } from "framer-motion";

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
  const [bannerText, setBannerText] = useState("🔥 Placement Season: Use our ATS-friendly templates to get noticed.");
  const [isBannerActive, setIsBannerActive] = useState(true);
  const [landingVariant, setLandingVariant] = useState<"minimal" | "dashboard">("minimal");
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  
  // Dynamic Landing CMS copy states
  const [badgeText, setBadgeText] = useState("Built for Indian Engineering Students");
  const [heroHeadline, setHeroHeadline] = useState("Your Projects Are Gold. Your Resume Doesn't Show It.");
  const [heroSubheadline, setHeroSubheadline] = useState("Turn your CGPA, branch-specific skills, and raw projects into ATS-ready, recruiter-approved resume content in 2 minutes. Trained on modern Indian tech hiring patterns.");
  const [ctaText, setCtaText] = useState("Build Resume Free");

  // Interactive Variant B (Dashboard) States
  const [bActiveTab, setBActiveTab] = useState<"details" | "projects" | "skills">("projects");
  const [bQuantified, setBQuantified] = useState(true);
  const [bKeywords, setBKeywords] = useState(true);
  const [bNoCanva, setBNoCanva] = useState(true);
  const [mobileTab, setMobileTab] = useState<"input" | "grader">("input");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSession(getLocalSession());
    
    // Log landing visit analytics
    try {
      let sid = localStorage.getItem("atslift_session_id");
      if (!sid) {
        sid = "session_" + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("atslift_session_id", sid);
      }
      fetch("/api/analytics/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sid,
          eventType: "LANDING_VISIT",
          page: "landing",
          metadata: { userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown" }
        })
      }).catch(err => console.error("Failed to log landing visit:", err));
    } catch (e) {
      console.error(e);
    }

    // Fetch active config dynamically from database
    fetch("/api/config")
      .then(res => res.json())
      .then(data => {
        if (data.activePrice) setPrice(data.activePrice);
        if (data.bannerText) setBannerText(data.bannerText);
        if (data.isBannerActive !== undefined) setIsBannerActive(data.isBannerActive);
        if (data.landingVariant) setLandingVariant(data.landingVariant);
        if (data.heroHeadline) setHeroHeadline(data.heroHeadline);
        if (data.heroSubheadline) setHeroSubheadline(data.heroSubheadline);
        if (data.ctaText) setCtaText(data.ctaText);
        if (data.badgeText) setBadgeText(data.badgeText);
        if (data.badgeText) setBadgeText(data.badgeText);
        setIsConfigLoaded(true);
      }).catch(err => {
        console.error("Failed to load config", err);
        setIsConfigLoaded(true);
      });
  }, []);

  // Scroll listener for sticky CTA
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      // Show sticky CTA after scrolling past the hero section
      const heroBottom = heroRef.current.getBoundingClientRect().bottom;
      if (heroBottom < 0) {
        setShowStickyCTA(true);
      } else {
        setShowStickyCTA(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        html, body {
          background-color: ${landingVariant === "dashboard" ? "#080b0c" : "#f7f6f2"} !important;
          color: ${landingVariant === "dashboard" ? "#eae9e5" : "#28251d"} !important;
          color-scheme: ${landingVariant === "dashboard" ? "dark" : "light"} !important;
        }
        
        :root {
          ${landingVariant === "dashboard" ? `
            --primary: #019b9c !important;
            --bg-base: #080b0c !important;
            --surface: #111618 !important;
            --text: #eae9e5 !important;
            --text-muted: #9f9d98 !important;
            --border: #20292b !important;
            --success: #10b981 !important;
            --warning: #f59e0b !important;
            --error: #ef4444 !important;
            --background: #080b0c !important;
            --foreground: #eae9e5 !important;
          ` : `
            --primary: #01696f !important;
            --bg-base: #f7f6f2 !important;
            --surface: #f9f8f5 !important;
            --text: #28251d !important;
            --text-muted: #7a7974 !important;
            --border: #d4d1ca !important;
            --success: #437a22 !important;
            --warning: #964219 !important;
            --error: #a12c7b !important;
            --background: #f7f6f2 !important;
            --foreground: #28251d !important;
          `}
        }
      `}} />
      <div className={`flex flex-col min-h-screen transition-opacity duration-300 font-sans ${
        landingVariant === "dashboard" ? "bg-[#080b0c] text-[#eae9e5] selection:bg-primary/30" : "bg-bg-base text-text selection:bg-primary/20"
      }`}>
      {isBannerActive && (
        <div className={`w-full text-center py-2 px-4 text-xs font-bold font-sans flex items-center justify-center gap-2 relative z-50 border-b ${
          landingVariant === "dashboard"
            ? "bg-primary/20 border-primary/20 text-[#00e1ec]"
            : "bg-primary/10 border-primary/20 text-primary"
        }`}>
          <span>{bannerText}</span>
        </div>
      )}
      
      {/* Mobile Sticky Bottom CTA */}
      <AnimatePresence>
        {showStickyCTA && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="md:hidden fixed bottom-0 left-0 right-0 z-[60] p-4 bg-surface/80 backdrop-blur-xl border-t border-border/50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
          >
            <Link
              href="/build"
              className="w-full flex items-center justify-center space-x-2 py-3.5 bg-primary text-white font-bold rounded-full shadow-lg"
            >
              <span>Build Resume Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-center mt-2 text-[10px] font-semibold text-text-muted">Takes 2 minutes • ₹{price} one-time fee</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`md:hidden fixed top-0 right-0 bottom-0 w-[85vw] max-w-sm z-[80] border-l flex flex-col shadow-2xl transition-colors duration-300 ${
                landingVariant === "dashboard"
                  ? "bg-[#0e1315] border-[#20292b] text-white"
                  : "bg-surface border-border/50 text-text"
              }`}
            >
              <div className={`flex items-center justify-between p-6 border-b transition-colors duration-300 ${
                landingVariant === "dashboard" ? "border-[#20292b]" : "border-border/40"
              }`}>
                <div className="flex items-center space-x-2">
                  <img src="/logo.png" alt="ATSLift Logo" className="w-8 h-8 rounded-md object-contain logo-rotated" />
                  <span className="font-bold text-lg tracking-tight font-sans">
                    ATS<span className="text-primary font-medium font-serif italic">Lift</span>
                  </span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2 rounded-full transition-colors ${
                    landingVariant === "dashboard"
                      ? "bg-white/5 text-[#9f9d98] hover:text-white"
                      : "bg-border/30 text-text-muted hover:text-text"
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto py-6 px-6 flex flex-col space-y-6">
                <nav className="flex flex-col space-y-4">
                  <Link 
                    href="/ats-check" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className={`text-lg font-bold flex items-center justify-between py-2 border-b transition-colors duration-300 ${
                      landingVariant === "dashboard"
                        ? "text-[#9f9d98] hover:text-[#00e1ec] border-[#20292b]"
                        : "text-text-muted hover:text-text border-border/30"
                    }`}
                  >
                    <span>ATS Grader Demo</span>
                    <ArrowRight className="w-4 h-4 opacity-50" />
                  </Link>
                  <Link 
                    href="/about" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className={`text-lg font-bold flex items-center justify-between py-2 border-b transition-colors duration-300 ${
                      landingVariant === "dashboard"
                        ? "text-[#9f9d98] hover:text-[#00e1ec] border-[#20292b]"
                        : "text-text-muted hover:text-text border-border/30"
                    }`}
                  >
                    <span>About Us</span>
                    <ArrowRight className="w-4 h-4 opacity-50" />
                  </Link>
                  <a 
                    href="#faq" 
                    onClick={() => { setMobileMenuOpen(false); document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }); }} 
                    className={`text-lg font-bold flex items-center justify-between py-2 border-b transition-colors duration-300 ${
                      landingVariant === "dashboard"
                        ? "text-[#9f9d98] hover:text-[#00e1ec] border-[#20292b]"
                        : "text-text-muted hover:text-text border-border/30"
                    }`}
                  >
                    <span>FAQ</span>
                    <ArrowRight className="w-4 h-4 opacity-50" />
                  </a>
                  {session ? (
                    <Link 
                      href="/dashboard" 
                      onClick={() => setMobileMenuOpen(false)} 
                      className={`text-lg font-bold flex items-center justify-between py-2 border-b transition-colors duration-300 ${
                        landingVariant === "dashboard"
                          ? "text-[#00e1ec] border-[#20292b] hover:text-[#00e1ec]/80"
                          : "text-primary border-border/30 hover:text-primary/80"
                      }`}
                    >
                      <span>Dashboard</span>
                      <ArrowRight className="w-4 h-4 opacity-50" />
                    </Link>
                  ) : (
                    <Link 
                      href="/login" 
                      onClick={() => setMobileMenuOpen(false)} 
                      className={`text-lg font-bold flex items-center justify-between py-2 border-b transition-colors duration-300 ${
                        landingVariant === "dashboard"
                          ? "text-[#9f9d98] hover:text-[#00e1ec] border-[#20292b]"
                          : "text-text-muted hover:text-text border-border/30"
                      }`}
                    >
                      <span>Log In</span>
                      <ArrowRight className="w-4 h-4 opacity-50" />
                    </Link>
                  )}
                </nav>
                
                <div className={`mt-auto pt-6 border-t transition-colors duration-300 ${
                  landingVariant === "dashboard" ? "border-[#20292b]" : "border-border/40"
                }`}>
                  <Link
                    href="/build"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center space-x-2 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/95 transition-all"
                  >
                    <span>Build Resume Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Premium Navbar */}
      <header className={`sticky top-0 z-50 px-6 py-4 flex items-center justify-between transition-colors duration-300 border-b ${
        landingVariant === "dashboard"
          ? "bg-[#080b0c]/85 border-[#20292b] backdrop-blur-md text-white shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
          : "glass-panel border-border/40 text-text"
      }`}>
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="ATSLift Logo" className="w-8 h-8 rounded-md object-contain logo-rotated" />
          <span className="font-bold text-lg tracking-tight font-sans">
            ATS<span className="text-primary font-medium font-serif italic">Lift</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center space-x-7">
          <Link href="/ats-check" className={`text-sm font-semibold transition-all hidden sm:flex items-center space-x-1.5 ${
            landingVariant === "dashboard" ? "text-[#9f9d98] hover:text-[#00e1ec]" : "text-text-muted hover:text-primary"
          }`}>
            <Sparkles className="w-4 h-4" />
            <span>ATS Check</span>
          </Link>
          {session ? (
            <Link href="/dashboard" className={`text-sm font-semibold transition-colors ${
              landingVariant === "dashboard" ? "text-[#9f9d98] hover:text-white" : "text-text-muted hover:text-text"
            }`}>
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className={`text-sm font-semibold transition-colors ${
              landingVariant === "dashboard" ? "text-[#9f9d98] hover:text-white" : "text-text-muted hover:text-text"
            }`}>
              Log In
            </Link>
          )}
          <Link
            href="/build"
            className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white text-sm font-bold rounded-full shadow-[0_4px_14px_0_rgba(1,105,111,0.39)] hover:shadow-[0_6px_20px_rgba(1,105,111,0.23)] hover:-translate-y-0.5 transition-all duration-300 flex items-center space-x-1.5"
          >
            <span>Build Resume Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center gap-3">
          <Link
            href="/build"
            className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-full shadow-sm"
          >
            Build Resume Free
          </Link>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className={`p-2 rounded-lg ${landingVariant === "dashboard" ? "text-white bg-white/5" : "text-text bg-border/30"}`}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {landingVariant === "dashboard" ? (
        <div className="flex-1 w-full bg-[#080b0c] text-[#eae9e5] min-h-screen py-16 flex flex-col gap-20 relative overflow-hidden font-sans bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:30px_30px]">
          {/* Organic floating mesh glow blurs for maximum wow factor */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[160px] pointer-events-none animate-pulse duration-[12000ms]" />
          <div className="absolute top-[10%] right-[-100px] w-[600px] h-[600px] bg-[#00e1ec]/8 rounded-full blur-[180px] pointer-events-none animate-pulse duration-[10000ms]" />
          <div className="absolute bottom-1/4 left-[-150px] w-[500px] h-[500px] bg-emerald-500/4 rounded-full blur-[150px] pointer-events-none" />

          {/* ── SECTION 1: PROFESSIONAL HERO HEADER ── */}
          <div ref={heroRef} className="text-center space-y-6 max-w-4xl mx-auto relative z-10 px-4 animate-fadeIn flex flex-col items-center justify-center min-h-[calc(100dvh-150px)]">
            {/* Floating SDE Candidate Portal Badge */}
            <div className="inline-flex items-center space-x-2 px-4.5 py-2.5 rounded-full border border-[#00e1ec]/30 bg-[#00e1ec]/5 text-[10px] font-black tracking-widest text-[#00e1ec] uppercase shadow-[0_0_30px_rgba(0,225,236,0.15),inset_0_1px_rgba(255,255,255,0.05)] hover:border-[#00e1ec]/50 hover:bg-[#00e1ec]/10 hover:scale-105 transition-all duration-300 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#00e1ec] animate-spin-slow" />
              <span>{badgeText}</span>
            </div>

            {/* Glowing Headline */}
            <h1 className="text-4xl md:text-7xl font-serif tracking-tight text-white leading-tight font-extralight max-w-4xl mx-auto drop-shadow-md">
              {heroHeadline.includes(".") ? (
                <>
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-[#eae9e5]">{heroHeadline.split(".")[0]}.</span>{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#00e1ec] to-success font-normal italic drop-shadow-[0_2px_15px_rgba(0,225,236,0.25)]">
                    {heroHeadline.split(".")[1]}
                  </span>
                </>
              ) : (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#eae9e5] to-[#00e1ec] font-bold">
                  {heroHeadline}
                </span>
              )}
            </h1>

            {/* Subheading */}
            <p className="text-base md:text-lg text-[#9f9d98] leading-relaxed max-w-2xl mx-auto font-semibold">
              {heroSubheadline}
            </p>

            {/* Hero Trust Badge Stats Row */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-5 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[#eae9e5]/80 pt-4">
              <span className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#111618]/80 border border-[#20292b] min-h-[44px] px-4 py-2 rounded-xl sm:rounded-full shadow-[inset_0_1px_rgba(255,255,255,0.03)] hover:border-primary/30 transition-colors duration-300">
                <Check className="w-3.5 h-3.5 text-[#00e1ec]" />
                <span>100% SDE Optimized</span>
              </span>
              <span className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#111618]/80 border border-[#20292b] min-h-[44px] px-4 py-2 rounded-xl sm:rounded-full shadow-[inset_0_1px_rgba(255,255,255,0.03)] hover:border-success/30 transition-colors duration-300">
                <ShieldCheck className="w-3.5 h-3.5 text-success" />
                <span>Razorpay Secured</span>
              </span>
              <span className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#111618]/80 border border-[#20292b] min-h-[44px] px-4 py-2 rounded-xl sm:rounded-full shadow-[inset_0_1px_rgba(255,255,255,0.03)] hover:border-warning/30 transition-colors duration-300">
                <Flame className="w-3.5 h-3.5 text-warning animate-pulse" />
                <span>2-Min Generation</span>
              </span>
            </div>
          </div>
          
          {/* Mobile Social Proof Ticker */}
          <div className="md:hidden w-full overflow-hidden border-y border-[#20292b] bg-[#111618]/60 py-3 relative z-10">
            <div className="flex whitespace-nowrap animate-marquee">
              <div className="flex gap-8 items-center text-[10px] font-bold text-[#eae9e5]/80 tracking-wider">
                <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-warning" /> VIT student just unlocked a resume</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-success" /> NIT Trichy candidate scored 94 ATS</span>
                <span className="flex items-center gap-1.5"><Flame className="w-3 h-3 text-primary" /> BITS Pilani student generated their resume</span>
                {/* Duplicate for infinite loop illusion */}
                <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-warning" /> VIT student just unlocked a resume</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-success" /> NIT Trichy candidate scored 94 ATS</span>
                <span className="flex items-center gap-1.5"><Flame className="w-3 h-3 text-primary" /> BITS Pilani student generated their resume</span>
              </div>
            </div>
          </div>

          {/* ── SECTION 2: INTERACTIVE ATS WORKSPACE SIMULATOR ── */}
          <div className="max-w-6xl mx-auto w-full px-4 md:px-6 relative z-10 space-y-6">
            <div className="text-center md:text-left space-y-1">
              <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-wider">1. Try the Interactive Resume Grader</h2>
              <p className="text-xs text-[#9f9d98]">Input your details on the left, choose enhancements, and watch your ATS compatibility score rise on the right.</p>
            </div>

            {/* DESKTOP LAYOUT (100% UNCHANGED) */}
            <div className="hidden md:grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-[#111618]/90 border border-primary/20 rounded-3xl p-4 md:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
              {/* Left Column: Mock Workbench inputs (5 cols) */}
              <div className="lg:col-span-5 bg-[#0a0d0e]/60 border border-[#20292b] rounded-2xl p-5 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#20292b] pb-3 flex-wrap gap-2 text-left">
                    <div>
                      <span className="text-[9px] font-black text-[#00e1ec] tracking-widest uppercase block">Workbench Input</span>
                      <h4 className="text-xs font-bold text-white">Student Details</h4>
                    </div>
                    <div className="flex gap-1 text-[9px] font-bold uppercase tracking-wider">
                      {["details", "projects", "skills"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setBActiveTab(tab as any)}
                          className={`px-2.5 py-1.5 rounded-md border transition-all cursor-pointer ${
                            bActiveTab === tab
                              ? "bg-primary text-white border-primary"
                              : "bg-[#111618] border-[#20292b] text-[#9f9d98] hover:border-primary/50"
                          }`}
                        >
                          {tab === "details" ? "My Profile" : tab === "projects" ? "My Project" : "My Skills"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tab content 1: Details */}
                  {bActiveTab === "details" && (
                    <div className="space-y-3.5 text-left animate-fadeIn">
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-extrabold text-[#7a7974] uppercase">Target Job Role</span>
                        <div className="w-full h-9 px-3 rounded-lg border border-[#20292b] bg-[#111618] text-xs font-semibold text-[#eae9e5] flex items-center">
                          Software Development Engineer (SDE)
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-extrabold text-[#7a7974] uppercase">Engineering Branch</span>
                        <div className="w-full h-9 px-3 rounded-lg border border-[#20292b] bg-[#111618] text-xs font-semibold text-[#eae9e5] flex items-center">
                          Computer Science & Engineering (CSE)
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-extrabold text-[#7a7974] uppercase">CGPA</span>
                        <div className="w-full h-9 px-3 rounded-lg border border-[#20292b] bg-[#111618] text-xs font-semibold text-[#eae9e5] flex items-center font-mono">
                          8.32 / 10.0
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab content 2: Projects */}
                  {bActiveTab === "projects" && (
                    <div className="space-y-3.5 text-left animate-fadeIn">
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-extrabold text-[#7a7974] uppercase">Project Title</span>
                        <div className="w-full h-9 px-3 rounded-lg border border-[#20292b] bg-[#111618] text-xs font-semibold text-[#eae9e5] flex items-center">
                          AI Customer Support Chatbot
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-extrabold text-[#7a7974] uppercase">Your Basic Project Description</span>
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
                        <span className="text-[9px] font-extrabold text-[#7a7974] uppercase block">Programming Languages</span>
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
                  <span className="text-[9px] font-black text-[#7a7974] uppercase tracking-wider block mb-2">Build Controls</span>
                  <Link
                    href="/build"
                    className="w-full h-11 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>{ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Live ATS scorecard & grader (7 cols) */}
              <div className="lg:col-span-7 border border-[#20292b] bg-[#0a0d0e]/60 rounded-2xl p-5 flex flex-col justify-between space-y-6 relative overflow-hidden">
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-[#20292b] pb-3">
                    <div className="text-left">
                      <span className="text-[9px] font-extrabold text-success tracking-widest uppercase block">Live Scoring</span>
                      <h3 className="text-sm font-bold text-white">Parser Compatibility Results</h3>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#00e1ec] bg-[#00e1ec]/10 border border-[#00e1ec]/30 px-2.5 py-1 rounded-full uppercase">
                      Automatic Grader
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
                      <span className="text-[8.5px] font-black text-[#7a7974] uppercase tracking-widest block">Choose Enhancements</span>
                      <div className="space-y-1.5 text-xs font-semibold text-[#eae9e5]">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={bQuantified}
                            onChange={(e) => setBQuantified(e.target.checked)}
                            className="w-4 h-4 text-primary accent-primary rounded cursor-pointer shrink-0"
                          />
                          <span>Add performance metrics (+15 pts)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={bKeywords}
                            onChange={(e) => setBKeywords(e.target.checked)}
                            className="w-4 h-4 text-primary accent-primary rounded cursor-pointer shrink-0"
                          />
                          <span>Inject programming keywords (+16 pts)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={bNoCanva}
                            onChange={(e) => setBNoCanva(e.target.checked)}
                            className="w-4 h-4 text-primary accent-primary rounded cursor-pointer shrink-0"
                          />
                          <span>Clean up structure formatting (+20 pts)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Transformed Resume preview block */}
                  <div className="space-y-2 text-left bg-[#111618]/50 border border-[#20292b] rounded-xl p-4 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-extrabold text-[#00e1ec] uppercase">Optimized Resume Bullet Preview</span>
                      <span className="text-[9px] font-mono font-bold text-[#9f9d98] bg-[#0a0d0e] border border-[#20292b] px-1.5 py-0.5 rounded">
                        PDF Format
                      </span>
                    </div>
                    
                    {/* Dynamic bullet text depending on toggles */}
                    <div className="text-xs md:text-sm font-medium leading-relaxed min-h-12 flex items-center justify-start text-[#eae9e5] border border-dashed border-[#20292b] p-3 rounded-lg bg-[#0a0d0e] font-mono">
                      {bQuantified && bKeywords ? (
                        <p>
                          • Built an AI customer support bot using <strong className="text-[#00e1ec] font-bold">FastAPI</strong>, <strong className="text-[#00e1ec] font-bold">Python</strong>, and <strong className="text-[#00e1ec] font-bold">OpenAI GPT-4</strong> API, reducing load times by <strong className="text-success underline font-bold">40%</strong> and managing 200+ active user sessions.
                        </p>
                      ) : bQuantified ? (
                        <p>
                          • Developed a customer support bot in Python using OpenAI API, managing queries efficiently and improving response times by <strong className="text-success underline font-bold">40%</strong>.
                        </p>
                      ) : bKeywords ? (
                        <p>
                          • Designed an AI chatbot using <strong className="text-[#00e1ec] font-bold">FastAPI</strong> and <strong className="text-[#00e1ec] font-bold">OpenAI API</strong> to automate support question resolving.
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
                    <span>₹{price} to unlock complete text</span>
                  </span>
                  <span>• 3 Free AI Adjustments included</span>
                  <span>• Secure payments via Razorpay</span>
                </div>
              </div>
            </div>

            {/* MOBILE REDESIGNED LAYOUT (SUPER EASY TO USE - REDESIGNED 📱) */}
            <div className="md:hidden grid grid-cols-1 gap-6 bg-[#111618]/90 border border-primary/20 rounded-3xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
              {/* Touch-optimized Tabs */}
              <div className="grid grid-cols-2 gap-2 bg-[#0a0d0e]/60 border border-[#20292b] p-1.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMobileTab("input")}
                  className={`py-3.5 text-xs font-bold rounded-lg transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                    mobileTab === "input"
                      ? "bg-primary text-white"
                      : "text-[#9f9d98] hover:text-white"
                  }`}
                >
                  <span>📝 Mock Inputs</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileTab("grader")}
                  className={`py-3.5 text-xs font-bold rounded-lg transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                    mobileTab === "grader"
                      ? "bg-primary text-white"
                      : "text-[#9f9d98] hover:text-white"
                  }`}
                >
                  <span>📊 Live Grader</span>
                </button>
              </div>

              {/* View 1: Workbench Input */}
              {mobileTab === "input" && (
                <div className="bg-[#0a0d0e]/60 border border-[#20292b] rounded-2xl p-4 flex flex-col space-y-5 text-left animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-[#20292b] pb-3 flex-wrap gap-2">
                    <div>
                      <span className="text-[9px] font-black text-[#00e1ec] tracking-widest uppercase block">Mock Workbench</span>
                      <h4 className="text-xs font-bold text-white">Fill Academic Profile</h4>
                    </div>
                    <div className="flex gap-1 text-[9px] font-bold uppercase tracking-wider">
                      {["details", "projects", "skills"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setBActiveTab(tab as any)}
                          className={`px-3 py-1.5 min-h-[40px] flex items-center justify-center rounded transition-all cursor-pointer ${
                            bActiveTab === tab
                              ? "bg-primary text-white font-bold"
                              : "bg-[#111618] border border-[#20292b] text-[#9f9d98]"
                          }`}
                        >
                          {tab === "details" ? "Profile" : tab === "projects" ? "Project" : "Skills"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {bActiveTab === "details" && (
                    <div className="space-y-3.5 text-left animate-fadeIn">
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-extrabold text-[#7a7974] uppercase">Target Job Role</span>
                        <div className="w-full h-10 px-3 rounded-lg border border-[#20292b] bg-[#111618] text-xs font-semibold text-[#eae9e5] flex items-center">
                          Software Development Engineer (SDE)
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-extrabold text-[#7a7974] uppercase">Engineering Branch</span>
                        <div className="w-full h-10 px-3 rounded-lg border border-[#20292b] bg-[#111618] text-xs font-semibold text-[#eae9e5] flex items-center">
                          Computer Science & Engineering (CSE)
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-extrabold text-[#7a7974] uppercase">CGPA</span>
                        <div className="w-full h-10 px-3 rounded-lg border border-[#20292b] bg-[#111618] text-xs font-semibold text-[#eae9e5] flex items-center font-mono">
                          8.32 / 10.0
                        </div>
                      </div>
                    </div>
                  )}

                  {bActiveTab === "projects" && (
                    <div className="space-y-3.5 text-left animate-fadeIn">
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-extrabold text-[#7a7974] uppercase">Project Title</span>
                        <div className="w-full h-10 px-3 rounded-lg border border-[#20292b] bg-[#111618] text-xs font-semibold text-[#eae9e5] flex items-center">
                          AI Customer Support Chatbot
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-extrabold text-[#7a7974] uppercase">Basic Raw Project Description</span>
                        <textarea
                          readOnly
                          value="I created a chatbot using OpenAI API and Python. I set up a server in FastAPI to run queries. It helps answer customer questions fast."
                          className="w-full h-24 p-3 rounded-lg border border-[#20292b] bg-[#111618] text-xs font-medium text-[#9f9d98] outline-hidden resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  )}

                  {bActiveTab === "skills" && (
                    <div className="space-y-3.5 text-left animate-fadeIn">
                      <div className="space-y-2">
                        <span className="text-[9px] font-extrabold text-[#7a7974] uppercase block">Programming Languages</span>
                        <div className="flex flex-wrap gap-1.5">
                          {["Python", "TypeScript", "C++", "SQL"].map((l) => (
                            <span key={l} className="px-2.5 py-1.5 bg-[#111618] border border-[#20292b] rounded text-[10px] font-semibold text-[#eae9e5]">
                              {l}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[9px] font-extrabold text-[#7a7974] uppercase block">Frameworks & Tools</span>
                        <div className="flex flex-wrap gap-1.5">
                          {["FastAPI", "React.js", "Docker", "LangChain", "Git"].map((f) => (
                            <span key={f} className="px-2.5 py-1.5 bg-[#111618] border border-[#20292b] rounded text-[10px] font-semibold text-[#eae9e5]">
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-[#20292b] pt-4 mt-2 flex gap-2">
                    <Link
                      href="/ats-check"
                      className={`h-12 px-4 rounded-xl transition-all flex items-center justify-center space-x-1.5 border shadow-sm ${
                        landingVariant === "dashboard" ? "text-[#00e1ec] border-[#00e1ec]/30 bg-[#00e1ec]/10 hover:bg-[#00e1ec]/20" : "text-primary border-primary/30 bg-primary/10 hover:bg-primary/20"
                      }`}
                      title="ATS Check"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span className="text-xs font-bold whitespace-nowrap">ATS Score</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setMobileTab("grader")}
                      className="flex-1 h-12 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                    >
                      <span>Live Score</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* View 2: Grader Outcome */}
              {mobileTab === "grader" && (
                <div className="bg-[#0a0d0e]/60 border border-[#20292b] rounded-2xl p-4 flex flex-col space-y-5 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-[#20292b] pb-3 text-left">
                    <div>
                      <span className="text-[9px] font-extrabold text-success tracking-widest uppercase block">Live Scoring</span>
                      <h3 className="text-xs font-bold text-white">Parser Compatibility Results</h3>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[8px] font-bold text-[#00e1ec] bg-[#00e1ec]/10 border border-[#00e1ec]/30 px-2 py-0.5 rounded-full uppercase">
                      Automatic Grader
                    </span>
                  </div>

                  {/* Circular Score */}
                  <div className="flex items-center gap-4 bg-[#111618]/70 border border-[#20292b] rounded-xl p-3.5 text-left">
                    <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="26" strokeWidth="4" stroke="#1d2527" fill="transparent" />
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          strokeWidth="4.5"
                          stroke={
                            (48 + (bQuantified ? 15 : 0) + (bKeywords ? 16 : 0) + (bNoCanva ? 20 : 0)) >= 85
                              ? "#10b981"
                              : "#f59e0b"
                          }
                          fill="transparent"
                          strokeDasharray="163.3"
                          strokeDashoffset={163.3 - (163.3 * (48 + (bQuantified ? 15 : 0) + (bKeywords ? 16 : 0) + (bNoCanva ? 20 : 0))) / 100}
                          className="transition-all duration-500 ease-out score-glow"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-xl font-black font-mono leading-none text-white">
                          {48 + (bQuantified ? 15 : 0) + (bKeywords ? 16 : 0) + (bNoCanva ? 20 : 0)}
                        </span>
                        <span className="text-[7px] font-bold text-[#9f9d98] uppercase tracking-wider mt-0.5">Score</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-left flex-1">
                      <span className="text-[8px] font-black text-[#7a7974] uppercase tracking-widest block">Choose Enhancements</span>
                      <div className="space-y-1.5 text-[11px] font-bold text-[#eae9e5]">
                        <label className="flex items-center gap-2 cursor-pointer select-none py-1 touch-feedback">
                          <input
                            type="checkbox"
                            checked={bQuantified}
                            onChange={(e) => setBQuantified(e.target.checked)}
                            className="w-5 h-5 text-primary accent-primary rounded cursor-pointer shrink-0"
                          />
                          <span>Add metrics (+15 pts)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer select-none py-1 touch-feedback">
                          <input
                            type="checkbox"
                            checked={bKeywords}
                            onChange={(e) => setBKeywords(e.target.checked)}
                            className="w-5 h-5 text-primary accent-primary rounded cursor-pointer shrink-0"
                          />
                          <span>Inject tech words (+16 pts)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer select-none py-1 touch-feedback">
                          <input
                            type="checkbox"
                            checked={bNoCanva}
                            onChange={(e) => setBNoCanva(e.target.checked)}
                            className="w-5 h-5 text-primary accent-primary rounded cursor-pointer shrink-0"
                          />
                          <span>ATS formatting (+20 pts)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Bullet Preview */}
                  <div className="space-y-2 text-left bg-[#111618]/50 border border-[#20292b] rounded-xl p-3">
                    <span className="text-[9px] font-extrabold text-[#00e1ec] uppercase block">Optimized Bullet Preview</span>
                    <div className="text-xs font-semibold leading-relaxed p-3 rounded-lg bg-[#0a0d0e] font-mono text-[#eae9e5] border border-dashed border-[#20292b]">
                      {bQuantified && bKeywords ? (
                        <p>
                          • Built an AI customer support bot using <strong className="text-[#00e1ec] font-bold">FastAPI</strong>, <strong className="text-[#00e1ec] font-bold">Python</strong>, and <strong className="text-[#00e1ec] font-bold">OpenAI GPT-4</strong> API, reducing load times by <strong className="text-success underline font-bold">40%</strong> and managing 200+ active user sessions.
                        </p>
                      ) : bQuantified ? (
                        <p>
                          • Developed a customer support bot in Python using OpenAI API, managing queries efficiently and improving response times by <strong className="text-success underline font-bold">40%</strong>.
                        </p>
                      ) : bKeywords ? (
                        <p>
                          • Designed an AI chatbot using <strong className="text-[#00e1ec] font-bold">FastAPI</strong> and <strong className="text-[#00e1ec] font-bold">OpenAI API</strong> to automate support question resolving.
                        </p>
                      ) : (
                        <p className="text-[#7a7974] italic">
                          • I created a chatbot using OpenAI API and Python to answer customer support questions.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-[#20292b] pt-4 mt-2 flex gap-2">
                    <Link
                      href="/ats-check"
                      className={`h-12 px-4 rounded-xl transition-all flex items-center justify-center space-x-1.5 border shadow-sm ${
                        landingVariant === "dashboard" ? "text-[#00e1ec] border-[#00e1ec]/30 bg-[#00e1ec]/10 hover:bg-[#00e1ec]/20" : "text-primary border-primary/30 bg-primary/10 hover:bg-primary/20"
                      }`}
                      title="ATS Check"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span className="text-xs font-bold whitespace-nowrap">ATS Score</span>
                    </Link>
                    <Link
                      href="/build"
                      className="flex-1 h-12 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                    >
                      <span>Start</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── SECTION 3: HOW IT WORKS (SIMPLE 3 STEPS) ── */}
          <div id="about" className="max-w-5xl mx-auto w-full px-4 md:px-6 py-4 relative z-10 text-center space-y-8">
            <div className="space-y-1">
              <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-wider">2. Simple Three-Step Process</h2>
              <p className="text-xs text-[#9f9d98] max-w-md mx-auto leading-relaxed">
                Create a high-scoring, professional engineering resume in three quick steps.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-[#111618]/50 border border-[#20292b] rounded-2xl p-6 space-y-4 hover:-translate-y-1 hover:border-primary/45 hover:bg-[#111618]/70 shadow-[inset_0_1px_rgba(255,255,255,0.03),0_4px_20px_rgba(0,0,0,0.15)] transition-all duration-300">
                <span className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 text-[#00e1ec] font-bold flex items-center justify-center text-xs shadow-inner">
                  1
                </span>
                <h4 className="font-bold text-sm text-white tracking-wide">Enter Projects & Skills</h4>
                <p className="text-xs text-[#9f9d98] leading-relaxed font-medium">
                  Type in your college projects, branch, and programming languages. Simple, unedited descriptions are perfect.
                </p>
              </div>

              <div className="bg-[#111618]/50 border border-[#20292b] rounded-2xl p-6 space-y-4 hover:-translate-y-1 hover:border-[#00e1ec]/45 hover:bg-[#111618]/70 shadow-[inset_0_1px_rgba(255,255,255,0.03),0_4px_20px_rgba(0,0,0,0.15)] transition-all duration-300">
                <span className="w-9 h-9 rounded-full bg-[#00e1ec]/10 border border-[#00e1ec]/20 text-[#00e1ec] font-bold flex items-center justify-center text-xs shadow-inner">
                  2
                </span>
                <h4 className="font-bold text-sm text-white tracking-wide">AI Grader Evaluates</h4>
                <p className="text-xs text-[#9f9d98] leading-relaxed font-medium">
                  Our algorithm reviews your text, injects critical technical keywords, and calculates a dynamic ATS score.
                </p>
              </div>

              <div className="bg-[#111618]/50 border border-[#20292b] rounded-2xl p-6 space-y-4 hover:-translate-y-1 hover:border-success/45 hover:bg-[#111618]/70 shadow-[inset_0_1px_rgba(255,255,255,0.03),0_4px_20px_rgba(0,0,0,0.15)] transition-all duration-300">
                <span className="w-9 h-9 rounded-full bg-success/10 border border-success/20 text-[#00e1ec] font-bold flex items-center justify-center text-xs shadow-inner">
                  3
                </span>
                <h4 className="font-bold text-sm text-white tracking-wide">Unlock & Download</h4>
                <p className="text-xs text-[#9f9d98] leading-relaxed font-medium">
                  Check your free circular score. Pay a one-time fee of ₹{price} to unlock the complete optimized content.
                </p>
              </div>
            </div>
          </div>

          {/* ── SECTION 4: WHAT RECRUITERS ACTUALLY SCAN FOR ── */}
          <div className="max-w-5xl mx-auto w-full px-4 md:px-6 py-4 relative z-10 space-y-6">
            <div className="text-center md:text-left space-y-1">
              <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-wider">3. What Engineering Recruiters Scan For</h2>
              <p className="text-xs text-[#9f9d98]">Most recruiters spend less than 10 seconds reviewing a resume. Here is exactly what they seek.</p>
            </div>

            <div className="bg-[#111618]/50 border border-[#20292b] rounded-3xl p-6 md:p-8 shadow-[inset_0_1px_rgba(255,255,255,0.03),0_4px_30px_rgba(0,0,0,0.2)] hover:border-primary/30 transition-colors duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs font-semibold text-left">
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-[#00e1ec] flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-[#00e1ec] p-0.5 bg-[#00e1ec]/10 rounded-full" /> Hard Skills
                  </h4>
                  <p className="text-[#9f9d98] leading-relaxed font-medium">
                    Programming languages, framework libraries (like FastAPI, React), database configurations, and deployment tools.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-[#00e1ec] flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-[#00e1ec] p-0.5 bg-[#00e1ec]/10 rounded-full" /> Quantifiable Results
                  </h4>
                  <p className="text-[#9f9d98] leading-relaxed font-medium">
                    Numbers showing system speed improvements, user active sessions, or calculated percentages to demonstrate value.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-[#00e1ec] flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-[#00e1ec] p-0.5 bg-[#00e1ec]/10 rounded-full" /> Simple Formatting
                  </h4>
                  <p className="text-[#9f9d98] leading-relaxed font-medium">
                    Strict single-column text structures that company scanning algorithms can index with 100% compliance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── SECTION 5: WHY CANVA / DOCX RESUMES FAIL ── */}
          <div className="max-w-5xl mx-auto w-full px-4 md:px-6 py-4 relative z-10 space-y-6">
            <div className="text-center md:text-left space-y-1">
              <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-wider">4. Why Graphic Templates Fail</h2>
              <p className="text-xs text-[#9f9d98]">Standard design builders like Canva block screeners using multi-column tables and generic descriptions.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto font-medium">
              {/* Canva */}
              <div className="border border-[#20292b] bg-[#111618]/30 rounded-2xl p-6 relative shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:border-error/30 transition-all duration-300">
                <div className="absolute top-4 right-4 inline-block text-[9px] font-extrabold tracking-wider text-error bg-error/10 border border-error/25 px-2.5 py-1 rounded-full uppercase">
                  Legacy Formats
                </div>
                <h3 className="font-bold text-xs tracking-wide text-error mb-5 uppercase">Standard Canva Formats</h3>
                
                <div className="space-y-4 text-left text-xs">
                  <div className="p-4 bg-[#0a0d0e]/60 rounded-xl border border-[#20292b] shadow-inner">
                    <span className="font-bold block text-[10px] text-[#7a7974] mb-1 uppercase tracking-wider">COMPLEX GRAPHICS</span>
                    <p className="text-error font-mono leading-relaxed italic">
                      [Parser Error: Tables and complex columns detect as corrupted blocks or skipped entirely by system.]
                    </p>
                  </div>
                  <div className="p-4 bg-[#0a0d0e]/60 rounded-xl border border-[#20292b] shadow-inner">
                    <span className="font-bold block text-[10px] text-[#7a7974] mb-1 uppercase tracking-wider">GENERIC PHRASING</span>
                    <p className="text-[#eae9e5]/80 italic">
                      &quot;Worked at a startup building APIs and backend queries.&quot; (Generic phrasing, no technical keywords)
                    </p>
                  </div>
                </div>
              </div>

              {/* ATSLift */}
              <div className="border-2 border-primary bg-[#111618]/50 rounded-2xl p-6 relative shadow-[0_0_35px_rgba(0,225,236,0.15),inset_0_1px_rgba(255,255,255,0.03)] hover:border-[#00e1ec] transition-all duration-300">
                <div className="absolute top-4 right-4 inline-block text-[9px] font-extrabold tracking-wider text-success bg-success/15 border border-success/25 px-2.5 py-1 rounded-full uppercase">
                  ATSLift Format
                </div>
                <h3 className="font-bold text-xs tracking-wide text-[#00e1ec] mb-5 uppercase">ATS Compliant Formats</h3>

                <div className="space-y-4 text-left text-xs">
                  <div className="p-4 bg-[#0a0d0e]/60 rounded-xl border border-primary/20 shadow-inner">
                    <span className="font-bold block text-[10px] text-primary mb-1 uppercase tracking-wider">quantified achievements</span>
                    <p className="text-[#eae9e5]">
                      • Optimized relational queries in <strong className="text-[#00e1ec] font-bold">PostgreSQL</strong>, decreasing query execution latency by <strong className="text-success font-bold">35%</strong>.
                    </p>
                  </div>
                  <div className="p-4 bg-[#0a0d0e]/60 rounded-xl border border-primary/20 shadow-inner">
                    <span className="font-bold block text-[10px] text-primary mb-1 uppercase tracking-wider">HIGH-SIGNAL TECH STACK</span>
                    <p className="text-[#eae9e5]">
                      • Built and containerized backend services using <strong className="text-[#00e1ec] font-bold">Docker</strong> and <strong className="text-[#00e1ec] font-bold">FastAPI</strong> for 5,000+ daily active users.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── SECTION 6: GUARANTEES & PAYWALL UNLOCK ── */}
          <div className="max-w-5xl mx-auto w-full px-4 md:px-6 py-4 relative z-10 text-center">
            <div className="bg-gradient-to-b from-[#111618]/90 to-[#0a0d0e] border border-primary/20 rounded-3xl p-8 md:p-12 space-y-8 relative overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.4),inset_0_1px_rgba(255,255,255,0.03)]">
              <div className="absolute -right-24 -top-24 w-80 h-80 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute -left-24 -bottom-24 w-80 h-80 bg-[#00e1ec]/5 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="space-y-4 max-w-2xl mx-auto relative z-10">
                <div className="inline-flex items-center gap-1.5 bg-success/15 border border-success/30 px-3 py-1.5 rounded-full text-[9px] font-extrabold uppercase text-[#10b981] tracking-widest shadow-xs mx-auto mb-2 backdrop-blur-md">
                  <ShieldCheck className="w-4 h-4" /> Compliance Guarantee
                </div>
                <h2 className="text-2xl md:text-4.5xl font-serif italic text-white leading-tight font-light">
                  Simple payment. <br />
                  Placement-ready resume text.
                </h2>
                <p className="text-xs md:text-sm text-[#9f9d98] font-semibold max-w-md mx-auto leading-relaxed">
                  Join thousands of students who bypassed automatic CV filters. Pay a one-time fee of ₹{price} once you review the score.
                </p>
              </div>

              {/* standard vs premium grid */}
              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left text-xs font-semibold relative z-10">
                <div className="border border-[#20292b] bg-[#0a0d0e]/60 rounded-2xl p-6 space-y-4 hover:border-primary/20 transition-colors duration-300 shadow-inner">
                  <span className="text-[10px] font-black text-[#7a7974] tracking-widest uppercase">Free Preview Includes</span>
                  <ul className="space-y-2.5 text-[#9f9d98]">
                    <li className="flex items-center gap-2">❌ High-scoring, copyable resume bullets</li>
                    <li className="flex items-center gap-2">❌ Tailoring tool for specific job openings</li>
                    <li className="flex items-center gap-2">❌ Direct formatting strings export</li>
                    <li className="flex items-center gap-2 text-[#eae9e5]">✓ Circular ATS score compatability rating</li>
                    <li className="flex items-center gap-2 text-[#eae9e5]">✓ Basic resume structure checklist</li>
                  </ul>
                </div>

                <div className="border-2 border-primary bg-[#111618] rounded-2xl p-6 space-y-4 shadow-[0_0_30px_rgba(1,105,111,0.25),inset_0_1px_rgba(255,255,255,0.03)] relative hover:border-[#00e1ec] transition-colors duration-300">
                  <div className="absolute top-4 right-4 inline-block text-[8px] font-black tracking-widest text-[#00e1ec] bg-[#00e1ec]/10 border border-[#00e1ec]/20 px-2.5 py-1 rounded-full uppercase">
                    Recommended
                  </div>
                  <span className="text-[10px] font-black text-[#00e1ec] tracking-widest uppercase">Premium Unlock Includes</span>
                  <ul className="space-y-2.5 text-[#eae9e5]">
                    <li className="flex items-center gap-2 text-success">✓ Copy-ready optimized technical bullets</li>
                    <li className="flex items-center gap-2 text-success">✓ 3 Free AI adjustments for custom job targets</li>
                    <li className="flex items-center gap-2 text-success">✓ Industry-recognized keywords injected</li>
                    <li className="flex items-center gap-2 text-success">✓ Strict ATS-compliant format</li>
                    <li className="flex items-center gap-2 text-success">✓ Money-back compliance guarantee</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 max-w-md mx-auto relative z-10">
                <Link
                  href="/build"
                  className="w-full h-12 bg-primary hover:bg-primary/95 hover:scale-[1.01] text-white font-bold text-sm rounded-full transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-[0_4px_20px_rgba(1,105,111,0.35)]"
                >
                  <span>{ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <span className="text-[9px] font-bold text-[#7a7974] uppercase tracking-wider block mt-3">
                  ₹{price} One-time Fee • Secure Checkout • Instant Access
                </span>
              </div>
            </div>
          </div>

          {/* ── SECTION 7: CAMPUS PLACEMENTS FAQS ── */}
          <div id="faq" className="max-w-3xl mx-auto w-full px-4 md:px-6 py-4 relative z-10 text-left">
            <h3 className="text-xl md:text-2xl font-serif text-white text-center mb-8">
              Frequently Asked Questions
            </h3>
            
            <div className="space-y-4">
              {[
                {
                  q: "How does the SDE keyword optimization work?",
                  a: "Our AI model reviews your project descriptions and maps generic phrases to key libraries and frameworks (like LangChain, FastAPI, or Docker). This ensures your resume matches what tech recruiters seek."
                },
                {
                  q: "Why should I avoid Canva resume templates?",
                  a: "Many company scanning systems struggle to parse multi-column layouts, visual charts, or complex graphical tables. Our strict, single-column plain text format is fully readable by corporate parser systems."
                },
                {
                  q: "What does the one-time payment unlock?",
                  a: "The small one-time payment unlocks the complete optimized copy-ready text, provides 3 additional free custom edits to target specific jobs, and includes 100% money-back compliance coverage."
                }
              ].map((faqItem, idx) => (
                <div key={idx} className="border border-[#20292b] bg-[#111618]/30 rounded-2xl p-5 hover:border-primary/30 hover:bg-[#111618]/50 shadow-[inset_0_1px_rgba(255,255,255,0.02)] transition-all duration-300">
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
              <span>{badgeText}</span>
            </div>

            {/* Hero Title */}
            <h1 className="text-4xl md:text-7xl font-serif tracking-tight text-text leading-[1.08] max-w-3xl mb-6">
              {heroHeadline}
            </h1>

            {/* Subtitle */}
            <p className="text-base md:text-lg text-text-muted max-w-xl mb-10 leading-relaxed">
              {heroSubheadline}
            </p>

            {/* CTA Area */}
            <div className="flex flex-col items-center space-y-4 mb-12">
              <div className="flex items-center gap-2 w-full max-w-sm justify-center px-4">
                <Link
                  href="/ats-check"
                  className="md:hidden flex items-center justify-center space-x-1.5 px-5 py-4 bg-primary/10 text-primary border border-primary/20 rounded-full shadow-sm hover:bg-primary/20 transition-all"
                  title="ATS Check"
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-bold whitespace-nowrap">ATS Score</span>
                </Link>
                <Link
                  href="/build"
                  className="group flex-1 md:flex-none px-6 md:px-8 py-4 bg-primary hover:bg-primary/95 text-white text-base font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                >
                  <span className="whitespace-nowrap hidden md:inline">Build Resume Free</span>
                  <span className="whitespace-nowrap md:hidden">Start</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
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

              <div className="max-md:flex max-md:overflow-x-auto max-md:snap-x max-md:snap-mandatory max-md:gap-4 max-md:-mx-6 max-md:px-6 max-md:pb-6 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto [scrollbar-width:none]">
                {/* Left Card: Input */}
                <div className="max-md:min-w-[85vw] max-md:snap-center border border-border bg-bg-base/60 rounded-2xl p-4 md:p-6 relative">
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
                <div className="max-md:min-w-[85vw] max-md:snap-center border-2 border-primary bg-surface rounded-2xl p-4 md:p-6 relative shadow-md glow-primary">
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
          <section id="about" className="px-6 py-12 md:py-24 max-w-5xl mx-auto w-full border-b border-border/40 relative overflow-hidden">
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

            {/* Small Centered Student Quote Block */}
            <div className="text-center max-w-xl mx-auto pt-8 border-t border-border/20 relative z-10 flex flex-col items-center">
              <p className="font-serif italic text-lg md:text-xl text-text leading-relaxed mb-4">
                “I went from getting auto-rejected to landing 4 interview calls in a week. The ATS scorer is a game changer for off-campus placements.”
              </p>
              <div className="flex items-center gap-3">
                <img src="/rahul.png" alt="Student" className="w-10 h-10 rounded-full border border-border/50 shadow-sm object-cover" />
                <div className="text-left">
                  <span className="text-sm font-bold text-text block">Rahul Sharma</span>
                  <span className="text-xs font-medium text-text-muted">B.Tech CSE, NIT Trichy</span>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: Competitive Positioning */}
          <section className="px-6 py-12 md:py-24 max-w-5xl mx-auto w-full border-b border-border/40 relative overflow-hidden">
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
            <div className="max-md:flex max-md:overflow-x-auto max-md:snap-x max-md:snap-mandatory max-md:gap-4 max-md:-mx-6 max-md:px-6 max-md:pb-6 bg-surface/50 border border-border/30 rounded-3xl p-2 max-w-5xl mx-auto mb-16 relative z-10 grid md:grid-cols-3 md:gap-0 items-stretch [scrollbar-width:none]">
              {/* Column 1: Generic Resume Builders */}
              <div className="max-md:min-w-[85vw] max-md:snap-center max-md:rounded-2xl max-md:border p-6 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-border/20 bg-transparent transition-all duration-300 opacity-70 hover:opacity-90">
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
              <div className="max-md:min-w-[85vw] max-md:snap-center max-md:rounded-2xl max-md:border p-6 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-border/20 bg-transparent transition-all duration-300 opacity-85 hover:opacity-100">
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
              <div className="max-md:min-w-[85vw] max-md:snap-center bg-gradient-to-b from-surface to-primary/[0.02] border-2 border-primary rounded-3xl p-6 md:p-10 shadow-[0_20px_50px_rgba(1,105,111,0.08)] relative max-md:mt-0 md:-translate-y-6 md:scale-[1.04] z-20 flex flex-col justify-between transition-all duration-300 group">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-surface text-[9px] font-extrabold tracking-widest px-4 py-1.5 rounded-full uppercase shadow-md border border-white/20 whitespace-nowrap">
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
          <section className="px-6 py-12 md:py-20 max-w-5xl mx-auto w-full">
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
                <h4 className="text-4xl md:text-5xl font-serif italic mb-1">15,000+</h4>
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
          <section id="faq" className="px-6 py-12 md:py-20 bg-surface/30 border-t border-border/50">
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
          <section className="px-6 py-16 md:py-24 text-center max-w-4xl mx-auto flex flex-col items-center">
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
              Build Resume Free
            </Link>
            <span className="text-xs text-text-muted mt-3 font-semibold">
              Takes 2 minutes. Pay ₹{price} only if you love the preview.
            </span>
          </section>
        </>
      )}
      
      {/* Premium Multi-Column Footer */}
      <footer className={`mt-auto border-t px-6 py-10 md:py-16 transition-colors duration-300 font-sans ${
        landingVariant === "dashboard"
          ? "bg-[#0a0d0e] border-[#20292b] text-[#9f9d98]"
          : "bg-surface border-border/60 text-text-muted"
      }`}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 pb-12">
          {/* Col 1: Brand & Purpose */}
          <div className="md:col-span-5 space-y-4 text-left">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="ATSLift Logo" className="w-6 h-6 object-contain logo-rotated" />
              <span className={`font-black text-base tracking-tight ${landingVariant === "dashboard" ? "text-white" : "text-text"}`}>
                ATS<span className="text-primary font-serif italic">Lift</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed max-w-sm font-semibold">
              The premium, SDE-trained optimizer engineered specifically for Indian engineering candidates to bypass automated filters and stand out in campus shortlists.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-success">
              <ShieldCheck className="w-4.5 h-4.5 text-success" />
              <span>Razorpay Secured Gateway SSL</span>
            </div>
          </div>

          {/* Col 2: Product */}
          <div className="md:col-span-2 space-y-3.5 text-left">
            <span className={`text-[10px] font-black uppercase tracking-widest block ${
              landingVariant === "dashboard" ? "text-white" : "text-text"
            }`}>Product</span>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link href="/build" className={`transition-colors ${landingVariant === "dashboard" ? "hover:text-[#00e1ec]" : "hover:text-primary"}`}>
                  Build Resume
                </Link>
              </li>
              <li>
                <Link href="/ats-check" className={`transition-colors ${landingVariant === "dashboard" ? "hover:text-[#00e1ec]" : "hover:text-primary"}`}>
                  ATS Grader
                </Link>
              </li>
              <li>
                <span className="opacity-50 cursor-not-allowed">Premium Features</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div className="md:col-span-2 space-y-3.5 text-left">
            <span className={`text-[10px] font-black uppercase tracking-widest block ${
              landingVariant === "dashboard" ? "text-white" : "text-text"
            }`}>Resources</span>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link href="/about" className={`transition-colors ${landingVariant === "dashboard" ? "hover:text-[#00e1ec]" : "hover:text-primary"}`}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className={`transition-colors ${landingVariant === "dashboard" ? "hover:text-[#00e1ec]" : "hover:text-primary"}`}>
                  SDE Keywords Guide
                </Link>
              </li>
              <li>
                <Link href="#" className={`transition-colors ${landingVariant === "dashboard" ? "hover:text-[#00e1ec]" : "hover:text-primary"}`}>
                  Placement Portal Hacks
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Contact */}
          <div className="md:col-span-3 space-y-3.5 text-left">
            <span className={`text-[10px] font-black uppercase tracking-widest block ${
              landingVariant === "dashboard" ? "text-white" : "text-text"
            }`}>Policies & Verification</span>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link href="/privacy" className={`transition-colors ${landingVariant === "dashboard" ? "hover:text-[#00e1ec]" : "hover:text-primary"}`}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className={`transition-colors ${landingVariant === "dashboard" ? "hover:text-[#00e1ec]" : "hover:text-primary"}`}>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="#" className={`transition-colors ${landingVariant === "dashboard" ? "hover:text-[#00e1ec]" : "hover:text-primary"}`}>
                  Razorpay Payment Status
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className={`max-w-5xl mx-auto pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-wider ${
          landingVariant === "dashboard" ? "border-[#20292b] text-[#7a7974]" : "border-border/60 text-text-muted/80"
        }`}>
          <span>© {new Date().getFullYear()} ATSLift Operations. All rights reserved.</span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span>Razorpay Secured Gateway</span>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
