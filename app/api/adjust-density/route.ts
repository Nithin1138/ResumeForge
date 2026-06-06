import { NextRequest, NextResponse } from "next/server";
import { generateLlmText } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeData, density } = body;

    if (!resumeData || !density) {
      return NextResponse.json(
        { error: "Missing required parameters: resumeData and density are mandatory." },
        { status: 400 }
      );
    }

    if (!["concise", "normal", "expand"].includes(density)) {
      return NextResponse.json({ error: "Invalid density option." }, { status: 400 });
    }

    const prompt = `
SYSTEM:
You are an expert ATS resume writer. Your task is to adjust the density (character length) of the bullet points and achievements in the provided resume data.
The target density option selected is: ${density.toUpperCase()}.

DENSITY INSTRUCTIONS:
1. CONCISE:
   - Make every project and experience bullet point short, punchy, compact, and highly dense.
   - Target character count: STRICTLY between 50 and 80 characters per bullet point.
   - Summarize achievements to be short and brief.
2. NORMAL:
   - Standard resume length.
   - Target character count: STRICTLY between 65 and 135 characters per bullet point.
3. EXPAND:
   - Elaborate slightly, adding more detail about the technical context, implementation, or impact.
   - Target character count: STRICTLY between 130 and 180 characters per bullet point.

CRITICAL RULES:
1. DO NOT change the core meaning, projects, metrics, or technologies used. Keep all numerical impact values (e.g. percentages, number of requests, latency figures) and technical terms EXACTLY the same.
2. Keep the exact same number of items and bullets.
3. Output ONLY valid JSON matching this exact structure:
{
  "projects": [
    {
      "bullets": [
        "bullet 1 matching the density rule",
        "bullet 2 matching the density rule",
        "bullet 3 matching the density rule"
      ]
    }
  ],
  "experience": [
    {
      "bullets": [
        "bullet 1 matching the density rule",
        "bullet 2 matching the density rule",
        "bullet 3 matching the density rule"
      ]
    }
  ],
  "achievements": [
    "achievement 1 matching the density rule",
    "achievement 2 matching the density rule"
  ]
}

Do not include any surrounding markdown text or explanations. Only return the raw JSON object.

INPUT RESUME DATA:
${JSON.stringify({
  projects: (resumeData.projects || []).map((p: any) => ({ title: p.title, bullets: p.bullets })),
  experience: (resumeData.experience || []).map((e: any) => ({ company: e.company, bullets: e.bullets })),
  achievements: resumeData.achievements || []
}, null, 2)}
`;

    const responseText = await generateLlmText(prompt, { json: true });
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    }

    const jsonResult = JSON.parse(cleanedText);
    return NextResponse.json(jsonResult);
  } catch (error: any) {
    console.error("API /api/adjust-density POST error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error occurred during density adjustment." },
      { status: 500 }
    );
  }
}
