"use client";

import React, { useState } from "react";
import { Copy, Check, FileText, ArrowRight, ShieldCheck, Zap, LineChart, Cpu, MessageSquare } from "lucide-react";

interface Props {
  handlePayment: () => void;
  isProcessingPayment: boolean;
}

export default function AIVerificationSection({ handlePayment, isProcessingPayment }: Props) {
  const [copied, setCopied] = useState(false);

  const promptText = `Analyze this resume for ATS compatibility.

Score the resume from 0–100 based on:

1. Keyword Match
2. Technical Skills
3. Project Quality
4. Quantified Achievements
5. Recruiter Readability
6. ATS Formatting

Return:
Overall Score
Category Scores
Top 3 Strengths
Top 3 Weaknesses

Resume:
[PASTE RESUME HERE]`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="mt-20 mb-8 max-w-5xl mx-auto w-full px-4 lg:px-0">
      <div className="text-center mb-12">
        <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
          <ShieldCheck className="w-4 h-4" />
          <span>Transparency Feature</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-text mb-4">Independent AI Verification</h2>
        <p className="text-text-muted font-medium max-w-xl mx-auto leading-relaxed text-sm md:text-base">
          Don't take our word for it. Compare your current resume against your ATSLift resume using ChatGPT, Gemini, Claude, or Grok and judge the improvement yourself.
        </p>
      </div>

      {/* Comparison Visual */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-16 relative">
        {/* Before Card */}
        <div className="glass-panel border border-border p-6 rounded-2xl flex-1 w-full max-w-sm relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-3">
            <span className="text-[10px] font-bold bg-error/10 text-error border border-error/20 px-2 py-1 rounded-md uppercase tracking-wide">Current Resume Analysis</span>
          </div>
          <div className="w-12 h-12 bg-bg-base border border-border rounded-xl flex items-center justify-center mb-4 text-text-muted">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-text mb-3">Before ATSLift</h3>
          <ul className="space-y-3 text-sm text-text-muted font-medium">
            <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-bg-base border border-border flex items-center justify-center text-[10px] font-bold shrink-0">1</span> Take your existing resume</li>
            <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-bg-base border border-border flex items-center justify-center text-[10px] font-bold shrink-0">2</span> Open any AI assistant</li>
            <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-bg-base border border-border flex items-center justify-center text-[10px] font-bold shrink-0">3</span> Paste the ATS Evaluation Prompt</li>
            <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-bg-base border border-border flex items-center justify-center text-[10px] font-bold shrink-0">4</span> Save the analysis</li>
          </ul>
          <div className="mt-6 pt-4 border-t border-border/50 text-center">
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">Example ATS Score</p>
            <p className="text-3xl font-black text-text">72</p>
          </div>
        </div>

        {/* Center Arrow / Connector */}
        <div className="flex flex-col items-center justify-center z-10 hidden md:flex">
          <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <ArrowRight className="w-6 h-6" />
          </div>
        </div>
        
        {/* Mobile Arrow */}
        <div className="flex md:hidden items-center justify-center my-[-16px] z-10 relative">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg border-4 border-bg-base">
            <ArrowRight className="w-5 h-5 rotate-90" />
          </div>
        </div>

        {/* After Card */}
        <div className="bg-linear-to-b from-primary/10 to-transparent border border-primary/20 p-6 rounded-2xl flex-1 w-full max-w-sm relative shadow-xl shadow-primary/5">
          <div className="absolute top-0 right-0 p-3">
            <span className="text-[10px] font-bold bg-success/10 text-success border border-success/20 px-2 py-1 rounded-md uppercase tracking-wide">Optimized Resume Analysis</span>
          </div>
          <div className="w-12 h-12 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center mb-4 text-primary">
            <LineChart className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-text mb-3">After ATSLift</h3>
          <ul className="space-y-3 text-sm text-text-muted font-medium">
            <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-bg-base border border-border flex items-center justify-center text-[10px] font-bold shrink-0">1</span> Unlock your ATSLift resume</li>
            <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-bg-base border border-border flex items-center justify-center text-[10px] font-bold shrink-0">2</span> Use the same AI assistant</li>
            <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-bg-base border border-border flex items-center justify-center text-[10px] font-bold shrink-0">3</span> Paste the ATS Evaluation Prompt</li>
            <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-bg-base border border-border flex items-center justify-center text-[10px] font-bold shrink-0">4</span> Compare the results</li>
          </ul>
          <div className="mt-6 pt-4 border-t border-primary/20 text-center">
            <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-1">Example ATS Score</p>
            <p className="text-3xl font-black text-primary drop-shadow-sm">87</p>
          </div>
        </div>
      </div>
      
      <p className="text-center text-[10px] text-text-muted uppercase font-bold tracking-wider mb-16">
        Disclaimer: Example only. Actual scores depend on resume quality and evaluation method.
      </p>

      {/* Trust & Verification Steps */}
      <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 mb-16 shadow-xs">
        <div className="text-center mb-10">
          <h3 className="text-xl md:text-2xl font-black text-text mb-2">Why ATSLift?</h3>
          <p className="text-sm text-text-muted font-medium max-w-xl mx-auto">
            We don't ask you to trust a hidden scoring algorithm. Verify the improvement yourself using independent AI analysis.
          </p>
        </div>

        {/* Horizontal Timeline */}
        <div className="flex flex-col md:flex-row justify-between items-start relative mb-12">
          {/* Desktop connecting line */}
          <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-0.5 bg-border z-0"></div>
          
          <div className="relative z-10 flex flex-row md:flex-col items-center text-left md:text-center w-full md:w-1/5 mb-6 md:mb-0 gap-4 md:gap-2">
            <div className="w-12 h-12 rounded-full bg-bg-base border-2 border-border flex items-center justify-center font-bold text-text shrink-0">1</div>
            <div>
              <p className="text-xs font-bold text-text">Copy Current Resume</p>
            </div>
          </div>
          <div className="relative z-10 flex flex-row md:flex-col items-center text-left md:text-center w-full md:w-1/5 mb-6 md:mb-0 gap-4 md:gap-2">
            <div className="w-12 h-12 rounded-full bg-bg-base border-2 border-border flex items-center justify-center font-bold text-text shrink-0">2</div>
            <div>
              <p className="text-xs font-bold text-text">Analyze Using AI</p>
            </div>
          </div>
          <div className="relative z-10 flex flex-row md:flex-col items-center text-left md:text-center w-full md:w-1/5 mb-6 md:mb-0 gap-4 md:gap-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/50 text-primary flex items-center justify-center font-bold shrink-0 shadow-sm shadow-primary/10">3</div>
            <div>
              <p className="text-xs font-bold text-primary">Unlock ATSLift Resume</p>
            </div>
          </div>
          <div className="relative z-10 flex flex-row md:flex-col items-center text-left md:text-center w-full md:w-1/5 mb-6 md:mb-0 gap-4 md:gap-2">
            <div className="w-12 h-12 rounded-full bg-bg-base border-2 border-border flex items-center justify-center font-bold text-text shrink-0">4</div>
            <div>
              <p className="text-xs font-bold text-text">Evaluate Again</p>
            </div>
          </div>
          <div className="relative z-10 flex flex-row md:flex-col items-center text-left md:text-center w-full md:w-1/5 gap-4 md:gap-2">
            <div className="w-12 h-12 rounded-full bg-bg-base border-2 border-border flex items-center justify-center font-bold text-text shrink-0">5</div>
            <div>
              <p className="text-xs font-bold text-text">Compare Results</p>
            </div>
          </div>
        </div>

        {/* Supported Models */}
        <div className="text-center pt-8 border-t border-border/50">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-4">Supported AI Models</p>
          <div className="flex flex-wrap justify-center gap-3 mb-5">
            <span className="px-4 py-2 bg-bg-base border border-border rounded-full text-xs font-semibold text-text flex items-center gap-2"><MessageSquare className="w-4 h-4" /> ChatGPT</span>
            <span className="px-4 py-2 bg-bg-base border border-border rounded-full text-xs font-semibold text-text flex items-center gap-2"><Zap className="w-4 h-4" /> Gemini</span>
            <span className="px-4 py-2 bg-bg-base border border-border rounded-full text-xs font-semibold text-text flex items-center gap-2"><Cpu className="w-4 h-4" /> Claude</span>
            <span className="px-4 py-2 bg-bg-base border border-border rounded-full text-xs font-semibold text-text flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Grok</span>
          </div>
          <p className="text-xs text-text-muted font-medium max-w-md mx-auto">
            Use the same AI model and the same evaluation prompt before and after comparison for the most accurate results.
          </p>
        </div>
      </div>

      {/* Copy Prompt Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-20 items-center">
        <div className="flex flex-col justify-center order-2 lg:order-1">
          <h3 className="text-2xl font-black text-text mb-3">ATS Evaluation Prompt</h3>
          <p className="text-sm text-text-muted font-medium mb-8 leading-relaxed">
            Copy this exact prompt and paste it into your favorite AI along with your resume text. 
            By using the exact same parameters for both resumes, you guarantee a fair and unbiased comparison.
          </p>
          
          <div className="bg-text/5 border border-border/60 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-text/40"></div>
            <h4 className="text-[11px] font-bold text-text uppercase tracking-wider mb-2 flex items-center gap-2">
               Important Disclaimer
            </h4>
            <p className="text-xs text-text-muted leading-relaxed font-medium">
              AI models use different evaluation methods and may produce different scores. 
              For the best comparison: use the same AI model, use the same prompt, and compare before and after resumes under identical conditions.
            </p>
          </div>
        </div>
        
        <div className="glass-panel border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col h-full order-1 lg:order-2">
          <div className="bg-surface border-b border-border/60 px-5 py-4 flex justify-between items-center">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Prompt Preview</span>
            <button 
              onClick={copyToClipboard}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                copied ? "bg-success text-white shadow-sm" : "bg-bg-base border border-border text-text hover:bg-border/30 hover:text-text"
              }`}
            >
              {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy Prompt</>}
            </button>
          </div>
          <div className="p-5 bg-bg-base/40 text-[13px] font-mono text-text-muted whitespace-pre-wrap flex-1 overflow-y-auto max-h-72 leading-relaxed custom-scrollbar">
            {promptText}
          </div>
        </div>
      </div>

      {/* Conversion CTA */}
      <div className="text-center pb-12 border-b border-border/30">
        <h3 className="text-3xl font-black text-text mb-4">Ready to See the Difference?</h3>
        <p className="text-sm md:text-base text-text-muted font-medium max-w-lg mx-auto mb-8">
          Generate an ATS-optimized resume and compare the results yourself.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={handlePayment}
            disabled={isProcessingPayment}
            className="px-8 py-4 bg-primary hover:bg-primary/95 text-white rounded-full font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto flex items-center justify-center gap-2 text-sm"
          >
            {isProcessingPayment ? "Processing..." : "Unlock My Resume"} <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              copyToClipboard();
            }}
            className="px-8 py-4 bg-surface border border-border hover:bg-border/40 text-text rounded-full font-bold transition-all w-full sm:w-auto text-sm"
          >
            {copied ? "Prompt Copied!" : "Copy ATS Evaluation Prompt"}
          </button>
        </div>
      </div>
    </section>
  );
}
