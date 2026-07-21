"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  User as UserIcon, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  Copy, 
  Check, 
  Lock, 
  Save, 
  Loader2, 
  Layout, 
  FileText, 
  LogOut, 
  Sparkles,
  Award,
  ArrowLeft,
  KeyRound,
  Share2
} from "lucide-react";
import { signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";
import WalletCard from "@/components/WalletCard";
import HeaderWalletBadge from "@/components/HeaderWalletBadge";

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: Date | string;
  referralCode: string | null;
  resumesCount: number;
  paidResumesCount: number;
  coverLettersCount: number;
  hasPasswordAccount: boolean;
}

export default function ProfileClient({ initialUser }: { initialUser: UserProfile }) {
  const [name, setName] = useState(initialUser.name || "");
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState("");

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Referral copy state
  const [copiedRef, setCopiedRef] = useState(false);

  const referralCode = initialUser.referralCode || `ATS-${initialUser.id.substring(0, 6).toUpperCase()}`;
  const referralLink = typeof window !== "undefined" 
    ? `${window.location.origin}/login?ref=${referralCode}` 
    : `https://atslift.in/login?ref=${referralCode}`;

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingName(true);
    setNameError("");
    setNameSuccess(false);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile name");
      }

      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (err: any) {
      setNameError(err.message);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }

    setIsSavingPassword(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: initialUser.hasPasswordAccount ? currentPassword : undefined,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const formattedDate = new Date(initialUser.createdAt).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    day: "numeric",
  });

  const userInitial = (name || initialUser.email || "U").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-bg-base text-text flex flex-col font-sans">
      {/* Navbar Header */}
      <header className="glass-panel border-b border-border/40 max-md:px-4 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/dashboard" className="flex items-center space-x-2 text-text-muted hover:text-text transition-colors text-xs font-bold mr-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Link>
          <div className="h-4 w-px bg-border/60 max-sm:hidden" />
          <Link href="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="ATSLift Logo" className="w-7 h-7 rounded-md object-contain logo-rotated" />
            <span className="font-bold text-base tracking-tight text-text">
              ATS<span className="text-primary font-medium font-serif italic">Lift</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          <HeaderWalletBadge />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full px-4 md:px-6 py-8 md:py-12 space-y-8 flex-1">
        
        {/* Profile Banner Card */}
        <div className="bg-surface border border-border/60 rounded-3xl p-6 md:p-8 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center text-primary font-extrabold text-3xl md:text-4xl shadow-inner overflow-hidden">
                {initialUser.image ? (
                  <img src={initialUser.image} alt="User Avatar" className="w-full h-full object-cover" />
                ) : (
                  userInitial
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-surface shadow-xs" title="Verified Account">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            {/* User Meta */}
            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-text">
                  {name || "Candidate Engineer"}
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-primary/10 border border-primary/20 text-primary tracking-wider uppercase w-fit mx-auto sm:mx-0">
                  Candidate Account
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-text-muted font-medium">
                <span className="flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  <span>{initialUser.email}</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>Member since {formattedDate}</span>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <Link
                href="/dashboard"
                className="px-5 py-2.5 bg-surface border border-border hover:bg-bg-base text-text hover:text-primary text-xs font-bold rounded-full inline-flex items-center justify-center space-x-2 transition-all shadow-xs cursor-pointer"
              >
                <Layout className="w-3.5 h-3.5 text-primary" />
                <span>Dashboard</span>
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/15 text-red-600 border border-red-500/25 hover:border-red-500/40 text-xs font-bold rounded-full inline-flex items-center justify-center space-x-2 transition-all shadow-xs cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Candidate Wallet */}
        <WalletCard />

        {/* Quick Account Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-surface border border-border/60 rounded-2xl p-5 flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Resumes Formatted</span>
              <span className="text-2xl font-black font-sans text-text">{initialUser.resumesCount}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-surface border border-border/60 rounded-2xl p-5 flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Cover Letters Built</span>
              <span className="text-2xl font-black font-sans text-text">{initialUser.coverLettersCount}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
              <Mail className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-surface border border-border/60 rounded-2xl p-5 flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Unlocked Downloads</span>
              <span className="text-2xl font-black font-sans text-text">{initialUser.paidResumesCount}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* 2-Column Details & Settings Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Personal Information Form Card */}
          <div className="bg-surface border border-border/60 rounded-3xl p-6 space-y-6 shadow-xs">
            <div className="border-b border-border/40 pb-3 flex items-center space-x-2">
              <UserIcon className="w-5 h-5 text-primary" />
              <h2 className="font-serif font-bold text-lg text-text">Personal Details</h2>
            </div>

            <form onSubmit={handleUpdateName} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg-base text-text text-sm font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
                  <span>Email Address</span>
                  <span className="text-[10px] text-emerald-600 font-extrabold flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                </label>
                <input
                  type="email"
                  value={initialUser.email || ""}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-border/40 bg-surface/50 text-text-muted text-sm font-semibold cursor-not-allowed"
                />
              </div>

              {nameError && (
                <p className="text-xs text-red-500 font-semibold bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                  {nameError}
                </p>
              )}

              {nameSuccess && (
                <p className="text-xs text-emerald-600 font-semibold bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 flex items-center space-x-1.5">
                  <Check className="w-4 h-4" />
                  <span>Profile updated successfully!</span>
                </p>
              )}

              <button
                type="submit"
                disabled={isSavingName}
                className="w-full py-3 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                {isSavingName ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Security & Password Card */}
          <div className="bg-surface border border-border/60 rounded-3xl p-6 space-y-6 shadow-xs">
            <div className="border-b border-border/40 pb-3 flex items-center space-x-2">
              <KeyRound className="w-5 h-5 text-primary" />
              <h2 className="font-serif font-bold text-lg text-text">Security & Password</h2>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {initialUser.hasPasswordAccount && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-base text-text text-sm font-semibold focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-base text-text text-sm font-semibold focus:outline-none focus:border-primary transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-base text-text text-sm font-semibold focus:outline-none focus:border-primary transition-all"
                  required
                />
              </div>

              {passwordError && (
                <p className="text-xs text-red-500 font-semibold bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                  {passwordError}
                </p>
              )}

              {passwordSuccess && (
                <p className="text-xs text-emerald-600 font-semibold bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 flex items-center space-x-1.5">
                  <Check className="w-4 h-4" />
                  <span>Password updated successfully!</span>
                </p>
              )}

              <button
                type="submit"
                disabled={isSavingPassword}
                className="w-full py-3 bg-surface border border-primary/40 text-primary hover:bg-primary/5 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                {isSavingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Referral Program Card */}
        <div className="bg-gradient-to-r from-primary/10 via-surface to-surface border border-primary/20 rounded-3xl p-6 md:p-8 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-primary/20 text-primary uppercase tracking-wider">
                Candidate Rewards Program
              </span>
              <h3 className="font-serif font-bold text-xl text-text flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary" />
                <span>Invite Engineering Batchmates</span>
              </h3>
              <p className="text-xs text-text-muted font-medium max-w-xl">
                Share your referral link with classmates. When 3 batchmates join ATSLift, unlock 1 full un-truncated copyable resume format for free!
              </p>
            </div>

            <button
              onClick={handleCopyReferral}
              className="px-6 py-3 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-full inline-flex items-center justify-center space-x-2 transition-all shadow-xs shrink-0 cursor-pointer"
            >
              {copiedRef ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Referral Link</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-bg-base/70 border border-border/50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
            <span className="text-text-muted truncate max-w-full">{referralLink}</span>
            <span className="px-3 py-1 bg-surface border border-border rounded-lg text-primary font-bold tracking-widest shrink-0">
              {referralCode}
            </span>
          </div>
        </div>

      </main>
    </div>
  );
}
