import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractJdInfoWithLLM } from "@/lib/llm-extractor";
import { sendTelegramMessage, formatDateDDMMYYYY } from "@/lib/telegram";
import { scheduleQStashReminder } from "@/lib/qstash";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Resend webhook verification/event type check
    if (payload.type !== "email.received" || !payload.data) {
      return NextResponse.json({ message: "Ignored event type" }, { status: 200 });
    }

    const { email_id, to, from, subject } = payload.data;
    const recipientList: string[] = Array.isArray(to) ? to : [to];

    // Find the inbound alias matching a TelegramUser in DB
    let matchedTgUser = null;
    let matchedAlias = "";

    for (const recipient of recipientList) {
      const cleanAddr = recipient.toLowerCase().trim();
      const tgUser = await prisma.telegramUser.findFirst({
        where: {
          inboundAlias: {
            equals: cleanAddr,
            mode: "insensitive",
          },
        },
      });

      if (tgUser) {
        matchedTgUser = tgUser;
        matchedAlias = cleanAddr;
        break;
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
      // Failed extraction / Malformed -> Flag for Manual Review
      const posting = await prisma.jobPosting.create({
        data: {
          telegramUserId: matchedTgUser.id,
          companyName: subject || "Unknown Placement Drive",
          roleTitle: "Placement Drive (Review Required)",
          rawEmailText: fullTextContext,
          eligibilityCriteria: JSON.stringify({ note: "Manual review required" }),
          status: "MANUAL_REVIEW",
        },
      });

      await sendTelegramMessage(
        matchedTgUser.telegramChatId,
        `⚠️ <b>New Placement Email Received (Manual Review Needed)</b>\n\n<b>Subject:</b> ${subject}\n<b>From:</b> ${from}\n\nOur AI couldn't parse all details automatically. You can review the details in your ATSLift dashboard.`
      );

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

    // 1. Send Immediate Telegram Notification FIRST (Zero Delay!)
    const targetDate = appDeadline || driveDate;
    const branches = extracted.eligibilityCriteria?.branches?.join(", ") || "All Branches";
    const cgpa = extracted.eligibilityCriteria?.cgpaCutoff || "No Cutoff specified";
    const deadlineStr = formatDateDDMMYYYY(targetDate);

    const msgText = `🎯 <b>New Drive Detected: ${extracted.companyName}</b>\n\n<b>Role:</b> ${extracted.roleTitle}\n<b>Eligible Branches:</b> ${branches}\n<b>CGPA Cutoff:</b> ${cgpa}\n<b>Deadline/Date:</b> 🗓️ ${deadlineStr}\n\n<i>Reminders have been scheduled for 3 days before, 1 day before, and day of drive.</i>`;

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
    await sendTelegramMessage(matchedTgUser.telegramChatId, msgText, inlineKeyboard);

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
