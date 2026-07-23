import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram";

export async function GET(req: Request) {
  return handleCronReminders(req);
}

export async function POST(req: Request) {
  return handleCronReminders(req);
}

async function handleCronReminders(req: Request) {
  try {
    // Optional secret verification for external CRON pingers (e.g. cron-job.org)
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get("authorization");

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Also check Vercel Cron header
      const isVercelCron = req.headers.get("x-vercel-cron") === "1";
      if (!isVercelCron) {
        return NextResponse.json({ message: "Unauthorized cron request" }, { status: 401 });
      }
    }

    const now = new Date();

    // Fetch due unsent reminders
    const dueReminders = await prisma.reminder.findMany({
      where: {
        sent: false,
        scheduledFor: { lte: now },
      },
      include: {
        jobPosting: {
          include: {
            telegramUser: true,
          },
        },
      },
      take: 50, // Batch limit
    });

    let sentCount = 0;

    for (const rem of dueReminders) {
      const posting = rem.jobPosting;
      const tgUser = posting?.telegramUser;

      // If posting status is already APPLIED, NOT_ELIGIBLE, or SKIPPED, skip reminder and mark sent
      if (!posting || !tgUser || posting.status === "APPLIED" || posting.status === "NOT_ELIGIBLE" || posting.status === "SKIPPED") {
        await prisma.reminder.update({
          where: { id: rem.id },
          data: { sent: true },
        });
        continue;
      }

      // Format Reminder Title based on Reminder Type
      let reminderTitle = "⏰ <b>Upcoming Drive Reminder</b>";
      if (rem.reminderType === "THREE_DAYS_BEFORE") {
        reminderTitle = "⏰ <b>REMINDER: 3 Days Left to Apply</b>";
      } else if (rem.reminderType === "ONE_DAY_BEFORE") {
        reminderTitle = "⚠️ <b>URGENT: 1 Day Left to Apply!</b>";
      } else if (rem.reminderType === "DAY_OF") {
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
          where: { id: rem.id },
          data: { sent: true },
        });
        sentCount++;
      }
    }

    return NextResponse.json({
      ok: true,
      processed: dueReminders.length,
      sent: sentCount,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Error running cron reminders:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
