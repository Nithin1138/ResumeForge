"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Layout, 
  FileText, 
  Database, 
  Plus, 
  Menu 
} from "lucide-react";

interface MobileBottomNavProps {
  onOpenMenu: () => void;
  isMenuOpen: boolean;
}

export default function MobileBottomNav({ onOpenMenu, isMenuOpen }: MobileBottomNavProps) {
  const pathname = usePathname();

  const isDashboard = pathname === "/dashboard";
  const isResumes = pathname.startsWith("/myresumes");
  const isMySpace = pathname.startsWith("/my-space");

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-surface/95 backdrop-blur-lg border-t border-border/60 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.3)] font-sans"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 6px)" }}
    >
      <div className="grid grid-cols-5 items-center px-2 py-1.5 max-w-md mx-auto">
        {/* 1. Dashboard */}
        <Link
          href="/dashboard"
          prefetch={true}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            isDashboard
              ? "text-primary font-black"
              : "text-text-muted hover:text-text font-medium"
          }`}
        >
          <div className={`p-1 rounded-lg transition-all ${isDashboard ? "bg-primary/10" : ""}`}>
            <Layout className={`w-5 h-5 ${isDashboard ? "text-primary" : "text-text-muted"}`} />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Home</span>
        </Link>

        {/* 2. Resumes */}
        <Link
          href="/myresumes"
          prefetch={true}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            isResumes
              ? "text-primary font-black"
              : "text-text-muted hover:text-text font-medium"
          }`}
        >
          <div className={`p-1 rounded-lg transition-all ${isResumes ? "bg-primary/10" : ""}`}>
            <FileText className={`w-5 h-5 ${isResumes ? "text-primary" : "text-text-muted"}`} />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Resumes</span>
        </Link>

        {/* 3. Center Elevated Build CTA */}
        <div className="flex flex-col items-center justify-center">
          <Link
            href="/build"
            prefetch={true}
            aria-label="Build New Resume"
            className="w-11 h-11 -mt-4 rounded-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all transform active:scale-95 border-2 border-surface cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </Link>
          <span className="text-[9px] font-extrabold text-primary tracking-tight mt-0.5">Build</span>
        </div>

        {/* 4. My Space */}
        <Link
          href="/my-space"
          prefetch={true}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            isMySpace
              ? "text-primary font-black"
              : "text-text-muted hover:text-text font-medium"
          }`}
        >
          <div className={`p-1 rounded-lg transition-all ${isMySpace ? "bg-primary/10" : ""}`}>
            <Database className={`w-5 h-5 ${isMySpace ? "text-primary" : "text-text-muted"}`} />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">My Space</span>
        </Link>

        {/* 5. Menu (Opens Drawer) */}
        <button
          onClick={onOpenMenu}
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
            isMenuOpen
              ? "text-primary font-black"
              : "text-text-muted hover:text-text font-medium"
          }`}
        >
          <div className={`p-1 rounded-lg transition-all ${isMenuOpen ? "bg-primary/10 text-primary" : ""}`}>
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Menu</span>
        </button>
      </div>
    </nav>
  );
}
