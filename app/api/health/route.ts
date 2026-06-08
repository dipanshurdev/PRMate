import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { env } from "@/lib/env";

export async function GET() {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      environment: env.NODE_ENV,
      services: {
        github: env.GITHUB_TOKEN ? 'configured' : 'not configured',
        gemini: env.GEMINI_API_KEY ? 'configured' : 'not configured',
        coral: env.CORAL_PATH ? 'configured' : 'not configured (fallback available)',
      },
    };

    logger.debug('Health check passed', health);
    return NextResponse.json(health);
  } catch (error) {
    logger.error('Health check failed', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
