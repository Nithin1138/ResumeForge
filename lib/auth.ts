import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export interface UserSession {
  userId: string;
  email: string;
  name?: string;
}

// Retrieves the authenticated user from session cookies (Server-only context)
export async function getSessionUser(req: NextRequest): Promise<UserSession | null> {
  try {
    const sessionCookie = req.cookies.get("rf_session")?.value;
    if (!sessionCookie) return null;

    const parsed = JSON.parse(sessionCookie);
    if (!parsed.userId || !parsed.email) return null;

    // Verify user exists in local database
    const user = await prisma.user.findUnique({
      where: { id: parsed.userId },
    });

    if (!user) return null;

    return {
      userId: user.id,
      email: user.email,
      name: user.name || undefined,
    };
  } catch (error) {
    return null;
  }
}
