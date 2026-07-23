import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, otp, password } = await req.json();

    if (!email || !otp || !password) {
      return NextResponse.json(
        { message: "Email, 6-digit verification code, and password are required." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Account already exists, please login." },
        { status: 409 }
      );
    }

    // Find valid verification token
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier: {
          startsWith: `${trimmedEmail}:signup-otp:`,
        },
        token: cleanOtp,
      },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { message: "Invalid verification code. Please check your email and try again." },
        { status: 400 }
      );
    }

    if (tokenRecord.expires < new Date()) {
      await prisma.verificationToken.deleteMany({
        where: { identifier: tokenRecord.identifier },
      });
      return NextResponse.json(
        { message: "Verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Extract password hash from token identifier or re-hash password
    const identifierParts = tokenRecord.identifier.split(":signup-otp:");
    let hashedPassword = identifierParts[1];

    if (!hashedPassword) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Create the verified User
    const newUser = await prisma.user.create({
      data: {
        email: trimmedEmail,
        password: hashedPassword,
        emailVerified: new Date(),
      },
    });

    // Delete used token
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: {
          startsWith: `${trimmedEmail}:signup-otp:`,
        },
      },
    });

    return NextResponse.json(
      { message: "Account created successfully!", userId: newUser.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An error occurred during account creation. Please try again." },
      { status: 500 }
    );
  }
}
