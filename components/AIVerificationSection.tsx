"use client";

import React, { useState } from "react";
import { Copy, Check, FileText, ArrowRight, ShieldCheck, Zap, LineChart, Cpu, MessageSquare, X, ArrowLeft } from "lucide-react";

interface Props {
  handlePayment: () => void;
  isProcessingPayment: boolean;
}

export default function AIVerificationSection({ handlePayment, isProcessingPayment }: Props) {
  const [copied, setCopied] = useState(false);

  const promptText = `Analyze this resume for ATS compatibility.

Score the resume from 0–100 based on the following specific criteria and weights:

1. Keyword Match (30 points)
2. ATS Compatibility (25 points)
3. Technical Strength (15 points)
4. Project Quality (15 points)
5. Recruiter Readability (10 points)
6. Experience Credibility (5 points)

Return:
Overall Score (out of 100)
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
    <section className="w-full pb-16 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
          <ShieldCheck className="w-4 h-4" />
          <span>Transparency Feature</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-text mb-4">Independent AI Verification</h2>
        <p className="text-text-muted font-medium max-w-xl mx-auto leading-relaxed text-sm md:text-base">
          Don't take our word for it. Compare your current resume against your ATSLift resume using ChatGPT, Gemini, Claude, or Grok and judge the improvement yourself.
        </p>
      </div>



      {/* Trust & Verification Steps (Now Main Hero Box) */}
      <div className="bg-gradient-to-br from-surface to-primary/5 border-2 border-primary/20 rounded-3xl p-8 md:p-12 mb-12 shadow-xl relative overflow-hidden group">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-primary/10 blur-[80px] rounded-full pointer-events-none transition-opacity opacity-50 group-hover:opacity-100"></div>

        <div className="text-center mb-10">
          <h3 className="text-xl md:text-2xl font-black text-text mb-2">Why ATSLift?</h3>
          <p className="text-sm text-text-muted font-medium max-w-xl mx-auto">
            We don't ask you to trust a hidden scoring algorithm. Verify the improvement yourself using independent AI analysis.
          </p>
        </div>

        {/* Horizontal Timeline */}
        <div className="flex flex-col md:flex-row justify-center items-start md:items-center relative mb-8 gap-4 md:gap-2 max-w-4xl mx-auto">
          
          <div className="flex flex-row md:flex-col items-center text-left md:text-center gap-3 md:gap-2 flex-1 w-full md:w-auto">
            <div className="w-8 h-8 rounded-full bg-bg-base border border-border flex items-center justify-center font-bold text-text text-[10px] shrink-0">1</div>
            <p className="text-[11px] font-bold text-text leading-tight">Copy Current Resume</p>
          </div>
          
          <div className="hidden md:block w-6 h-px bg-border/60 shrink-0" />
          
          <div className="flex flex-row md:flex-col items-center text-left md:text-center gap-3 md:gap-2 flex-1 w-full md:w-auto">
            <div className="w-8 h-8 rounded-full bg-bg-base border border-border flex items-center justify-center font-bold text-text text-[10px] shrink-0">2</div>
            <p className="text-[11px] font-bold text-text leading-tight">Analyze Using AI</p>
          </div>
          
          <div className="hidden md:block w-6 h-px bg-border/60 shrink-0" />

          <div className="flex flex-row md:flex-col items-center text-left md:text-center gap-3 md:gap-2 flex-1 w-full md:w-auto">
            <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-primary/50 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 shadow-sm shadow-primary/10">3</div>
            <p className="text-[11px] font-bold text-primary leading-tight">Unlock ATSLift Resume</p>
          </div>

          <div className="hidden md:block w-6 h-px bg-border/60 shrink-0" />

          <div className="flex flex-row md:flex-col items-center text-left md:text-center gap-3 md:gap-2 flex-1 w-full md:w-auto">
            <div className="w-8 h-8 rounded-full bg-bg-base border border-border flex items-center justify-center font-bold text-text text-[10px] shrink-0">4</div>
            <p className="text-[11px] font-bold text-text leading-tight">Evaluate Again</p>
          </div>

          <div className="hidden md:block w-6 h-px bg-border/60 shrink-0" />

          <div className="flex flex-row md:flex-col items-center text-left md:text-center gap-3 md:gap-2 flex-1 w-full md:w-auto">
            <div className="w-8 h-8 rounded-full bg-bg-base border border-border flex items-center justify-center font-bold text-text text-[10px] shrink-0">5</div>
            <p className="text-[11px] font-bold text-text leading-tight">Compare Results</p>
          </div>
        </div>

        {/* Supported Models */}
        <div className="text-center pt-8 border-t border-border/50">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-4">Supported AI Models</p>
          <div className="flex flex-wrap justify-center gap-3 mb-5">
            <a href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-bg-base border border-border hover:bg-border/40 hover:-translate-y-0.5 transition-all rounded-full text-[11px] font-bold text-text flex items-center gap-2 cursor-pointer shadow-xs"><MessageSquare className="w-3.5 h-3.5" /> ChatGPT</a>
            <a href="https://gemini.google.com/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-bg-base border border-border hover:bg-border/40 hover:-translate-y-0.5 transition-all rounded-full text-[11px] font-bold text-text flex items-center gap-2 cursor-pointer shadow-xs"><Zap className="w-3.5 h-3.5" /> Gemini</a>
            <a href="https://claude.ai/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-bg-base border border-border hover:bg-border/40 hover:-translate-y-0.5 transition-all rounded-full text-[11px] font-bold text-text flex items-center gap-2 cursor-pointer shadow-xs"><Cpu className="w-3.5 h-3.5" /> Claude</a>
            <a href="https://grok.com/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-bg-base border border-border hover:bg-border/40 hover:-translate-y-0.5 transition-all rounded-full text-[11px] font-bold text-text flex items-center gap-2 cursor-pointer shadow-xs"><ShieldCheck className="w-3.5 h-3.5" /> Grok</a>
          </div>
          <p className="text-xs text-text-muted font-medium max-w-md mx-auto">
            Use the same AI model and the same evaluation prompt before and after comparison for the most accurate results.
          </p>
        </div>
      </div>

      {/* Copy Prompt Section */}
      <div className="flex flex-col gap-6 mb-16 items-center">
        <div className="flex flex-col justify-center">
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
        
        <div className="glass-panel w-full border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
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
            onClick={copyToClipboard}
            className="px-8 py-4 bg-surface border border-border hover:bg-border/40 text-text rounded-full font-bold transition-all w-full sm:w-auto text-sm"
          >
            {copied ? "Prompt Copied!" : "Copy ATS Evaluation Prompt"}
          </button>
        </div>
      </div>
    </section>
  );
}
