"use client";

import { useState, useEffect } from "react";
import {
  Send,
  Copy,
  Check,
  ShieldCheck,
  Mail,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw
} from "lucide-react";

export function TelegramLinkCard() {
   const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [copiedAlias, setCopiedAlias] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [webhookMsg, setWebhookMsg] = useState<string | null>(null);

  // New Spreadsheet Link states
  const [pastedUrl, setPastedUrl] = useState("");
  const [savingUrl, setSavingUrl] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/telegram/link-token");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch Telegram link status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleCopy = (text: string, type: "alias" | "token") => {
    navigator.clipboard.writeText(text);
    if (type === "alias") {
      setCopiedAlias(true);
      setTimeout(() => setCopiedAlias(false), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const handleApproveVerification = async (linkToOpen?: string) => {
    if (linkToOpen) {
      window.open(linkToOpen, "_blank", "noopener,noreferrer");
    }

    setVerifying(true);
    try {
      const res = await fetch("/api/telegram/verify-gmail-forwarding", {
        method: "POST",
      });
      if (res.ok) {
        setWebhookMsg("🎉 Gmail Auto-Forwarding Verified! Sent notification to Telegram.");
        setData((prev: any) => ({
          ...prev,
          gmailVerificationCode: null,
          gmailVerificationLink: null,
        }));
      }
    } catch (err) {
      console.error("Failed to verify Gmail forwarding:", err);
    } finally {
      setVerifying(false);
    }
  };

  const handleLinkSpreadsheet = async (urlToSave: string) => {
    if (urlToSave && !urlToSave.toLowerCase().startsWith("https://docs.google.com/spreadsheets")) {
      alert("Please enter a valid Google Sheets URL (should start with https://docs.google.com/spreadsheets)");
      return;
    }

    setSavingUrl(true);
    try {
      const res = await fetch("/api/telegram/save-spreadsheet-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlToSave }),
      });
      if (res.ok) {
        const json = await res.json();
        setData((prev: any) => ({
          ...prev,
          syncSpreadsheetUrl: json.syncSpreadsheetUrl,
        }));
        setPastedUrl("");
        setWebhookMsg(urlToSave ? "✅ Google Sheet linked successfully!" : "🔄 Spreadsheet link removed.");
      }
    } catch (err) {
      console.error("Failed to link spreadsheet:", err);
    } finally {
      setSavingUrl(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset your Telegram connection & email alias? A fresh alias and link code will be generated.")) {
      return;
    }
    setResetting(true);
    try {
      const res = await fetch("/api/telegram/reset", { method: "POST" });
      if (res.ok) {
        setWebhookMsg("🔄 Reset successful! Fresh email alias & Telegram link code generated.");
        await fetchStatus();
      }
    } catch (err) {
      console.error("Failed to reset Telegram state:", err);
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-surface border border-border/80 rounded-3xl flex items-center justify-center space-x-3 text-text-muted">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
        <span className="text-xs font-semibold">Loading Telegram Monitoring Status...</span>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6 bg-surface/90 dark:bg-surface/90 border border-border/80 rounded-3xl shadow-xl space-y-5 relative overflow-hidden backdrop-blur-xl">
      {/* Top Header Accent */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-sky-500/15 text-sky-500 flex items-center justify-center font-bold">
            <Send className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-text flex items-center space-x-2">
              <span>Telegram Placement Reminders</span>
              <span className="inline-flex items-center space-x-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-2.5 h-2.5 animate-pulse text-amber-400" />
                <span>Phase 1 Active</span>
              </span>
            </h3>
            <p className="text-[11px] text-text-muted font-medium">
              Auto-detect placement drive emails & receive 3-day / 1-day / day-of Telegram reminders.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleReset}
            disabled={resetting}
            className="px-2.5 py-1.5 text-xs font-extrabold text-red-500 hover:text-white hover:bg-red-500/90 bg-red-500/10 border border-red-500/20 rounded-xl transition-all cursor-pointer flex items-center space-x-1 disabled:opacity-50"
            title="Reset Telegram connection and generate a new personal alias"
          >
            {resetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
            <span>{resetting ? "Resetting..." : "Reset"}</span>
          </button>

          <button
            onClick={fetchStatus}
            className="p-2 text-text-muted hover:text-primary rounded-xl transition-colors cursor-pointer"
            title="Refresh Status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {webhookMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl font-bold flex items-center justify-between">
          <span>{webhookMsg}</span>
          <button onClick={() => setWebhookMsg(null)} className="text-xs hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {data.isLinked ? (
        /* Connected State */
        <div className="space-y-4 pt-1 border-t border-border/50">
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-2xl font-bold flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-emerald-500" />
              <span>Telegram Connected! Bot is actively monitoring placement emails.</span>
            </div>
            {data.telegramUsername && (
              <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full">
                @{data.telegramUsername}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
              Your Personal Inbound Alias
            </label>

            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-bg-base border border-border px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold text-primary truncate">
                {data.inboundAlias}
              </div>
              <button
                onClick={() => handleCopy(data.inboundAlias, "alias")}
                className="px-4 py-2.5 bg-primary hover:opacity-90 text-white text-xs font-extrabold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
              >
                {copiedAlias ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedAlias ? "Copied!" : "Copy Alias"}</span>
              </button>
            </div>
          </div>

          {/* New Google Sheets Auto-Sync Instructions */}
          <div className="p-5 bg-primary/5 border border-primary/20 rounded-3xl space-y-4 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <h4 className="font-extrabold text-sm text-text">
                1-Click Google Sheets Auto-Sync (Recommended)
              </h4>
            </div>

            <p className="text-[11px] text-text-muted font-medium leading-relaxed">
              Standard email forwarding often fails due to strict college security (DMARC) policies. Use our custom Google Sheet to safely sync placement emails from your Gmail to Telegram in 30 seconds.
            </p>

            <ol className="list-decimal list-inside space-y-2.5 text-[11px] text-text-muted font-medium leading-relaxed">
              <li>
                {data.syncSpreadsheetUrl ? (
                  <span>
                    Open your linked{" "}
                    <a
                      href={data.syncSpreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-primary hover:underline font-extrabold"
                    >
                      <span>Google Sync Sheet</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>{" "}
                    (or click{" "}
                    <button
                      onClick={() => handleLinkSpreadsheet("")}
                      className="text-red-500 hover:underline font-bold bg-transparent border-none p-0 cursor-pointer"
                    >
                      Unlink Sheet
                    </button>
                    ).
                  </span>
                ) : (
                  <span>
                    Click here to{" "}
                    <a
                      href="https://docs.google.com/spreadsheets/d/1I4cFk_dQoEOoS1CYa44mLlEfeZemHgSIr_WbYMtZmLE/copy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-primary hover:underline font-extrabold"
                    >
                      <span>Make a Copy of the Sync Sheet Template</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>.
                  </span>
                )}
              </li>
              <li>
                In your copied sheet, paste your Personal Inbound Alias (shown above) into cell <b>B1</b>.
              </li>
              <li>
                In cell <b>B2</b>, enter the search filter for your college domains (e.g. <code>from:(vitstudent.ac.in OR vitapstudent.ac.in)</code>).
              </li>
              <li>
                In the sheet menu bar, click <b>🚀 ATSLift</b> ➔ <b>Start Sync</b> (approve Google permissions on the first run).
              </li>
            </ol>

            {/* Link Input Field if not linked */}
            {!data.syncSpreadsheetUrl && (
              <div className="pt-3 border-t border-border/40 space-y-2">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
                  🔗 Link your Spreadsheet URL (to avoid copying it again)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                    value={pastedUrl}
                    onChange={(e) => setPastedUrl(e.target.value)}
                    className="flex-1 bg-bg-base border border-border px-3 py-2 rounded-xl text-xs text-text outline-hidden focus:border-primary/50"
                  />
                  <button
                    onClick={() => handleLinkSpreadsheet(pastedUrl)}
                    disabled={savingUrl || !pastedUrl}
                    className="px-3.5 py-2 bg-primary hover:opacity-90 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    {savingUrl ? "Saving..." : "Link Sheet"}
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2.5 border-t border-border/40 flex items-center justify-between text-[10px] font-semibold text-text-muted">
              <span>⚡ Checks Gmail every 1 minute</span>
              <span>🔒 100% Secure & Private</span>
            </div>
          </div>
        </div>
      ) : (
        /* Not Connected State */
        <div className="space-y-4 pt-1 border-t border-border/50">
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs rounded-2xl font-semibold flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 text-amber-500" />
              <span>Connect your Telegram account to activate automated placement reminders.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Option 1: Direct Buttons */}
            <div className="p-4 bg-bg-base border border-border rounded-2xl space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted block">
                Option 1: Open Telegram Bot
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <a
                  href={`https://web.telegram.org/a/#?tgaddr=tg%3A%2F%2Fresolve%3Fdomain%3D${data.botUsername}%26start%3D${data.linkToken}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-[11px] font-extrabold rounded-xl flex items-center justify-center space-x-1 transition-all cursor-pointer shadow-xs"
                >
                  <span>Telegram Web</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>

                <a
                  href={data.deepLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 bg-primary hover:opacity-90 text-white text-[11px] font-extrabold rounded-xl flex items-center justify-center space-x-1 transition-all cursor-pointer shadow-xs"
                >
                  <span>Telegram App</span>
                  <Send className="w-3 h-3 opacity-80" />
                </a>
              </div>
            </div>

            {/* Option 2: 6-Digit Link Code */}
            <div className="p-4 bg-bg-base border border-border rounded-2xl space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted block">
                Option 2: Copy Bot Command
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopy(`/start ${data.linkToken}`, "token")}
                  className="flex-1 py-2 px-3 bg-surface border border-border hover:border-primary/40 rounded-xl text-xs font-mono font-extrabold text-primary flex items-center justify-between cursor-pointer transition-all"
                >
                  <span>/start {data.linkToken}</span>
                  {copiedToken ? <Check className="w-4 h-4 text-emerald-500 shrink-0" /> : <Copy className="w-4 h-4 text-text-muted shrink-0" />}
                </button>
              </div>
              <p className="text-[10px] text-text-muted font-medium text-center">
                Search <b>@{data.botUsername}</b> on Telegram & send the copied command.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
