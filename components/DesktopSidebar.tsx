"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Layout, 
  FileText, 
  Mail, 
  Edit3, 
  Database, 
  Wallet, 
  User, 
  Sparkles, 
  Plus,
  ChevronRight,
  LogOut
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DesktopSidebar() {
  const pathname = usePathname();
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/user/wallet")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.balance === "number") {
          setWalletBalance(data.balance);
        }
      })
      .catch(() => {});
  }, []);

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Layout,
      active: pathname === "/dashboard",
    },
    {
      name: "Resumes",
      href: "/myresumes",
      icon: FileText,
      active: pathname.startsWith("/myresumes"),
    },
    {
      name: "Cover Pages",
      href: "/mycover-letters",
      icon: Mail,
      active: pathname.startsWith("/mycover-letters"),
    },
    {
      name: "Edit / Build",
      href: "/build",
      icon: Edit3,
      active: pathname.startsWith("/build"),
    },
    {
      name: "My Space",
      href: "/my-space",
      icon: Database,
      active: pathname.startsWith("/my-space"),
    },
    {
      name: "Wallet",
      href: "/dashboard#wallet",
      icon: Wallet,
      badge: walletBalance !== null ? `₹${walletBalance}` : null,
      active: pathname === "/dashboard" && typeof window !== "undefined" && window.location.hash === "#wallet",
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
      active: pathname.startsWith("/profile"),
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border/60 bg-surface h-screen sticky top-0 shrink-0 z-40 font-sans">
      {/* Brand Header */}
      <div className="p-6 border-b border-border/40 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center space-x-2.5">
          <img src="/logo.png" alt="ATSLift Logo" className="w-8 h-8 rounded-md object-contain logo-rotated" />
          <span className="font-bold text-xl tracking-tight text-text">
            ATS<span className="text-primary font-serif italic font-medium">Lift</span>
          </span>
        </Link>
      </div>

      {/* Build CTA Button */}
      <div className="p-4">
        <Link
          href="/build"
          className="w-full py-3 px-4 rounded-2xl bg-primary hover:bg-primary/95 text-white text-xs font-extrabold flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Build Resume</span>
        </Link>
      </div>

      {/* Navigation Items List */}
      <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                item.active
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-2xs"
                  : "text-text-muted hover:text-text-main hover:bg-bg-base/60"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${item.active ? "text-primary" : "text-text-muted"}`} />
                <span>{item.name}</span>
              </div>

              {item.badge ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                  {item.badge}
                </span>
              ) : (
                item.active && <ChevronRight className="w-3.5 h-3.5 text-primary opacity-60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Footer: Wallet & Theme Controls */}
      <div className="p-4 border-t border-border/40 space-y-3 bg-bg-base/30">
        {/* Wallet Balance Pill */}
        {walletBalance !== null && (
          <Link
            href="/dashboard#wallet"
            className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between hover:bg-emerald-500/15 transition-all text-xs cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <Wallet className="w-4 h-4 text-emerald-500" />
              <span className="font-bold text-text-main">Wallet Balance</span>
            </div>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">₹{walletBalance}</span>
          </Link>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-semibold text-text-muted">Appearance</span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
