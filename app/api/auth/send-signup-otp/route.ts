import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/resend";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const hasMinLen = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumOrSpecial = /[\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasMinLen || !hasUpper || !hasLower || !hasNumOrSpecial) {
      return NextResponse.json(
        { message: "Please enter a strong password (at least 8 characters with uppercase, lowercase, and numbers or symbols)." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Account already exists, please login" },
        { status: 409 }
      );
    }

    // Hash password for temporary token storage
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const identifier = `${trimmedEmail}:signup-otp:${hashedPassword}`;
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any old pending signup tokens for this email
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: {
          startsWith: `${trimmedEmail}:signup-otp:`,
        },
      },
    });

    // Create the verification token in DB
    await prisma.verificationToken.create({
      data: {
        identifier,
        token: otp,
        expires,
      },
    });

    // Send 6-digit OTP email
    const emailSent = await sendOtpEmail(trimmedEmail, otp, "signup");
    if (!emailSent) {
      return NextResponse.json(
        { message: "Failed to send 6-digit code. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: "Verification code sent to your email.",
        otp: process.env.NODE_ENV !== "production" ? otp : undefined
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send signup OTP error:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
