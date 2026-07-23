"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Loader2, 
  ArrowRight, 
  Mail, 
  Sparkles, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ShieldCheck, 
  KeyRound, 
  Check, 
  FileText, 
  Zap, 
  Star,
  GraduationCap,
  Key,
  FolderKanban
} from "lucide-react";
import { signIn, getSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";

function getPasswordStrength(pass: string) {
  const hasMinLen = pass.length >= 8;
  const hasUpper = /[A-Z]/.test(pass);
  const hasLower = /[a-z]/.test(pass);
  const hasNumOrSpecial = /[\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass);

  const checks = [
    { label: "8+ Chars", met: hasMinLen },
    { label: "A-Z Upper", met: hasUpper },
    { label: "a-z Lower", met: hasLower },
    { label: "Number/Symbol", met: hasNumOrSpecial },
  ];

  const score = checks.filter((c) => c.met).length;

  let label = "Weak";
  let color = "bg-rose-500";
  let textColor = "text-rose-500";

  if (score === 2) {
    label = "Fair";
    color = "bg-amber-500";
    textColor = "text-amber-500";
  } else if (score === 3) {
    label = "Good";
    color = "bg-yellow-500";
    textColor = "text-yellow-500";
  } else if (score === 4) {
    label = "Strong";
    color = "bg-emerald-500";
    textColor = "text-emerald-500";
  }

  return { score, label, color, textColor, checks };
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("error") === "SessionExpired") {
      signOut({ redirect: false });
    } else {
      getSession().then((session) => {
        if (session) {
          router.push("/dashboard");
        }
      });
    }
  }, [router, searchParams]);

  // Auth States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpStep, setSignUpStep] = useState<"form" | "otp">("form");
  const [signUpOtp, setSignUpOtp] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot Password / OTP States
  const [isForgotPass, setIsForgotPass] = useState(false);
  const [forgotPassStep, setForgotPassStep] = useState<"email" | "otp">("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("error") && searchParams.get("error") !== "SessionExpired") {
      setError("Mail or password is wrong");
    }
  }, [searchParams]);

  const strength = getPasswordStrength(password);
  const passwordsMatch = confirmPassword.length > 0 && confirmPassword === password;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetSuccess(null);

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid university or personal email address.");
      return;
    }

    if (isSignUp && signUpStep === "form") {
      if (strength.score < 4) {
        setError("Please fulfill all 4 password strength requirements.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match. Please re-enter your password.");
        return;
      }
    }

    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (signUpStep === "form") {
          // Step 1: Send 6-digit OTP code to candidate's email
          const res = await fetch("/api/auth/send-signup-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.message || "Failed to send verification code.");
          }

          setSignUpStep("otp");
          if (data.otp) {
            setResetSuccess(`Code sent! For Sandbox Test, use: ${data.otp}`);
          } else {
            setResetSuccess(`6-digit verification code sent to ${email}`);
          }
        } else {
          // Step 2: Verify 6-digit OTP code and create account
          if (!signUpOtp.trim() || signUpOtp.length !== 6 || !/^\d+$/.test(signUpOtp)) {
            throw new Error("Verification code must be a 6-digit number.");
          }

          const registerRes = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, otp: signUpOtp }),
          });

          const registerData = await registerRes.json();
          if (!registerRes.ok) {
            throw new Error(registerData.message || "Failed to create account.");
          }

          // Auto sign-in with credentials after successful verification
          const signInRes = await signIn("credentials", {
            email,
            password,
            redirect: false,
          });

          if (signInRes?.error) {
            setResetSuccess("Account created successfully! Please sign in with your email and password.");
            setIsSignUp(false);
            setSignUpStep("form");
          } else {
            router.push("/dashboard");
          }
        }
      } else {
        // Direct Sign In with Email & Password
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (res?.error) {
          throw new Error("Mail or password is wrong");
        } else if (res?.ok) {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setError(err.message || "Mail or password is wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);
    setResetSuccess(null);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err: any) {
      setError(err.message || "Google Authentication failed.");
      setIsGoogleLoading(false);
    }
  };

  const handleForgotPassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(null);
    setResetSuccess(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to request password reset.");
      }

      setForgotPassStep("otp");
      if (data.otp) {
        setResetSuccess(`Code sent! For Sandbox Test, use: ${data.otp}`);
      } else {
        setResetSuccess(`6-digit code sent to ${forgotEmail}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to send verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError("OTP code must be a 6-digit number.");
      return;
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, otp, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password.");
      }

      setResetSuccess("Password reset successfully. Please log in with your new password.");
      setIsForgotPass(false);
      setForgotPassStep("email");
      setEmail(forgotEmail);
      setPassword("");
      setConfirmPassword("");
      setOtp("");
      setNewPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  // Determine active view key for dynamic left side content
  const activeMode = isForgotPass ? "forgot" : isSignUp ? "signup" : "signin";

  return (
    <div className="min-h-screen bg-bg-base text-text flex flex-col font-sans relative overflow-hidden">
      {/* Dynamic Animated Ambient Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.25, 0.45, 0.25],
          x: [0, 30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary/15 rounded-full blur-[140px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
          y: [0, -40, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-10%] right-[-5%] w-[550px] h-[550px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none"
      />

      {/* Top Header */}
      <header className="glass-panel border-b border-border/40 px-6 py-3.5 flex items-center justify-between relative z-30">
        <Link href="/" className="flex items-center space-x-2.5 cursor-pointer group">
          <img src="/logo.png" alt="ATSLift Logo" className="w-7 h-7 rounded-md object-contain logo-rotated transition-transform group-hover:scale-105" />
          <span className="font-bold text-lg tracking-tight text-text">
            ATS<span className="text-primary font-medium font-serif italic">Lift</span>
          </span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-Bit SSL Encrypted Vault</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Split Grid Section */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 gap-8 items-center relative z-20 my-auto">
        
        {/* Left Side: Dynamic Brand Showcase & Social Proof */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-6 pr-4 min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMode}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-5"
            >
              {/* Dynamic Top Pill Badge */}
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-extrabold text-primary uppercase tracking-wider shadow-2xs backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>
                  {activeMode === "forgot"
                    ? "🔐 ACCOUNT RECOVERY MODE"
                    : activeMode === "signin"
                    ? "⚡ WELCOME BACK CANDIDATE"
                    : "✨ CAMPUS PLACEMENT SEASON 2026 ACTIVE"}
                </span>
              </div>

              {/* Dynamic Main Headline */}
              <div className="space-y-2.5">
                <h1 className="text-4xl xl:text-[44px] font-serif font-bold tracking-tight text-text leading-[1.12]">
                  {activeMode === "forgot" ? (
                    <>
                      Reset Your Password <span className="text-primary italic font-serif">Securely</span>.
                    </>
                  ) : activeMode === "signin" ? (
                    <>
                      Access Your Saved <span className="text-primary italic font-serif">ATS Resumes</span> & Vault.
                    </>
                  ) : (
                    <>
                      Turn Raw Projects Into <span className="text-primary italic font-serif">100% ATS-Passed</span> Resumes.
                    </>
                  )}
                </h1>
                <p className="text-xs sm:text-sm text-text-muted font-medium leading-relaxed max-w-lg">
                  {activeMode === "forgot"
                    ? "Verify your registered email with a 6-digit OTP code to safely update your account credentials."
                    : activeMode === "signin"
                    ? "Sign in to manage your unlocked resumes, edit candidate profile details, and generate tailored cover letters."
                    : "Built specifically for engineering students across CS, IT, ECE, AI/ML, and Data Science to land interviews at top tech companies."}
                </p>
              </div>

              {/* Dynamic Feature Highlight Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {activeMode === "forgot" ? (
                  <>
                    <div className="p-3.5 bg-surface/70 border border-border/70 rounded-xl space-y-1 shadow-2xs hover:border-primary/40 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center font-bold">
                        <Key className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="font-bold text-xs text-text">Instant 6-Digit OTP</h4>
                      <p className="text-[11px] text-text-muted font-medium leading-normal">
                        One-time password code sent directly to your email inbox for instant authentication.
                      </p>
                    </div>

                    <div className="p-3.5 bg-surface/70 border border-border/70 rounded-xl space-y-1 shadow-2xs hover:border-primary/40 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="font-bold text-xs text-text">256-Bit Protection</h4>
                      <p className="text-[11px] text-text-muted font-medium leading-normal">
                        All passwords are encrypted with industry-standard salted bcrypt algorithms.
                      </p>
                    </div>
                  </>
                ) : activeMode === "signin" ? (
                  <>
                    <div className="p-3.5 bg-surface/70 border border-border/70 rounded-xl space-y-1 shadow-2xs hover:border-primary/40 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center font-bold">
                        <FolderKanban className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="font-bold text-xs text-text">Unlocked Resumes Space</h4>
                      <p className="text-[11px] text-text-muted font-medium leading-normal">
                        Access all your unlocked resume versions, edit candidate metrics, and export PDFs anytime.
                      </p>
                    </div>

                    <div className="p-3.5 bg-surface/70 border border-border/70 rounded-xl space-y-1 shadow-2xs hover:border-primary/40 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="font-bold text-xs text-text">1-Click Cover Letters</h4>
                      <p className="text-[11px] text-text-muted font-medium leading-normal">
                        Generate recruiter-matched cover letters based on your saved candidate profile.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3.5 bg-surface/70 border border-border/70 rounded-xl space-y-1 shadow-2xs hover:border-primary/40 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center font-bold">
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="font-bold text-xs text-text">Instant ATS Optimization</h4>
                      <p className="text-[11px] text-text-muted font-medium leading-normal">
                        Auto-formats metrics, tech stacks, and bullet points to bypass recruiter ATS filters.
                      </p>
                    </div>

                    <div className="p-3.5 bg-surface/70 border border-border/70 rounded-xl space-y-1 shadow-2xs hover:border-primary/40 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="font-bold text-xs text-text">PDF & Copyable Formats</h4>
                      <p className="text-[11px] text-text-muted font-medium leading-normal">
                        Download recruiter-ready A4 PDFs or copy raw text directly into online job portals.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Social Proof Card */}
          <div className="p-4 bg-surface/80 border border-border/80 rounded-xl shadow-sm space-y-2">
            <div className="flex items-center space-x-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-xs font-bold text-text ml-2">4.9 / 5.0 Rating</span>
            </div>
            <p className="text-xs text-text font-medium italic leading-relaxed">
              {activeMode === "forgot"
                ? '"Password reset via 6-digit OTP took less than 30 seconds right before my campus interview."'
                : activeMode === "signin"
                ? '"Having all my resume versions stored in ATSLift saved me so much time during off-campus drives!"'
                : '"ATSLift converted my messy project descriptions into bullet points with metrics. Landed 3 SDE interviews!"'}
            </p>
            <div className="flex items-center justify-between text-[10px] text-text-muted pt-1 border-t border-border/50">
              <span className="font-bold text-text">Verified Student Candidate</span>
              <span className="flex items-center space-x-1 font-semibold">
                <GraduationCap className="w-3.5 h-3.5 text-primary" />
                <span>IIT / NIT / VIT Network</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Completely Fixed, Non-Scrollable Auth Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 max-w-[440px] w-full mx-auto"
        >
          <div className="p-[1px] bg-gradient-to-b from-primary/30 via-border/50 to-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden">
            {/* Rigid Fixed Dimensions Card: Absolutely NO scrollbar */}
            <div className="bg-surface/95 dark:bg-surface/95 backdrop-blur-2xl rounded-[23px] p-5 sm:p-6 flex flex-col justify-between overflow-hidden">
              
              <div>
                {/* Header Title inside Card */}
                <div className="text-center space-y-1 mb-3">
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-text">
                    {isForgotPass ? "Account Recovery" : isSignUp ? "Create ATSLift Account" : "Welcome Back"}
                  </h2>
                  <p className="text-[11px] text-text-muted font-medium max-w-xs mx-auto leading-tight">
                    {isForgotPass
                      ? "Enter your email to receive a 6-digit password reset code."
                      : isSignUp
                      ? "Verify your email with a 6-digit code to activate account."
                      : "Access your unlocked resumes, candidate space, & AI copilot."}
                  </p>
                </div>

                {/* Segmented Tab Switcher */}
                {!isForgotPass && (
                  <div className="flex items-center bg-bg-base/90 border border-border/80 p-1 rounded-xl mb-3 relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(false);
                        setSignUpStep("form");
                        setError(null);
                        setResetSuccess(null);
                      }}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all relative z-10 cursor-pointer ${
                        !isSignUp ? "text-primary dark:text-white" : "text-text-muted hover:text-text"
                      }`}
                    >
                      {!isSignUp && (
                        <motion.div
                          layoutId="authTab"
                          className="absolute inset-0 bg-surface dark:bg-surface-dark border border-border/70 rounded-lg shadow-xs -z-10"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      Sign In
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(true);
                        setSignUpStep("form");
                        setError(null);
                        setResetSuccess(null);
                      }}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all relative z-10 cursor-pointer ${
                        isSignUp ? "text-primary dark:text-white" : "text-text-muted hover:text-text"
                      }`}
                    >
                      {isSignUp && (
                        <motion.div
                          layoutId="authTab"
                          className="absolute inset-0 bg-surface dark:bg-surface-dark border border-border/70 rounded-lg shadow-xs -z-10"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      Create Account
                    </button>
                  </div>
                )}

                {/* Animated Alerts */}
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] rounded-lg font-bold mb-2.5 flex items-center space-x-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 animate-pulse" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  {resetSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] rounded-lg font-bold mb-2.5 flex items-center space-x-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                      <span>{resetSuccess}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Auth Forms */}
                <AnimatePresence mode="wait">
                  {isForgotPass ? (
                    <motion.div
                      key="forgotView"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.18 }}
                      className="space-y-2.5"
                    >
                      {forgotPassStep === "email" ? (
                        <form onSubmit={handleForgotPassSubmit} className="space-y-2.5">
                          <div>
                            <label className="block text-[10px] font-extrabold mb-1 uppercase tracking-wider text-text-muted">
                              University / Personal Email
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                              <input
                                type="email"
                                required
                                autoComplete="email"
                                className="w-full pl-9 pr-3 py-2 rounded-lg border border-border/80 bg-bg-base text-text focus:ring-2 focus:ring-primary/40 focus:border-transparent outline-none text-xs font-semibold transition-all"
                                placeholder="e.g. nithin.kumar@vit.edu"
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2.5 bg-gradient-to-r from-primary via-emerald-600 to-primary hover:opacity-95 text-white text-xs font-extrabold rounded-full flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer disabled:opacity-50 mt-1"
                          >
                            {isLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>
                                <span>Send 6-Digit OTP</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>

                          <div className="text-center pt-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                setIsForgotPass(false);
                                setError(null);
                                setResetSuccess(null);
                              }}
                              className="text-[11px] text-text-muted hover:text-primary transition-colors font-bold cursor-pointer"
                            >
                              ← Back to Sign In
                            </button>
                          </div>
                        </form>
                      ) : (
                        <form onSubmit={handleResetPassSubmit} className="space-y-2.5">
                          <div>
                            <label className="block text-[10px] font-extrabold mb-1 uppercase tracking-wider text-text-muted">
                              6-Digit OTP Code
                            </label>
                            <div className="relative">
                              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary" />
                              <input
                                type="text"
                                required
                                maxLength={6}
                                pattern="\d{6}"
                                inputMode="numeric"
                                className="w-full pl-9 pr-3 py-2 rounded-lg border border-border/80 bg-bg-base text-text focus:ring-2 focus:ring-primary/40 focus:border-transparent outline-none text-xs tracking-widest font-bold transition-all"
                                placeholder="123456"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-extrabold mb-1 uppercase tracking-wider text-text-muted">
                              New Password
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                              <input
                                type={showNewPassword ? "text" : "password"}
                                required
                                autoComplete="new-password"
                                className="w-full pl-9 pr-9 py-2 rounded-lg border border-border/80 bg-bg-base text-text focus:ring-2 focus:ring-primary/40 focus:border-transparent outline-none text-xs font-semibold transition-all"
                                placeholder="Min 8 characters"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer"
                                tabIndex={-1}
                              >
                                {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2.5 bg-gradient-to-r from-primary via-emerald-600 to-primary hover:opacity-95 text-white text-xs font-extrabold rounded-full flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer disabled:opacity-50 mt-1"
                          >
                            {isLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>
                                <span>Confirm & Reset Password</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>

                          <div className="text-center pt-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                setForgotPassStep("email");
                                setError(null);
                              }}
                              className="text-[11px] text-text-muted hover:text-primary transition-colors font-bold cursor-pointer"
                            >
                              Try a different email
                            </button>
                          </div>
                        </form>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key={isSignUp ? `signUpForm_${signUpStep}` : "signInForm"}
                      initial={{ opacity: 0, x: isSignUp ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: isSignUp ? -10 : 10 }}
                      transition={{ duration: 0.18 }}
                      className="space-y-2.5"
                    >
                      {/* Google Sign In Button */}
                      <button
                        onClick={handleGoogleLogin}
                        disabled={isGoogleLoading || isLoading}
                        className="w-full py-2 border border-border/80 hover:bg-bg-base/80 text-text text-xs font-bold rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 shadow-2xs hover:shadow-xs group"
                      >
                        {isGoogleLoading ? (
                          <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                        ) : (
                          <svg className="w-3.5 h-3.5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            <path d="M1 1h22v22H1z" fill="none" />
                          </svg>
                        )}
                        <span>Continue with Google</span>
                      </button>

                      {/* Divider */}
                      <div className="flex items-center my-2">
                        <div className="flex-1 h-[1px] bg-border/60" />
                        <span className="text-[9px] text-text-muted font-extrabold px-2.5 uppercase tracking-wider">Or Email & Password</span>
                        <div className="flex-1 h-[1px] bg-border/60" />
                      </div>

                      {/* Form inputs */}
                      <form onSubmit={handleAuthSubmit} className="space-y-2.5">
                        <div>
                          <label className="block text-[10px] font-extrabold mb-1 uppercase tracking-wider text-text-muted">
                            University / Personal Email
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                            <input
                              type="email"
                              required
                              disabled={isSignUp && signUpStep === "otp"}
                              autoComplete="email"
                              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border/80 bg-bg-base text-text focus:ring-2 focus:ring-primary/40 focus:border-transparent outline-none text-xs font-semibold transition-all disabled:opacity-60"
                              placeholder="e.g. nithin.kumar@vit.edu"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </div>
                        </div>

                        {isSignUp && signUpStep === "otp" ? (
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
                              Enter 6-Digit Code Received via Email
                            </label>
                            <div className="relative">
                              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary" />
                              <input
                                type="text"
                                required
                                maxLength={6}
                                pattern="\d{6}"
                                inputMode="numeric"
                                autoFocus
                                className="w-full pl-9 pr-3 py-2 rounded-lg border-2 border-primary/60 bg-bg-base text-text focus:ring-2 focus:ring-primary focus:border-primary outline-none text-xs tracking-[5px] font-mono font-extrabold transition-all"
                                placeholder="123456"
                                value={signUpOtp}
                                onChange={(e) => setSignUpOtp(e.target.value.replace(/\D/g, ""))}
                              />
                            </div>
                            <div className="flex justify-between items-center pt-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSignUpStep("form");
                                  setSignUpOtp("");
                                  setError(null);
                                  setResetSuccess(null);
                                }}
                                className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                              >
                                ← Change Email or Password
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div>
                              <div className="flex justify-between items-center mb-0.5">
                                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
                                  Password
                                </label>
                                {!isSignUp && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsForgotPass(true);
                                      setForgotPassStep("email");
                                      setForgotEmail(email);
                                      setError(null);
                                      setResetSuccess(null);
                                    }}
                                    className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                                  >
                                    Forgot password?
                                  </button>
                                )}
                              </div>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                                <input
                                  type={showPassword ? "text" : "password"}
                                  required
                                  autoComplete={isSignUp ? "new-password" : "current-password"}
                                  className="w-full pl-9 pr-9 py-2 rounded-lg border border-border/80 bg-bg-base text-text focus:ring-2 focus:ring-primary/40 focus:border-transparent outline-none text-xs font-semibold transition-all"
                                  placeholder="••••••••"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer"
                                  tabIndex={-1}
                                >
                                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>

                              {/* Ultra-Compact Password Strength Bar & Micro Checks */}
                              {isSignUp && password.length > 0 && (
                                <div className="mt-1.5 p-1.5 bg-bg-base/70 border border-border/60 rounded-lg space-y-1">
                                  <div className="flex items-center justify-between text-[9px] font-extrabold">
                                    <span className="text-text-muted uppercase tracking-wider">Strength</span>
                                    <span className={strength.textColor}>{strength.label}</span>
                                  </div>
                                  
                                  <div className="grid grid-cols-4 gap-1 h-1 w-full">
                                    {[1, 2, 3, 4].map((step) => (
                                      <div
                                        key={step}
                                        className={`h-full rounded-full transition-all duration-300 ${
                                          strength.score >= step ? strength.color : "bg-border/40"
                                        }`}
                                      />
                                    ))}
                                  </div>

                                  <div className="grid grid-cols-4 gap-1 pt-0.5 text-[9px] font-bold text-center">
                                    {strength.checks.map((c, idx) => (
                                      <span
                                        key={idx}
                                        className={`px-1 py-0.5 rounded text-[8px] truncate ${
                                          c.met
                                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold"
                                            : "bg-border/30 text-text-muted/50"
                                        }`}
                                      >
                                        {c.met ? "✓ " : ""}{c.label}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Confirm Password Input (Account Creation) */}
                            {isSignUp && (
                              <div>
                                <label className="block text-[10px] font-extrabold mb-0.5 uppercase tracking-wider text-text-muted">
                                  Confirm Password
                                </label>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                                  <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    autoComplete="new-password"
                                    className={`w-full pl-9 pr-9 py-2 rounded-lg border ${
                                      confirmPassword && !passwordsMatch
                                        ? "border-rose-500 focus:ring-rose-500/30"
                                        : confirmPassword && passwordsMatch
                                        ? "border-emerald-500/80 focus:ring-emerald-500/30"
                                        : "border-border/80 focus:ring-primary/40"
                                    } bg-bg-base text-text focus:ring-2 focus:border-transparent outline-none text-xs font-semibold transition-all`}
                                    placeholder="Re-enter your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                  />
                                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                                    {passwordsMatch && (
                                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                      className="text-text-muted hover:text-text cursor-pointer"
                                      tabIndex={-1}
                                    >
                                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>
                                </div>
                                {confirmPassword && !passwordsMatch && (
                                  <p className="text-[9px] text-rose-500 font-bold mt-0.5">Passwords do not match</p>
                                )}
                              </div>
                            )}
                          </>
                        )}

                        <button
                          type="submit"
                          disabled={isLoading || isGoogleLoading}
                          className="w-full py-2.5 bg-gradient-to-r from-primary via-emerald-600 to-primary hover:opacity-95 text-white text-xs font-extrabold rounded-full flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer disabled:opacity-50 mt-2"
                        >
                          {isLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <span>
                                {isSignUp
                                  ? signUpStep === "otp"
                                    ? "Verify Code & Create Account"
                                    : "Send 6-Digit Code"
                                  : "Sign In to Dashboard"}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Card Footer Links (Fixed Bottom) */}
              <div className="pt-2 mt-1 border-t border-border/40 text-center text-[9px] text-text-muted space-x-1.5 shrink-0">
                <span>By continuing, you agree to ATSLift's</span>
                <Link href="/terms" className="underline hover:text-text font-semibold">Terms</Link>
                <span>&</span>
                <Link href="/privacy" className="underline hover:text-text font-semibold">Privacy Policy</Link>
              </div>

            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg-base flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
