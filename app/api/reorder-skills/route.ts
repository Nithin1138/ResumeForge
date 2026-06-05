import { NextRequest, NextResponse } from "next/server";
import { generateReorderedSkills } from "@/lib/gemini";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { skills, jobDescription } = body;

    if (!skills || !Array.isArray(skills) || !jobDescription) {
      return NextResponse.json(
        { error: "Missing or invalid parameters: skills (array) and jobDescription (string) are required." },
        { status: 400 }
      );
    }

    const reorderedSkills = await generateReorderedSkills(skills, jobDescription);

    return NextResponse.json({ skills: reorderedSkills });
  } catch (error) {
    console.error("API /api/reorder-skills POST error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred." },
      { status: 500 }
    );
  }
}
