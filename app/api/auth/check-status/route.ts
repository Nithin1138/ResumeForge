import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ verified: false });
    }

    const user = await prisma.user.findFirst({
      where: { 
        email: {
          equals: email,
          mode: 'insensitive' // Ensure case-insensitive match
        }
      },
      select: { emailVerified: true },
    });

    return NextResponse.json({ verified: !!user?.emailVerified });
  } catch (error) {
    console.error("Check status error:", error);
    return NextResponse.json({ verified: false });
  }
}
