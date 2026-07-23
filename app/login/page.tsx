"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight, Mail, Sparkles, Lock, Eye, EyeOff, CheckCircle2, ShieldCheck, KeyRound, Check } from "lucide-react";
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

  // Standard Auth States
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
          setResetSuccess(`6-digit verification code sent to ${email}`);
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
      setResetSuccess(`6-digit code sent to ${forgotEmail}`);
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

  return (
    <div className="min-h-screen bg-bg-base text-text flex flex-col font-sans relative overflow-hidden">
      {/* Ambient Animated Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.25, 0.4, 0.25],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.15, 0.35, 0.15],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"
      />

      {/* Header */}
      <header className="glass-panel border-b border-border/40 px-6 py-4 flex items-center justify-between relative z-20">
        <Link href="/" className="flex items-center space-x-2 cursor-pointer group">
          <img src="/logo.png" alt="ATSLift Logo" className="w-8 h-8 rounded-md object-contain logo-rotated transition-transform group-hover:scale-105" />
          <span className="font-bold text-lg tracking-tight text-text">
            ATS<span className="text-primary font-medium font-serif italic">Lift</span>
          </span>
        </Link>
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>256-Bit SSL Encrypted</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Card Container with Viewport Constraint & Custom Scrollbar */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 relative z-10 my-auto">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel bg-surface/95 dark:bg-surface/95 backdrop-blur-2xl border border-border/80 rounded-3xl max-w-[460px] w-full p-5 sm:p-7 shadow-2xl relative max-h-[88vh] overflow-y-auto custom-scrollbar flex flex-col justify-between"
        >
          <div>
            {/* Top Decorative Header */}
            <div className="text-center space-y-1.5 mb-5">
              <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-extrabold text-primary uppercase tracking-wider shadow-2xs">
                <Sparkles className="w-3 h-3 animate-pulse text-amber-400" />
                <span>Placement Season 2026 Active</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text">
                {isForgotPass ? "Account Recovery" : isSignUp ? "Create ATSLift Account" : "Access Your Space"}
              </h1>
              <p className="text-xs text-text-muted font-medium max-w-xs mx-auto leading-relaxed">
                {isForgotPass
                  ? "Reset your password via 6-digit email OTP verification."
                  : isSignUp
                  ? "Verify your email with a 6-digit code to create your account."
                  : "Manage unlocked resumes, candidate space vault, and AI copilot."}
              </p>
            </div>

            {/* Segmented Tab Switcher (Sign In vs Create Account) */}
            {!isForgotPass && (
              <div className="flex items-center bg-bg-base/80 border border-border/70 p-1 rounded-2xl mb-5 relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setSignUpStep("form");
                    setError(null);
                    setResetSuccess(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all relative z-10 cursor-pointer ${
                    !isSignUp ? "text-primary dark:text-white" : "text-text-muted hover:text-text"
                  }`}
                >
                  {!isSignUp && (
                    <motion.div
                      layoutId="authTab"
                      className="absolute inset-0 bg-surface dark:bg-surface-dark border border-border/60 rounded-xl shadow-xs -z-10"
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
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all relative z-10 cursor-pointer ${
                    isSignUp ? "text-primary dark:text-white" : "text-text-muted hover:text-text"
                  }`}
                >
                  {isSignUp && (
                    <motion.div
                      layoutId="authTab"
                      className="absolute inset-0 bg-surface dark:bg-surface-dark border border-border/60 rounded-xl shadow-xs -z-10"
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
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3 bg-error/10 border border-error/20 text-error text-xs rounded-xl font-bold mb-4 flex items-center space-x-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-error shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {resetSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl font-bold mb-4 flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{resetSuccess}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Animated Content Views */}
            <AnimatePresence mode="wait">
              {isForgotPass ? (
                <motion.div
                  key="forgotView"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3.5"
                >
                  {forgotPassStep === "email" ? (
                    <form onSubmit={handleForgotPassSubmit} className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-extrabold mb-1 uppercase tracking-wider text-text-muted">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                          <input
                            type="email"
                            required
                            autoComplete="email"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/80 bg-bg-base text-text focus:ring-2 focus:ring-primary/40 focus:border-transparent outline-none text-xs font-semibold transition-all"
                            placeholder="e.g. nithin.kumar@vit.edu"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-gradient-to-r from-primary via-emerald-600 to-primary hover:opacity-95 text-white text-xs font-extrabold rounded-full flex items-center justify-center space-x-2 shadow-md hover:scale-[1.005] active:scale-[0.995] transition-all cursor-pointer disabled:opacity-50 mt-1"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span>Send 6-Digit OTP</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPass(false);
                            setError(null);
                            setResetSuccess(null);
                          }}
                          className="text-xs text-text-muted hover:text-primary transition-colors font-bold cursor-pointer"
                        >
                          ← Back to Sign In
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleResetPassSubmit} className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-extrabold mb-1 uppercase tracking-wider text-text-muted">
                          6-Digit OTP Code
                        </label>
                        <div className="relative">
                          <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                          <input
                            type="text"
                            required
                            maxLength={6}
                            pattern="\d{6}"
                            inputMode="numeric"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/80 bg-bg-base text-text focus:ring-2 focus:ring-primary/40 focus:border-transparent outline-none text-xs tracking-widest font-bold transition-all"
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
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                          <input
                            type={showNewPassword ? "text" : "password"}
                            required
                            autoComplete="new-password"
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border/80 bg-bg-base text-text focus:ring-2 focus:ring-primary/40 focus:border-transparent outline-none text-xs font-semibold transition-all"
                            placeholder="Min 8 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer"
                            tabIndex={-1}
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-gradient-to-r from-primary via-emerald-600 to-primary hover:opacity-95 text-white text-xs font-extrabold rounded-full flex items-center justify-center space-x-2 shadow-md hover:scale-[1.005] active:scale-[0.995] transition-all cursor-pointer disabled:opacity-50 mt-1"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span>Confirm & Reset Password</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setForgotPassStep("email");
                            setError(null);
                          }}
                          className="text-xs text-text-muted hover:text-primary transition-colors font-bold cursor-pointer"
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
                  initial={{ opacity: 0, x: isSignUp ? 12 : -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isSignUp ? -12 : 12 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3.5"
                >
                  {/* Google Sign In Option */}
                  <button
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading || isLoading}
                    className="w-full py-2.5 border border-border/80 hover:bg-bg-base/80 text-text text-xs font-bold rounded-xl flex items-center justify-center space-x-2.5 transition-all cursor-pointer disabled:opacity-50 shadow-2xs hover:shadow-xs group"
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    ) : (
                      <svg className="w-4 h-4 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        <path d="M1 1h22v22H1z" fill="none" />
                      </svg>
                    )}
                    <span>Continue with Google</span>
                  </button>

                  <div className="flex items-center my-3">
                    <div className="flex-1 h-[1px] bg-border/60" />
                    <span className="text-[10px] text-text-muted font-extrabold px-3 uppercase tracking-wider">Or Email & Password</span>
                    <div className="flex-1 h-[1px] bg-border/60" />
                  </div>

                  {/* Email & Password Form */}
                  <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-extrabold mb-1 uppercase tracking-wider text-text-muted">
                        University / Personal Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                          type="email"
                          required
                          disabled={isSignUp && signUpStep === "otp"}
                          autoComplete="email"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/80 bg-bg-base text-text focus:ring-2 focus:ring-primary/40 focus:border-transparent outline-none text-xs font-semibold transition-all disabled:opacity-60"
                          placeholder="e.g. nithin.kumar@vit.edu"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    {isSignUp && signUpStep === "otp" ? (
                      <div>
                        <label className="block text-[10px] font-extrabold mb-1 uppercase tracking-wider text-text-muted">
                          Enter 6-Digit Code Received via Email
                        </label>
                        <div className="relative">
                          <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                          <input
                            type="text"
                            required
                            maxLength={6}
                            pattern="\d{6}"
                            inputMode="numeric"
                            autoFocus
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-primary/50 bg-bg-base text-text focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm tracking-widest font-extrabold transition-all"
                            placeholder="123456"
                            value={signUpOtp}
                            onChange={(e) => setSignUpOtp(e.target.value.replace(/\D/g, ""))}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSignUpStep("form");
                              setSignUpOtp("");
                              setError(null);
                              setResetSuccess(null);
                            }}
                            className="text-xs font-bold text-primary hover:underline cursor-pointer"
                          >
                            ← Change Email or Password
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <div className="flex justify-between items-center mb-1">
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
                                className="text-xs font-bold text-primary hover:underline cursor-pointer"
                              >
                                Forgot password?
                              </button>
                            )}
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                              type={showPassword ? "text" : "password"}
                              required
                              autoComplete={isSignUp ? "new-password" : "current-password"}
                              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border/80 bg-bg-base text-text focus:ring-2 focus:ring-primary/40 focus:border-transparent outline-none text-xs font-semibold transition-all"
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer"
                              tabIndex={-1}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>

                          {/* Sleek Compact Password Strength Indicator for Account Creation */}
                          {isSignUp && password.length > 0 && (
                            <div className="mt-2 p-2.5 bg-bg-base/70 border border-border/60 rounded-xl space-y-1.5">
                              <div className="flex items-center justify-between text-[10px] font-extrabold">
                                <span className="text-text-muted uppercase tracking-wider">Password Strength</span>
                                <span className={strength.textColor}>{strength.label}</span>
                              </div>
                              
                              <div className="grid grid-cols-4 gap-1 h-1.5 w-full">
                                {[1, 2, 3, 4].map((step) => (
                                  <div
                                    key={step}
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      strength.score >= step ? strength.color : "bg-border/40"
                                    }`}
                                  />
                                ))}
                              </div>

                              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 pt-0.5 text-[10px] font-bold">
                                {strength.checks.map((c, idx) => (
                                  <div key={idx} className="flex items-center space-x-1">
                                    <span className={c.met ? "text-emerald-500 shrink-0" : "text-text-muted/40 shrink-0"}>
                                      {c.met ? "✓" : "•"}
                                    </span>
                                    <span className={c.met ? "text-text" : "text-text-muted/50"}>
                                      {c.label}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Confirm Password Input (Only for Account Creation) */}
                        {isSignUp && (
                          <div>
                            <label className="block text-[10px] font-extrabold mb-1 uppercase tracking-wider text-text-muted">
                              Confirm Password
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                autoComplete="new-password"
                                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border ${
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
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                                {passwordsMatch && (
                                  <Check className="w-4 h-4 text-emerald-500" />
                                )}
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="text-text-muted hover:text-text cursor-pointer"
                                  tabIndex={-1}
                                >
                                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                            {confirmPassword && !passwordsMatch && (
                              <p className="text-[10px] text-rose-500 font-bold mt-1">Passwords do not match</p>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading || isGoogleLoading}
                      className="w-full py-3 bg-gradient-to-r from-primary via-emerald-600 to-primary hover:opacity-95 text-white text-xs font-extrabold rounded-full flex items-center justify-center space-x-2 shadow-md hover:scale-[1.005] active:scale-[0.995] transition-all cursor-pointer disabled:opacity-50 mt-2"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>
                            {isSignUp
                              ? signUpStep === "otp"
                                ? "Verify Code & Create Account"
                                : "Send 6-Digit Code"
                              : "Sign In to Dashboard"}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
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
