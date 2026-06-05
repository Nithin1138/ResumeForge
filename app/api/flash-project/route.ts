import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { generateGroqFallback } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  let title = "";
  let repoUrl = "";
  
  try {
    const body = await req.json();
    repoUrl = body.repoUrl;

    if (!repoUrl) {
      return NextResponse.json({ error: "GitHub URL is required" }, { status: 400 });
    }

    // Extract owner and repo from URL
    // Format: https://github.com/owner/repo
    const githubRegex = /github\.com\/([^\/]+)\/([^\/]+)/i;
    const match = repoUrl.match(githubRegex);
    
    if (!match) {
      return NextResponse.json({ error: "Invalid GitHub repository URL" }, { status: 400 });
    }

    const owner = match[1];
    // Remove any trailing path/params from the repo name
    const repo = match[2].split(/[\/\?#]/)[0];

    const headers: Record<string, string> = {
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "ATSLift-App"
    };

    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `token ${process.env.GITHUB_TOKEN}`;
    }

    // 1. Fetch Repo Metadata
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) {
      if (repoRes.status === 404) {
        return NextResponse.json({ error: "Repository not found. Make sure it's public or check the URL." }, { status: 404 });
      } else if (repoRes.status === 403) {
        return NextResponse.json({ error: "GitHub API rate limit exceeded. Please try again later." }, { status: 403 });
      }
      return NextResponse.json({ error: "Failed to fetch repository metadata" }, { status: 400 });
    }

    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch;
    const description = repoData.description || "No description provided";
    const language = repoData.language || "Unknown";
    
    title = repoData.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());

    // Calculate duration from GitHub dates
    const createdDate = new Date(repoData.created_at);
    // Use pushed_at to get the last commit date, fallback to updated_at
    const lastActiveDate = new Date(repoData.pushed_at || repoData.updated_at);
    
    const formatMonthYear = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };
    
    const duration = `${formatMonthYear(createdDate)} - ${formatMonthYear(lastActiveDate)}`;

    // 2. Fetch README
    let readmeText = "";
    // Check main branches and README extensions
    const readmeUrls = [
      `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/README.md`,
      `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/readme.md`,
      `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/README.txt`,
      `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`,
      `https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`
    ];

    for (const url of readmeUrls) {
      const readmeRes = await fetch(url);
      if (readmeRes.ok) {
        readmeText = await readmeRes.text();
        break;
      }
    }

    // 3. AI Extraction
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "mock" || apiKey === "xxx") {
      // Return mock data for testing
      return NextResponse.json({
        techStack: language !== "Unknown" ? language : "JavaScript, React",
        description: description,
        keyResult: "Implemented core features",
        duration: duration
      });
    }

    const prompt = `
You are an expert ATS resume writer. I am providing you with the metadata and README content of a GitHub repository for a project named "${title}".
Your task is to extract information and format it perfectly for a resume.

REPOSITORY DETAILS:
Description: ${description}
Primary Language: ${language}

README CONTENT (truncated):
${readmeText.substring(0, 8000)}

Extract the following:
1. "techStack": A comma-separated string of the main languages, frameworks, and tools used. 
2. "description": A professional, concise 1-2 sentence summary of what the project is and what it does. Focus on the engineering aspect. Avoid saying "This is a repository for..." - just state what the system is.
3. "keyResult": A strong, action-oriented bullet point following the Google X-Y-Z formula (Accomplishing [X], as measured by [Y], by doing [Z]), but written naturally and dynamically. Do NOT literally use the words "Accomplished", "as measured by", or "by doing". Start with a strong, varied technical action verb (e.g., "Reduced manual image analysis effort by 40% by training a custom CNN classification model with 92% accuracy to automate real-time crop disease detection" or "Optimized database query latency by 45% by refactoring database ingestion workflows and adding Redis caching layers to support 1,000+ active concurrent users"). Keep it to ONE single sentence.

Return ONLY a valid JSON object matching exactly this structure (no markdown tags):
{
  "techStack": "",
  "description": "",
  "keyResult": ""
}
`;

    const ai = new GoogleGenAI({ apiKey });
    let responseText = "";

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        }
      });
      responseText = response.text || "";
    } catch (geminiError: any) {
      console.warn("Gemini generation failed for flash project:", geminiError);
      
      // Fallback
      try {
        responseText = await generateGroqFallback(prompt, true);
      } catch (groqError) {
        throw new Error("AI generation failed completely.");
      }
    }

    responseText = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

    try {
      const jsonResult = JSON.parse(responseText);
      // Ensure we fill in at least the language if AI missed it
      if (!jsonResult.techStack && language !== "Unknown") {
        jsonResult.techStack = language;
      }
      // Attach the calculated duration from GitHub
      jsonResult.duration = duration;
      jsonResult.title = title;

      // Log success (only original data)
      if (apiKey && apiKey !== "mock" && apiKey !== "xxx") {
        try {
          await prisma.flashProjectLog.create({
            data: {
              repoUrl,
              projectTitle: title,
              status: "SUCCESS"
            }
          });
        } catch (dbErr) {
          console.error("Failed to log flash project success:", dbErr);
        }
      }

      return NextResponse.json(jsonResult);
    } catch (parseError) {
      console.error("AI JSON Parse Error:", responseText);
      throw new Error("Failed to parse extracted AI response.");
    }

  } catch (error: any) {
    console.error("API /api/flash-project POST error:", error);
    
    // Log error (only original data)
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "mock" && apiKey !== "xxx" && repoUrl) {
      try {
        await prisma.flashProjectLog.create({
          data: {
            repoUrl: repoUrl || "Unknown",
            projectTitle: title || "Unknown",
            status: "ERROR",
            errorMessage: error.message || "Unknown error"
          }
        });
      } catch (dbErr) {
        console.error("Failed to log flash project error:", dbErr);
      }
    }

    return NextResponse.json(
      { error: error.message || "Internal server error occurred." },
      { status: 500 }
    );
  }
}
