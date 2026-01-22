import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SECURITY_HEADERS, buildContentSecurityPolicy } from '@/lib/auth-security'

export function middleware(request: NextRequest) {
  // P2-3: HTTPS redirect in production
  if (
    process.env.NODE_ENV === 'production' &&
    request.headers.get('x-forwarded-proto') !== 'https'
  ) {
    const host = request.headers.get('host')
    if (host) {
      return NextResponse.redirect(
        `https://${host}${request.nextUrl.pathname}${request.nextUrl.search}`,
        301
      )
    }
  }

  // Get the response
  const response = NextResponse.next()

  // P2-6: Apply comprehensive security headers
  const headers = response.headers

  // Apply all security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    headers.set(key, value)
  })

  // HSTS (only in production with HTTPS)
  if (process.env.NODE_ENV === 'production') {
    headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  // P1-6: Improved Content Security Policy (removed unsafe-inline/unsafe-eval where possible)
  // P3-9: Added CSP violation reporting
  const csp = buildContentSecurityPolicy()
  const cspWithReporting = process.env.NODE_ENV === 'production'
    ? `${csp}; report-uri /api/csp-report`
    : csp

  headers.set('Content-Security-Policy', cspWithReporting)

  return response
}

// Apply middleware to all routes except static files and API health checks
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
