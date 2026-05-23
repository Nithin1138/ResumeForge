import { NextRequest, NextResponse } from "next/server";
import { generateSectionContent } from "@/lib/gemini";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { sectionType, currentText } = body;

    if (!sectionType || !currentText) {
      return NextResponse.json(
        { error: "Missing required parameters: sectionType and currentText are mandatory." },
        { status: 400 }
      );
    }

    const newText = await generateSectionContent(sectionType, currentText);

    return NextResponse.json({ newText });
  } catch (error) {
    console.error("API /api/generate-section POST error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred." },
      { status: 500 }
    );
  }
}
