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

  const emailSubject = "Your ATS Resume Content is Ready — ATSLift";
  const emailHtml = `
    <div style="font-family: 'Satoshi', sans-serif; background-color: #f7f6f2; color: #28251d; padding: 40px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #d4d1ca;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="font-family: 'Instrument Serif', Georgia, serif; font-size: 28px; margin: 0; color: #01696f;">ATSLift</h2>
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
        <p style="margin: 0;">ATSLift — Built by engineering students for engineering students.</p>
        <p style="margin: 5px 0 0 0;">Secure checkout powered by Razorpay. Need help? Reply to this email.</p>
      </div>
    </div>
  `;

  const emailText = `Hi ${customerName},\n\nYour resume content is ready. Access it directly here: ${successUrl}\n\nPlain-Text Content:\n\n${plainTextResume}`;
  const fromEmail = process.env.FROM_EMAIL || "ATSLift <noreply@atslift.in>";

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

export async function sendOtpEmail(toEmail: string, otp: string): Promise<boolean> {
  const emailSubject = "Your Password Reset OTP — ATSLift";
  const emailHtml = `
    <div style="font-family: 'Satoshi', sans-serif; background-color: #f7f6f2; color: #28251d; padding: 40px; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid #d4d1ca;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="font-family: 'Instrument Serif', Georgia, serif; font-size: 28px; margin: 0; color: #01696f;">ATSLift</h2>
        <p style="font-size: 12px; color: #7a7974; margin: 5px 0 0 0;">ATS Resume Builder for Engineering Students</p>
      </div>
      
      <div style="background-color: #f9f8f5; border: 1px solid #d4d1ca; padding: 25px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
        <h3 style="font-size: 18px; margin: 0 0 10px 0; color: #28251d;">Reset Your Password</h3>
        <p style="font-size: 14px; line-height: 1.6; color: #7a7974; margin: 0 0 20px 0;">
          Use the OTP code below to verify your email and set a new password. This code will expire in 10 minutes.
        </p>
        
        <div style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #01696f; background-color: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #d4d1ca; display: inline-block; margin-bottom: 10px;">
          ${otp}
        </div>
      </div>
      
      <div style="text-align: center; border-top: 1px solid #d4d1ca; padding-top: 20px; font-size: 11px; color: #7a7974;">
        <p style="margin: 0;">If you did not request this, you can safely ignore this email.</p>
        <p style="margin: 5px 0 0 0;">ATSLift — Built by engineering students for engineering students.</p>
      </div>
    </div>
  `;
  const emailText = `Reset Your Password\n\nUse the OTP code below to verify your email and set a new password. This code will expire in 10 minutes.\n\nOTP Code: ${otp}`;
  const fromEmail = process.env.FROM_EMAIL || "ATSLift <noreply@atslift.in>";

  try {
    // Check if SMTP is configured
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
      console.log(`[Email Simulation - OTP] To: ${toEmail}\nSubject: ${emailSubject}\nOTP: ${otp}`);
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
    console.error("Failed to send OTP email:", error);
    return false;
  }
}

export async function sendBroadcastEmail(
  toEmail: string,
  subject: string,
  htmlBody: string
): Promise<boolean> {
  const fromEmail = process.env.FROM_EMAIL || "ATSLift <noreply@atslift.in>";
  const plainText = htmlBody.replace(/<[^>]*>/g, ""); // basic HTML tag strip
  
  try {
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
        subject,
        html: htmlBody,
        text: plainText,
      });
      return true;
    }

    const resend = getResendClient();
    if (!resend) {
      console.log(`[Email Simulation - Broadcast] To: ${toEmail}\nSubject: ${subject}\nBody: ${plainText.substring(0, 100)}...`);
      return true;
    }

    const result = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject,
      html: htmlBody,
      text: plainText,
    });

    return !!result.data?.id;
  } catch (error) {
    console.error("Failed to send broadcast email:", error);
    return false;
  }
}


