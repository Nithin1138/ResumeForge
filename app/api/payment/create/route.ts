import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";

const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId === "mock" || keyId.startsWith("rzp_live_xxx")) {
    console.warn("Razorpay keys not configured. Operating in Local Sandbox Demo Mode.");
    return null;
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

export async function POST(req: NextRequest) {
  try {
    const { resumeId } = await req.json();

    if (!resumeId) {
      return NextResponse.json({ error: "Missing required parameter: resumeId" }, { status: 400 });
    }

    // Retrieve resume to get customer details
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found in database" }, { status: 404 });
    }

    const inputData = JSON.parse(resume.inputData);
    const customerName = inputData.personal.fullName || "Student";
    const customerEmail = inputData.personal.email || "student@college.edu";
    
    // Fetch dynamic pricing configuration from database
    let pricePaise = 4900; // default ₹49
    if (inputData.options?.projectVariants === "3 versions") {
      pricePaise = 9900;
    } else {
      try {
        const config = await prisma.adminConfig.findUnique({
          where: { id: "admin" }
        });
        if (config) {
          const activePrice = config.isFlashOfferActive ? config.flashPrice : config.dynamicPrice;
          pricePaise = activePrice * 100;
        }
      } catch (e) {
        console.warn("Failed to fetch price config, using default ₹49:", e);
      }
    }
    
    // Dynamically get the exact origin to prevent NextAuth redirect bugs if NEXT_PUBLIC_APP_URL is misconfigured
    let appUrl = req.nextUrl.origin;
    if (appUrl.includes("localhost") && process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("callback")) {
      appUrl = process.env.NEXT_PUBLIC_APP_URL;
    }

    const razorpay = getRazorpayClient();

    if (!razorpay) {
      // Local Sandbox / Demo Mode Bypass
      const mockPaymentLinkId = "plink_mock_" + Math.random().toString(36).substr(2, 9);
      
      // Update Prisma with mock payment details
      await prisma.resume.update({
        where: { id: resumeId },
        data: {
          paymentLinkId: mockPaymentLinkId,
          amountPaid: pricePaise,
        },
      });

      // Sandbox URL redirects directly to the success page simulating completed checkout
      const mockCheckoutUrl = `${appUrl}/success/${resumeId}?payment_id=pay_mock_${Math.random().toString(36).substr(2, 9)}&sandbox=true`;
      
      return NextResponse.json({
        paymentUrl: mockCheckoutUrl,
        isSandbox: true,
      });
    }

    // Real Razorpay Payment Link Creation
    const paymentLink = await razorpay.paymentLink.create({
      amount: pricePaise,
      currency: "INR",
      accept_partial: false,
      description: `ATSLift — ATS Resume Content Generation for ${customerName}`,
      customer: {
        name: customerName,
        email: customerEmail,
      },
      notify: {
        sms: false,
        email: true,
      },
      reminder_enable: false,
      notes: {
        resumeId: resumeId,
      },
      callback_url: `${appUrl}/success/${resumeId}`,
      callback_method: "get",
    });

    // Update database with active payment link details
    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        paymentLinkId: paymentLink.id,
        amountPaid: pricePaise,
      },
    });

    return NextResponse.json({
      paymentUrl: paymentLink.short_url,
      isSandbox: false,
    });
  } catch (error: any) {
    console.error("API /api/payment/create POST error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to initialize checkout gateway." },
      { status: 500 }
    );
  }
}
