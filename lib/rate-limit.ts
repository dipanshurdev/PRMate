/**
 * Simple in-memory rate limiter for API endpoints
 * Prevents abuse and ensures fair usage of API resources
 */

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitStore>();

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the requester (IP address, user ID, etc.)
 * @param limit - Maximum number of requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns Object with success status and remaining requests
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000 // 1 minute default
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const existing = rateLimitStore.get(identifier);

  // Clean up expired entries
  if (existing && existing.resetTime < now) {
    rateLimitStore.delete(identifier);
  }

  const record = rateLimitStore.get(identifier) || {
    count: 0,
    resetTime: now + windowMs,
  };

  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count += 1;
  rateLimitStore.set(identifier, record);

  return {
    success: true,
    remaining: limit - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Clean up expired rate limit entries
 * Call this periodically to prevent memory leaks
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Clean up every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}
