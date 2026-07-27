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

    // Ignore stale queued messages older than 5 minutes to prevent chat flooding
    const nowUnix = Math.floor(Date.now() / 1000);
    if (message.date && (nowUnix - message.date > 300)) {
      console.log(`[Telegram Webhook]: Ignoring stale queued message from ${nowUnix - message.date}s ago`);
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
          `👋 <b>Welcome to ATSLift JD Reminder Bot!</b>\n\nTo link your ATSLift account, visit your ATSLift dashboard at <code>/automations</code> to get your code.\n\nThen send: <code>/start &lt;code&gt;</code>`
        );
        return NextResponse.json({ ok: true });
      }

      // Find user by verificationToken OR User.telegramLinkCode
      const cleanToken = tokenArg ? tokenArg.replace(/[^0-9]/g, "") : "";
      let matchedUserId: string | null = null;

      const verToken = await prisma.verificationToken.findFirst({
        where: {
          OR: [
            ...(tokenArg ? [{ token: tokenArg }] : []),
            ...(cleanToken ? [{ token: cleanToken }] : []),
          ],
        },
      });

      if (verToken) {
        matchedUserId = verToken.identifier.replace(":telegram-link", "");
      } else {
        const userMatch = await prisma.user.findFirst({
          where: {
            OR: [
              ...(tokenArg ? [{ telegramLinkCode: tokenArg }] : []),
              ...(cleanToken ? [{ telegramLinkCode: cleanToken }] : []),
            ],
          },
        });
        if (userMatch) {
          matchedUserId = userMatch.id;
        }
      }

      if (!matchedUserId) {
        await sendTelegramMessage(
          chatId,
          `❌ <b>Invalid Link Code</b>\n\nPlease check your 6-digit linking code on your ATSLift dashboard at <code>/automations</code> and try again.`
        );
        return NextResponse.json({ ok: true });
      }

      const userId = matchedUserId;
      const inboundAlias = getInboundAlias(userId);

      // Clean up any existing conflicting records for this userId or telegramChatId to prevent P2002 unique constraint errors
      await prisma.telegramUser.deleteMany({
        where: {
          OR: [
            { userId },
            { telegramChatId: chatId.toString() },
          ],
        },
      });

      // Create fresh TelegramUser link
      await prisma.telegramUser.create({
        data: {
          userId,
          telegramChatId: chatId.toString(),
          telegramUsername,
          inboundAlias,
        },
      });

      // Delete verification token if exists
      await prisma.verificationToken.deleteMany({
        where: { identifier: `${userId}:telegram-link` },
      });

      // Welcome Message with Google Sheets Auto-Sync Instructions
      const welcomeMsg = `🎉 <b>Account Successfully Linked!</b>\n\nYour ATSLift account is connected. Here is your personal Inbound Alias:\n\n📧 <code>${inboundAlias}</code>\n\n<b>How to set up Auto-Sync (15 seconds):</b>\n1. Open your ATSLift dashboard at https://atslift.app/automations.\n2. Click the link to <b>Make a Copy of the Google Sheet Template</b>.\n3. Paste your alias <code>${inboundAlias}</code> into cell <b>B1</b>.\n4. Click <b>🚀 ATSLift</b> ➔ <b>Start Sync</b> in the sheet's top menu.\n\nYour Google Sheet will now automatically sync all new placement emails to Telegram every 1 minute!`;

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
