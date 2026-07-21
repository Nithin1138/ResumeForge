"use client";

import React, { useState, useEffect } from "react";
import { Wallet, Plus, Sparkles, ArrowDownRight, ArrowUpRight, History, CreditCard, Check, Loader2, Info } from "lucide-react";

interface WalletTransaction {
  id: string;
  type: "TOPUP" | "SPEND";
  amount: number;
  paidAmount: number;
  description: string;
  createdAt: string;
}

export default function WalletCard() {
  const [balance, setBalance] = useState<number | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Top-Up Modal State
  const [isTopUpOpen, setIsTopUpOpen] = useState<boolean>(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>("");

  const fetchWallet = async () => {
    try {
      const res = await fetch("/api/user/wallet");
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance || 0);
        setDiscountPercent(data.discountPercent ?? 10);
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error("Failed to load wallet data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleTopUp = async () => {
    const amountToCredit = customAmount ? parseInt(customAmount, 10) : selectedAmount;
    if (isNaN(amountToCredit) || amountToCredit <= 0) return;

    setIsProcessing(true);
    setSuccessMsg("");

    try {
      const res = await fetch("/api/user/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topUpAmount: amountToCredit }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBalance(data.newBalance);
        setSuccessMsg(`Succesfully added ₹${data.credited} to your wallet! (Paid ₹${data.paidAmount})`);
        setTimeout(() => {
          setIsTopUpOpen(false);
          setSuccessMsg("");
          fetchWallet();
        }, 1800);
      } else {
        alert(data.error || "Top-up failed. Please try again.");
      }
    } catch (err: any) {
      alert("Top-up request error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const getPayableAmount = (creditAmt: number) => {
    return Math.round(creditAmt * (1 - discountPercent / 100));
  };

  const currentCreditAmount = customAmount ? parseInt(customAmount, 10) || 0 : selectedAmount;
  const currentPayableAmount = getPayableAmount(currentCreditAmount);
  const currentSavings = currentCreditAmount - currentPayableAmount;

  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-surface border border-border/80 shadow-xs flex items-center justify-center space-x-3 text-text-muted">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span className="text-sm font-medium">Loading Candidate Wallet...</span>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-surface via-surface to-primary/5 border border-border/80 shadow-sm relative overflow-hidden space-y-5">
      {/* Glow ambient background accent */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Row */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary shadow-xs">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-text-main">ATSLift Candidate Wallet</h3>
              {discountPercent > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 uppercase tracking-wide">
                  {discountPercent}% Top-Up Discount
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted">Top up once & unlock resumes instantly anytime</p>
          </div>
        </div>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className="p-2 text-xs font-semibold text-text-muted hover:text-text-main border border-border/60 hover:bg-bg-base/50 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
        >
          <History className="w-4 h-4" />
          <span className="hidden sm:inline">History</span>
        </button>
      </div>

      {/* Balance & TopUp Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
        <div className="sm:col-span-2 p-4 rounded-2xl bg-bg-base/60 border border-border/60 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-text-muted uppercase tracking-wider block">Available Balance</span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-3xl font-extrabold text-text-main">₹{balance ?? 0}</span>
              <span className="text-xs text-text-muted font-medium">INR</span>
            </div>
          </div>

          <button
            onClick={() => setIsTopUpOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all flex items-center space-x-2 cursor-pointer shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Money</span>
          </button>
        </div>

        {/* Quick Perks summary */}
        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col justify-center space-y-1">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Unlocks</span>
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            No gateway redirects. 1-click checkout with wallet balance.
          </p>
        </div>
      </div>

      {/* Transaction History Dropdown */}
      {showHistory && (
        <div className="pt-2 border-t border-border/60 space-y-3 animate-fade-in relative z-10">
          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Recent Transactions</h4>
          {transactions.length === 0 ? (
            <p className="text-xs text-text-muted py-2 italic">No wallet transactions yet.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-3 rounded-xl bg-bg-base/40 border border-border/50 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    {tx.type === "TOPUP" ? (
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-text-main">{tx.description}</p>
                      <span className="text-[10px] text-text-muted">
                        {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  <span className={`font-bold ${tx.type === "TOPUP" ? "text-emerald-500" : "text-text-main"}`}>
                    {tx.type === "TOPUP" ? `+₹${tx.amount}` : `-₹${tx.amount}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TOP-UP MODAL */}
      {isTopUpOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[9999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
                  <CreditCard className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-main">Top Up Candidate Wallet</h3>
                  <p className="text-xs text-text-muted">Get extra value with admin discount</p>
                </div>
              </div>
              <button
                onClick={() => setIsTopUpOpen(false)}
                className="p-1.5 rounded-xl hover:bg-bg-base text-text-muted hover:text-text-main transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Success Banner */}
            {successMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center space-x-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            ) : (
              <>
                {/* Preset Amount Options */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                    Select Top-Up Amount
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[100, 200, 500, 1000].map((amt) => {
                      const pay = getPayableAmount(amt);
                      const isSelected = selectedAmount === amt && !customAmount;
                      return (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => {
                            setSelectedAmount(amt);
                            setCustomAmount("");
                          }}
                          className={`p-3 rounded-2xl border text-center transition-all cursor-pointer relative ${
                            isSelected
                              ? "border-primary bg-primary/10 text-primary font-extrabold shadow-xs"
                              : "border-border/80 bg-bg-base/40 text-text-main hover:border-primary/50"
                          }`}
                        >
                          <span className="text-base font-extrabold block">₹{amt}</span>
                          <span className="text-[10px] text-text-muted block mt-0.5">Pay ₹{pay}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Amount Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                    Or Enter Custom Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="10"
                    placeholder="e.g. 300"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-base text-text-main text-sm font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Summary Card */}
                <div className="p-4 rounded-2xl bg-bg-base/70 border border-border/60 space-y-2 text-xs">
                  <div className="flex justify-between text-text-muted">
                    <span>Wallet Balance Credit</span>
                    <span className="font-bold text-text-main">₹{currentCreditAmount || 0}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-emerald-500 font-medium">
                      <span>Admin Top-Up Discount ({discountPercent}%)</span>
                      <span>-₹{currentSavings}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-border/60 flex justify-between font-bold text-sm text-text-main">
                    <span>Total Payable Today</span>
                    <span className="text-primary">₹{currentPayableAmount || 0}</span>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="button"
                  onClick={handleTopUp}
                  disabled={isProcessing || currentCreditAmount <= 0}
                  className="w-full py-3 rounded-2xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Adding to Wallet...</span>
                    </>
                  ) : (
                    <span>Add ₹{currentCreditAmount} (Pay ₹{currentPayableAmount})</span>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
