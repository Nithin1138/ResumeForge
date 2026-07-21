"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, Check, Tag as TagIcon, X, Loader2 } from "lucide-react";

export interface TagOption {
  id: string;
  label: string;
  color: string; // Tailwind background & text class
  dot: string;   // Color dot background class
}

export const TAG_OPTIONS: TagOption[] = [
  { id: "green", label: "Data Science", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30", dot: "bg-emerald-500" },
  { id: "red", label: "SWE / Software", color: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30", dot: "bg-rose-500" },
  { id: "purple", label: "AI / ML", color: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30", dot: "bg-purple-500" },
  { id: "blue", label: "Product / QA", color: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30", dot: "bg-sky-500" },
  { id: "orange", label: "Frontend / UI", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30", dot: "bg-amber-500" },
];

interface TagSelectorProps {
  currentTag?: string | null;
  onSelectTag: (newTag: string | null) => Promise<void>;
}

export default function TagSelector({ currentTag, onSelectTag }: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedOption = TAG_OPTIONS.find((t) => t.id === currentTag);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (tagId: string | null) => {
    setLoading(true);
    await onSelectTag(tagId);
    setLoading(false);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* Trigger Button: If tag exists, show tag pill; otherwise show + dotted button */}
      {selectedOption ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`px-3 py-1 rounded-full text-xs font-bold border transition-all flex items-center space-x-1.5 cursor-pointer shadow-2xs hover:opacity-90 ${selectedOption.color}`}
          title="Click to change domain tag"
        >
          <span className={`w-2 h-2 rounded-full ${selectedOption.dot}`} />
          <span>{selectedOption.label}</span>
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin ml-1" />
          ) : (
            <TagIcon className="w-3 h-3 opacity-60 ml-0.5" />
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-1 rounded-full border border-dashed border-border/80 hover:border-primary bg-bg-base/40 hover:bg-primary/5 text-text-muted hover:text-primary text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
          title="Categorize this output"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tag</span>
          {loading && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
        </button>
      )}

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-2xl shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100 font-sans">
          <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-text-muted border-b border-border/40 pb-1">
            Select Domain Tag
          </div>

          {TAG_OPTIONS.map((tag) => {
            const isCurrent = currentTag === tag.id;
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleSelect(tag.id)}
                className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-primary/10 text-primary"
                    : "text-text-muted hover:text-text hover:bg-bg-base"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${tag.dot}`} />
                  <span>{tag.label}</span>
                </div>
                {isCurrent && <Check className="w-3.5 h-3.5 text-primary" />}
              </button>
            );
          })}

          {/* Remove Tag option */}
          {currentTag && (
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className="w-full px-3 py-1.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 flex items-center space-x-2 transition-all cursor-pointer pt-2 border-t border-border/40"
            >
              <X className="w-3.5 h-3.5" />
              <span>Remove Tag</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
