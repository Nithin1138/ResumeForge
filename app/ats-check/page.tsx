"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UploadCloud, FileText, CheckCircle, 
  ArrowRight, AlertCircle, RefreshCw,
  Award, TrendingUp, ShieldCheck,
  Cpu, Database, Code, ScanLine, Layout, Briefcase, Zap
} from "lucide-react";

interface CategoryScore {
  name: string;
  weightage: number;
  score: number;
  feedback: string;
  icon: any;
}

interface ATSResult {
  overallScore: number;
  categories: CategoryScore[];
}

const SCORING_CRITERIA = [
  { name: "Keyword Match & Searchability", weightage: 35, description: "Measures density and relevance of technical keywords.", icon: Database },
  { name: "Resume Parsing & Structure", weightage: 25, description: "Evaluates standard section formatting and machine readability.", icon: Code },
  { name: "Technical Signal Strength", weightage: 20, description: "Assesses complexity and depth of engineering projects.", icon: Cpu },
  { name: "Impact & Quantification", weightage: 10, description: "Checks for quantifiable achievements and metrics.", icon: Zap },
  { name: "Recruiter Readability", weightage: 7, description: "Measures skim-friendliness and layout clarity.", icon: Layout },
  { name: "Experience & Relevance", weightage: 3, description: "Matches background with target role expectations.", icon: Briefcase },
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
    if (ratio >= 0.8) return "from-emerald-400 to-emerald-600 shadow-[0_0_15px_rgba(52,211,153,0.5)]";
    if (ratio >= 0.6) return "from-amber-400 to-amber-600 shadow-[0_0_15px_rgba(251,191,36,0.5)]";
    return "from-rose-400 to-rose-600 shadow-[0_0_15px_rgba(251,113,133,0.5)]";
  };
  
  const getScoreColorText = (score: number, max: number) => {
    const ratio = score / max;
    if (ratio >= 0.8) return "text-emerald-600 dark:text-emerald-400";
    if (ratio >= 0.6) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  return (
    <div className="min-h-screen bg-bg-base text-text font-sans flex flex-col relative">
      {/* Super Premium Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-bg-base">
        {/* Architectual Grid */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
        
        {/* Ambient Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full mix-blend-multiply filter blur-[150px] animate-blob" />
        <div className="absolute top-[30%] right-[-15%] w-[800px] h-[800px] bg-blue-500/10 rounded-full mix-blend-multiply filter blur-[200px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full mix-blend-multiply filter blur-[150px] animate-blob animation-delay-4000" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-bg-base/60 backdrop-blur-2xl border-b border-border/40 px-6 py-4 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center space-x-3 group">
          <img src="/logo.png" alt="ATSLift Logo" className="w-9 h-9 rounded-md object-contain group-hover:rotate-12 transition-transform duration-500" />
          <span className="font-extrabold text-xl tracking-tight text-text">
            ATS<span className="text-primary font-medium font-serif italic">Lift</span>
          </span>
        </Link>
        <Link
          href="/build"
          className="px-6 py-2.5 bg-text text-bg-base hover:bg-text/90 text-sm font-bold rounded-full transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5"
        >
          Build Resume
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center p-6 sm:p-10 relative z-10 w-full max-w-7xl mx-auto">
        <div className="text-center mb-14 mt-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold tracking-widest uppercase mb-6 shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.15)]">
            <ScanLine className="w-4 h-4" />
            <span>AI Scanner Engine</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-text mb-6 leading-tight">
            Check Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600 italic font-serif pr-2">ATS Reality</span>
          </h1>
          <p className="text-text-muted max-w-2xl mx-auto text-lg md:text-xl font-medium">
            Upload your resume and see exactly how top-tier engineering recruiters and automated ATS pipelines parse your profile.
          </p>
        </div>

        <div className="w-full flex flex-col lg:flex-row gap-8 xl:gap-12 items-stretch">
          {/* Left Column */}
          <div className="flex-1 flex flex-col w-full lg:max-w-xl">
            <AnimatePresence mode="wait">
              {!result && !isLoading && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
                  className="w-full flex-1 bg-surface/80 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-[2.5rem] p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] flex flex-col justify-center relative overflow-hidden group/upload"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover/upload:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  
                  <div className="text-center mb-8 relative z-10">
                    <h3 className="text-3xl font-extrabold text-text tracking-tight">Upload Resume</h3>
                    <p className="text-text-muted mt-2 font-medium">Drop your PDF to initiate deep scanning.</p>
                  </div>
                  
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative rounded-[2rem] p-12 text-center cursor-pointer transition-all duration-500 overflow-hidden ${
                      isDragging 
                        ? "border-primary bg-primary/10 scale-[1.02] shadow-[0_0_40px_rgba(var(--color-primary-rgb),0.2)]" 
                        : file 
                        ? "border-success/50 bg-success/5 border-2 shadow-[0_0_30px_rgba(34,197,94,0.1)]" 
                        : "border-border/80 border-2 border-dashed bg-surface/50 hover:border-primary/50 hover:bg-surface hover:shadow-2xl"
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept=".pdf,application/pdf"
                      className="hidden"
                    />
                    
                    {file ? (
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center relative z-10"
                      >
                        <div className="relative p-6 bg-success/10 rounded-3xl mb-6">
                          <div className="absolute inset-0 bg-success/20 blur-xl rounded-full" />
                          <FileText className="w-14 h-14 text-success relative z-10" />
                        </div>
                        <p className="font-extrabold text-text text-xl tracking-tight">{file.name}</p>
                        <p className="text-sm text-text-muted mt-2 font-semibold bg-success/10 text-success px-4 py-1 rounded-full">
                          Ready to analyze ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center relative z-10">
                        <div className="p-6 bg-border/30 rounded-3xl mb-6 group-hover:bg-primary group-hover:scale-110 group-hover:shadow-[0_15px_30px_rgba(var(--color-primary-rgb),0.4)] transition-all duration-500">
                          <UploadCloud className="w-12 h-12 text-text-muted group-hover:text-white transition-colors" />
                        </div>
                        <p className="font-bold text-text text-xl mb-2 group-hover:text-primary transition-colors">Drag & Drop Resume</p>
                        <p className="text-text-muted font-medium">or <span className="text-primary group-hover:underline">browse files</span> (PDF)</p>
                      </div>
                    )}
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 rounded-xl bg-error/10 border border-error/20 flex items-center space-x-3 text-error">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span className="text-sm font-bold">{error}</span>
                    </motion.div>
                  )}

                  <div className="mt-10 flex justify-center relative z-10">
                    <button
                      onClick={handleUpload}
                      disabled={!file}
                      className="group w-full py-5 bg-text hover:bg-text/90 text-bg-base text-lg font-extrabold rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center space-x-3 overflow-hidden relative"
                    >
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                      <span className="tracking-wide">Initialize Analysis</span>
                      <TrendingUp className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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
                  className="w-full flex-1 bg-surface/80 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-[2.5rem] p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center py-24 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 animate-[pulse_4s_infinite]" />
                  
                  <div className="relative w-40 h-40 mb-10 z-10 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-border rounded-full" />
                    <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-[spin_1.2s_cubic-bezier(0.5,0,0.5,1)_infinite]" />
                    <div className="absolute inset-4 border-4 border-blue-500/40 rounded-full border-b-transparent animate-[spin_2s_linear_infinite_reverse]" />
                    <div className="absolute inset-8 bg-primary/10 rounded-full animate-ping opacity-75" />
                    <div className="absolute inset-0 flex items-center justify-center text-primary">
                      <ScanLine className="w-12 h-12" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-extrabold text-text mb-4 z-10 tracking-tight">Extracting Signals...</h3>
                  <p className="text-lg text-text-muted font-medium z-10 text-center px-4">
                    Scanning structure, parsing keywords, and analyzing complexity against industry benchmarks.
                  </p>
                </motion.div>
              )}

              {result && !isLoading && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
                  className="w-full flex-1 bg-surface/90 backdrop-blur-3xl border border-white/40 dark:border-white/10 rounded-[2.5rem] p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col items-center justify-center group"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none transform group-hover:scale-110 group-hover:rotate-12">
                    <Award className="w-64 h-64 text-text" />
                  </div>
                  
                  <div className="inline-flex items-center space-x-2 px-5 py-2 rounded-full bg-border/50 border border-border text-text text-sm font-black tracking-widest uppercase mb-10">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Analysis Complete</span>
                  </div>
                  
                  {/* Huge Circular Progress */}
                  <div className="relative w-64 h-64 flex items-center justify-center mb-10 group/score">
                    <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl group-hover/score:bg-primary/20 transition-colors duration-700" />
                    <svg className="w-full h-full transform -rotate-90 relative z-10 drop-shadow-2xl" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="6" className="text-border/40" />
                      <motion.circle 
                        cx="50" 
                        cy="50" 
                        r="44" 
                        fill="none" 
                        stroke="url(#gradient)" 
                        strokeWidth="10" 
                        strokeDasharray="276" 
                        initial={{ strokeDashoffset: 276 }}
                        animate={{ strokeDashoffset: 276 - (276 * result.overallScore) / 100 }}
                        transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          {result.overallScore >= 80 ? (
                            <><stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#059669" /></>
                          ) : result.overallScore >= 60 ? (
                            <><stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#d97706" /></>
                          ) : (
                            <><stop offset="0%" stopColor="#fb7185" /><stop offset="100%" stopColor="#e11d48" /></>
                          )}
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center w-full h-full z-20">
                      <span className="text-7xl font-black text-text tracking-tighter drop-shadow-md">{result.overallScore}</span>
                      <span className="text-lg font-bold text-text-muted uppercase tracking-widest mt-1">Score</span>
                    </div>
                  </div>

                  <div className={`px-8 py-3 rounded-full border-2 text-sm font-black uppercase tracking-widest mb-12 shadow-lg ${
                    result.overallScore >= 80 
                      ? "text-emerald-700 border-emerald-300 bg-emerald-100" 
                      : result.overallScore >= 60 
                      ? "text-amber-700 border-amber-300 bg-amber-100" 
                      : "text-rose-700 border-rose-300 bg-rose-100"
                  }`}>
                    {result.overallScore >= 80 ? "Top 10% Candidate" : result.overallScore >= 60 ? "Requires Refinement" : "Critical Overhaul Needed"}
                  </div>

                  <button
                    onClick={resetState}
                    className="flex items-center space-x-2 text-sm font-bold text-text-muted hover:text-text bg-border/30 hover:bg-border/60 px-6 py-3 rounded-full transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Scan Another Document</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: High-End Data Dashboard */}
          <div className="flex-1 flex flex-col space-y-6 lg:max-w-xl">
            <div className="w-full bg-surface/90 backdrop-blur-3xl border border-white/40 dark:border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] flex-1 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-[80px] pointer-events-none" />
              
              <div className="mb-8 relative z-10">
                <h3 className="font-extrabold text-2xl tracking-tight text-text mb-2 flex items-center">
                  <Database className="w-6 h-6 text-primary mr-3" />
                  Telemetry Engine
                </h3>
                <p className="text-text-muted font-medium text-sm">How Fortune 500 ATS logic evaluates your profile structure</p>
              </div>
              
              <div className="space-y-7 flex-1 relative z-10">
                {(result ? result.categories : SCORING_CRITERIA).map((cat, idx) => {
                  const isResult = !!result;
                  const name = cat.name;
                  const weightage = cat.weightage;
                  const score = isResult ? (cat as CategoryScore).score : 0;
                  const description = isResult ? (cat as CategoryScore).feedback : (cat as any).description;
                  const IconComponent = SCORING_CRITERIA.find(c => c.name === name)?.icon || FileText;

                  return (
                    <div key={idx} className="flex flex-col group/item relative">
                      <div className="flex justify-between items-end mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-bg-base border border-border rounded-lg shadow-sm">
                            <IconComponent className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-bold text-sm text-text">{name}</span>
                        </div>
                        <span className="text-xs font-black tracking-widest text-text-muted bg-bg-base px-2 py-1 rounded-md border border-border shadow-sm">
                          {isResult ? (
                            <><span className={getScoreColorText(score, weightage)}>{score}</span> / {weightage}</>
                          ) : (
                            <span className="text-primary">{weightage} PT MAX</span>
                          )}
                        </span>
                      </div>
                      
                      <div className="w-full h-3.5 bg-bg-base/80 border border-border rounded-full relative overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
                        <div 
                          className="absolute left-0 top-0 h-full rounded-full bg-border/60"
                          style={{ width: `${weightage}%` }}
                        />
                        
                        {isResult && (
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.4 + (idx * 0.15) }}
                            className={`absolute left-0 top-0 h-full rounded-full bg-gradient-to-r ${getProgressColor(score, weightage)}`}
                          >
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
                          </motion.div>
                        )}
                      </div>
                      
                      <p className="text-[13px] text-text-muted leading-relaxed font-medium mt-3 pl-1 border-l-2 border-primary/30">
                        {description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Improve CTA Widget */}
            <AnimatePresence>
              {result && !isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, type: "spring", delay: 1 }}
                  className="bg-text text-bg-base rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col sm:flex-row items-center justify-between relative overflow-hidden group/improve"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[60px] pointer-events-none transition-transform duration-700 group-hover/improve:scale-150" />
                  
                  <div className="mb-6 sm:mb-0 relative z-10 pr-4">
                    <h4 className="font-extrabold text-2xl mb-2 tracking-tight">Need a guaranteed 95+?</h4>
                    <p className="text-sm font-medium text-bg-base/80">
                      Use our proprietary builder. It forces you to write bullet points exactly how ATS engines want to read them.
                    </p>
                  </div>
                  
                  <Link
                    href="/build"
                    className="shrink-0 px-8 py-4 bg-primary hover:bg-primary/90 text-white text-sm font-black tracking-widest uppercase rounded-xl shadow-[0_10px_30px_rgba(var(--color-primary-rgb),0.3)] hover:shadow-[0_15px_40px_rgba(var(--color-primary-rgb),0.5)] transition-all duration-300 flex items-center space-x-3 relative z-10 group/btn transform hover:-translate-y-1 hover:scale-105"
                  >
                    <span>Fix Resume Now</span>
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
