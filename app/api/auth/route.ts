import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required for authentication." }, { status: 400 });
    }

    // Find or register new candidate profile
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split("@")[0],
        },
      });
      console.log(`[Auth] Registered new user profile: ${email}`);
    }

    const sessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
    };

    const response = NextResponse.json({ success: true, user: sessionPayload });

    // Set standard session cookie (30 days validation)
    response.cookies.set("rf_session", JSON.stringify(sessionPayload), {
      httpOnly: false, // Exposed to client helpers
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("API /api/auth POST error:", error);
    return NextResponse.json({ error: "Authentication transaction failed." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const response = NextResponse.json({ success: true, message: "Logged out successfully." });
    response.cookies.delete("rf_session");
    return response;
  } catch (error) {
    return NextResponse.json({ error: "Logout failed." }, { status: 500 });
  }
}
