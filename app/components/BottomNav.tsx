"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, ScanLine, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  // Do not show BottomNav in adminpanel or dynamic outcomes
  if (pathname?.startsWith("/adminpanel") || pathname?.startsWith("/result") || pathname?.startsWith("/success")) {
    return null;
  }

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Builder", href: "/build", icon: FileText },
    { label: "Audit", href: "/ats-check", icon: ScanLine },
    { label: "Dashboard", href: "/dashboard", icon: User },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[448px] h-14 bg-surface/90 backdrop-blur-md border border-border/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 flex items-center justify-around px-2 py-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 h-full rounded-xl transition-all duration-300 ${
              isActive
                ? "text-primary scale-105 font-bold"
                : "text-text-muted hover:text-text"
            }`}
          >
            <item.icon className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] uppercase tracking-wider font-semibold">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
