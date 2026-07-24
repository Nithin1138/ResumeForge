import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { 
  sendTelegramMessage, 
  answerTelegramCallback, 
  getInboundAlias,
  escapeHtml
} from "@/lib/telegram";

export async function POST(req: Request) {
  try {
    const update = await req.json();

    // 1. Handle Inline Button Callback Queries
    if (update.callback_query) {
      const callback = update.callback_query;
      const callbackId = callback.id;
      const data = callback.data; // e.g. "applied:jobPostingId"
      const chatId = callback.message?.chat?.id;

      if (data && data.includes(":")) {
        const [action, postingId] = data.split(":");

        const posting = await prisma.jobPosting.findUnique({
          where: { id: postingId },
        });

        if (posting) {
          let newStatus: "APPLIED" | "NOT_ELIGIBLE" | "SKIPPED" = "APPLIED";
          let statusText = "Marked as Applied ✅";

          if (action === "not_eligible") {
            newStatus = "NOT_ELIGIBLE";
            statusText = "Marked as Not Eligible ❌";
          } else if (action === "skip") {
            newStatus = "SKIPPED";
            statusText = "Posting Skipped ⏭️";
          }

          // Update Posting Status
          await prisma.jobPosting.update({
            where: { id: postingId },
            data: { status: newStatus },
          });

          // Cancel remaining pending reminders for this posting
          await prisma.reminder.updateMany({
            where: { jobPostingId: postingId, sent: false },
            data: { sent: true },
          });

          await answerTelegramCallback(callbackId, statusText);

          if (chatId) {
            await sendTelegramMessage(
              chatId,
              `📌 <b>${escapeHtml(posting.companyName)} — ${escapeHtml(posting.roleTitle)}</b>\nStatus updated to: <b>${statusText}</b>. Future reminders for this posting have been canceled.`
            );
          }
        } else {
          await answerTelegramCallback(callbackId, "Job posting not found.");
        }
      }

      return NextResponse.json({ ok: true });
    }

    // 2. Handle Text Messages (/start, /status, /help)
    const message = update.message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const telegramUsername = message.from?.username || null;
    const text = (message.text || "").trim();

    // Extract any 6-digit link code or token from message safely
    const digitMatch = text.match(/\b(\d{6})\b/);
    const rawArg = text.split(/\s+/)[1]?.trim();
    const tokenArg = digitMatch ? digitMatch[1] : (rawArg || "");

    // Command: /start or sending 6-digit code
    if (text.startsWith("/start") || digitMatch) {
      if (!tokenArg) {
        await sendTelegramMessage(
          chatId,
          `👋 <b>Welcome to ATSLift JD Reminder Bot!</b>\n\nTo link your ATSLift account, visit your ATSLift dashboard at <code>/automations</code> and click <b>Link Telegram</b> to get your code.\n\nThen send: <code>/start &lt;code&gt;</code>`
        );
        return NextResponse.json({ ok: true });
      }

      // Find token in database safely
      const cleanToken = tokenArg ? tokenArg.replace(/[^0-9]/g, "") : "";
      const verToken = await prisma.verificationToken.findFirst({
        where: {
          OR: [
            ...(tokenArg ? [{ token: tokenArg }] : []),
            ...(cleanToken ? [{ token: cleanToken }] : []),
          ],
        },
      });

      if (!verToken || !verToken.identifier.endsWith(":telegram-link")) {
        await sendTelegramMessage(
          chatId,
          `❌ <b>Invalid or Expired Link Code</b>\n\nPlease refresh your ATSLift dashboard at <code>/automations</code> to generate a new 6-digit linking code and try again.`
        );
        return NextResponse.json({ ok: true });
      }

      const userId = verToken.identifier.replace(":telegram-link", "");
      const inboundAlias = getInboundAlias(userId);

      // Upsert TelegramUser
      await prisma.telegramUser.upsert({
        where: { userId },
        create: {
          userId,
          telegramChatId: chatId.toString(),
          telegramUsername,
          inboundAlias,
        },
        update: {
          telegramChatId: chatId.toString(),
          telegramUsername,
          inboundAlias,
        },
      });

      // Delete token
      await prisma.verificationToken.deleteMany({
        where: { identifier: verToken.identifier },
      });

      // Welcome Message with Gmail Filter Setup Instructions
      const welcomeMsg = `🎉 <b>Account Successfully Linked!</b>\n\nYour ATSLift account is connected. Here is your personal JD forwarding email alias:\n\n📧 <code>${inboundAlias}</code>\n\n<b>How to set up auto-forwarding in Gmail (2 minutes):</b>\n1. Open Gmail on desktop ⚙️ ➔ <b>See all settings</b>.\n2. Click <b>Filters and Blocked Addresses</b> ➔ <b>Create a new filter</b>.\n3. In <b>From</b>, enter your placement cell email (e.g. <code>placement.ac.in</code> or <code>cdc.ac.in</code>).\n4. Click <b>Create filter</b>, select <b>Forward it to</b> ➔ add <code>${inboundAlias}</code>.\n\nWhenever a placement email arrives, ATSLift will extract the company, role, eligibility & deadlines and send you instant Telegram reminders!`;

      await sendTelegramMessage(chatId, welcomeMsg);
      return NextResponse.json({ ok: true });
    }

    // Command: /status
    if (text === "/status") {
      const tgUser = await prisma.telegramUser.findUnique({
        where: { telegramChatId: chatId.toString() },
      });

      if (tgUser) {
        await sendTelegramMessage(
          chatId,
          `✅ <b>Account Status: Linked</b>\n\n<b>User ID:</b> <code>${tgUser.userId}</code>\n<b>Forwarding Alias:</b> <code>${tgUser.inboundAlias}</code>\n\nYour bot is actively monitoring placement emails.`
        );
      } else {
        await sendTelegramMessage(
          chatId,
          `⚠️ <b>Account Not Linked</b>\n\nVisit your ATSLift dashboard at <code>/automations</code> to link your Telegram account.`
        );
      }
      return NextResponse.json({ ok: true });
    }

    // Default fallback responder for any other text message
    await sendTelegramMessage(
      chatId,
      `🤖 <b>ATSLift Bot Active</b>\n\nSend <code>/start &lt;code&gt;</code> to link your account or <code>/status</code> to check connection status.`
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error in Telegram Webhook:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
