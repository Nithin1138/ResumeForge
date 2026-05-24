import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { message: "All fields (email, OTP, new password) are required." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const identifier = `${trimmedEmail}:otp`;

    // Fetch the verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier,
        token: otp,
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { message: "Invalid OTP code. Please check and try again." },
        { status: 400 }
      );
    }

    // Verify expiration time
    if (verificationToken.expires < new Date()) {
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier,
            token: otp,
          },
        },
      });

      return NextResponse.json(
        { message: "OTP code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Clean up used token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier,
          token: otp,
        },
      },
    });

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    await prisma.user.update({
      where: { email: trimmedEmail },
      data: { password: hashedPassword },
    });

    return NextResponse.json(
      { message: "Password updated successfully. You can now log in." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset update error:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred during password reset." },
      { status: 500 }
    );
  }
}
