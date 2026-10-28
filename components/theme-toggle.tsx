"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle({ className = "" }: { className?: string } = {}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className={`p-1.5 sm:p-2 rounded-xl bg-surface border border-border shadow-sm opacity-0 flex items-center justify-center w-8.5 h-8.5 sm:w-10 sm:h-10 shrink-0 ${className}`}
        aria-label="Toggle theme"
      >
        <div className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    );
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className={`p-1.5 sm:p-2 rounded-xl bg-surface border border-border shadow-sm hover:scale-105 hover:border-primary/40 active:scale-95 transition-all flex items-center justify-center text-text w-8.5 h-8.5 sm:w-10 sm:h-10 cursor-pointer shrink-0 ${className}`}
      aria-label="Toggle theme"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
      ) : (
        <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
      )}
    </button>
  );
}
