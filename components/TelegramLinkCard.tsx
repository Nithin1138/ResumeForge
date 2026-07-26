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
  AlertCircle
} from "lucide-react";

export function TelegramLinkCard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [copiedAlias, setCopiedAlias] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [webhookMsg, setWebhookMsg] = useState<string | null>(null);

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

        <button
          onClick={fetchStatus}
          className="p-2 text-text-muted hover:text-primary rounded-xl transition-colors cursor-pointer"
          title="Refresh Status"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
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

          {/* 1-Click Gmail Auto-Forwarding Verification Banner */}
          {(data.gmailVerificationLink || data.gmailVerificationCode) && (
            <div className="p-4 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-extrabold text-xs">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <span>🔑 Gmail Auto-Forwarding Verification Requested!</span>
                </div>
                {data.gmailVerificationCode && (
                  <span className="bg-amber-500/20 font-mono text-xs font-black px-2.5 py-1 rounded-lg text-amber-600 dark:text-amber-300">
                    Code: {data.gmailVerificationCode}
                  </span>
                )}
              </div>

              <p className="text-xs text-text-muted font-medium">
                Google sent a verification link to confirm Gmail auto-forwarding to your personal alias <code>{data.inboundAlias}</code>.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {data.gmailVerificationLink && (
                  <button
                    onClick={() => handleApproveVerification(data.gmailVerificationLink)}
                    disabled={verifying}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold rounded-xl flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <span>{verifying ? "Verifying..." : "1-Click Approve Gmail Forwarding"}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}

                {data.gmailVerificationCode && (
                  <button
                    onClick={() => handleCopy(data.gmailVerificationCode, "token")}
                    className="px-3.5 py-2 bg-surface hover:bg-bg-base border border-border text-text text-xs font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </button>
                )}

                <button
                  onClick={() => handleApproveVerification()}
                  disabled={verifying}
                  className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-extrabold rounded-xl flex items-center space-x-1.5 cursor-pointer transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark Verified</span>
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
              Your Personal Placement Inbound Email Alias
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
                <span>{copiedAlias ? "Copied!" : "Copy Email"}</span>
              </button>
            </div>
          </div>

          {/* Quick Setup Instructions */}
          <div className="p-4 bg-bg-base/60 border border-border/60 rounded-2xl space-y-2 text-xs">
            <h4 className="font-extrabold text-text flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-primary" />
              <span>Gmail Auto-Forwarding Instructions:</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-text-muted font-medium leading-relaxed">
              <li>Open Gmail on desktop ⚙️ ➔ <b>See all settings</b> ➔ <b>Forwarding and POP/IMAP</b> (or <b>Filters and Blocked Addresses</b>).</li>
              <li>Click <b>Add a forwarding address</b> ➔ enter <code>{data.inboundAlias}</code>.</li>
              <li><b>Approve Verification</b>: Click <b>1-Click Approve Gmail Forwarding</b> in the banner above (or enter the verification code sent to your alias).</li>
              <li>Click <b>Create a new filter</b> ➔ enter your placement cell domain in <b>From</b> (e.g. <code>vitap.ac.in</code> or <code>vitapstudent.ac.in</code>) ➔ click <b>Create filter</b>.</li>
              <li>Check the box <b>☑️ Forward it to:</b> ➔ select <code>{data.inboundAlias}</code> from the dropdown menu ➔ click <b>Create filter</b>.</li>
            </ol>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold pt-1">
              📌 <b>Crucial Note:</b> Make sure your Gmail filter <code>From:</code> covers official placement domains like <code>vitap.ac.in</code> so all CDC emails are forwarded!
            </p>
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
