"use client";

import { useState } from "react";
import { Loader2, Trash2, LogOut } from "lucide-react";
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
