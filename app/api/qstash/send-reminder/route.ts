import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reminderId } = body;

    if (!reminderId) {
      return NextResponse.json({ message: "Missing reminderId" }, { status: 400 });
    }

    // Look up Reminder in database
    const reminder = await prisma.reminder.findUnique({
      where: { id: reminderId },
      include: {
        jobPosting: {
          include: {
            telegramUser: true,
          },
        },
      },
    });

    if (!reminder) {
      return NextResponse.json({ message: "Reminder not found" }, { status: 404 });
    }

    // If already sent or posting status is non-active, skip dispatch
    if (reminder.sent) {
      return NextResponse.json({ message: "Reminder already delivered" }, { status: 200 });
    }

    const posting = reminder.jobPosting;
    const tgUser = posting?.telegramUser;

    if (!posting || !tgUser || posting.status === "APPLIED" || posting.status === "NOT_ELIGIBLE" || posting.status === "SKIPPED") {
      await prisma.reminder.update({
        where: { id: reminderId },
        data: { sent: true },
      });
      return NextResponse.json({ message: "Posting non-active, canceled reminder" }, { status: 200 });
    }

    // Format Reminder Message
    let reminderTitle = "⏰ <b>Upcoming Drive Reminder</b>";
    if (reminder.reminderType === "THREE_DAYS_BEFORE") {
      reminderTitle = "⏰ <b>REMINDER: 3 Days Left to Apply</b>";
    } else if (reminder.reminderType === "ONE_DAY_BEFORE") {
      reminderTitle = "⚠️ <b>URGENT: 1 Day Left to Apply!</b>";
    } else if (reminder.reminderType === "DAY_OF") {
      reminderTitle = "🚀 <b>TODAY: Drive Day / Application Deadline!</b>";
    }

    const targetDate = posting.applicationDeadline || posting.driveDate;
    const deadlineStr = targetDate
      ? targetDate.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })
      : "Today";

    const msgText = `${reminderTitle}\n\n<b>Company:</b> ${posting.companyName}\n<b>Role:</b> ${posting.roleTitle}\n<b>Deadline / Date:</b> 🗓️ ${deadlineStr}\n\nHave you applied for this drive yet?`;

    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: "✅ Applied", callback_data: `applied:${posting.id}` },
          { text: "❌ Not Eligible", callback_data: `not_eligible:${posting.id}` },
          { text: "⏭️ Skip", callback_data: `skip:${posting.id}` },
        ],
      ],
    };

    const success = await sendTelegramMessage(tgUser.telegramChatId, msgText, inlineKeyboard);

    if (success) {
      await prisma.reminder.update({
        where: { id: reminderId },
        data: { sent: true },
      });
    }

    return NextResponse.json({ ok: true, reminderId, delivered: success });
  } catch (error) {
    console.error("Error in /api/qstash/send-reminder:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
