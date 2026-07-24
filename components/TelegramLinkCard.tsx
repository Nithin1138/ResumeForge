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
  Zap,
  PlusCircle,
  X
} from "lucide-react";

export function TelegramLinkCard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [copiedAlias, setCopiedAlias] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const [webhookMsg, setWebhookMsg] = useState<string | null>(null);
  const [settingWebhook, setSettingWebhook] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simulatingEmail, setSimulatingEmail] = useState(false);

  // Modal State for Manual Email Ingestion
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manualSubject, setManualSubject] = useState("");
  const [manualSender, setManualSender] = useState("placement@vitapstudent.ac.in");
  const [manualBody, setManualBody] = useState("");
  const [ingesting, setIngesting] = useState(false);

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

  const handleSimulateDevLink = async () => {
    if (!data?.linkToken) return;
    setSimulating(true);
    try {
      const res = await fetch("/api/telegram/dev-simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkToken: data.linkToken }),
      });
      const json = await res.json();
      if (json.ok) {
        setWebhookMsg("⚡ Dev Mode: Successfully linked account!");
        fetchStatus();
      } else {
        setWebhookMsg(`Dev Error: ${json.message}`);
      }
    } catch (err) {
      console.error("Dev simulation error:", err);
    } finally {
      setSimulating(false);
    }
  };

  const handleSimulateTestEmail = async () => {
    setSimulatingEmail(true);
    setWebhookMsg(null);
    try {
      const res = await fetch("/api/resend/dev-simulate-email", {
        method: "POST",
      });
      const json = await res.json();
      if (json.ok) {
        setWebhookMsg("🎯 Placement Email Received & AI Parsed! Check server logs & DB.");
      } else {
        setWebhookMsg(`Error: ${json.message}`);
      }
    } catch (err) {
      console.error("Email simulation error:", err);
    } finally {
      setSimulatingEmail(false);
    }
  };

  const handleSimulateGmailVerification = () => {
    setData((prev: any) => ({
      ...prev,
      gmailVerificationCode: "847291048",
      gmailVerificationLink: "https://mail.google.com/mail/vf-847291048",
    }));
    setWebhookMsg("🔑 Simulated Gmail Verification Banner! Test 1-Click Approval below.");
  };

  const handleManualIngestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBody.trim()) return;

    setIngesting(true);
    setWebhookMsg(null);
    try {
      const res = await fetch("/api/resend/manual-ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailSubject: manualSubject,
          sender: manualSender,
          emailBody: manualBody,
        }),
      });

      const json = await res.json();
      if (json.ok) {
        setWebhookMsg("🎯 Real Placement Email AI Parsed & Sent to Telegram!");
        setIsModalOpen(false);
        setManualBody("");
        setManualSubject("");
      } else {
        setWebhookMsg(`Ingest Error: ${json.message}`);
      }
    } catch (err) {
      console.error("Manual ingest error:", err);
      setWebhookMsg("Failed to ingest placement email.");
    } finally {
      setIngesting(false);
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

  const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

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
        <div className="p-3 bg-primary/10 border border-primary/20 text-primary text-xs rounded-xl font-bold">
          {webhookMsg}
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

              <div className="flex items-center space-x-2 pt-1">
                {data.gmailVerificationLink && (
                  <a
                    href={data.gmailVerificationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold rounded-xl flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <span>1-Click Approve Gmail Forwarding</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
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
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
                Your Personal Placement Inbound Email Alias
              </label>

              <div className="flex items-center space-x-2.5">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-[10px] font-extrabold text-emerald-500 hover:underline flex items-center space-x-1 cursor-pointer bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>Paste Real Email</span>
                </button>

                <button
                  onClick={handleSimulateGmailVerification}
                  className="text-[10px] font-bold text-amber-500 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>Test Verification Banner</span>
                </button>

                <button
                  onClick={handleSimulateTestEmail}
                  disabled={simulatingEmail}
                  className="text-[10px] font-bold text-sky-500 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <Zap className="w-3 h-3" />
                  <span>{simulatingEmail ? "Processing AI..." : "Test Simulation"}</span>
                </button>
              </div>
            </div>

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
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-text-muted font-medium leading-relaxed">
              <li>Open Gmail on desktop ⚙️ ➔ <b>See all settings</b> ➔ <b>Filters and Blocked Addresses</b>.</li>
              <li>Click <b>Create a new filter</b> ➔ enter your placement cell email (e.g. <code>placement.ac.in</code>) in <b>From</b>.</li>
              <li>Select <b>Forward it to</b> and enter <code>{data.inboundAlias}</code>.</li>
            </ol>
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

          {/* Developer Local simulation bar */}
          {isLocalhost && (
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-between">
              <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                🛠️ <b>Localhost Detected:</b> Telegram API requires HTTPS. Tap to simulate linking directly on local DB:
              </div>
              <button
                onClick={handleSimulateDevLink}
                disabled={simulating}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1 shrink-0 ml-2 cursor-pointer shadow-xs"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{simulating ? "Linking..." : "Simulate Local Link"}</span>
              </button>
            </div>
          )}

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

      {/* Manual Real Email Ingestion Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-extrabold text-base text-text flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-emerald-500" />
                <span>Parse Real Placement Email</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualIngestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-text mb-1">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={manualSubject}
                  onChange={(e) => setManualSubject(e.target.value)}
                  placeholder="e.g. Tekion | Placement Drive / Internship - 2027 Batch"
                  className="w-full px-3.5 py-2.5 bg-bg-base border border-border/80 rounded-xl text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-text mb-1">
                  Placement Cell Sender Email
                </label>
                <input
                  type="text"
                  value={manualSender}
                  onChange={(e) => setManualSender(e.target.value)}
                  placeholder="cdc@vitapstudent.ac.in"
                  className="w-full px-3.5 py-2.5 bg-bg-base border border-border/80 rounded-xl text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-text mb-1">
                  Paste Placement Email Content / Table *
                </label>
                <textarea
                  rows={6}
                  value={manualBody}
                  onChange={(e) => setManualBody(e.target.value)}
                  placeholder="Paste the placement email text, criteria table, CTC, and deadline dates here..."
                  required
                  className="w-full p-3 bg-bg-base border border-border/80 rounded-xl text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-surface hover:bg-bg-base text-text-muted text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={ingesting}
                  className="px-5 py-2.5 bg-primary hover:opacity-90 text-white text-xs font-extrabold rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-xs"
                >
                  {ingesting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Parsing AI...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Parse & Notify Telegram</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
