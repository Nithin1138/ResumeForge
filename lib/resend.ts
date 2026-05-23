import { Resend } from "resend";
import { createTransport } from "nodemailer";

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "mock" || apiKey === "re_xxx") {
    console.warn("RESEND_API_KEY not configured or set to mock. Using email simulation logger.");
    return null;
  }
  return new Resend(apiKey);
};

export async function sendResumeEmail(
  toEmail: string,
  customerName: string,
  resumeId: string,
  plainTextResume: string
): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const successUrl = `${appUrl}/success/${resumeId}?sandbox=true`;

  const emailSubject = "Your ATS Resume Content is Ready — ResumeForge";
  const emailHtml = `
    <div style="font-family: 'Satoshi', sans-serif; background-color: #f7f6f2; color: #28251d; padding: 40px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #d4d1ca;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="font-family: 'Instrument Serif', Georgia, serif; font-size: 28px; margin: 0; color: #01696f;">ResumeForge</h2>
        <p style="font-size: 12px; color: #7a7974; margin: 5px 0 0 0;">ATS Resume Builder for Engineering Students</p>
      </div>
      
      <div style="background-color: #f9f8f5; border: 1px solid #d4d1ca; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="font-size: 18px; margin: 0 0 10px 0;">Hi ${customerName},</h3>
        <p style="font-size: 14px; line-height: 1.6; color: #28251d; margin: 0 0 20px 0;">
          Congratulations! Your payment has been confirmed, and your full ATS-optimized resume content is completely unlocked and ready to use.
        </p>
        
        <div style="text-align: center; margin-bottom: 10px;">
          <a href="${successUrl}" style="background-color: #01696f; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; padding: 12px 25px; border-radius: 9999px; display: inline-block; box-shadow: 0 4px 6px rgba(1, 105, 111, 0.1);">
            View & Copy Your Resume →
          </a>
        </div>
      </div>
      
      <div style="margin-bottom: 25px;">
        <h4 style="font-size: 12px; color: #7a7974; text-transform: uppercase; letter-spacing: 1px; border-b: 1px solid #d4d1ca; padding-bottom: 5px; margin-bottom: 15px;">Plain-Text Content Preview</h4>
        <pre style="background-color: #ffffff; border: 1px solid #d4d1ca; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 10px; overflow-x: auto; white-space: pre-wrap; line-height: 1.5; color: #28251d;">
${plainTextResume}
        </pre>
      </div>

      <div style="text-align: center; border-top: 1px solid #d4d1ca; padding-top: 20px; font-size: 11px; color: #7a7974;">
        <p style="margin: 0;">ResumeForge — Built by engineering students for engineering students.</p>
        <p style="margin: 5px 0 0 0;">Secure checkout powered by Razorpay. Need help? Reply to this email.</p>
      </div>
    </div>
  `;

  const emailText = `Hi ${customerName},\n\nYour resume content is ready. Access it directly here: ${successUrl}\n\nPlain-Text Content:\n\n${plainTextResume}`;
  const fromEmail = process.env.FROM_EMAIL || "ResumeForge <noreply@resumeforge.in>";

  try {
    // Check if SMTP is configured (Gmail/Free SMTP)
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASSWORD;

    if (smtpHost && smtpUser && smtpPass) {
      const transport = createTransport({
        host: smtpHost,
        port: Number(smtpPort) || 465,
        secure: Number(smtpPort) === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transport.sendMail({
        from: fromEmail,
        to: toEmail,
        subject: emailSubject,
        html: emailHtml,
        text: emailText,
      });
      return true;
    }

    // Fallback to Resend Client
    const resend = getResendClient();
    if (!resend) {
      console.log(`[Email Simulation] To: ${toEmail}\nSubject: ${emailSubject}\nUnlocked View URL: ${successUrl}\n--- Content ---\n${plainTextResume.substring(0, 300)}...\n--- End ---`);
      return true;
    }

    const result = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
    });

    return !!result.data?.id;
  } catch (error) {
    console.error("Failed to send transactional resume email:", error);
    return false;
  }
}
