import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { createHash } from "crypto";
import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "lib", "adminConfig.json");
const SECRET_KEY = process.env.NEXTAUTH_SECRET || "admin-secret-key-for-atslift-dashboard";

// Hashing helper
const hashPassword = (password: string) => {
  return createHash("sha256").update(password).digest("hex");
};

// Config IO helpers (Async using DB)
const getAdminConfig = async () => {
  try {
    const config = await prisma.adminConfig.findUnique({
      where: { id: "admin" }
    });
    
    if (config) {
      return config;
    }
  } catch (err) {
    console.error("Error reading admin config from DB", err);
  }
  
  // Safe defaults (nithin123 hashed)
  return {
    username: "Nithin",
    passwordHash: "80f86da84da5b0e35545fcec0a5d8c786b075f3bea545aa6bd090f097392b8ed",
  };
};

const saveAdminConfig = async (config: any) => {
  try {
    await prisma.adminConfig.upsert({
      where: { id: "admin" },
      update: {
        username: config.username,
        passwordHash: config.passwordHash,
      },
      create: {
        id: "admin",
        username: config.username,
        passwordHash: config.passwordHash,
      }
    });
    return true;
  } catch (err) {
    console.error("Error writing admin config to DB", err);
    return false;
  }
};

// Token session generator
const generateSessionToken = (username: string, passwordHash: string) => {
  return createHash("sha256")
    .update(`${username}-${passwordHash}-${SECRET_KEY}`)
    .digest("hex");
};

// Session verifier
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

// ── GET HANDLER: Fetch operation statistics ──
export async function GET(req: NextRequest) {
  const isAuthorized = await verifySession();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Core aggregates
    const totalUsers = await prisma.user.count();
    const totalResumes = await prisma.resume.count();
    const waitlistCount = await prisma.waitlistEmail.count();
    const waitlistList = await prisma.waitlistEmail.findMany({
      orderBy: { createdAt: "desc" }
    });

    // Fetch all PAID resumes to calculate revenue and trends
    const paidResumes = await prisma.resume.findMany({
      where: { paymentStatus: "PAID" },
      select: {
        amountPaid: true,
        createdAt: true,
      },
    });

    const totalPaidResumes = paidResumes.length;
    const totalRevenue = paidResumes.reduce(
      (sum, r) => sum + (r.amountPaid ? r.amountPaid / 100 : 49),
      0
    );

    // 2. Metrics calculation
    const razorpayFees = totalRevenue * 0.0236; // 2% + 18% GST = 2.36% standard
    const apiCost = totalResumes * 0.50; // Average ₹0.50 per generation
    const netProfit = totalRevenue - razorpayFees - apiCost;

    // 3. User lists
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        isBlocked: true,
        resumes: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const usersList = users.map((u) => ({
      id: u.id,
      name: u.name || "Anonymous User",
      email: u.email || "No Email",
      createdAt: u.createdAt,
      resumeCount: u.resumes.length,
      isBlocked: u.isBlocked,
    }));

    // 4. Resume student metadata analytics
    const resumesMetadata = await prisma.resume.findMany({
      select: {
        cgpa: true,
        branch: true,
        targetRole: true,
        college: true,
      }
    });

    const cgpas = resumesMetadata
      .map(r => parseFloat(r.cgpa || ""))
      .filter(n => !isNaN(n) && n > 0 && n <= 10);
    const avgCgpa = cgpas.length > 0 ? (cgpas.reduce((sum, n) => sum + n, 0) / cgpas.length).toFixed(2) : "0.00";

    const getTopFrequency = (arr: (string | null)[]) => {
      const filtered = arr.filter(Boolean) as string[];
      if (filtered.length === 0) return "N/A";
      const counts: Record<string, number> = {};
      filtered.forEach(val => {
        const key = val.trim();
        counts[key] = (counts[key] || 0) + 1;
      });
      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    };

    const topBranch = getTopFrequency(resumesMetadata.map(r => r.branch));
    const topCollege = getTopFrequency(resumesMetadata.map(r => r.college));
    const topTargetRole = getTopFrequency(resumesMetadata.map(r => r.targetRole));

    // 5. Active users count (unique sessions in past 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activeSessions = await prisma.resume.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        sessionId: true,
        userId: true,
      },
    });
    
    const uniqueActiveUserIds = new Set(
      activeSessions.map((s) => s.userId || s.sessionId).filter(Boolean)
    );
    const activeUsersCount = uniqueActiveUserIds.size;

    // 6. Past week financial breakdown
    const pastWeekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      return d;
    }).reverse();

    const weeklyTrend = pastWeekDays.map((day) => {
      const dayStart = day;
      const dayEnd = new Date(day);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayPayments = paidResumes.filter((r) => {
        const date = new Date(r.createdAt);
        return date >= dayStart && date < dayEnd;
      });

      const dayResumesCount = dayPayments.length;
      const dayRevenue = dayPayments.reduce(
        (sum, r) => sum + (r.amountPaid ? r.amountPaid / 100 : 49),
        0
      );
      const dayRazorpayFees = dayRevenue * 0.0236;
      const dayApiCost = dayResumesCount * 0.50;
      const dayProfit = dayRevenue - dayRazorpayFees - dayApiCost;

      return {
        date: day.toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
        revenue: Math.round(dayRevenue),
        profit: Math.round(dayProfit),
        paidCount: dayResumesCount,
      };
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalResumesBuilt: totalResumes,
        totalPaidResumes,
        totalRevenue: Math.round(totalRevenue),
        razorpayFees: Math.round(razorpayFees),
        apiCost: Math.round(apiCost),
        netProfit: Math.round(netProfit),
        activeUsers: activeUsersCount || Math.max(totalUsers, 1),
        waitlistCount,
        avgCgpa,
        topBranch,
        topCollege,
        topTargetRole,
        nodeVersion: process.version,
      },
      users: usersList,
      waitlist: waitlistList,
      weeklyTrend,
    });
  } catch (err: any) {
    console.error("Failed to query stats", err);
    return NextResponse.json(
      { error: "Database query failed: " + err.message },
      { status: 500 }
    );
  }
}

