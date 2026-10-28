"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Wallet } from "lucide-react";
import { getCachedWalletBalance } from "@/lib/walletClient";

export default function HeaderWalletBadge() {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    getCachedWalletBalance().then((bal) => {
      if (isMounted && typeof bal === "number") {
        setBalance(bal);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (balance === null) return null;

  return (
    <Link
      href="/wallet"
      className="px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold hover:bg-emerald-500/20 transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs shrink-0"
      title="Candidate Wallet Available Balance"
    >
      <Wallet className="w-3.5 h-3.5" />
      <span>₹{balance}</span>
    </Link>
  );
}
