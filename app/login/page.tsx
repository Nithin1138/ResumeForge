"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight, Mail, Sparkles } from "lucide-react";
import { signIn } from "next-auth/react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifyRequest, setIsVerifyRequest] = useState(false);

  useEffect(() => {
    if (searchParams.get("verifyRequest") === "true") {
      setIsVerifyRequest(true);
    }
    if (searchParams.get("error")) {
      setError("Authentication failed. Please try again.");
    }
  }, [searchParams]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid university or personal email address.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await signIn("email", { email, redirect: false });

      if (res?.error) {
        throw new Error(res.error);
      }

      // If successful without redirect, the email was sent
      setIsVerifyRequest(true);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err: any) {
      setError(err.message || "Google Authentication failed.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base text-text flex flex-col font-sans">
      {/* Header */}
      <header className="glass-panel border-b border-border/40 px-6 py-4 flex items-center">
        <Link href="/" className="flex items-center space-x-2 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm tracking-wider">
            RF
          </div>
          <span className="font-bold text-lg tracking-tight text-text">
            Resume<span className="text-primary font-medium font-serif italic">Forge</span>
          </span>
        </Link>
      </header>

      {/* Main Card container */}
      <main className="flex-1 flex items-center justify-center p-6 relative">
        {/* Background glow decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-8 shadow-xs relative z-10">
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
                className="mt-6 text-xs text-primary font-bold hover:underline"
              >
                Try a different email
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Google Sign In Bypass */}
              <button
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || isLoading}
                className="w-full py-3 border border-border hover:bg-bg-base/60 text-sm font-semibold rounded-full flex items-center justify-center space-x-2.5 transition-colors cursor-pointer disabled:opacity-50"
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
                <span className="text-[10px] text-text-muted font-bold px-3 uppercase tracking-wider">Or Magic Email</span>
                <div className="flex-1 h-[1px] bg-border/60" />
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider text-text-muted">
                    University / Personal Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="email"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden text-sm"
                      placeholder="e.g. nithin.kumar@vit.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
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
                      <span>Generate Magic Link</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
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
