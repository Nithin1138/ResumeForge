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
    const data = payload.data || payload;

    // Log payload summary for debugging
    console.log("[Inbound Webhook Event]:", payload.type || "Cloudflare/Direct", data.subject, data.to);

    // Resend / Cloudflare event type check (allow email.received, cloudflare.email, or direct payload)
    if (payload.type && payload.type !== "email.received" && payload.type !== "email.inbound" && payload.type !== "cloudflare.email") {
      return NextResponse.json({ message: "Ignored event type" }, { status: 200 });
    }

    const email_id = data.email_id || data.id || payload.email_id;
    const to = data.to || payload.to || payload.recipient;
    const from = data.from || payload.from || payload.sender;
    const subject = data.subject || payload.subject;

    const recipientList: string[] = Array.isArray(to) ? [...to] : (to ? [to] : []);
    if (payload.delivered_to) recipientList.push(payload.delivered_to);
    if (payload.forwarded_to) recipientList.push(payload.forwarded_to);
    if (data.delivered_to) recipientList.push(data.delivered_to);

    // Find the inbound alias or user email matching a TelegramUser in DB
    let matchedTgUser = null;

    for (const rawRecipient of recipientList) {
      const cleanAddr = extractCleanEmail(rawRecipient);
      const prefix = cleanAddr.split("@")[0]; // e.g. "jd_cmrv1w4kb000"

      // 1. Try exact inboundAlias match
      let tgUser = await prisma.telegramUser.findFirst({
        where: {
          inboundAlias: {
            equals: cleanAddr,
            mode: "insensitive",
          },
        },
      });

      // 2. Try user email match (e.g. personalprojects1009@gmail.com)
      if (!tgUser) {
        tgUser = await prisma.telegramUser.findFirst({
          where: {
            user: {
              email: {
                equals: cleanAddr,
                mode: "insensitive",
              },
            },
          },
        });
      }

      // 3. Try prefix match (e.g. jd_cmrv1w4kb000)
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

    // 3. Fallback: If only 1 Telegram user is linked in DB or default single user, match recent TelegramUser
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
    let rawEmailText = data.text || data.body || payload.text || "";
    let rawHtmlText = data.html || payload.html || "";
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
        } else {
          // Retry with alternate Resend endpoint if needed
          const emailResAlt = await fetch(`https://api.resend.com/emails/${email_id}`, {
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
            },
          });
          if (emailResAlt.ok) {
            const emailDataAlt = await emailResAlt.json();
            rawEmailText = emailDataAlt.text || "";
            rawHtmlText = emailDataAlt.html || "";
          }
        }
      } catch (err) {
        console.error("[Resend Inbound API Error]:", err);
      }
    }

    const fullTextContext = `Subject: ${subject || ""}\nFrom: ${from || ""}\n\n${rawEmailText}`;
    const fromLower = (from || "").toLowerCase();
    const subjectLower = (subject || "").toLowerCase();
    const bodyContextLower = (fullTextContext + " " + rawHtmlText).toLowerCase();

    // Check if this is a Gmail Auto-Forwarding Confirmation Email from Google
    // IMPORTANT: Be very specific here — forwarded real emails also contain google.com links in the wrapper HTML.
    // Only flag as confirmation if sender is explicitly Google's forwarding noreply address,
    // OR the subject specifically mentions forwarding/confirmation,
    // OR the body contains the distinctive Gmail verification URL pattern.
    const isGmailConfirmation =
      fromLower.includes("forwarding-noreply@google.com") ||
      (subjectLower.includes("gmail forwarding") && subjectLower.includes("confirmation")) ||
      bodyContextLower.includes("google.com/mail/vf-") ||
      (bodyContextLower.includes("confirmation code") && fromLower.includes("google.com"));

    if (isGmailConfirmation) {
      // 1. Code match: 9-digit or 7-10 digit numbers
      const codeMatch = 
        fullTextContext.match(/Confirmation code:\s*(\d+)/i) || 
        fullTextContext.match(/code:\s*(\d+)/i) ||
        fullTextContext.match(/\b(\d{7,10})\b/) ||
        rawHtmlText.match(/\b(\d{7,10})\b/);

      // 2. Link match: https://mail.google.com/mail/vf-... or mail-attachment
      const linkMatch = 
        fullTextContext.match(/(https:\/\/mail\.google\.com\/mail\/vf-[^\s<">]+)/i) ||
        rawHtmlText.match(/(https:\/\/mail\.google\.com\/mail\/vf-[^\s<">]+)/i) ||
        fullTextContext.match(/(https:\/\/[^\s<">]*google[^\s<">]*\/vf-[^\s<">]+)/i) ||
        rawHtmlText.match(/(https:\/\/[^\s<">]*google[^\s<">]*\/vf-[^\s<">]+)/i);

      const confirmCode = codeMatch ? codeMatch[1] : null;
      let confirmLink = linkMatch ? linkMatch[1] : null;

      if (confirmLink) {
        confirmLink = confirmLink.replace(/&amp;/g, "&").replace(/["'>]+$/, "");
      }

      // Store Verification Code and Link in DB so it shows on Website Dashboard
      await prisma.telegramUser.update({
        where: { id: matchedTgUser.id },
        data: {
          gmailVerificationCode: confirmCode,
          gmailVerificationLink: confirmLink,
        },
      });

      let confirmMsg = `🔑 <b>Gmail Auto-Forwarding Confirmation Request Received!</b>\n\nGoogle sent a verification email to complete your Gmail filter setup:\n\n`;

      if (confirmCode) {
        confirmMsg += `<b>Confirmation Code:</b> <code>${confirmCode}</code>\n\n`;
      }
      if (confirmLink) {
        confirmMsg += `🔗 <b>Verification Link:</b>\n<a href="${confirmLink}">Click Here to Approve Gmail Forwarding</a>\n\n`;
      }

      confirmMsg += `Copy this confirmation code into your Gmail Settings or check your ATSLift website dashboard to approve!`;

      await sendTelegramMessage(matchedTgUser.telegramChatId, confirmMsg);
      return NextResponse.json({ ok: true, type: "GMAIL_CONFIRMATION" });
    }

    // Call LLM Extractor with both text & HTML
    const extracted = await extractJdInfoWithLLM(fullTextContext, rawHtmlText);

    const companyName = (extracted && extracted.companyName && extracted.companyName !== "Placement Drive") 
      ? extracted.companyName 
      : (subject ? subject.replace(/^jd\s*/i, "").trim() || "Placement Drive" : "Placement Drive");

    const roleTitle = extracted?.roleTitle || "Software Engineer / Candidate";

    const eligText = typeof extracted?.eligibilityCriteria === "object"
      ? (extracted.eligibilityCriteria?.rawEligibilityText || JSON.stringify(extracted.eligibilityCriteria))
      : (extracted?.eligibilityCriteria || "All Branches");

    const datesText = extracted?.otherImportantDates
      ? JSON.stringify(extracted.otherImportantDates)
      : null;

    // Create JobPosting record in database
    const jobPosting = await prisma.jobPosting.create({
      data: {
        telegramUserId: matchedTgUser.id,
        companyName: companyName,
        roleTitle: roleTitle,
        eligibilityCriteria: eligText,
        applicationDeadline: extracted?.applicationDeadline ? new Date(extracted.applicationDeadline) : null,
        driveDate: extracted?.driveDate ? new Date(extracted.driveDate) : null,
        otherImportantDates: datesText,
        rawEmailText: rawEmailText || fullTextContext,
      },
    });

    // Schedule Reminders via QStash if deadline is present
    if (jobPosting.applicationDeadline) {
      try {
        await scheduleQStashReminder(jobPosting.id, jobPosting.applicationDeadline);
      } catch (err) {
        console.error("Failed to schedule QStash reminders:", err);
      }
    }

    // Format & Send Rich Telegram Alert Notification
    const deadlineFormatted = formatDateDDMMYYYY(jobPosting.applicationDeadline);

    let tgMsg = `🎯 <b>New Placement Drive Detected!</b>\n\n`;
    tgMsg += `🏢 <b>Company:</b> ${escapeHtml(jobPosting.companyName)}\n`;
    tgMsg += `💼 <b>Role:</b> ${escapeHtml(jobPosting.roleTitle)}\n`;
    tgMsg += `🎓 <b>Eligibility Criteria:</b> ${escapeHtml(jobPosting.eligibilityCriteria)}\n`;
    tgMsg += `⏰ <b>Application Deadline:</b> <b>${deadlineFormatted}</b>\n\n`;
    tgMsg += `<i>Automatic reminders will be sent 3 days before, 1 day before, and on the morning of the deadline.</i>`;

    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: "✅ Applied", callback_data: `applied:${jobPosting.id}` },
          { text: "❌ Not Eligible", callback_data: `not_eligible:${jobPosting.id}` },
          { text: "⏭️ Skip", callback_data: `skip:${jobPosting.id}` },
        ],
      ],
    };

    await sendTelegramMessage(matchedTgUser.telegramChatId, tgMsg, inlineKeyboard);

    return NextResponse.json({
      ok: true,
      jobPostingId: jobPosting.id,
    });
  } catch (error) {
    console.error("Error in /api/resend/inbound:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
