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
import { checkRateLimit } from "@/lib/rate-limit";
import { validateQuestion, validateAiAction } from "@/lib/validation";
import { withTimeout } from "@/lib/timeout";
import { logger } from "@/lib/logger";
import {
  validateAIResponse,
  validatePriorityIssues,
  validateDuplicateIssues,
} from "@/lib/responseValidation";

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
  logger.logApiRequest('POST', '/api/ai');

  // Rate limiting based on IP address
  const ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             'unknown';
  
  const rateLimit = checkRateLimit(ip, 50, 60000); // 50 requests per minute for AI
  
  if (!rateLimit.success) {
    logger.logRateLimit(ip, '/api/ai');
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '50',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
        }
      }
    );
  }

  let body: AiRequest | undefined;
  
  try {
    body = (await req.json()) as AiRequest;

    // Validate AI action
    if (body.action) {
      validateAiAction(body.action);
    }

    logger.debug('AI request', { action: body.action });

    if (body.action === "summary") {
      const rawSummary = await withTimeout(
        summarizeRepo(body.repoData),
        60000, // 1 minute timeout
        'AI summary generation timed out'
      );
      const summary = validateAIResponse(rawSummary);
      return NextResponse.json({ summary }, {
        headers: {
          'X-RateLimit-Limit': '50',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          'Cache-Control': 'private, max-age=300', // 5 min private cache
        }
      });
    }

    if (body.action === "weekly-report") {
      const rawWeeklyReport = await withTimeout(
        generateWeeklyMaintainerReport({
          repo: body.repo,
          repoData: body.repoData,
          healthScore: body.healthScore,
        }),
        60000, // 1 minute timeout
        'Weekly report generation timed out'
      );

      const weeklyReport = validateAIResponse(rawWeeklyReport);

      return NextResponse.json({ weeklyReport }, {
        headers: {
          'X-RateLimit-Limit': '50',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          'Cache-Control': 'private, max-age=600', // 10 min private cache
        }
      });
    }

    if (body.action === "duplicates") {
      const rawDuplicates = await withTimeout(
        findDuplicateIssues(body.issues),
        60000, // 1 minute timeout
        'Duplicate detection timed out'
      );
      const duplicates = validateDuplicateIssues(rawDuplicates);
      return NextResponse.json({ duplicates }, {
        headers: {
          'X-RateLimit-Limit': '50',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          'Cache-Control': 'private, max-age=600', // 10 min private cache
        }
      });
    }

    if (body.action === "priorities") {
      const rawPriorities = await withTimeout(
        prioritizeIssues(body.issues),
        60000, // 1 minute timeout
        'Issue prioritization timed out'
      );
      const priorities = validatePriorityIssues(rawPriorities);
      return NextResponse.json({ priorities }, {
        headers: {
          'X-RateLimit-Limit': '50',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          'Cache-Control': 'private, max-age=300', // 5 min private cache
        }
      });
    }

    if (body.action === "release-notes") {
      const rawReleaseNotes = await withTimeout(
        generateReleaseNotes(body.pulls),
        60000, // 1 minute timeout
        'Release notes generation timed out'
      );
      const releaseNotes = validateAIResponse(rawReleaseNotes);
      return NextResponse.json({ releaseNotes }, {
        headers: {
          'X-RateLimit-Limit': '50',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          'Cache-Control': 'private, max-age=600', // 10 min private cache
        }
      });
    }

    if (body.action === "ask") {
      const validatedQuestion = validateQuestion(body.question ?? '');
      const rawAnswer = await withTimeout(
        askRepository(body.repoData, validatedQuestion),
        60000, // 1 minute timeout
        'Question answering timed out'
      );
      const answer = validateAIResponse(rawAnswer);
      return NextResponse.json({ answer }, {
        headers: {
          'X-RateLimit-Limit': '50',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          'Cache-Control': 'private, max-age=180', // 3 min private cache (questions can vary)
        }
      });
    }

    return NextResponse.json({ error: "Unknown AI action." }, { status: 400 });
  } catch (error) {
    logger.logApiError('POST', '/api/ai', error instanceof Error ? error : new Error(String(error)), { action: body?.action });
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
