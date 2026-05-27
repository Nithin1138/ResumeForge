"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

export default function MobileWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Exclude adminpanel completely so it stays full-width on desktop
  const isAdminPanel = pathname?.startsWith("/adminpanel");

  if (isAdminPanel) {
    return (
      <div className="w-full min-h-screen bg-bg-base text-text">
        {children}
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full min-h-screen bg-[#080a0b]">
      <div className="max-w-[480px] w-full min-h-screen bg-bg-base border-x border-border/30 relative flex flex-col shadow-[0_0_55px_rgba(0,0,0,0.5)] overflow-x-hidden pb-20">
        {children}
        <BottomNav />
      </div>
    </div>
  );
}
