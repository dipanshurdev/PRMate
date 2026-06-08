import { getRepoData } from "@/lib/github";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { validateAndParseRepoUrl } from "@/lib/validation";
import { withTimeout } from "@/lib/timeout";
import { logger } from "@/lib/logger";
import { validateGitHubRepoData } from "@/lib/responseValidation";

export async function POST(req: NextRequest) {
  logger.logApiRequest('POST', '/api/analyze');

  // Rate limiting based on IP address
  const ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             'unknown';
  
  const rateLimit = checkRateLimit(ip, 30, 60000); // 30 requests per minute
  
  if (!rateLimit.success) {
    logger.logRateLimit(ip, '/api/analyze');
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '30',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
        }
      }
    );
  }

  try {
    const { repoUrl } = (await req.json()) as { repoUrl?: string };

    // Validate and parse the repository URL
    const { owner, repo } = validateAndParseRepoUrl(repoUrl ?? '');

    // Add timeout to GitHub API call
    const rawData = await withTimeout(
      getRepoData({ owner, repo }),
      60000, // 1 minute total timeout
      'Repository analysis timed out. Please try again.'
    );

    // Validate the response data
    const data = validateGitHubRepoData(rawData);

    logger.info('Repository analysis successful', { owner, repo });

    return NextResponse.json(data, {
      headers: {
        'X-RateLimit-Limit': '30',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // 5 min cache, 10 min stale
      }
    });
  } catch (error) {
    logger.logApiError('POST', '/api/analyze', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Unable to analyze this repository." },
      { status: 500 },
    );
  }
}
