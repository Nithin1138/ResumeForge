import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { createTransport } from "nodemailer";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "resumeforge_fallback_secret_2024_for_testing_12345",
  adapter: {
    ...PrismaAdapter(prisma),
    async useVerificationToken({ identifier, token }) {
      try {
        // Use findFirst instead of findUnique with compound key to bypass adapter-pg bug
        const verificationToken = await prisma.verificationToken.findFirst({
          where: { identifier, token },
        });
        if (verificationToken) {
          // Disable token deletion to prevent email client prefetching (e.g. Gmail/Outlook) 
          // from consuming the token before the user actually clicks the link.
          // The token will still naturally expire based on its 'expires' field.
          /*
          await prisma.verificationToken.deleteMany({
            where: { identifier, token },
          });
          */
          return verificationToken;
        }
        return null;
      } catch (error) {
        console.error("Verification Token Error:", error);
        return null;
      }
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        
        if (!user) {
          throw new Error("No account found, please sign up");
        }
        
        if (!user.password) {
          throw new Error("Please sign in with Google or Magic Link");
        }

        if (!user.emailVerified) {
          throw new Error("Please verify your email first. Use the sign up flow or magic link to receive an activation email.");
        }
        
        const isValid = await bcrypt.compare(credentials.password, user.password);
        
        if (!isValid) {
          throw new Error("Invalid email or password");
        }
        
        return user;
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "mock-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-client-secret",
    }),
    EmailProvider({
      server: "", // Not used since we're overriding sendVerificationRequest
      from: process.env.FROM_EMAIL || "ATSLift <noreply@atslift.in>",
      sendVerificationRequest: async ({ identifier, url, provider }) => {

        const emailHtml = `
          <div style="font-family: 'Satoshi', sans-serif; background-color: #f7f6f2; color: #28251d; padding: 40px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #d4d1ca;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="font-family: 'Instrument Serif', Georgia, serif; font-size: 28px; margin: 0; color: #01696f;">ATSLift</h2>
              <p style="font-size: 12px; color: #7a7974; margin: 5px 0 0 0;">ATS Resume Builder for Engineering Students</p>
            </div>
            
            <div style="background-color: #f9f8f5; border: 1px solid #d4d1ca; padding: 25px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
              <h3 style="font-size: 18px; margin: 0 0 10px 0; color: #01696f;">Activate Your Account</h3>
              <p style="font-size: 14px; line-height: 1.6; color: #28251d; margin: 0 0 20px 0;">
                Click the button below to activate your account and access your ATSLift dashboard. This link expires in 24 hours.
              </p>
              
              <div style="text-align: center; margin-bottom: 10px;">
                <a href="${url}" style="background-color: #01696f; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; padding: 12px 25px; border-radius: 9999px; display: inline-block; box-shadow: 0 4px 6px rgba(1, 105, 111, 0.1);">
                  Activate Account
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
              subject: `Activate your ATSLift Account`,
              html: emailHtml,
            });
            return;
          }

          // Resend Fallback
          const resendApiKey = process.env.RESEND_API_KEY;
          if (!resendApiKey || resendApiKey === "mock") {
            console.log(`\n[Auth Simulation] To: ${identifier}\nSubject: Activate your ATSLift Account\nLogin URL: ${url}\n`);
            return;
          }

          const resend = new Resend(resendApiKey);

          await resend.emails.send({
            from: provider.from,
            to: identifier,
            subject: `Activate your ATSLift Account`,
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
    async signIn({ user, account, profile, email, credentials }) {
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: user.email }});
        if (dbUser?.isBlocked) {
          throw new Error("Your account has been suspended by the administrator.");
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        // Expose the internal user ID so our dashboard components can query Prisma properly
        Object.assign(session.user, { id: token.sub });
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
