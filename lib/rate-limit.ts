/**
 * Simple in-memory rate limiter
 * For production, consider using Redis with @upstash/ratelimit
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number
  /** Time window in seconds */
  windowSeconds: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (e.g., IP address or user ID)
 * @param config - Rate limit configuration
 * @returns Result with success status and remaining requests
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const key = identifier
  const entry = rateLimitStore.get(key)

  // If no entry or expired, create new one
  if (!entry || entry.resetTime < now) {
    const resetTime = now + config.windowSeconds * 1000
    rateLimitStore.set(key, { count: 1, resetTime })
    return {
      success: true,
      remaining: config.limit - 1,
      reset: resetTime,
    }
  }

  // Increment count
  entry.count++

  if (entry.count > config.limit) {
    return {
      success: false,
      remaining: 0,
      reset: entry.resetTime,
    }
  }

  return {
    success: true,
    remaining: config.limit - entry.count,
    reset: entry.resetTime,
  }
}

/**
 * Get client IP from request headers
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  return 'unknown'
}

// Preset configurations for different endpoint types
export const RATE_LIMITS = {
  /** Auth endpoints: 5 requests per minute */
  auth: { limit: 5, windowSeconds: 60 },
  /** API endpoints: 30 requests per minute */
  api: { limit: 30, windowSeconds: 60 },
  /** Newsletter: 3 requests per hour */
  newsletter: { limit: 3, windowSeconds: 3600 },
  /** Reviews: 10 per hour */
  reviews: { limit: 10, windowSeconds: 3600 },
} as const
