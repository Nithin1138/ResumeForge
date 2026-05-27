import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, eventType, page, metadata } = body;

    if (!sessionId || !eventType || !page) {
      return NextResponse.json({ error: "Missing required tracking parameters" }, { status: 400 });
    }

    const event = await prisma.analyticsEvent.create({
      data: {
        sessionId,
        eventType,
        page,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });

    // Smart Trigger: If eventType is 'PAYWALL_EXIT' or 'FORM_ABANDON', 
    // we can automatically flag checking logs or risk models, or queue notification events.
    if (eventType === "PAYWALL_EXIT" || eventType === "FORM_ABANDON") {
      // Trigger a light-weight operational alert for checkout abandonment analytics
      try {
        await prisma.systemQueue.create({
          data: {
            jobType: "ABANDONED_ALERT",
            status: "QUEUED",
            latencyMs: 0
          }
        });
      } catch (queueErr) {
        console.error("Failed to queue abandonment alert:", queueErr);
      }
    }

    return NextResponse.json({ success: true, eventId: event.id });
  } catch (error: any) {
    console.error("Failed to log telemetry event:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
