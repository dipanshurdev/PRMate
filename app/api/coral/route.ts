import { NextRequest, NextResponse } from "next/server";
import { runCoralQuery } from "@/lib/coral";
import { checkRateLimit } from "@/lib/rate-limit";
import { validateCoralQuery } from "@/lib/validation";
import { withTimeout } from "@/lib/timeout";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  logger.logApiRequest('POST', '/api/coral');

  // Rate limiting based on IP address
  const ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             'unknown';
  
  const rateLimit = checkRateLimit(ip, 20, 60000); // 20 requests per minute for Coral
  
  if (!rateLimit.success) {
    logger.logRateLimit(ip, '/api/coral');
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '20',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
        }
      }
    );
  }

  try {
    const { query } = (await req.json()) as { query?: string };

    // Validate the Coral query
    const validatedQuery = validateCoralQuery(query ?? '');

    // Add timeout to Coral query execution
    const result = await withTimeout(
      runCoralQuery(validatedQuery),
      45000, // 45 second timeout (Coral has its own 30s timeout)
      'Coral query execution timed out'
    );

    logger.info('Coral query executed successfully');

    return NextResponse.json({ result }, {
      headers: {
        'X-RateLimit-Limit': '20',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
        'Cache-Control': 'private, max-age=60', // 1 min private cache (SQL queries can vary)
      }
    });
  } catch (error) {
    logger.logApiError('POST', '/api/coral', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to run Coral query.",
      },
      { status: 500 },
    );
  }
}
