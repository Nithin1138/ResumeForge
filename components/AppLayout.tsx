"use client";

import React from "react";
import DesktopSidebar from "./DesktopSidebar";
import Link from "next/link";
import { Database, Layout, Menu } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import HeaderWalletBadge from "./HeaderWalletBadge";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-bg-base text-text flex font-sans relative">
      {/* Desktop Left Sidebar */}
      <DesktopSidebar />

      {/* Main Content Viewport */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Mobile Top Navbar (Hidden on desktop since DesktopSidebar is visible) */}
        <header className="lg:hidden glass-panel border-b border-border/40 px-4 py-3.5 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="ATSLift Logo" className="w-7 h-7 rounded-md object-contain logo-rotated" />
              <span className="font-bold text-base tracking-tight text-text">
                ATS<span className="text-primary font-medium font-serif italic">Lift</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-2.5">
            <HeaderWalletBadge />
            <Link 
              href="/my-space" 
              className="px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs" 
              title="My Space Vault & AI Assistant"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">My Space</span>
            </Link>
            <ThemeToggle />
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
