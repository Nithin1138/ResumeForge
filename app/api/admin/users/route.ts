import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { createHash } from "crypto";
import bcrypt from "bcryptjs";

const SECRET_KEY = process.env.NEXTAUTH_SECRET || "admin-secret-key-for-atslift-dashboard";

const getAdminConfig = async () => {
  try {
    const config = await prisma.adminConfig.findUnique({
      where: { id: "admin" }
    });
    if (config) return config;
  } catch (err) {}
  return {
    username: "Nithin",
    passwordHash: "80f86da84da5b0e35545fcec0a5d8c786b075f3bea545aa6bd090f097392b8ed",
  };
};

const generateSessionToken = (username: string, passwordHash: string) => {
  return createHash("sha256")
    .update(`${username}-${passwordHash}-${SECRET_KEY}`)
    .digest("hex");
};

const verifySession = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token) return false;

    const config = await getAdminConfig();
    const expectedToken = generateSessionToken(config.username, config.passwordHash);
    return token === expectedToken;
  } catch (err) {
    return false;
  }
};

export async function POST(req: NextRequest) {
  const isAuthorized = await verifySession();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: new Date(), // Automatically verify admin-created accounts
      },
    });

    return NextResponse.json({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const isAuthorized = await verifySession();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { userId, isBlocked } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isBlocked },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const isAuthorized = await verifySession();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Delete user resumes first to avoid foreign key constraint error
    await prisma.resume.deleteMany({
      where: { userId },
    });

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
