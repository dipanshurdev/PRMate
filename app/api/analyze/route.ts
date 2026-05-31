import { getRepoData } from "@/lib/github";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { repoUrl } = (await req.json()) as { repoUrl?: string };
    const url = new URL(repoUrl ?? "");

    if (url.hostname !== "github.com") {
      return NextResponse.json(
        { error: "Please enter a valid GitHub repository URL." },
        { status: 400 },
      );
    }

    const [owner, repo] = url.pathname.split("/").filter(Boolean);

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "GitHub URL must include an owner and repository name." },
        { status: 400 },
      );
    }

    const data = await getRepoData({ owner, repo });

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Unable to analyze this repository." },
      { status: 500 },
    );
  }
}
