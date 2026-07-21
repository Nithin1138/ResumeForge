"use client";

import { useState } from "react";
import { Loader2, Trash2, LogOut, Edit2, Check, X, Sparkles, FileText } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import CoverLetterModal from "./CoverLetterModal";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="p-2 border border-border hover:bg-error/10 hover:text-error text-text-muted rounded-full transition-colors cursor-pointer"
      title="Log Out"
    >
      <LogOut className="w-4.5 h-4.5" />
    </button>
  );
}

export function DeleteButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/resume/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
        return;
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
    setIsDeleting(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2.5 text-text-muted hover:text-error border border-border bg-bg-base/30 rounded-full transition-colors cursor-pointer"
      title="Delete Resume"
    >
      {isDeleting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  );
}

export function EditTitle({ id, currentTitle }: { id: string, currentTitle: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState(currentTitle);
  const router = useRouter();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/resume/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeName: title }),
      });
      if (res.ok) {
        setIsEditing(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Rename failed:", error);
    }
    setIsSaving(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-border bg-bg-base/50 text-text rounded-md px-2 py-1 text-base md:text-lg font-bold w-full max-w-[200px]"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") {
              setTitle(currentTitle);
              setIsEditing(false);
            }
          }}
        />
        <button onClick={handleSave} disabled={isSaving} className="text-success hover:text-success/80 cursor-pointer">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        </button>
        <button onClick={() => { setTitle(currentTitle); setIsEditing(false); }} disabled={isSaving} className="text-error hover:text-error/80 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 group/title cursor-pointer" onClick={() => setIsEditing(true)}>
      <h3 className="font-bold text-base md:text-lg text-text group-hover:text-primary transition-colors line-clamp-1">
        {currentTitle}
      </h3>
      <Edit2 className="w-4 h-4 text-text-muted opacity-0 group-hover/title:opacity-100 transition-opacity" />
    </div>
  );
}

export function CoverLetterButton({
  resumeId,
  inputData,
  variant = "header",
  className = "",
}: {
  resumeId?: string;
  inputData?: any;
  variant?: "header" | "card" | "navbar";
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {variant === "header" && (
        <button
          onClick={() => setIsOpen(true)}
          className={`px-5 py-3.5 bg-gradient-to-r from-emerald-600 via-primary to-emerald-600 hover:opacity-95 text-white text-xs font-extrabold rounded-full inline-flex items-center justify-center space-x-1.5 transition-all shadow-xs hover:shadow-md cursor-pointer border border-emerald-400/30 ${className}`}
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>Build Cover Letter</span>
          <span className="text-[9px] bg-amber-300 text-zinc-950 font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider ml-1">
            FREE
          </span>
        </button>
      )}

      {variant === "navbar" && (
        <button
          onClick={() => setIsOpen(true)}
          className={`px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold rounded-full inline-flex items-center justify-center space-x-1 transition-all cursor-pointer ${className}`}
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Cover Letter</span>
        </button>
      )}

      {variant === "card" && (
        <button
          onClick={() => setIsOpen(true)}
          className={`p-2.5 text-primary hover:text-primary-hover border border-primary/30 bg-primary/5 hover:bg-primary/15 rounded-full transition-colors cursor-pointer flex items-center justify-center ${className}`}
          title="Create Cover Letter for this resume"
        >
          <FileText className="w-4 h-4" />
        </button>
      )}

      <CoverLetterModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        resumeId={resumeId}
        inputData={inputData}
      />
    </>
  );
}
