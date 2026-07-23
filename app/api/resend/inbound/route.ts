import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractJdInfoWithLLM } from "@/lib/llm-extractor";
import { sendTelegramMessage, formatDateDDMMYYYY, escapeHtml } from "@/lib/telegram";
import { scheduleQStashReminder } from "@/lib/qstash";

function extractCleanEmail(raw: string): string {
  if (!raw) return "";
  const match = raw.match(/<([^>]+)>/);
  const addr = match ? match[1] : raw;
  return addr.toLowerCase().trim();
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Log payload summary for debugging
    console.log("[Resend Webhook Event]:", payload.type, payload.data?.subject, payload.data?.to);

    // Resend webhook verification/event type check
    if (payload.type !== "email.received" || !payload.data) {
      return NextResponse.json({ message: "Ignored event type" }, { status: 200 });
    }

    const { email_id, to, from, subject } = payload.data;
    const recipientList: string[] = Array.isArray(to) ? to : [to];

    // Find the inbound alias matching a TelegramUser in DB
    let matchedTgUser = null;

    for (const rawRecipient of recipientList) {
      const cleanAddr = extractCleanEmail(rawRecipient);
      const prefix = cleanAddr.split("@")[0]; // e.g. "jd_cmrv1w4kb000"

      // 1. Try exact email match
      let tgUser = await prisma.telegramUser.findFirst({
        where: {
          inboundAlias: {
            equals: cleanAddr,
            mode: "insensitive",
          },
        },
      });

      // 2. Try prefix match (e.g. jd_cmrv1w4kb000)
      if (!tgUser && prefix && prefix.startsWith("jd_")) {
        tgUser = await prisma.telegramUser.findFirst({
          where: {
            inboundAlias: {
              startsWith: prefix,
              mode: "insensitive",
            },
          },
        });
      }

      if (tgUser) {
        matchedTgUser = tgUser;
        break;
      }
    }

    // 3. Fallback: If only 1 Telegram user is linked in DB, use that user (prevents dev/single-user drops)
    if (!matchedTgUser) {
      const firstUser = await prisma.telegramUser.findFirst({
        orderBy: { createdAt: "desc" },
      });
      if (firstUser) {
        console.log(`[Resend Inbound Fallback]: Matched recipient to recent user ${firstUser.inboundAlias}`);
        matchedTgUser = firstUser;
      }
    }

    if (!matchedTgUser) {
      console.warn(`[Resend Inbound] No matching TelegramUser found for recipients:`, recipientList);
      return NextResponse.json({ message: "No matching user alias" }, { status: 200 });
    }

    // Fetch email content from Resend payload or API
    let rawEmailText = payload.data.text || payload.data.body || "";
    let rawHtmlText = payload.data.html || "";
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!rawEmailText && !rawHtmlText && resendApiKey && email_id) {
      try {
        const emailRes = await fetch(`https://api.resend.com/emails/receiving/${email_id}`, {
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
          },
        });

        if (emailRes.ok) {
          const emailData = await emailRes.json();
          rawEmailText = emailData.text || "";
          rawHtmlText = emailData.html || "";
        }
      } catch (err) {
        console.error("[Resend Inbound API Error]:", err);
      }
    }

    // Prepend Email Subject and Sender to raw text context
    const fullTextContext = `Subject: ${subject || ""}\nFrom: ${from || ""}\n\n${rawEmailText}`;

    // Call LLM Extractor with both text & HTML
    const extracted = await extractJdInfoWithLLM(fullTextContext, rawHtmlText);

    if (!extracted || !extracted.companyName) {
      // Fallback: Store record and send Telegram message so user is NEVER left in silence!
      const posting = await prisma.jobPosting.create({
        data: {
          telegramUserId: matchedTgUser.id,
          companyName: subject || "Placement Drive",
          roleTitle: "Placement Drive Candidate",
          rawEmailText: fullTextContext,
          eligibilityCriteria: JSON.stringify({ note: "Parsed from email subject" }),
          status: "MANUAL_REVIEW",
        },
      });

      const fallbackMsg = `📩 <b>Placement Email Received!</b>\n\n<b>Subject:</b> ${escapeHtml(subject || "Placement Drive")}\n<b>From:</b> ${escapeHtml(from || "Placement Cell")}\n\nWe received your email! Check your ATSLift dashboard for full details.`;

      await sendTelegramMessage(matchedTgUser.telegramChatId, fallbackMsg);

      return NextResponse.json({ ok: true, status: "MANUAL_REVIEW" });
    }

    // Successfully extracted structured data
    const appDeadline = extracted.applicationDeadline ? new Date(extracted.applicationDeadline) : null;
    const driveDate = extracted.driveDate ? new Date(extracted.driveDate) : null;

    const posting = await prisma.jobPosting.create({
      data: {
        telegramUserId: matchedTgUser.id,
        companyName: extracted.companyName,
        roleTitle: extracted.roleTitle,
        rawEmailText: fullTextContext,
        eligibilityCriteria: JSON.stringify(extracted.eligibilityCriteria || {}),
        applicationDeadline: appDeadline && !isNaN(appDeadline.getTime()) ? appDeadline : null,
        driveDate: driveDate && !isNaN(driveDate.getTime()) ? driveDate : null,
        otherImportantDates: JSON.stringify(extracted.otherImportantDates || []),
        status: "NOTIFIED",
      },
    });

    // 1. Send Immediate Telegram Notification FIRST (Zero Delay & Never Silent!)
    const targetDate = appDeadline || driveDate;
    const branches = escapeHtml(extracted.eligibilityCriteria?.branches?.join(", ") || "All Branches");
    const cgpa = escapeHtml(extracted.eligibilityCriteria?.cgpaCutoff || "No Cutoff specified");
    const companyEscaped = escapeHtml(extracted.companyName);
    const roleEscaped = escapeHtml(extracted.roleTitle);
    const deadlineStr = formatDateDDMMYYYY(targetDate);

    const msgText = `🎯 <b>New Drive Detected: ${companyEscaped}</b>\n\n<b>Role:</b> ${roleEscaped}\n<b>Eligible Branches:</b> ${branches}\n<b>CGPA Cutoff:</b> ${cgpa}\n<b>Deadline/Date:</b> 🗓️ ${deadlineStr}\n\n<i>Reminders have been scheduled for 3 days before, 1 day before, and day of drive.</i>`;

    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: "✅ Applied", callback_data: `applied:${posting.id}` },
          { text: "❌ Not Eligible", callback_data: `not_eligible:${posting.id}` },
          { text: "⏭️ Skip", callback_data: `skip:${posting.id}` },
        ],
      ],
    };

    // Send Telegram message immediately
    const sent = await sendTelegramMessage(matchedTgUser.telegramChatId, msgText, inlineKeyboard);
    console.log(`[Telegram Send Result for ${matchedTgUser.telegramChatId}]:`, sent);

    // 2. Schedule Reminders in background without blocking initial message response
    const now = new Date();
    const remindersToCreate: Array<{ scheduledFor: Date; reminderType: "THREE_DAYS_BEFORE" | "ONE_DAY_BEFORE" | "DAY_OF" }> = [];

    if (targetDate && !isNaN(targetDate.getTime())) {
      // 3 Days Before
      const threeDays = new Date(targetDate.getTime() - 3 * 24 * 60 * 60 * 1000);
      if (threeDays > now) {
        remindersToCreate.push({ scheduledFor: threeDays, reminderType: "THREE_DAYS_BEFORE" });
      }

      // 1 Day Before
      const oneDay = new Date(targetDate.getTime() - 1 * 24 * 60 * 60 * 1000);
      if (oneDay > now) {
        remindersToCreate.push({ scheduledFor: oneDay, reminderType: "ONE_DAY_BEFORE" });
      }

      // Day Of (at 8:00 AM IST on drive/deadline date)
      const dayOf = new Date(targetDate);
      dayOf.setHours(8, 0, 0, 0);
      if (dayOf > now) {
        remindersToCreate.push({ scheduledFor: dayOf, reminderType: "DAY_OF" });
      }
    }

    // Schedule reminders in parallel
    Promise.allSettled(
      remindersToCreate.map(async (rem) => {
        const createdRem = await prisma.reminder.create({
          data: {
            jobPostingId: posting.id,
            scheduledFor: rem.scheduledFor,
            reminderType: rem.reminderType,
            sent: false,
          },
        });
        return scheduleQStashReminder(createdRem.id, createdRem.scheduledFor);
      })
    ).catch((err) => console.error("Error scheduling background reminders:", err));

    return NextResponse.json({ ok: true, postingId: posting.id });
  } catch (error) {
    console.error("Error in Resend Inbound Webhook:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
