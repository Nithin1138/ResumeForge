"use client";

import React, { useState } from "react";
import { Copy, Check, ArrowRight, ShieldCheck } from "lucide-react";

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
          <div className="flex justify-center gap-6 md:gap-10 mb-5">
            <a 
              href="https://chatgpt.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Analyze with ChatGPT"
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-14 h-14 bg-bg-base border border-border group-hover:bg-border/40 group-hover:-translate-y-0.5 transition-all rounded-full flex items-center justify-center shadow-xs text-text group-hover:text-primary">
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                  <title>ChatGPT</title>
                  <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
                </svg>
              </div>
              <span className="text-[11px] font-bold text-text-muted group-hover:text-primary transition-colors">ChatGPT</span>
            </a>
            <a 
              href="https://gemini.google.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Analyze with Gemini"
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-14 h-14 bg-bg-base border border-border group-hover:bg-border/40 group-hover:-translate-y-0.5 transition-all rounded-full flex items-center justify-center shadow-xs text-text group-hover:text-primary">
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                  <title>Gemini</title>
                  <path d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81" />
                </svg>
              </div>
              <span className="text-[11px] font-bold text-text-muted group-hover:text-primary transition-colors">Gemini</span>
            </a>
            <a 
              href="https://claude.ai/" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Analyze with Claude"
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-14 h-14 bg-bg-base border border-border group-hover:bg-border/40 group-hover:-translate-y-0.5 transition-all rounded-full flex items-center justify-center shadow-xs text-text group-hover:text-primary">
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                  <title>Claude</title>
                  <path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z" />
                </svg>
              </div>
              <span className="text-[11px] font-bold text-text-muted group-hover:text-primary transition-colors">Claude</span>
            </a>
            <a 
              href="https://grok.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Analyze with Grok"
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-14 h-14 bg-bg-base border border-border group-hover:bg-border/40 group-hover:-translate-y-0.5 transition-all rounded-full flex items-center justify-center shadow-xs text-text group-hover:text-primary">
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                  <title>Grok</title>
                  <path d="M9.27 15.29l7.978-5.897c.391-.29.95-.177 1.137.272.98 2.369.542 5.215-1.41 7.169-1.951 1.954-4.667 2.382-7.149 1.406l-2.711 1.257c3.889 2.661 8.611 2.003 11.562-.953 2.341-2.344 3.066-5.539 2.388-8.42l.006.007c-.983-4.232.242-5.924 2.75-9.383.06-.082.12-.164.179-.248l-3.301 3.305v-.01L9.267 15.292M7.623 16.723c-2.792-2.67-2.31-6.801.071-9.184 1.761-1.763 4.647-2.483 7.166-1.425l2.705-1.25a7.808 7.808 0 00-1.829-1A8.975 8.975 0 005.984 5.83c-2.533 2.536-3.33 6.436-1.962 9.764 1.022 2.487-.653 4.246-2.34 6.022-.599.63-1.199 1.259-1.682 1.925l7.62-6.815" />
                </svg>
              </div>
              <span className="text-[11px] font-bold text-text-muted group-hover:text-primary transition-colors">Grok</span>
            </a>
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
