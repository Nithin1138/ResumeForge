"use client";

import React, { Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AutomationsClient from "./AutomationsClient";
import { Loader2 } from "lucide-react";

export default function AutomationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-bg-base text-text flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated" || !session?.user?.email) {
    if (typeof window !== "undefined") {
      router.push("/login");
    }
    return (
      <div className="min-h-screen bg-bg-base text-text flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-base text-text flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      <AutomationsClient />
    </Suspense>
  );
}
