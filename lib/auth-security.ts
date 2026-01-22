/**
 * Security validation and utilities for NextAuth configuration
 * Implements P0 and P1 security fixes
 */

/**
 * Validates NEXTAUTH_SECRET meets security requirements
 * Prevents weak or default secrets that could compromise session security
 */
export function validateNextAuthSecret(): void {
  const secret = process.env.NEXTAUTH_SECRET

  // P1-1: Must be set
  if (!secret) {
    throw new Error(
      '🔒 SECURITY ERROR: NEXTAUTH_SECRET environment variable must be set. ' +
      'Generate a secure secret with: openssl rand -base64 32'
    )
  }

  // P1-1: Minimum length requirement (32 characters for 256-bit security)
  if (secret.length < 32) {
    throw new Error(
      `🔒 SECURITY ERROR: NEXTAUTH_SECRET must be at least 32 characters long (current: ${secret.length}). ` +
      'Generate a secure secret with: openssl rand -base64 32'
    )
  }

  // P1-1: Prevent default/example secrets
  const insecureDefaults = [
    'your-nextauth-secret-here',
    'your-secret-here',
    'secret',
    'changeme',
    'password',
    'nextauth-secret',
  ]

  if (insecureDefaults.some(def => secret.toLowerCase().includes(def))) {
    throw new Error(
      '🔒 SECURITY ERROR: NEXTAUTH_SECRET appears to be a default/example value. ' +
      'Generate a secure secret with: openssl rand -base64 32'
    )
  }

  // P1-1: Check for sufficient entropy (should have mix of characters)
  const hasLowercase = /[a-z]/.test(secret)
  const hasUppercase = /[A-Z]/.test(secret)
  const hasNumber = /[0-9]/.test(secret)
  const hasSpecial = /[^a-zA-Z0-9]/.test(secret)

  if (!hasLowercase || !hasUppercase || !hasNumber || !hasSpecial) {
    console.warn(
      '⚠️  WARNING: NEXTAUTH_SECRET should contain a mix of uppercase, lowercase, numbers, and special characters. ' +
      'Generate a secure secret with: openssl rand -base64 32'
    )
  }

  // Success
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ NEXTAUTH_SECRET validation passed')
  }
}

/**
 * Validates all required environment variables for production
 */
export function validateProductionSecrets(): void {
  if (process.env.NODE_ENV !== 'production') {
    return
  }

  const required = [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `🔒 SECURITY ERROR: Missing required environment variables for production: ${missing.join(', ')}`
    )
  }

  // Validate database URL doesn't expose credentials
  const dbUrl = process.env.DATABASE_URL
  if (dbUrl && dbUrl.includes('password') && dbUrl.includes('user')) {
    console.warn(
      '⚠️  WARNING: DATABASE_URL appears to contain credentials. ' +
      'Consider using connection pooling URLs that don\'t expose credentials.'
    )
  }
}

/**
 * Security headers configuration
 * Implements defense-in-depth security headers
 */
export const SECURITY_HEADERS = {
  // P1-6: Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // P2-6: Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // P2-6: Enable XSS protection for legacy browsers
  'X-XSS-Protection': '1; mode=block',

  // P2-6: Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // P2-6: Restrict powerful browser features
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',

  // P2-6: Additional security headers
  'X-Download-Options': 'noopen',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
} as const

/**
 * Generate nonce for CSP
 * Used to allow specific inline scripts while blocking others
 */
export function generateCSPNonce(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for environments without crypto.randomUUID
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15)
}

/**
 * Build Content Security Policy
 * P1-6: Removes unsafe-inline and unsafe-eval while maintaining compatibility
 * Note: Development mode allows unsafe-eval for Framer Motion animations
 */
