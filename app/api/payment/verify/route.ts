import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";

const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

export async function POST(req: NextRequest) {
  try {
    const { paymentId, resumeId } = await req.json();

    if (!paymentId || !resumeId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 });
    }

    // Fetch the payment from Razorpay directly to verify it is real and paid
    const payment = await razorpay.payments.fetch(paymentId);

    if (payment && payment.status === "captured") {
      // Mark as paid in our database manually (fallback for missing webhooks)
      const updatedResume = await prisma.resume.update({
        where: { id: resumeId },
        data: {
          paymentStatus: "PAID",
          amountPaid: typeof payment.amount === 'number' ? payment.amount : 4900,
        }
      });

      // Log successful checkout unlock analytics event
      try {
        await prisma.analyticsEvent.create({
          data: {
            sessionId: updatedResume.sessionId,
            eventType: "PAYWALL_UNLOCK",
            page: `result_${resumeId}`,
            metadata: JSON.stringify({ resumeId, amountPaid: updatedResume.amountPaid })
          }
        });
      } catch (e) {
        console.error("Failed to log paywall unlock event:", e);
      }

      return NextResponse.json({ success: true, status: "PAID" });
    }

    return NextResponse.json({ success: false, status: payment.status });

  } catch (error: any) {
    console.error("Manual Payment Verification Error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
