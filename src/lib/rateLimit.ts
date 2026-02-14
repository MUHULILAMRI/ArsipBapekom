/**
 * Simple in-memory rate limiter for API routes.
 * In production, consider using Redis-backed rate limiting for multi-instance setups.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitOptions {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check if a request is within the rate limit.
 * @param identifier - Unique identifier for the requester (e.g., IP address, user ID)
 * @param options - Rate limiting configuration
 * @returns RateLimitResult indicating if the request is allowed
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetAt) {
    // First request or window expired
    const resetAt = now + options.windowSeconds * 1000;
    store.set(identifier, { count: 1, resetAt });
    return { success: true, remaining: options.maxRequests - 1, resetAt };
  }

  if (entry.count >= options.maxRequests) {
    // Rate limit exceeded
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  // Increment counter
  entry.count++;
  return {
    success: true,
    remaining: options.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Get the client IP address from a request.
 * Falls back to "unknown" if IP cannot be determined.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "unknown";
}
