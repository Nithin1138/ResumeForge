"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight, Mail, Sparkles, Lock, Eye, EyeOff } from "lucide-react";
import { signIn, getSession, signOut } from "next-auth/react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  
  useEffect(() => {
    if (searchParams.get("error") === "SessionExpired") {
      // Clear invalid session silently to break the redirect loop
      signOut({ redirect: false });
    } else {
      getSession().then(session => {
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
          // Check if session exists on current device
          const session = await getSession();
          if (session) {
            router.push("/dashboard");
            return;
          }
          
          // Cross-device check: Poll backend to see if email was verified on another device (e.g. mobile)
          const res = await fetch("/api/auth/check-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          const data = await res.json();
          
          if (data.verified) {
            clearInterval(interval);
            // Automatically log them in on this device since they are now verified
            const signInRes = await signIn("credentials", { 
              email, 
              password, 
              redirect: false 
            });
            if (signInRes && !signInRes.error) {
              router.push("/dashboard");
            }
          }
        } catch (error) {
          // Ignore polling errors
        }
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
        // Register the user
        const registerRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        
        const registerData = await registerRes.json();
        
        if (!registerRes.ok) {
          throw new Error(registerData.message || "Failed to register.");
        }
        
        // After successful registration, trigger the activation email via NextAuth
        const emailSignInRes = await signIn("email", { 
          email, 
          callbackUrl: "/dashboard",
          redirect: false 
        });
        if (emailSignInRes?.error) {
          throw new Error("Account created, but failed to send activation email.");
        }
        
        setIsVerifyRequest(true);
        setIsLoading(false);
        return;
      }

      // Sign In Flow
      const res = await signIn("credentials", { 
        email, 
        password, 
        callbackUrl: "/dashboard", 
        redirect: false 
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
      setEmail(forgotEmail); // Prefill the sign in email field
      setPassword(""); // Clear password field
      setOtp("");
      setNewPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base text-text flex flex-col font-sans">
      {/* Header */}
      <header className="glass-panel border-b border-border/40 px-6 py-4 flex items-center">
        <Link href="/" className="flex items-center space-x-2 cursor-pointer">
          <img src="/logo.png" alt="ATSLift Logo" className="w-8 h-8 rounded-md object-contain logo-rotated" />
          <span className="font-bold text-lg tracking-tight text-text">
            ATS<span className="text-primary font-medium font-serif italic">Lift</span>
          </span>
        </Link>
      </header>

      {/* Main Card container */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-6 relative">
        {/* Background glow decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-5 md:p-8 shadow-xs relative z-10">
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase">
              <Sparkles className="w-3 h-3" />
              <span>Campus Season Active</span>
            </div>
            <h1 className="text-3xl font-serif tracking-tight">Access Your Dashboard</h1>
            <p className="text-xs text-text-muted font-semibold max-w-xs mx-auto">
              Save resume histories, manage unlocked copyable templates, and run tone revisions.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-error/10 border border-error/20 text-error text-xs rounded-xl font-bold mb-5">
              {error}
            </div>
          )}

          {resetSuccess && (
            <div className="p-3.5 bg-success/10 border border-success/20 text-success text-xs rounded-xl font-bold mb-5">
              {resetSuccess}
            </div>
          )}

          {isVerifyRequest ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Check your email</h3>
              <p className="text-sm text-text-muted">
                A magic sign-in link has been sent to <span className="font-bold text-text">{email}</span>. Click the link to log in.
              </p>
              <button 
                onClick={() => setIsVerifyRequest(false)}
                className="mt-6 text-xs text-primary font-bold hover:underline cursor-pointer"
              >
                Try a different email
              </button>
            </div>
          ) : isForgotPass ? (
            <div className="space-y-4">
              <div className="mb-4">
                <h2 className="text-xl font-bold mb-1">
                  {forgotPassStep === "email" ? "Forgot Password" : "Reset Password"}
                </h2>
                <p className="text-xs text-text-muted font-semibold">
                  {forgotPassStep === "email"
                    ? "Enter your email and we'll send a 6-digit OTP code to verify your account."
                    : `Enter the 6-digit code sent to ${forgotEmail} and choose your new password.`}
                </p>
              </div>

              {forgotPassStep === "email" ? (
                <form onSubmit={handleForgotPassSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider text-text-muted">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
                        placeholder="e.g. nithin.kumar@vit.edu"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-primary hover:bg-primary/95 text-white text-sm font-semibold rounded-full flex items-center justify-center space-x-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    ) : (
                      <>
                        <span>Send OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center mt-4 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPass(false);
                        setError(null);
                      }}
                      className="text-xs text-text-muted hover:text-primary transition-colors font-medium cursor-pointer"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetPassSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider text-text-muted">
                      6-Digit OTP Code
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        pattern="\d{6}"
                        inputMode="numeric"
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm tracking-widest font-bold"
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider text-text-muted">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
                        placeholder="Min 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-text-muted hover:text-text cursor-pointer"
                        tabIndex={-1}
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-primary hover:bg-primary/95 text-white text-sm font-semibold rounded-full flex items-center justify-center space-x-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    ) : (
                      <>
                        <span>Reset Password</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center mt-4 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotPassStep("email");
                        setError(null);
                      }}
                      className="text-xs text-text-muted hover:text-primary transition-colors font-medium cursor-pointer"
                    >
                      Try a different email
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Google Sign In Bypass */}
              <button
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || isLoading}
                className="w-full py-3.5 border border-border hover:bg-bg-base/60 text-sm font-semibold rounded-full flex items-center justify-center space-x-2.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                )}
                <span>Continue with Google Sign-In</span>
              </button>

              <div className="flex items-center my-6">
                <div className="flex-1 h-[1px] bg-border/60" />
                <span className="text-[10px] text-text-muted font-bold px-3 uppercase tracking-wider">Or Email & Password</span>
                <div className="flex-1 h-[1px] bg-border/60" />
              </div>

              {/* Email & Password Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider text-text-muted">
                    University / Personal Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
                      placeholder="e.g. nithin.kumar@vit.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">
                      Password
                    </label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPass(true);
                          setForgotPassStep("email");
                          setForgotEmail(email); // prefill with whatever is in email input
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
                      className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-text-muted hover:text-text cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || isGoogleLoading}
                  className="w-full py-3.5 bg-primary hover:bg-primary/95 text-white text-sm font-semibold rounded-full flex items-center justify-center space-x-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  ) : (
                    <>
                      <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                
                <div className="text-center mt-4 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setResetSuccess(null);
                      setError(null);
                    }}
                    className="text-xs text-text-muted hover:text-primary transition-colors font-medium cursor-pointer"
                  >
                    {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
