import { NextRequest, NextResponse } from 'next/server'
import { logSecurityEvent } from '@/lib/auth-security'
import { getClientIp } from '@/lib/rate-limit'

/**
 * P3-9: CSP Violation Reporting Endpoint
 * Collects and logs Content Security Policy violations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const ip = getClientIp(request)

    // Log CSP violation as security event
    logSecurityEvent({
      type: 'CSP_VIOLATION',
      ip,
      userAgent: request.headers.get('user-agent') || undefined,
      severity: 'medium',
      details: {
        'csp-report': body['csp-report'] || body,
        url: request.url,
        timestamp: new Date().toISOString(),
      },
    })

    // Return 204 No Content as per CSP spec
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error processing CSP report:', error)
    // Still return 204 to not alert attackers
    return new NextResponse(null, { status: 204 })
  }
}
