import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractJdInfoWithLLM } from "@/lib/llm-extractor";
import { sendTelegramMessage, formatDateDDMMYYYY, escapeHtml } from "@/lib/telegram";
import { scheduleQStashReminder } from "@/lib/qstash";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { emailSubject, emailBody, sender } = await req.json();

    if (!emailBody || emailBody.trim().length < 10) {
      return NextResponse.json({ message: "Email content is required and must be at least 10 characters." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { telegramUser: true },
    });

    if (!user || !user.telegramUser) {
      return NextResponse.json({ message: "Telegram account not linked yet." }, { status: 400 });
    }

    const fullTextContext = `Subject: ${emailSubject || "Placement Drive"}\nFrom: ${sender || "Placement Cell"}\n\n${emailBody}`;

    // Extract structured info with LLM
    const extracted = await extractJdInfoWithLLM(fullTextContext);

    if (!extracted || !extracted.companyName) {
      const posting = await prisma.jobPosting.create({
        data: {
          telegramUserId: user.telegramUser.id,
          companyName: emailSubject || "Campus Placement Drive",
          roleTitle: "Placement Drive Candidate",
          rawEmailText: fullTextContext,
          eligibilityCriteria: JSON.stringify({ note: "Manual review required" }),
          status: "MANUAL_REVIEW",
        },
      });

      await sendTelegramMessage(
        user.telegramUser.telegramChatId,
        `📩 <b>Placement Email Ingested (Manual Review)</b>\n\n<b>Subject:</b> ${escapeHtml(emailSubject || "Placement Drive")}\n<b>From:</b> ${escapeHtml(sender || "Placement Cell")}\n\nProcessed email! Check your ATSLift dashboard.`
      );

      return NextResponse.json({ ok: true, status: "MANUAL_REVIEW", postingId: posting.id });
    }

    const appDeadline = extracted.applicationDeadline ? new Date(extracted.applicationDeadline) : null;
    const driveDate = extracted.driveDate ? new Date(extracted.driveDate) : null;

    const posting = await prisma.jobPosting.create({
      data: {
        telegramUserId: user.telegramUser.id,
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

    // Send Immediate Telegram Alert
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

    await sendTelegramMessage(user.telegramUser.telegramChatId, msgText, inlineKeyboard);

    // Schedule background reminders
    const now = new Date();
    const remindersToCreate: Array<{ scheduledFor: Date; reminderType: "THREE_DAYS_BEFORE" | "ONE_DAY_BEFORE" | "DAY_OF" }> = [];

    if (targetDate && !isNaN(targetDate.getTime())) {
      const threeDays = new Date(targetDate.getTime() - 3 * 24 * 60 * 60 * 1000);
      if (threeDays > now) remindersToCreate.push({ scheduledFor: threeDays, reminderType: "THREE_DAYS_BEFORE" });

      const oneDay = new Date(targetDate.getTime() - 1 * 24 * 60 * 60 * 1000);
      if (oneDay > now) remindersToCreate.push({ scheduledFor: oneDay, reminderType: "ONE_DAY_BEFORE" });

      const dayOf = new Date(targetDate);
      dayOf.setHours(8, 0, 0, 0);
      if (dayOf > now) remindersToCreate.push({ scheduledFor: dayOf, reminderType: "DAY_OF" });
    }

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
    ).catch(() => {});

    return NextResponse.json({ ok: true, postingId: posting.id });
  } catch (error) {
    console.error("Error in manual ingest route:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
