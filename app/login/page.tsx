"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight, Mail, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid university or personal email address.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: email.split("@")[0] }),
      });

      if (!res.ok) {
        throw new Error("Magic login transaction failed.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      // Simulate authenticating with Google Popup
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const mockEmail = "campus.placement@nit.edu";
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: mockEmail, name: "Placement Candidate" }),
      });

      if (!res.ok) {
        throw new Error("Google checkout authentication failed.");
      }

      router.push("/dashboard");
      router.refresh();
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
                <span className="text-base">💎</span>
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
        </div>
      </main>
    </div>
  );
}