// ── POST HANDLER: Authentication & Password Update ──
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    const config = await getAdminConfig();

    // ACTION: LOGIN
    if (action === "login") {
      const { username, password } = body;
      
      if (!username || !password) {
        return NextResponse.json({ error: "Credentials required" }, { status: 400 });
      }

      const inputHash = hashPassword(password);
      
      if (
        username.toLowerCase() === config.username.toLowerCase() &&
        inputHash === config.passwordHash
      ) {
        // Set secure cookie session
        const sessionToken = generateSessionToken(config.username, config.passwordHash);
        const cookieStore = await cookies();
        
        cookieStore.set("admin_session", sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24, // 1 day session
          path: "/",
          sameSite: "lax",
        });

        return NextResponse.json({ success: true, username: config.username });
      }

      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    // ACTION: LOGOUT
    if (action === "logout") {
      const cookieStore = await cookies();
      cookieStore.delete("admin_session");
      return NextResponse.json({ success: true });
    }

    // ACTION: CHANGE PASSWORD
    if (action === "changePassword") {
      const isAuthorized = await verifySession();
      if (!isAuthorized) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { currentPassword, newPassword } = body;
      if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: "Both fields required" }, { status: 400 });
      }

      const currentHash = hashPassword(currentPassword);
      if (currentHash !== config.passwordHash) {
        return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
      }

      // Update config credentials
      config.passwordHash = hashPassword(newPassword);
      const isSaved = await saveAdminConfig(config);

      if (!isSaved) {
        return NextResponse.json({ error: "Failed to write updates" }, { status: 500 });
      }

      // Re-sign session cookie to ensure stability
      const newSessionToken = generateSessionToken(config.username, config.passwordHash);
      const cookieStore = await cookies();
      cookieStore.set("admin_session", newSessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24,
        path: "/",
        sameSite: "lax",
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
