"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, Check, X } from "lucide-react";
import { COLOR_PALETTES, addCustomTag } from "@/lib/userTags";

interface CreateTagButtonProps {
  onTagCreated: () => void;
}

export default function CreateTagButton({ onTagCreated }: CreateTagButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tagName, setTagName] = useState("");
  const [selectedPalette, setSelectedPalette] = useState("emerald");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    addCustomTag(tagName, selectedPalette);
    onTagCreated();
    setTagName("");
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-3.5 py-1.5 rounded-full border border-dashed border-primary/60 hover:border-primary bg-primary/10 hover:bg-primary/20 text-primary text-xs font-extrabold flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs shrink-0"
        title="Create a custom category tag"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>+ Add Tag</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4 animate-fade-in font-sans">
          <div 
            ref={modalRef}
            className="bg-surface border border-border rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <span className="text-sm font-extrabold text-text flex items-center space-x-2">
                <Plus className="w-4 h-4 text-primary" />
                <span>Create Category Tag</span>
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-text-muted hover:text-text cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-text-muted uppercase tracking-wider block">Tag Name</label>
                <input
                  type="text"
                  placeholder="e.g. Data Science, SWE, AI/ML..."
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-base border border-border text-xs text-text focus:outline-none focus:border-primary font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-text-muted uppercase tracking-wider block">Tag Color</label>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {COLOR_PALETTES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPalette(p.id)}
                      className={`w-7 h-7 rounded-full transition-all flex items-center justify-center cursor-pointer ${p.dot} ${
                        selectedPalette === p.id ? "ring-2 ring-text ring-offset-2 scale-110" : "opacity-60 hover:opacity-100"
                      }`}
                      title={p.label}
                    >
                      {selectedPalette === p.id && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!tagName.trim()}
                className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-xs disabled:opacity-50 mt-2"
              >
                Create Tag
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
