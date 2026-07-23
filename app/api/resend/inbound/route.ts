import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractJdInfoWithLLM } from "@/lib/llm-extractor";
import { sendTelegramMessage } from "@/lib/telegram";
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

    // Fetch full email content using Resend Received Emails API
    let rawEmailText = "";
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey && email_id) {
      try {
        const emailRes = await fetch(`https://api.resend.com/emails/${email_id}`, {
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
          },
        });

        if (emailRes.ok) {
          const emailData = await emailRes.json();
          rawEmailText = emailData.text || emailData.html || "";
        }
      } catch (err) {
        console.error("[Resend Inbound API Error]:", err);
      }
    }

    // Fallback if API fetch didn't return text (e.g. simulation payload)
    if (!rawEmailText) {
      rawEmailText = payload.data.text || payload.data.body || `Subject: ${subject}\nFrom: ${from}`;
    }

    // Call LLM Extractor
    const extracted = await extractJdInfoWithLLM(rawEmailText);

    if (!extracted || !extracted.companyName) {
      // Failed extraction / Malformed -> Flag for Manual Review
      const posting = await prisma.jobPosting.create({
        data: {
          telegramUserId: matchedTgUser.id,
          companyName: subject || "Unknown Placement Drive",
          roleTitle: "Placement Drive (Review Required)",
          rawEmailText,
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
        rawEmailText,
        eligibilityCriteria: JSON.stringify(extracted.eligibilityCriteria || {}),
        applicationDeadline: appDeadline && !isNaN(appDeadline.getTime()) ? appDeadline : null,
        driveDate: driveDate && !isNaN(driveDate.getTime()) ? driveDate : null,
        otherImportantDates: JSON.stringify(extracted.otherImportantDates || []),
        status: "NOTIFIED",
      },
    });

    // Schedule Reminders (3 days before, 1 day before, day of)
    const now = new Date();
    const remindersToCreate: Array<{ scheduledFor: Date; reminderType: "THREE_DAYS_BEFORE" | "ONE_DAY_BEFORE" | "DAY_OF" }> = [];

    const targetDate = appDeadline || driveDate;

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

    for (const rem of remindersToCreate) {
      const createdRem = await prisma.reminder.create({
        data: {
          jobPostingId: posting.id,
          scheduledFor: rem.scheduledFor,
          reminderType: rem.reminderType,
          sent: false,
        },
      });

      // Schedule individual reminder delivery with Upstash QStash at creation time (no polling)
      await scheduleQStashReminder(createdRem.id, createdRem.scheduledFor);
    }

    // Send Immediate Telegram Notification with Inline Buttons
    const branches = extracted.eligibilityCriteria?.branches?.join(", ") || "All Branches";
    const cgpa = extracted.eligibilityCriteria?.cgpaCutoff || "No Cutoff specified";
    const deadlineStr = targetDate ? targetDate.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) : "Not Specified";

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

    await sendTelegramMessage(matchedTgUser.telegramChatId, msgText, inlineKeyboard);

    return NextResponse.json({ ok: true, postingId: posting.id });
  } catch (error) {
    console.error("Error in Resend Inbound Webhook:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
