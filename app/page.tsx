"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle, Flame, ShieldCheck, Sparkles, ChevronDown, Award } from "lucide-react";
import { getLocalSession } from "@/lib/authClient";

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
