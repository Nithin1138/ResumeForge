"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Wallet as WalletIcon, 
  Plus, 
  Search, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Filter, 
  Loader2,
  RefreshCw,
  X
} from "lucide-react";
import AppLayout from "@/components/AppLayout";

export interface TransactionItem {
  id: string;
  type: string; // TOPUP or SPEND
  amount: number;
  paidAmount: number;
  description: string;
  createdAt: string;
}

export default function WalletClient({
  initialBalance,
  initialDiscountPercent,
  initialTransactions,
}: {
  initialBalance: number;
  initialDiscountPercent: number;
  initialTransactions: TransactionItem[];
}) {
  const [balance, setBalance] = useState(initialBalance);
  const [discountPercent, setDiscountPercent] = useState(initialDiscountPercent);
  const [transactions, setTransactions] = useState<TransactionItem[]>(initialTransactions);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "TOPUP" | "SPEND">("ALL");

  // Top-Up Modal state
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("100");
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchWallet = async () => {
    try {
      const res = await fetch("/api/user/wallet");
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
        setDiscountPercent(data.discountPercent || 10);
        setTransactions(data.transactions || []);
      }
    } catch (e) {
      console.error("Failed to refresh wallet:", e);
    }
  };

  const handleTopUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(topUpAmount, 10);
    if (isNaN(amt) || amt <= 0) {
      setMessage("Please enter a valid positive amount.");
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topUpAmount }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          setMessage(`Success! Credited ₹${data.credited} to your candidate wallet.`);
          setBalance(data.newBalance);
          await fetchWallet();
          setTimeout(() => {
            setIsTopUpOpen(false);
            setMessage(null);
          }, 1500);
        }
      } else {
        setMessage(data.error || "Top-up failed.");
      }
    } catch (e: any) {
      setMessage(e.message || "Network error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      new Date(t.createdAt).toLocaleDateString().includes(searchQuery);

    const matchesType = filterType === "ALL" || t.type === filterType;

    return matchesSearch && matchesType;
  });

  const totalAdded = transactions
    .filter((t) => t.type === "TOPUP")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalUsed = transactions
    .filter((t) => t.type === "SPEND")
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-serif font-bold text-text flex items-center gap-2.5">
              <WalletIcon className="w-8 h-8 text-emerald-500" />
              <span>ATSLift Candidate Wallet</span>
            </h1>
            <p className="text-xs text-text-muted font-medium">
              Manage your available wallet funds, view transaction history, and top up balance with instant admin discount.
            </p>
          </div>

          <button
            onClick={() => setIsTopUpOpen(true)}
            className="px-5 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-sm shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Money to Wallet</span>
          </button>
        </div>

        {/* Top Wallet Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Balance Card */}
          <div className="bg-gradient-to-br from-emerald-500/10 via-surface to-surface border border-emerald-500/30 rounded-3xl p-6 space-y-4 shadow-xs relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">Available Balance</span>
                <div className="text-3xl font-black font-sans text-emerald-600 dark:text-emerald-400 flex items-baseline space-x-1">
                  <span>₹{balance}</span>
                  <span className="text-xs font-bold text-text-muted">INR</span>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                {discountPercent}% TOP-UP DISCOUNT
              </span>
            </div>

            <button
              onClick={() => setIsTopUpOpen(true)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Top Up Balance</span>
            </button>
          </div>

          {/* Card 2: Total Added Stat */}
          <div className="bg-surface border border-border/80 rounded-3xl p-6 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider">Total Money Added</span>
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-text pt-4">₹{totalAdded}</div>
            <span className="text-[11px] text-text-muted font-medium pt-1">Across all top-up transactions</span>
          </div>

          {/* Card 3: Total Used Stat */}
          <div className="bg-surface border border-border/80 rounded-3xl p-6 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider">Total Money Used</span>
              <div className="w-8 h-8 rounded-full bg-rose-500/15 text-rose-500 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-text pt-4">₹{totalUsed}</div>
            <span className="text-[11px] text-text-muted font-medium pt-1">Spent on resume & cover letter outputs</span>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
            <h2 className="text-base font-serif font-bold text-text flex items-center space-x-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Transaction History</span>
            </h2>

            {/* Controls: Search & Filter Tabs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search purpose, date, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl bg-surface border border-border text-xs text-text focus:outline-none focus:border-primary w-full sm:w-64 font-medium"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center space-x-1 bg-bg-base p-1 rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setFilterType("ALL")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterType === "ALL" ? "bg-surface text-text shadow-2xs" : "text-text-muted hover:text-text"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("TOPUP")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterType === "TOPUP" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-2xs" : "text-text-muted hover:text-text"
                  }`}
                >
                  Added
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("SPEND")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterType === "SPEND" ? "bg-rose-500/15 text-rose-500 shadow-2xs" : "text-text-muted hover:text-text"
                  }`}
                >
                  Used
                </button>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center bg-surface border border-border/80 rounded-3xl space-y-3">
              <Clock className="w-10 h-10 text-text-muted/40 mx-auto" />
              <h3 className="text-base font-bold text-text">No Transactions Found</h3>
              <p className="text-xs text-text-muted max-w-xs mx-auto">
                {searchQuery || filterType !== "ALL"
                  ? "No transactions match your current search or filter."
                  : "Top up your wallet to start making instant 1-click purchases."}
              </p>
            </div>
          ) : (
            <div className="bg-surface border border-border/80 rounded-3xl overflow-hidden shadow-xs divide-y divide-border/40">
              {filteredTransactions.map((tx) => {
                const isTopUp = tx.type === "TOPUP";
                const txDate = new Date(tx.createdAt);

                return (
                  <div
                    key={tx.id}
                    className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-bg-base/40 transition-colors font-sans"
                  >
                    {/* Left: Icon & Description */}
                    <div className="flex items-start space-x-3.5">
                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isTopUp
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                        }`}
                      >
                        {isTopUp ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm text-text">{tx.description}</h4>
                          <span
                            className={`text-[9px] font-extrabold px-2 py-0.2 rounded-full uppercase ${
                              isTopUp
                                ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                                : "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                            }`}
                          >
                            {isTopUp ? "Added Amount" : "Used Amount"}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted font-medium">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {txDate.toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {txDate.toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </span>
                          </span>
                          <span>•</span>
                          <span className="font-mono text-[10px]">ID: {tx.id}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Paid Badge */}
                    <div className="text-right sm:shrink-0 max-sm:border-t max-sm:border-border/30 max-sm:pt-2 max-sm:flex max-sm:justify-between max-sm:items-center">
                      <div
                        className={`text-base md:text-lg font-black font-sans ${
                          isTopUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
                        }`}
                      >
                        {isTopUp ? `+₹${tx.amount}` : `-₹${tx.amount}`}
                      </div>

                      {isTopUp && tx.paidAmount && (
                        <div className="text-[11px] font-bold text-text-muted">
                          Paid: ₹{tx.paidAmount} INR
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top-Up Modal */}
        {isTopUpOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[9999] flex items-center justify-center p-4 animate-fade-in font-sans">
            <div className="bg-surface border border-border rounded-3xl p-6 w-full max-w-md space-y-5 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center space-x-2">
                  <WalletIcon className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-bold text-lg text-text">Top Up Wallet</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTopUpOpen(false)}
                  className="text-text-muted hover:text-text cursor-pointer p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleTopUpSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text block">Select or Enter Amount (INR)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["100", "200", "500"].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTopUpAmount(amt)}
                        className={`py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                          topUpAmount === amt
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : "bg-bg-base text-text border-border hover:border-emerald-500/50"
                        }`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-text-muted select-none">₹</span>
                    <input
                      type="number"
                      min="10"
                      max="10000"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-bg-base border border-border text-xs text-text font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="Enter amount (e.g. 500)"
                    />
                  </div>
                </div>

                {/* Calculation Summary */}
                {topUpAmount && !isNaN(parseInt(topUpAmount)) && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between text-text font-bold">
                      <span>Wallet Credit:</span>
                      <span>₹{topUpAmount}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-extrabold">
                      <span>Admin Discount ({discountPercent}%):</span>
                      <span>-₹{Math.round(parseInt(topUpAmount) * (discountPercent / 100))}</span>
                    </div>
                    <div className="flex justify-between text-text font-black border-t border-emerald-500/20 pt-1">
                      <span>You Pay:</span>
                      <span>₹{Math.round(parseInt(topUpAmount) * (1 - discountPercent / 100))}</span>
                    </div>
                  </div>
                )}

                {message && (
                  <div
                    className={`p-3 rounded-xl text-xs font-bold text-center ${
                      message.includes("Success")
                        ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                        : "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                    }`}
                  >
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing || !topUpAmount}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Top Up Now</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
