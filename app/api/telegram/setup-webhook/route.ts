import { NextResponse } from "next/server";
import { setTelegramWebhook } from "@/lib/telegram";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const paramUrl = searchParams.get("url");

    let domain = paramUrl;
    if (!domain) {
      const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "checkeasy.vercel.app";
      const proto = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
      domain = `${proto}://${host}`;
    }
    
    // Construct full webhook URL
    const webhookUrl = domain.endsWith("/api/telegram/webhook") 
      ? domain 
      : `${domain.replace(/\/$/, "")}/api/telegram/webhook`;

    const success = await setTelegramWebhook(webhookUrl);

    if (success) {
      return NextResponse.json({
        ok: true,
        message: `Telegram webhook successfully registered to: ${webhookUrl}`,
      });
    } else {
      return NextResponse.json(
        {
          ok: false,
          message: "Failed to set Telegram webhook. Please verify TELEGRAM_BOT_TOKEN.",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error setting Telegram webhook:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
