"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight, Mail, Sparkles, Lock, Eye, EyeOff, CheckCircle2, ShieldCheck, User, KeyRound } from "lucide-react";
import { signIn, getSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";

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

  // Standard Login States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifyRequest, setIsVerifyRequest] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password / OTP States
  const [isForgotPass, setIsForgotPass] = useState(false);
  const [forgotPassStep, setForgotPassStep] = useState<"email" | "otp">("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("verifyRequest") === "true") {
      setIsVerifyRequest(true);
    }
    if (searchParams.get("error") && searchParams.get("error") !== "SessionExpired") {
      setError("Authentication failed. Please try again.");
    }
  }, [searchParams]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isVerifyRequest && email && password) {
      interval = setInterval(async () => {
        try {
          const session = await getSession();
          if (session) {
            router.push("/dashboard");
            return;
          }

          const res = await fetch("/api/auth/check-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          const data = await res.json();

          if (data.verified) {
            clearInterval(interval);
            const signInRes = await signIn("credentials", {
              email,
              password,
              redirect: false,
            });
            if (signInRes && !signInRes.error) {
              router.push("/dashboard");
            }
          }
        } catch (error) {}
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isVerifyRequest, router, email, password]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetSuccess(null);
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid university or personal email address.");
      return;
    }
    if (!password.trim() || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        const registerRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const registerData = await registerRes.json();

        if (!registerRes.ok) {
          throw new Error(registerData.message || "Failed to register.");
        }

        const emailSignInRes = await signIn("email", {
          email,
          callbackUrl: "/dashboard",
          redirect: false,
        });
        if (emailSignInRes?.error) {
          throw new Error("Account created, but failed to send activation email.");
        }

        setIsVerifyRequest(true);
        setIsLoading(false);
        return;
      }

      const res = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/dashboard",
        redirect: false,
      });

      if (res?.error) {
        throw new Error(res.error);
      } else if (res?.url) {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
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
      {/* Dynamic Animated Ambient Background Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"
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

      {/* Main Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel bg-surface/90 dark:bg-surface/90 backdrop-blur-2xl border border-border/80 rounded-3xl max-w-md w-full p-6 md:p-9 shadow-2xl relative overflow-hidden"
        >
          {/* Top Decorative Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-extrabold text-primary uppercase tracking-wider mb-1 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-400" />
              <span>Placement Season 2026 Active</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-text">
              {isForgotPass ? "Account Recovery" : isSignUp ? "Create ATSLift Account" : "Access Your Space"}
            </h1>
            <p className="text-xs text-text-muted font-medium max-w-xs mx-auto leading-relaxed">
              {isForgotPass
                ? "Reset your password via 6-digit email OTP verification."
                : isSignUp
                ? "Unlock copyable ATS resumes, cover letters, and master profile vault."
                : "Manage unlocked resumes, candidate space vault, and AI copilot."}
            </p>
          </div>

          {/* Segmented Tab Switcher (Sign In vs Create Account) */}
          {!isForgotPass && !isVerifyRequest && (
            <div className="flex items-center bg-bg-base/80 border border-border p-1 rounded-2xl mb-6 relative">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
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
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-3.5 bg-error/10 border border-error/20 text-error text-xs rounded-2xl font-bold mb-5 flex items-center space-x-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-error shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {resetSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-2xl font-bold mb-5 flex items-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{resetSuccess}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Animated Content Views */}
          <AnimatePresence mode="wait">
            {isVerifyRequest ? (
              <motion.div
                key="verifyView"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-6 space-y-4"
              >
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto shadow-md animate-bounce">
                  <Mail className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-serif font-bold text-text">Check Your Email</h3>
                <p className="text-xs text-text-muted font-medium leading-relaxed max-w-xs mx-auto">
                  A magic activation link has been sent to <span className="font-bold text-text">{email}</span>. Click the link to instantly log in.
                </p>
                <button
                  onClick={() => setIsVerifyRequest(false)}
                  className="pt-2 text-xs text-primary font-bold hover:underline cursor-pointer inline-flex items-center space-x-1"
                >
                  <span>← Try a different email</span>
                </button>
              </motion.div>
            ) : isForgotPass ? (
              <motion.div
                key="forgotView"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {forgotPassStep === "email" ? (
                  <form onSubmit={handleForgotPassSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider text-text-muted">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                          type="email"
                          required
                          autoComplete="email"
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-border/80 bg-bg-base text-text focus:ring-2 focus:ring-primary/40 focus:border-transparent outline-none text-xs font-semibold transition-all"
                          placeholder="e.g. nithin.kumar@vit.edu"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 bg-gradient-to-r from-primary via-emerald-600 to-primary hover:opacity-95 text-white text-xs font-extrabold rounded-full flex items-center justify-center space-x-2 shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
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

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPass(false);
                          setError(null);
                        }}
                        className="text-xs text-text-muted hover:text-primary transition-colors font-bold cursor-pointer"
                      >
                        ← Back to Sign In
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider text-text-muted">
                        6-Digit OTP Code
                      </label>
                      <div className="relative">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          pattern="\d{6}"
                          inputMode="numeric"
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-border/80 bg-bg-base text-text focus:ring-2 focus:ring-primary/40 focus:border-transparent outline-none text-xs tracking-widest font-bold transition-all"
                          placeholder="123456"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider text-text-muted">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                          type={showNewPassword ? "text" : "password"}
                          required
                          autoComplete="new-password"
                          className="w-full pl-11 pr-12 py-3 rounded-xl border border-border/80 bg-bg-base text-text focus:ring-2 focus:ring-primary/40 focus:border-transparent outline-none text-xs font-semibold transition-all"
                          placeholder="Min 6 characters"
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
                      className="w-full py-3.5 bg-gradient-to-r from-primary via-emerald-600 to-primary hover:opacity-95 text-white text-xs font-extrabold rounded-full flex items-center justify-center space-x-2 shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
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

                    <div className="text-center pt-2">
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
                key={isSignUp ? "signUpForm" : "signInForm"}
                initial={{ opacity: 0, x: isSignUp ? 15 : -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isSignUp ? -15 : 15 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* Google Sign In Option */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading || isLoading}
                  className="w-full py-3 border border-border/80 hover:bg-bg-base/80 text-text text-xs font-bold rounded-2xl flex items-center justify-center space-x-2.5 transition-all cursor-pointer disabled:opacity-50 shadow-2xs hover:shadow-xs group"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  ) : (
                    <svg className="w-4.5 h-4.5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      <path d="M1 1h22v22H1z" fill="none" />
                    </svg>
                  )}
                  <span>Continue with Google</span>
                </button>

                <div className="flex items-center my-4">
                  <div className="flex-1 h-[1px] bg-border/60" />
                  <span className="text-[10px] text-text-muted font-extrabold px-3 uppercase tracking-wider">Or Email & Password</span>
                  <div className="flex-1 h-[1px] bg-border/60" />
                </div>

                {/* Email & Password Form */}
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider text-text-muted">
                      University / Personal Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-border/80 bg-bg-base text-text focus:ring-2 focus:ring-primary/40 focus:border-transparent outline-none text-xs font-semibold transition-all"
                        placeholder="e.g. nithin.kumar@vit.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted">
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
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="current-password"
                        className="w-full pl-11 pr-12 py-3 rounded-xl border border-border/80 bg-bg-base text-text focus:ring-2 focus:ring-primary/40 focus:border-transparent outline-none text-xs font-semibold transition-all"
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
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || isGoogleLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-primary via-emerald-600 to-primary hover:opacity-95 text-white text-xs font-extrabold rounded-full flex items-center justify-center space-x-2 shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>{isSignUp ? "Create ATSLift Account" : "Sign In to Dashboard"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
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
