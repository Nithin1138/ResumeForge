// lib/qstash.ts
// Integration with Upstash QStash for precise delayed message scheduling (no polling required)

const QSTASH_TOKEN = process.env.QSTASH_TOKEN;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

export async function scheduleQStashReminder(
  reminderId: string,
  scheduledFor: Date
): Promise<boolean> {
  if (!QSTASH_TOKEN) {
    console.warn(`[QStash] QSTASH_TOKEN not configured. Reminder ${reminderId} saved in DB for fallback execution.`);
    return false;
  }

  try {
    const destinationUrl = `${APP_URL}/api/qstash/send-reminder`;
    
    // Upstash free tier has a max delay of 7 days (604,800 seconds)
    const maxDelayMs = 604800 * 1000;
    const now = Date.now();
    let scheduledTimeMs = scheduledFor.getTime();
    
    if (scheduledTimeMs - now > maxDelayMs) {
      console.warn(`[QStash] Scheduled date ${scheduledFor.toISOString()} exceeds 7-day free tier limit. Capping to 7 days from now.`);
      scheduledTimeMs = now + maxDelayMs - 60000; // 7 days minus 1 minute buffer
    }

    const notBeforeSec = Math.floor(scheduledTimeMs / 1000);

    const res = await fetch(`https://qstash.upstash.io/v2/publish/${destinationUrl}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${QSTASH_TOKEN}`,
        "Upstash-Not-Before": notBeforeSec.toString(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reminderId }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[QStash Publish Error]:", errText);
      return false;
    }

    const data = await res.json();
    console.log(`[QStash] Scheduled reminder ${reminderId} for ${scheduledFor.toISOString()} (Message ID: ${data.messageId})`);
    return true;
  } catch (error) {
    console.error("[QStash Exception]:", error);
    return false;
  }
}
