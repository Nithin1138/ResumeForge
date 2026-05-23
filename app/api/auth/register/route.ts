import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If user exists but has no password (e.g. they signed up with Google/Magic Link before)
      if (!existingUser.password) {
         // We can allow them to set a password by updating the user. 
         // But for a simple flow, we might just say email in use.
         // Let's just update them with the password to allow them to add credentials.
         const hashedPassword = await bcrypt.hash(password, 10);
         await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
         });
         return NextResponse.json(
          { message: "Password added to existing account", userId: existingUser.id },
          { status: 201 }
        );
      }
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: "User registered successfully", userId: newUser.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
