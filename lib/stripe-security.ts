/**
 * Stripe webhook security enhancements
 * Implements P1-5: Idempotency checks for webhook events
 */

import prisma from './prisma'

/**
 * Check if a Stripe webhook event has already been processed
 * Prevents duplicate processing from webhook retries
 */
export async function isEventProcessed(eventId: string): Promise<boolean> {
  try {
    const existingEvent = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM "StripeEvent"
      WHERE "eventId" = ${eventId}
    `

    return existingEvent[0].count > 0
  } catch (error) {
    // If table doesn't exist, return false
    // This will be created by migration
    return false
  }
}

/**
 * Mark a Stripe event as processed
 * Stores event ID to prevent duplicate processing
 */
export async function markEventProcessed(
  eventId: string,
  eventType: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.$executeRaw`
      INSERT INTO "StripeEvent" ("eventId", "type", "metadata", "processedAt")
      VALUES (${eventId}, ${eventType}, ${JSON.stringify(metadata || {})}, NOW())
      ON CONFLICT ("eventId") DO NOTHING
    `
  } catch (error) {
    console.error('Failed to mark event as processed:', error)
    // Don't throw - allow webhook to succeed even if logging fails
  }
}

/**
 * Validate Stripe webhook payload size
 * P1-4: Prevent memory exhaustion from large payloads
 */
export function validateWebhookPayloadSize(body: string): void {
  const maxSize = 1024 * 1024 // 1MB
  const bodySize = Buffer.byteLength(body, 'utf8')

  if (bodySize > maxSize) {
    throw new Error(
      `Webhook payload too large: ${bodySize} bytes (max: ${maxSize} bytes)`
    )
  }
}

/**
 * Clean up old processed events
 * Run periodically to prevent table bloat
 */
export async function cleanupOldEvents(daysToKeep: number = 90): Promise<number> {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const result = await prisma.$executeRaw`
      DELETE FROM "StripeEvent"
      WHERE "processedAt" < ${cutoffDate}
    `

    return result as number
  } catch (error) {
    console.error('Failed to clean up old events:', error)
    return 0
  }
}
