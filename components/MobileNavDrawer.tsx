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
  Plus,
  ChevronRight,
  LogOut,
  X,
  Bot,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./theme-toggle";
import { signOut } from "next-auth/react";

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNavDrawer({ isOpen, onClose }: MobileNavDrawerProps) {
  const pathname = usePathname();
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  // Fetch wallet balance
  useEffect(() => {
    if (isOpen) {
      fetch("/api/user/wallet")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && typeof data.balance === "number") {
            setWalletBalance(data.balance);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Lock background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Close when path changes
  useEffect(() => {
    onClose();
  }, [pathname]);

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Layout,
      active: pathname === "/dashboard",
      badge: null,
    },
    {
      name: "Resumes",
      href: "/myresumes",
      icon: FileText,
      active: pathname.startsWith("/myresumes"),
      badge: null,
    },
    {
      name: "Cover Pages",
      href: "/mycover-letters",
      icon: Mail,
      active: pathname.startsWith("/mycover-letters"),
      badge: null,
    },
    {
      name: "Edit Pages",
      href: "/edit",
      icon: Edit3,
      active: pathname.startsWith("/edit"),
      badge: null,
    },
    {
      name: "My Space",
      href: "/my-space",
      icon: Database,
      active: pathname.startsWith("/my-space"),
      badge: "Vault",
    },
    {
      name: "JD Automations",
      href: "/automations",
      icon: Bot,
      active: pathname.startsWith("/automations"),
      badge: "AI",
    },
    {
      name: "Wallet",
      href: "/wallet",
      icon: Wallet,
      active: pathname.startsWith("/wallet"),
      badge: null,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
      active: pathname.startsWith("/profile"),
      badge: null,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className="fixed inset-y-0 left-0 w-[290px] max-w-[85vw] bg-surface border-r border-border/80 shadow-2xl flex flex-col z-50 font-sans"
          >
            {/* Header: Logo & Close Button */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <Link
                href="/dashboard"
                onClick={onClose}
                className="flex items-center space-x-2.5 overflow-hidden"
              >
                <img
                  src="/logo.png"
                  alt="ATSLift Logo"
                  className="w-8 h-8 rounded-md object-contain logo-rotated shrink-0"
                />
                <span className="font-bold text-xl tracking-tight text-text">
                  ATS<span className="text-primary font-serif italic font-medium">Lift</span>
                </span>
              </Link>

              <button
                onClick={onClose}
                aria-label="Close menu"
                className="p-2 rounded-xl border border-border/70 bg-bg-base/80 text-text-muted hover:text-text hover:border-primary/40 transition-all cursor-pointer shadow-2xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Top Primary Actions */}
            <div className="p-3.5 space-y-2 border-b border-border/40 bg-bg-base/30">
              <Link
                href="/build"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/95 text-white text-xs font-black flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Build New Resume</span>
              </Link>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto custom-scrollbar">
              <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-text-muted/80">
                Menu
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                      item.active
                        ? "text-primary bg-primary/10 border border-primary/25 font-extrabold shadow-2xs"
                        : "text-text-muted hover:text-text hover:bg-bg-base/70"
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <Icon
                        className={`w-4.5 h-4.5 shrink-0 ${
                          item.active ? "text-primary" : "text-text-muted"
                        }`}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-black rounded-md bg-primary/15 text-primary border border-primary/20">
                          {item.badge}
                        </span>
                      )}
                      {item.active && (
                        <ChevronRight className="w-3.5 h-3.5 text-primary opacity-70" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Drawer Footer: Wallet & Appearance & Sign Out */}
            <div className="p-3.5 border-t border-border/50 space-y-2.5 bg-bg-base/40">
              {/* Wallet Pill */}
              <Link
                href="/wallet"
                onClick={onClose}
                className="w-full rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 flex items-center justify-between hover:bg-emerald-500/15 transition-all text-xs cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <Wallet className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-bold text-text">Wallet Balance</span>
                </div>
                <span className="font-black text-emerald-600 dark:text-emerald-400">
                  {walletBalance !== null ? `₹${walletBalance}` : "..."}
                </span>
              </Link>

              {/* Appearance & Sign Out Row */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-text-muted">Theme</span>
                  <ThemeToggle />
                </div>

                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="px-3 py-1.5 rounded-lg border border-border/60 hover:border-error/40 hover:bg-error/10 text-text-muted hover:text-error text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
