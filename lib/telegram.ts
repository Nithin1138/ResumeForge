// lib/telegram.ts
// Helper utilities for Telegram Bot API integration

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const INBOUND_DOMAIN = process.env.INBOUND_EMAIL_DOMAIN || "resend.app";

export function getInboundAlias(userId: string): string {
  // Generate a clean, short inbound email alias e.g. usr_xyz123@domain.resend.app
  const cleanId = userId.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().slice(0, 12);
  return `jd_${cleanId}@${INBOUND_DOMAIN}`;
}

export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  replyMarkup?: any
): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn("[Telegram Bot] TELEGRAM_BOT_TOKEN is not configured. Message logged to console:");
    console.log(`[Telegram Msg to ${chatId}]:\n${text}`);
    return true;
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        reply_markup: replyMarkup,
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("[Telegram Bot API Error]:", err);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Telegram Bot Exception]:", error);
    return false;
  }
}

export async function answerTelegramCallback(
  callbackQueryId: string,
  text?: string
): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) return true;

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
      }),
    });
    return true;
  } catch (error) {
    console.error("[Telegram Callback Error]:", error);
    return false;
  }
}

export async function setTelegramWebhook(webhookUrl: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) return false;

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message", "callback_query"],
      }),
    });
    const data = await res.json();
    return !!data.ok;
  } catch (error) {
    console.error("[Telegram SetWebhook Error]:", error);
    return false;
  }
}
