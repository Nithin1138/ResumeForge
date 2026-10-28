"use client";

// In-memory client-side cache and in-flight promise deduplication
let cachedBalance: number | null = null;
let lastFetchedAt = 0;
let inflightPromise: Promise<number | null> | null = null;
const CACHE_TTL_MS = 25_000; // 25 seconds TTL for client navigation

export async function getCachedWalletBalance(forceRefresh = false): Promise<number | null> {
  const now = Date.now();
  if (!forceRefresh && cachedBalance !== null && now - lastFetchedAt < CACHE_TTL_MS) {
    return cachedBalance;
  }

  // Deduplicate concurrent in-flight requests (e.g. Header + Sidebar + Drawer mounting together)
  if (inflightPromise) {
    return inflightPromise;
  }

  inflightPromise = (async () => {
    try {
      const res = await fetch("/api/user/wallet?lite=true");
      if (res.ok) {
        const data = await res.json();
        if (typeof data.balance === "number") {
          cachedBalance = data.balance;
          lastFetchedAt = Date.now();
          return cachedBalance;
        }
      }
    } catch {
      // Return previous cached value on network error
    } finally {
      inflightPromise = null;
    }
    return cachedBalance;
  })();

  return inflightPromise;
}

export function setCachedWalletBalance(balance: number) {
  cachedBalance = balance;
  lastFetchedAt = Date.now();
}
