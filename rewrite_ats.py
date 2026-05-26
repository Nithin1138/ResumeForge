with open("app/ats-check/page.tsx", "w") as f:
    f.write("""\"use client\";

import { useState, useRef, useEffect } from "react";
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
  icon?: any;
}

interface ATSResult {
  overallScore: number;
  categories: CategoryScore[];
}

const SCORING_CRITERIA = [
  { name: "Keyword Match", weightage: 35, description: "Density and relevance of technical keywords.", icon: Database },
  { name: "Parsing & Structure", weightage: 25, description: "Machine readability and formatting integrity.", icon: Code },
  { name: "Signal Strength", weightage: 20, description: "Complexity and depth of engineering impact.", icon: Cpu },
  { name: "Quantification", weightage: 10, description: "Presence of quantifiable achievements.", icon: Zap },
  { name: "Readability", weightage: 7, description: "Skim-friendliness for human recruiters.", icon: Layout },
  { name: "Role Relevance", weightage: 3, description: "Alignment with target role expectations.", icon: Briefcase },
];

const LOADING_STEPS = [
  "Initializing audit...",
  "Parsing document structure...",
  "Extracting semantic signals...",
  "Cross-referencing keywords...",
  "Evaluating recruiter readability...",
  "Finalizing reality check..."
];

export default function ATSCheckPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ATSResult | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 800);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

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
      // Emulate loading a bit longer for UX
      setTimeout(() => {
        setResult(data);
        setIsLoading(false);
      }, 1000);
    } catch (err: any) {
      setError(err.message || "An error occurred while analyzing the resume.");
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };
  
  const getScoreColorText = (score: number, max: number) => {
    const ratio = score / max;
    if (ratio >= 0.8) return "text-primary";
    if (ratio >= 0.6) return "text-warning";
    return "text-error";
  };

  return (
    <div className="min-h-screen bg-bg-base text-text font-sans flex flex-col selection:bg-primary/20">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-bg-base/80 backdrop-blur-lg border-b border-border/50 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3">
          <img src="/logo.png" alt="ATSLift Logo" className="w-8 h-8 rounded-md object-contain" />
          <span className="font-bold text-lg tracking-tight text-text">
            ATS<span className="text-primary font-medium font-serif italic">Lift</span>
          </span>
        </Link>
        <Link
          href="/build"
          className="px-5 py-2 bg-text hover:bg-text/90 text-bg-base text-xs md:text-sm font-semibold rounded-full transition-all duration-300"
        >
          Builder
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-6xl mx-auto w-full">
        
        {/* Title area (only visible when not showing results) */}
        <AnimatePresence mode="wait">
          {!result && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, margin: 0, overflow: "hidden" }}
              className="text-center mb-12"
            >
              <h1 className="text-5xl md:text-7xl font-serif tracking-tight text-text mb-4">
                ATS <span className="text-primary italic">Reality Check</span>
              </h1>
              <p className="text-text-muted text-lg max-w-xl mx-auto">
                A ruthless, automated audit of your resume structure, keyword density, and recruiter readability.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full">
          <AnimatePresence mode="wait">
            
            {/* STATE 1: UPLOAD */}
            {!result && !isLoading && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-3xl mx-auto flex flex-col items-center"
              >
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full bg-surface border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-300 ${
                    isDragging 
                      ? "border-primary bg-primary/5" 
                      : file 
                      ? "border-primary/40 bg-surface shadow-sm" 
                      : "border-border hover:border-primary/50 hover:bg-primary/5"
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
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 text-primary mb-4" />
                      <p className="font-bold text-text text-xl mb-1">{file.name}</p>
                      <p className="text-sm text-text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <UploadCloud className="w-10 h-10 text-text-muted mb-4" />
                      <p className="font-semibold text-text text-lg mb-1">Click to upload or drag and drop</p>
                      <p className="text-sm text-text-muted">PDF format, up to 5MB</p>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mt-6 p-4 rounded-xl bg-error/5 border border-error/20 flex items-center space-x-3 text-error w-full">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                )}

                <div className="mt-10">
                  <button
                    onClick={handleUpload}
                    disabled={!file}
                    className="px-10 py-4 bg-primary hover:bg-primary/90 text-white text-lg font-semibold rounded-full shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3"
                  >
                    <span>Run Audit</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STATE 2: LOADING */}
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-[400px] flex flex-col items-center justify-center space-y-6"
              >
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 border-2 border-border rounded-full" />
                  <div className="absolute w-16 h-16 border-2 border-primary rounded-full border-t-transparent animate-spin" />
                </div>
                
                <div className="h-8 overflow-hidden text-center relative w-full">
                  <AnimatePresence mode="popLayout">
                    <motion.p
                      key={loadingStep}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="font-serif text-2xl text-text absolute w-full"
                    >
                      {LOADING_STEPS[loadingStep]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* STATE 3: AUDIT REPORT */}
            {result && !isLoading && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full flex flex-col"
              >
                {/* Report Header */}
                <div className="w-full border-b-2 border-text pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between">
                  <div>
                    <span className="text-sm font-bold uppercase tracking-widest text-text-muted mb-2 block">Audit Report</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-text">Reality Check</h2>
                  </div>
                  
                  <div className="mt-6 md:mt-0 flex flex-col md:items-end">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-7xl md:text-8xl font-serif font-bold text-text leading-none tracking-tighter">
                        {result.overallScore}
                      </span>
                      <span className="text-xl text-text-muted font-serif">/ 100</span>
                    </div>
                    <span className={`text-sm font-bold tracking-wide mt-2 ${
                      result.overallScore >= 80 ? "text-primary" : result.overallScore >= 60 ? "text-warning" : "text-error"
                    }`}>
                      {result.overallScore >= 80 ? "Excellent" : result.overallScore >= 60 ? "Requires Refinement" : "Critical Overhaul Needed"}
                    </span>
                  </div>
                </div>

                {/* Criteria Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
                  {(result.categories.length > 0 ? result.categories : SCORING_CRITERIA).map((cat, idx) => {
                    const name = cat.name;
                    const weightage = cat.weightage;
                    const score = (cat as CategoryScore).score ?? 0;
                    const description = (cat as CategoryScore).feedback ?? (cat as any).description;
                    
                    return (
                      <div key={idx} className="flex flex-col pt-6 border-t border-border">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-semibold text-text">{name}</span>
                          <span className="text-xs font-bold bg-surface px-2 py-1 rounded text-text-muted">
                            <span className={getScoreColorText(score, weightage)}>{score}</span> / {weightage} pts
                          </span>
                        </div>
                        
                        {/* Progress indicator line */}
                        <div className="w-full h-1 bg-border/40 rounded-full mb-4 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(score / weightage) * 100}%` }}
                            transition={{ duration: 1, delay: 0.2 + (idx * 0.1) }}
                            className={`h-full rounded-full ${
                              (score/weightage) >= 0.8 ? 'bg-primary' : (score/weightage) >= 0.6 ? 'bg-warning' : 'bg-error'
                            }`}
                          />
                        </div>
                        
                        <p className="text-sm text-text-muted leading-relaxed flex-1">
                          {description}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Report Footer / CTA */}
                <div className="mt-16 bg-surface border border-border p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between text-center sm:text-left">
                  <div>
                    <h3 className="text-xl font-serif text-text font-bold mb-2">Need a guaranteed 95+?</h3>
                    <p className="text-text-muted text-sm">Our AI builder forces you to structure bullet points exactly how ATS engines read them.</p>
                  </div>
                  
                  <div className="mt-6 sm:mt-0 flex items-center space-x-4 shrink-0">
                    <button
                      onClick={resetState}
                      className="px-5 py-2.5 text-sm font-semibold text-text-muted hover:text-text transition-colors"
                    >
                      Scan Another
                    </button>
                    <Link
                      href="/build"
                      className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-full transition-all duration-300"
                    >
                      Improve Resume
                    </Link>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
""")
