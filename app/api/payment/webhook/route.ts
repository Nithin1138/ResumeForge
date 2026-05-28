import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendResumeEmail } from "@/lib/resend";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Standard webhook signature validation in production
    if (secret && signature && secret !== "mock" && secret !== "xxx") {
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(bodyText)
        .digest("hex");

      if (expectedSignature !== signature) {
        console.warn("Invalid Razorpay webhook signature detected.");
        return NextResponse.json({ error: "Signature verification failed." }, { status: 400 });
      }
    }

    let payload;
    try {
      payload = JSON.parse(bodyText);
    } catch (err) {
      return NextResponse.json({ error: "Invalid JSON body payload." }, { status: 400 });
    }

    const event = payload.event;

    // Process completed checkout link payments
    if (event === "payment_link.paid") {
      const paymentLinkEntity = payload.payload?.payment_link?.entity;
      const paymentEntity = payload.payload?.payment?.entity;
      
      const resumeId = paymentLinkEntity?.notes?.resumeId;
      const paymentId = paymentEntity?.id;
      const amountPaid = paymentLinkEntity?.amount_paid || 4900; // in paise

      console.log(`[Webhook] Processing payment_link.paid: resumeId=${resumeId}, paymentId=${paymentId}`);

      if (resumeId) {
        const updatedResume = await prisma.resume.update({
          where: { id: resumeId },
          data: {
            paymentStatus: "PAID",
            paymentId: paymentId || `pay_web_${Math.random().toString(36).substr(2, 9)}`,
            status: "PAID",
            amountPaid: amountPaid,
          },
        });
        console.log(`[Webhook] ✓ Resume ${resumeId} updated to PAID. Payment Status: ${updatedResume.paymentStatus}`);

        // Log successful checkout unlock analytics event via webhook
        try {
          await prisma.analyticsEvent.create({
            data: {
              sessionId: updatedResume.sessionId,
              eventType: "PAYWALL_UNLOCK",
              page: `result_${resumeId}`,
              metadata: JSON.stringify({ resumeId, amountPaid: updatedResume.amountPaid, source: "webhook" })
            }
          });
        } catch (e) {
          console.error("Failed to log webhook paywall unlock event:", e);
        }

        // Verify the update immediately
        const verified = await prisma.resume.findUnique({
          where: { id: resumeId }
        });
        console.log(`[Webhook] ✓ Verification: Resume ${resumeId} paymentStatus in DB = ${verified?.paymentStatus}`);

        // Safely trigger background transactional email delivery
        try {
          const inputData = JSON.parse(updatedResume.inputData);
          const outputFull = JSON.parse(updatedResume.outputFull || "{}");
          
          const customerName = inputData.personal?.fullName || "Placement Student";
          const toEmail = inputData.personal?.email;

          if (toEmail) {
            const plainTextResume = `
${inputData.personal.fullName.toUpperCase()}
Email: ${inputData.personal.email}${inputData.personal.phone ? ` | Phone: ${inputData.personal.phone}` : ""}${inputData.personal.linkedin ? ` | LinkedIn: ${inputData.personal.linkedin}` : ""}${inputData.personal.github ? ` | GitHub: ${inputData.personal.github}` : ""}
Target: ${inputData.personal.targetRole} ${inputData.personal.branch ? `(${inputData.personal.branch})` : ""}
Education: ${outputFull.pgEducation || inputData.personal.hasPG ? `[PG] ${outputFull.pgEducation?.degree || `${inputData.personal.pgDegreeName} in ${inputData.personal.pgBranch}`} - ${outputFull.pgEducation?.institution || inputData.personal.pgCollegeName} (${outputFull.pgEducation?.year || inputData.personal.pgGraduationYear}) | CGPA: ${outputFull.pgEducation?.cgpa || `${inputData.personal.pgCgpa}/10.0`} ; ` : ""}[UG] ${outputFull.education?.degree} - ${outputFull.education?.institution} (${outputFull.education?.year}) | CGPA: ${outputFull.education?.cgpa}

PROFESSIONAL SUMMARY
${outputFull.summary}

TECHNICAL SKILLS
- Languages: ${(outputFull.skills?.languages || []).join(", ")}
- Frameworks & Libraries: ${(outputFull.skills?.frameworks || []).join(", ")}
- Tools & Platforms: ${(outputFull.skills?.tools || []).join(", ")}
- Databases: ${(outputFull.skills?.databases || []).join(", ")}
- Core Concepts: ${(outputFull.skills?.concepts || []).join(", ")}
${outputFull.skills?.softSkills && outputFull.skills.softSkills.length > 0 ? `- Soft Skills: ${outputFull.skills.softSkills.join(", ")}\n` : ""}

PROJECTS
${(outputFull.projects || []).map((proj: any) => `
${proj.title} (${proj.techStack})
${proj.duration ? `Duration: ${proj.duration}\n` : ""}${proj.bullets.map((b: string) => `- ${b}`).join("\n")}
`).join("\n")}
            `.trim();

            sendResumeEmail(toEmail, customerName, resumeId, plainTextResume)
              .then(sent => console.log(`[Webhook] Email trigger: ${sent ? 'Sent successfully' : 'Skipped'}`))
              .catch(err => console.error("[Webhook] Background email delivery failure:", err));
          }
        } catch (emailErr) {
          console.error("[Webhook] Background candidate resolution failed:", emailErr);
        }
      }
    }

    return NextResponse.json({ status: "success", received: true });
  } catch (error) {
    console.error("API /api/payment/webhook POST error:", error);
    return NextResponse.json({ error: "Webhook notification processing failed." }, { status: 500 });
  }
}
