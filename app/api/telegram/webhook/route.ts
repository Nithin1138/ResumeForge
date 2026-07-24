import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { 
  sendTelegramMessage, 
  answerTelegramCallback, 
  getInboundAlias 
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
              `📌 <b>${posting.companyName} — ${posting.roleTitle}</b>\nStatus updated to: <b>${statusText}</b>. Future reminders for this posting have been canceled.`
            );
          }
        } else {
          await answerTelegramCallback(callbackId, "Job posting not found.");
        }
      }

      return NextResponse.json({ ok: true });
    }

    // 2. Handle Text Messages (/start <token> or raw 6-digit code 123456 or /status)
    const message = update.message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const telegramUsername = message.from?.username || null;
    const text = message.text.trim();

    // Check if user sent /start or raw 6-digit code
    const isStartCmd = text.startsWith("/start");
    const isRawCode = /^\d{6}$/.test(text);

    if (isStartCmd || isRawCode) {
      let tokenArg = "";
      if (isStartCmd) {
        const parts = text.split(" ");
        tokenArg = parts[1]?.trim() || "";
      } else if (isRawCode) {
        tokenArg = text;
      }

      if (!tokenArg) {
        await sendTelegramMessage(
          chatId,
          `👋 <b>Welcome to ATSLift JD Reminder Bot!</b>\n\nTo link your ATSLift account, send your 6-digit linking code:\n\n<code>/start &lt;code&gt;</code> or send the 6-digit number directly (e.g. <code>721548</code>).`
        );
        return NextResponse.json({ ok: true });
      }

      // Find token in database
      const verToken = await prisma.verificationToken.findFirst({
        where: {
          token: tokenArg,
          expires: { gt: new Date() },
        },
      });

      if (!verToken || !verToken.identifier.endsWith(":telegram-link")) {
        await sendTelegramMessage(
          chatId,
          `❌ <b>Invalid or Expired Link Code</b>\n\nPlease refresh your ATSLift dashboard to generate a new linking code and try again.`
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

      // Delete used token
      await prisma.verificationToken.deleteMany({
        where: { identifier: verToken.identifier },
      });

      // Send Success Confirmation with Inbound Email Alias Instructions
      const successMsg = `🎉 <b>Telegram Account Successfully Linked!</b>\n\nYour personal placement email alias is:\n<code>${inboundAlias}</code>\n\n<b>How it works:</b>\n1. Forward campus placement emails to your personal alias above.\n2. Our AI parses company, role, eligibility, CGPA, and deadline dates.\n3. You will receive immediate alerts and automated 3-day, 1-day, and day-of reminders right here in Telegram!`;

      await sendTelegramMessage(chatId, successMsg);
      return NextResponse.json({ ok: true });
    }

    // Command: /status
    if (text === "/status") {
      const tgUser = await prisma.telegramUser.findFirst({
        where: { telegramChatId: chatId.toString() },
      });

      if (!tgUser) {
        await sendTelegramMessage(
          chatId,
          `⚠️ <b>Account Not Linked</b>\n\nVisit your ATSLift dashboard to link your Telegram account.`
        );
      } else {
        await sendTelegramMessage(
          chatId,
          `✅ <b>Account Status: Linked</b>\n\n<b>Personal Inbound Alias:</b>\n<code>${tgUser.inboundAlias}</code>`
        );
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error handling Telegram Webhook:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
