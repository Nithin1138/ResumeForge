"use client";

import { useState } from "react";
import { Loader2, Trash2, LogOut, Edit2, Check, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

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
        // Keep the spinner spinning until the component unmounts naturally via refresh
        return;
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
    // Only reset if it failed
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
        <button onClick={handleSave} disabled={isSaving} className="text-success hover:text-success/80">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        </button>
        <button onClick={() => { setTitle(currentTitle); setIsEditing(false); }} disabled={isSaving} className="text-error hover:text-error/80">
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
