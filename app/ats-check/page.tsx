"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UploadCloud, FileText, CheckCircle, 
  ArrowRight, AlertCircle, RefreshCw,
  Award, TrendingUp, ShieldCheck
} from "lucide-react";

interface CategoryScore {
  name: string;
  weightage: number;
  score: number;
  feedback: string;
}

interface ATSResult {
  overallScore: number;
  categories: CategoryScore[];
}

const SCORING_CRITERIA = [
  { name: "Keyword Match & Searchability", weightage: 35, description: "Measures density and relevance of technical keywords." },
  { name: "Resume Parsing & Structure", weightage: 25, description: "Evaluates standard section formatting and machine readability." },
  { name: "Technical Signal Strength", weightage: 20, description: "Assesses complexity and depth of engineering projects." },
  { name: "Impact & Quantification", weightage: 10, description: "Checks for quantifiable achievements and metrics." },
  { name: "Recruiter Readability", weightage: 7, description: "Measures skim-friendliness and layout clarity." },
  { name: "Experience & Relevance", weightage: 3, description: "Matches background with target role expectations." },
];

export default function ATSCheckPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ATSResult | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf" || droppedFile.name.endsWith(".pdf")) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError("Please upload a PDF file.");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf" || selectedFile.name.endsWith(".pdf")) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError("Please upload a PDF file.");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/ats-check", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze resume");
      }

      const data: ATSResult = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred while analyzing the resume.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };
  
  const getProgressColor = (score: number, max: number) => {
    const ratio = score / max;
    if (ratio >= 0.8) return "bg-success";
    if (ratio >= 0.6) return "bg-warning";
    return "bg-error";
  };
  
  const getScoreColorText = (score: number, max: number) => {
    const ratio = score / max;
    if (ratio >= 0.8) return "text-success";
    if (ratio >= 0.6) return "text-warning";
    return "text-error";
  };

  return (
    <div className="min-h-screen bg-bg-base text-text selection:bg-primary/20 font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-border/40 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <img src="/logo.png" alt="ATSLift Logo" className="w-8 h-8 rounded-md object-contain logo-rotated" />
          <span className="font-bold text-lg tracking-tight font-sans text-text">
            ATS<span className="text-primary font-medium font-serif italic">Lift</span>
          </span>
        </Link>
        <Link
          href="/build"
          className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs md:text-sm font-semibold rounded-full transition-all duration-300"
        >
          Build Resume
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Dynamic ambient background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full mix-blend-multiply filter blur-[120px] animate-blob" />
          <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full mix-blend-multiply filter blur-[150px] animate-blob animation-delay-2000" />
          <div className="absolute bottom-[-20%] left-[20%] w-[700px] h-[700px] bg-purple-500/10 rounded-full mix-blend-multiply filter blur-[150px] animate-blob animation-delay-4000" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>

        <div className="max-w-5xl w-full z-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-text mb-4">
              Check Your <span className="text-primary italic">ATS Score</span>
            </h1>
            <p className="text-text-muted max-w-xl mx-auto">
              Upload your PDF resume to see how you rank against real-time universal tech company requirements. Discover what recruiters see.
            </p>
          </div>

          <div className="w-full flex flex-col md:flex-row gap-8 items-stretch">
            {/* Left Column: Interactive State Area (Upload / Loading / Result) */}
            <div className="flex-1 flex flex-col">
              <AnimatePresence mode="wait">
                {!result && !isLoading && (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 glass-panel bg-surface/60 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-[2rem] p-8 shadow-2xl flex flex-col justify-center relative overflow-hidden group/card"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <div className="mb-6 text-center">
                      <h3 className="font-serif text-2xl font-bold text-text">Upload Resume</h3>
                      <p className="text-sm text-text-muted mt-2">Get an instant reality check on your ATS score.</p>
                    </div>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-500 group overflow-hidden ${
                        isDragging 
                          ? "border-primary bg-primary/10 scale-[1.02]" 
                          : file ? "border-success/50 bg-success/5" : "border-border/60 hover:border-primary/50 hover:bg-surface/80 hover:shadow-inner"
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept=".pdf,application/pdf"
                        className="hidden"
                      />
                      
                      {file ? (
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex flex-col items-center space-y-5 relative z-10"
                        >
                          <div className="p-5 bg-success/10 text-success rounded-2xl shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                            <FileText className="w-10 h-10" />
                          </div>
                          <div>
                            <p className="font-bold text-text text-lg">{file.name}</p>
                            <p className="text-sm text-text-muted mt-1 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze</p>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="flex flex-col items-center space-y-5 relative z-10">
                          <div className="p-5 bg-primary/10 text-primary rounded-2xl group-hover:scale-110 group-hover:bg-primary text-white group-hover:shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.4)] transition-all duration-500">
                            <UploadCloud className="w-10 h-10 text-primary group-hover:text-white transition-colors" />
                          </div>
                          <div>
                            <p className="font-bold text-text text-lg mb-1 group-hover:text-primary transition-colors">Drag & drop your resume</p>
                            <p className="text-sm text-text-muted">or <span className="text-primary font-semibold group-hover:underline">browse files</span> (PDF up to 5MB)</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {error && (
                      <div className="mt-4 p-3 rounded-lg bg-error/10 border border-error/20 flex items-center space-x-2 text-error text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="mt-8 flex justify-center relative z-10">
                      <button
                        onClick={handleUpload}
                        disabled={!file}
                        className="group w-full sm:w-auto px-10 py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-[0_10px_30px_rgba(var(--color-primary-rgb),0.3)] hover:shadow-[0_15px_40px_rgba(var(--color-primary-rgb),0.4)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center space-x-3"
                      >
                        <span className="text-lg tracking-wide">Analyze Reality</span>
                        <TrendingUp className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {isLoading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 glass-panel bg-surface/60 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-[2rem] p-8 shadow-2xl flex flex-col items-center justify-center py-20 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent animate-pulse" />
                    
                    <div className="relative w-32 h-32 mb-10 z-10 flex items-center justify-center">
                      <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-[spin_1.5s_linear_infinite]"></div>
                      <div className="absolute inset-4 border-4 border-primary/40 rounded-full border-b-transparent animate-[spin_2s_linear_infinite_reverse]"></div>
                      <div className="absolute inset-0 flex items-center justify-center text-primary">
                        <CheckCircle className="w-10 h-10 animate-pulse" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-text mb-3 z-10 tracking-tight">Deconstructing Resume...</h3>
                    <p className="text-sm text-text-muted animate-pulse z-10 font-medium">Scanning against 50+ enterprise ATS checkpoints</p>
                  </motion.div>
                )}

                {result && !isLoading && (
                  <motion.div
                    key="result-score"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
                    className="flex-1 glass-panel bg-surface/80 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none transform group-hover:scale-110 group-hover:rotate-12">
                      <Award className="w-48 h-48 text-primary" />
                    </div>
                    
                    <span className="text-xs font-bold uppercase tracking-widest text-text-muted mb-8">Overall Score</span>
                    
                    {/* Circular Progress */}
                    <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-border/20" />
                        <motion.circle 
                          cx="50" 
                          cy="50" 
                          r="45" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="8" 
                          strokeDasharray="283" 
                          initial={{ strokeDashoffset: 283 }}
                          animate={{ strokeDashoffset: 283 - (283 * result.overallScore) / 100 }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                          className={result.overallScore >= 80 ? "text-success" : result.overallScore >= 60 ? "text-warning" : "text-error"}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-5xl font-serif font-bold text-text">{result.overallScore}</span>
                        <span className="text-sm text-text-muted mt-1">/ 100</span>
                      </div>
                    </div>

                    <div className={`px-6 py-2 rounded-full border text-sm font-bold uppercase tracking-wider mb-10 ${
                      result.overallScore >= 80 
                        ? "text-success border-success/30 bg-success/10" 
                        : result.overallScore >= 60 
                        ? "text-warning border-warning/30 bg-warning/10" 
                        : "text-error border-error/30 bg-error/10"
                    }`}>
                      {result.overallScore >= 80 ? "Excellent" : result.overallScore >= 60 ? "Needs Work" : "Critical Fixes Needed"}
                    </div>

                    <button
                      onClick={resetState}
                      className="flex items-center space-x-2 text-sm font-semibold text-text-muted hover:text-primary transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Check Another</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column: Persistent ATS Criteria Box */}
            <div className="flex-1 flex flex-col space-y-6">
              <div className="glass-panel bg-surface/70 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-[2rem] p-8 shadow-2xl flex-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[60px] -mr-10 -mt-10 pointer-events-none" />
                
                <h3 className="font-serif text-2xl font-bold mb-2 flex items-center text-text relative z-10">
                  <ShieldCheck className="w-6 h-6 text-primary mr-3" />
                  Evaluation Criteria
                </h3>
                <p className="text-sm text-text-muted mb-8 relative z-10">How top-tier company ATS systems weigh your resume</p>
                
                <div className="space-y-6">
                  {(result ? result.categories : SCORING_CRITERIA).map((cat, idx) => {
                    const isResult = !!result;
                    const name = cat.name;
                    const weightage = cat.weightage;
                    const score = isResult ? (cat as CategoryScore).score : 0;
                    const description = isResult ? (cat as CategoryScore).feedback : (cat as any).description;

                    return (
                      <div key={idx} className="flex flex-col">
                        <div className="flex justify-between items-end mb-2">
                          <span className="font-semibold text-sm text-text">{name}</span>
                          <span className="text-xs font-bold text-text-muted">
                            {isResult ? (
                              <><span className={getScoreColorText(score, weightage)}>{score}</span> / {weightage}</>
                            ) : (
                              <span className="text-primary">{weightage}% Max</span>
                            )}
                          </span>
                        </div>
                        
                        <div className="w-full h-3 bg-border/30 rounded-full mb-2 relative overflow-hidden shadow-inner">
                          {/* Background: Represents the total weightage size relative to 100% width */}
                          <div 
                            className="absolute left-0 top-0 h-full rounded-full bg-border/40 backdrop-blur-sm"
                            style={{ width: `${weightage}%` }}
                          />
                          
                          {/* Foreground: Represents the achieved score */}
                          {isResult && (
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${score}%` }}
                              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 + (idx * 0.1) }}
                              className={`absolute left-0 top-0 h-full rounded-full shadow-[0_0_15px_rgba(0,0,0,0.1)] ${getProgressColor(score, weightage)}`}
                            />
                          )}
                        </div>
                        
                        <p className="text-[12px] text-text-muted leading-relaxed flex items-start">
                          {isResult && <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/60 mr-2 mt-1.5 shrink-0" />}
                          {description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Conditionally reveal the Improve box only after results */}
              <AnimatePresence>
                {result && !isLoading && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, y: 20 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    transition={{ duration: 0.5, type: "spring", delay: 0.6 }}
                    className="glass-panel bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 rounded-[2rem] p-8 flex flex-col sm:flex-row items-center justify-between shadow-lg relative overflow-hidden group/improve"
                  >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/15 rounded-full blur-[50px] -mr-10 -mt-10 pointer-events-none transition-transform duration-700 group-hover/improve:scale-150" />
                    <div className="mb-5 sm:mb-0 relative z-10">
                      <h4 className="font-serif text-xl font-bold text-text mb-1">Not happy with your score?</h4>
                      <p className="text-sm text-text-muted font-medium">Re-build your resume to hit 95+ using our AI engine.</p>
                    </div>
                    <Link
                      href="/build"
                      className="shrink-0 px-8 py-3.5 bg-primary hover:bg-primary/90 text-white text-sm font-bold tracking-wide rounded-2xl shadow-[0_10px_25px_rgba(var(--color-primary-rgb),0.3)] hover:shadow-[0_15px_35px_rgba(var(--color-primary-rgb),0.4)] hover:-translate-y-1 transition-all duration-300 flex items-center space-x-3 relative z-10 group/btn"
                    >
                      <span>Improve Now</span>
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
