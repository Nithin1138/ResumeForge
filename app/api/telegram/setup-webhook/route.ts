import { NextResponse } from "next/server";
import { setTelegramWebhook } from "@/lib/telegram";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("url") || process.env.NEXT_PUBLIC_APP_URL || "https://atslift.vercel.app";
    
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
          message: "Failed to set Telegram webhook. Please verify your TELEGRAM_BOT_TOKEN environment variable.",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error setting Telegram webhook:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
