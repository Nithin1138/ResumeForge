"use client";

import React, { useState } from "react";
import DesktopSidebar from "./DesktopSidebar";
import MobileNavDrawer from "./MobileNavDrawer";
import MobileBottomNav from "./MobileBottomNav";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Menu } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import HeaderWalletBadge from "./HeaderWalletBadge";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-base text-text flex font-sans relative">
      {/* Desktop Left Sidebar */}
      <DesktopSidebar />

      {/* Mobile Slide-Out Navigation Drawer */}
      <MobileNavDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Mobile Top Navbar with Hamburger Menu Button */}
        <header className="lg:hidden glass-panel border-b border-border/40 px-3.5 py-2.5 sm:px-4 sm:py-3.5 flex items-center justify-between sticky top-0 z-40 bg-surface/90 backdrop-blur-md">
          <div className="flex items-center space-x-2.5">
            {/* Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="p-2 -ml-1 rounded-xl border border-border/70 bg-bg-base/80 text-text hover:text-primary hover:border-primary/40 active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>

            {/* Logo Link to Dashboard */}
            <Link href="/dashboard" className="flex items-center space-x-2">
              <img
                src="/logo.png"
                alt="ATSLift Logo"
                className="w-7 h-7 rounded-md object-contain logo-rotated shrink-0"
              />
              <span className="font-bold text-base tracking-tight text-text">
                ATS<span className="text-primary font-medium font-serif italic">Lift</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-2.5">
            <HeaderWalletBadge />
            <Link 
              href="/my-space" 
              className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs" 
              title="My Space Vault & AI Assistant"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">My Space</span>
            </Link>
            <ThemeToggle />
          </div>
        </header>

        {/* Main Body with Smooth Motion Page Transition & Mobile Bottom Bar Spacing */}
        <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8 pb-24 lg:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation Bar (1-Thumb Easy Navigation) */}
        <MobileBottomNav
          onOpenMenu={() => setIsMobileMenuOpen(true)}
          isMenuOpen={isMobileMenuOpen}
        />
      </div>
    </div>
  );
}