export function buildContentSecurityPolicy(nonce?: string): string {
  const isDev = process.env.NODE_ENV !== 'production'

  const directives = [
    "default-src 'self'",

    // Scripts: Use nonce instead of unsafe-inline
    // In development, allow unsafe-inline and unsafe-eval for Next.js and Framer Motion
    nonce
      ? `script-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-inline' 'unsafe-eval'" : ''} https://js.stripe.com https://www.googletagmanager.com`
      : `script-src 'self'${isDev ? " 'unsafe-inline' 'unsafe-eval'" : ''} https://js.stripe.com https://www.googletagmanager.com`,

    // Styles: Allow Google Fonts
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

    // Fonts
    "font-src 'self' https://fonts.gstatic.com data:",

    // Images: Allow external image sources
    "img-src 'self' data: blob: https://images.unsplash.com https://*.stripe.com https://res.cloudinary.com",

    // Connect: API endpoints
    "connect-src 'self' https://api.stripe.com https://www.google-analytics.com",

    // Frames: Stripe checkout
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",

    // Objects: Block plugins
    "object-src 'none'",

    // Base URI: Prevent base tag injection
    "base-uri 'self'",

    // Forms: Only allow same-origin form submissions
    "form-action 'self'",

    // Frame ancestors: Prevent embedding
    "frame-ancestors 'none'",

    // Upgrade insecure requests in production
    process.env.NODE_ENV === 'production' ? "upgrade-insecure-requests" : "",
  ].filter(Boolean)

  return directives.join('; ')
}

/**
 * Rate limit configuration for production
 * P1-2: Redis-based rate limiting for distributed environments
 */
export const REDIS_RATE_LIMITS = {
  // Authentication endpoints (stricter limits)
  auth: {
    points: 5,
    duration: 60, // 5 attempts per minute
    blockDuration: 900, // 15 min block after limit
  },

  // API endpoints (moderate limits)
  api: {
    points: 30,
    duration: 60, // 30 requests per minute
    blockDuration: 60, // 1 min block
  },

  // Newsletter (very strict)
  newsletter: {
    points: 3,
    duration: 3600, // 3 per hour
    blockDuration: 3600, // 1 hour block
  },

  // Reviews (moderate)
  reviews: {
    points: 10,
    duration: 3600, // 10 per hour
    blockDuration: 1800, // 30 min block
  },

  // Checkout (moderate to allow legitimate purchases)
  checkout: {
    points: 10,
    duration: 300, // 10 per 5 minutes
    blockDuration: 900, // 15 min block
  },
} as const

/**
 * Sanitize user input to prevent XSS
 * P2-7: Input sanitization for user-generated content
 */
export function sanitizeInput(input: string): string {
  // Remove any HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '')

  // Encode special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')

  // Limit length to prevent DoS
  return sanitized.substring(0, 10000)
}

/**
 * Validate email format with stricter rules
 */
export function validateEmail(email: string): boolean {
  // P2-1: Stricter email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  if (!emailRegex.test(email)) {
    return false
  }

  // Additional checks
  if (email.length > 254) return false // RFC 5321
  const [local, domain] = email.split('@')
  if (local.length > 64) return false // RFC 5321

  return true
}

/**
 * Validate password strength
 * P2-1: Enhanced password requirements including special characters
 */
export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('au moins 8 caractères')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('une majuscule')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('une minuscule')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('un chiffre')
  }

  // P2-1: Require special character
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/.test(password)) {
    errors.push('un caractère spécial (!@#$%^&*...)')
  }

  // Check for common weak passwords
  const weakPasswords = [
    'password', 'Password1!', '12345678!', 'Qwerty1!', 'Admin123!',
    'Welcome1!', 'Password123!', 'Azerty1!', 'Motdepasse1!',
  ]

  if (weakPasswords.includes(password)) {
    errors.push('ce mot de passe est trop courant')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Generate secure random token
 * Used for email verification, password reset, etc.
 */
export function generateSecureToken(length: number = 32): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    // Use crypto.randomUUID for better randomness
    return crypto.randomUUID().replace(/-/g, '')
  }

  // Fallback
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Security event logger
 * P3-1: Security logging for monitoring and incident response
 */
export function logSecurityEvent(event: {
  type: 'AUTH_FAILURE' | 'PERMISSION_DENIED' | 'RATE_LIMIT' | 'SUSPICIOUS' | 'CSP_VIOLATION'
  userId?: string
  ip: string
  userAgent?: string
  details: Record<string, unknown>
  severity?: 'low' | 'medium' | 'high' | 'critical'
}): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type: event.type,
    userId: event.userId || 'anonymous',
    ip: event.ip,
    userAgent: event.userAgent || 'unknown',
    severity: event.severity || 'medium',
    details: event.details,
  }

  // In production, send to logging service (Sentry, DataDog, etc.)
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with logging service
    console.error('[SECURITY]', JSON.stringify(logEntry))
  } else {
    console.warn('[SECURITY EVENT]', logEntry)
  }
}
