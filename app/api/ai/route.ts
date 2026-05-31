import {
  askRepository,
  findDuplicateIssues,
  generateWeeklyMaintainerReport,
  generateReleaseNotes,
  prioritizeIssues,
  summarizeRepo,
} from "@/lib/gemini";
import type { GitHubIssue, GitHubPull, RepoData } from "@/types/types";
import { NextRequest, NextResponse } from "next/server";

type AiRequest =
  | {
      action: "summary";
      repoData: RepoData;
    }
  | {
      action: "weekly-report";
      repo: string;
      repoData: RepoData;
      healthScore: number;
    }
  | {
      action: "duplicates";
      issues: GitHubIssue[];
    }
  | {
      action: "priorities";
      issues: GitHubIssue[];
    }
  | {
      action: "release-notes";
      pulls: GitHubPull[];
    }
  | {
      action: "ask";
      repoData: RepoData;
      question: string;
    };

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AiRequest;

    if (body.action === "summary") {
      const summary = await summarizeRepo(body.repoData);
      return NextResponse.json({ summary });
    }

    if (body.action === "weekly-report") {
      const weeklyReport = await generateWeeklyMaintainerReport({
        repo: body.repo,
        repoData: body.repoData,
        healthScore: body.healthScore,
      });

      return NextResponse.json({ weeklyReport });
    }

    if (body.action === "duplicates") {
      const duplicates = await findDuplicateIssues(body.issues);
      return NextResponse.json({ duplicates });
    }

    if (body.action === "priorities") {
      const priorities = await prioritizeIssues(body.issues);
      return NextResponse.json({ priorities });
    }

    if (body.action === "release-notes") {
      const releaseNotes = await generateReleaseNotes(body.pulls);
      return NextResponse.json({ releaseNotes });
    }

    if (body.action === "ask") {
      const answer = await askRepository(body.repoData, body.question);
      return NextResponse.json({ answer });
    }

    return NextResponse.json({ error: "Unknown AI action." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to complete the AI request.",
      },
      { status: 500 },
    );
  }
}
