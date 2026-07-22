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
  LogOut,
  Menu
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

let globalWalletCache: number | null = null;

export default function DesktopSidebar() {
  const pathname = usePathname();
  const [walletBalance, setWalletBalance] = useState<number | null>(globalWalletCache);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebarCollapsed");
      if (saved === "true") setIsCollapsed(true);
    }

    fetch("/api/user/wallet")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.balance === "number") {
          globalWalletCache = data.balance;
          setWalletBalance(data.balance);
        }
      })
      .catch(() => {});
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("sidebarCollapsed", String(next));
      }
      return next;
    });
  };

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
      name: "Edit Pages",
      href: "/edit",
      icon: Edit3,
      active: pathname.startsWith("/edit"),
    },
    {
      name: "My Space",
      href: "/my-space",
      icon: Database,
      active: pathname.startsWith("/my-space"),
    },
    {
      name: "Wallet",
      href: "/wallet",
      icon: Wallet,
      active: pathname.startsWith("/wallet"),
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
      active: pathname.startsWith("/profile"),
    },
  ];

  return (
    <aside className={`hidden lg:flex flex-col border-r border-border/60 bg-surface h-screen sticky top-0 shrink-0 z-40 font-sans transition-all duration-300 ${
      isCollapsed ? "w-20" : "w-64"
    }`}>
      {/* Brand Header & 3-Lines Toggle */}
      <div className={`p-4 border-b border-border/40 flex items-center justify-between ${isCollapsed ? "flex-col gap-3 justify-center" : ""}`}>
        <Link href="/dashboard" prefetch={true} className="flex items-center space-x-2.5 overflow-hidden">
          <img src="/logo.png" alt="ATSLift Logo" className="w-8 h-8 rounded-md object-contain logo-rotated shrink-0" />
          {!isCollapsed && (
            <span className="font-bold text-xl tracking-tight text-text truncate">
              ATS<span className="text-primary font-serif italic font-medium">Lift</span>
            </span>
          )}
        </Link>

        {/* 3-Lines Menu Open/Close Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl border border-border/70 bg-bg-base/80 text-text-muted hover:text-primary hover:border-primary/40 transition-all cursor-pointer shadow-2xs"
          title={isCollapsed ? "Expand Sidebar Menu (Open)" : "Collapse Sidebar Menu (Close)"}
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Build CTA Button */}
      <div className="p-3">
        <Link
          href="/build"
          prefetch={true}
          className={`w-full py-3 rounded-2xl bg-primary hover:bg-primary/95 text-white text-xs font-extrabold flex items-center justify-center shadow-sm transition-all cursor-pointer ${
            isCollapsed ? "px-0" : "px-4 space-x-2"
          }`}
          title="Build Resume"
        >
          <Plus className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Build Resume</span>}
        </Link>
      </div>

      {/* Navigation Items List */}
      <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              title={isCollapsed ? item.name : undefined}
              className={`flex items-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isCollapsed ? "justify-center p-3" : "justify-between px-3.5 py-2.5"
              } ${
                item.active
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-2xs"
                  : "text-text-muted hover:text-text-main hover:bg-bg-base/60"
              }`}
            >
              <div className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-3"}`}>
                <Icon className={`w-4.5 h-4.5 shrink-0 ${item.active ? "text-primary" : "text-text-muted"}`} />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </div>

              {!isCollapsed && item.active && <ChevronRight className="w-3.5 h-3.5 text-primary opacity-60 shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Footer: Wallet & Theme Controls */}
      <div className="p-3 border-t border-border/40 space-y-3 bg-bg-base/30">
        {/* Wallet Balance Pill */}
        <Link
          href="/wallet"
          prefetch={true}
          title={isCollapsed ? `Wallet Balance: ₹${walletBalance ?? 0}` : undefined}
          className={`rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center hover:bg-emerald-500/15 transition-all text-xs cursor-pointer min-h-[44px] ${
            isCollapsed ? "justify-center p-2.5" : "justify-between p-3"
          }`}
        >
          <div className="flex items-center space-x-2">
            <Wallet className="w-4 h-4 text-emerald-500 shrink-0" />
            {!isCollapsed && <span className="font-bold text-text-main">Wallet</span>}
          </div>
          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
            {walletBalance !== null ? `₹${walletBalance}` : "..."}
          </span>
        </Link>

        <div className={`flex items-center pt-1 ${isCollapsed ? "justify-center" : "justify-between"}`}>
          {!isCollapsed && <span className="text-xs font-semibold text-text-muted">Appearance</span>}
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
