import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { createTransport } from "nodemailer";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "mock-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-client-secret",
    }),
    EmailProvider({
      server: "", // Not used since we're overriding sendVerificationRequest
      from: process.env.FROM_EMAIL || "ResumeForge <noreply@resumeforge.in>",
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        const { host } = new URL(url);

        const emailHtml = `
          <div style="font-family: 'Satoshi', sans-serif; background-color: #f7f6f2; color: #28251d; padding: 40px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #d4d1ca;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="font-family: 'Instrument Serif', Georgia, serif; font-size: 28px; margin: 0; color: #01696f;">ResumeForge</h2>
              <p style="font-size: 12px; color: #7a7974; margin: 5px 0 0 0;">ATS Resume Builder for Engineering Students</p>
            </div>
            
            <div style="background-color: #f9f8f5; border: 1px solid #d4d1ca; padding: 25px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
              <h3 style="font-size: 18px; margin: 0 0 10px 0;">Sign In Request</h3>
              <p style="font-size: 14px; line-height: 1.6; color: #28251d; margin: 0 0 20px 0;">
                Click the button below to sign in to your ResumeForge dashboard. This link expires in 24 hours.
              </p>
              
              <div style="text-align: center; margin-bottom: 10px;">
                <a href="${url}" style="background-color: #01696f; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; padding: 12px 25px; border-radius: 9999px; display: inline-block; box-shadow: 0 4px 6px rgba(1, 105, 111, 0.1);">
                  Sign In to ResumeForge
                </a>
              </div>
              
              <p style="font-size: 12px; color: #7a7974; margin-top: 20px;">
                If you did not request this email, you can safely ignore it.
              </p>
            </div>
          </div>
        `;

        try {
          // SMTP Mode (Gmail/Free SMTP)
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
              from: provider.from,
              to: identifier,
              subject: `Sign in to ${host}`,
              html: emailHtml,
            });
            return;
          }

          // Resend Fallback
          const resendApiKey = process.env.RESEND_API_KEY;
          if (!resendApiKey || resendApiKey === "mock") {
            console.log(`\n[Auth Simulation] To: ${identifier}\nSubject: Sign in to ${host}\nLogin URL: ${url}\n`);
            return;
          }

          const { Resend } = require("resend");
          const resend = new Resend(resendApiKey);

          await resend.emails.send({
            from: provider.from,
            to: identifier,
            subject: `Sign in to ${host}`,
            html: emailHtml,
          });
        } catch (error) {
          console.error("Failed to send verification email:", error);
          throw new Error("Failed to send verification email.");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        // Expose the internal user ID so our dashboard components can query Prisma properly
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Redirect errors back to login page
    verifyRequest: "/login?verifyRequest=true",
  },
};
