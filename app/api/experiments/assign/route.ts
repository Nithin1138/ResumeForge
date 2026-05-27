import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, experimentName } = body;

    if (!sessionId || !experimentName) {
      return NextResponse.json({ error: "Session and experiment identifiers required" }, { status: 400 });
    }

    // Check if assignment already exists
    let assignment = await prisma.experimentAssignment.findUnique({
      where: {
        sessionId_experimentName: {
          sessionId,
          experimentName
        }
      }
    });

    if (!assignment) {
      // Deterministically assign variant: 50/50 split based on char code of session ID
      const charSum = sessionId.split("").reduce((sum: number, char: string) => sum + char.charCodeAt(0), 0);
      const variant = charSum % 2 === 0 ? "dashboard" : "minimal";

      assignment = await prisma.experimentAssignment.create({
        data: {
          sessionId,
          experimentName,
          variant,
          converted: false
        }
      });
    }

    return NextResponse.json({ success: true, variant: assignment.variant });
  } catch (error: any) {
    console.error("Experiment assignment failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
