# Stripe Payment Integration - Production-Ready Fixes

This document provides ready-to-implement code fixes for all critical issues identified in the security audit.

---

## Fix 1: Idempotency System Implementation

### Create: `lib/idempotency.ts`

```typescript
import crypto from 'crypto'
import prisma from './prisma'

/**
 * Generates a deterministic idempotency key based on user, action, and data
 * This ensures the same request always generates the same key
 */
export function generateIdempotencyKey(
  userId: string,
  action: string,
  data: Record<string, any>
): string {
  // Sort keys to ensure consistent hashing
  const sortedData = JSON.stringify(data, Object.keys(data).sort())

  const hash = crypto
    .createHash('sha256')
    .update(`${userId}:${action}:${sortedData}`)
    .digest('hex')

  return `${action}:${userId}:${hash.substring(0, 16)}`
}

/**
 * Checks if a request has been previously processed
 * Returns cached response if exists and is still valid
 */
export async function getIdempotencyResponse(
  idempotencyKey: string
): Promise<{ exists: boolean; response: any; status: number }> {
  try {
    const existing = await prisma.idempotencyKey.findUnique({
      where: { key: idempotencyKey },
    })

    if (!existing) {
      return { exists: false, response: null, status: 0 }
    }

    // Check if still valid (24 hours)
    const isExpired = Date.now() - existing.createdAt.getTime() > 24 * 60 * 60 * 1000
    if (isExpired) {
      return { exists: false, response: null, status: 0 }
    }

    return {
      exists: true,
      response: existing.response as any,
      status: existing.status,
    }
  } catch (error) {
    console.error('[Idempotency] Error checking key:', error)
    // Continue on error - treat as new request
    return { exists: false, response: null, status: 0 }
  }
}

/**
 * Stores the response of an idempotent request for future retrieval
 */
export async function storeIdempotencyResponse(
  idempotencyKey: string,
  userId: string,
  action: string,
  response: any,
  status: number
): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.idempotencyKey.upsert({
      where: { key: idempotencyKey },
      create: {
        key: idempotencyKey,
        userId,
        action,
        request: response,
        response,
        status,
        expiresAt,
      },
      update: {
        response,
        status,
        expiresAt,
        updatedAt: new Date(),
      },
    })
  } catch (error) {
    console.error('[Idempotency] Error storing key:', error)
    // Non-blocking error - request continues
  }
}

/**
 * Cleanup expired idempotency keys (run periodically)
 */
export async function cleanupExpiredKeys(): Promise<number> {
  try {
    const result = await prisma.idempotencyKey.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })

    console.log(`[Idempotency] Cleaned up ${result.count} expired keys`)
    return result.count
  } catch (error) {
    console.error('[Idempotency] Cleanup error:', error)
    return 0
  }
}
```

### Add to Prisma Schema: `prisma/schema.prisma`

```prisma
model IdempotencyKey {
  key       String                @id
  userId    String
  action    String
  request   Json
  response  Json
  status    Int
  expiresAt DateTime
  createdAt DateTime              @default(now())
  updatedAt DateTime              @updatedAt

  @@index([userId])
  @@index([action])
  @@index([expiresAt])
}
```

---

## Fix 2: Input Validation Schema

### Create: `lib/validation.ts`

```typescript
import { z } from 'zod'

/**
 * Validates individual line items for checkout
 */
export const LineItemSchema = z.object({
  productId: z.string().cuid('Invalid product ID'),
  name: z.string().min(1, 'Product name required').max(255, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  image: z
    .string()
    .url('Invalid image URL')
    .or(z.string().regex(/^\//, 'Invalid image path'))
    .optional(),
  price: z
    .number('Price must be a number')
    .positive('Price must be positive')
    .finite('Price must be finite')
    .multipleOf(0.01, 'Price must have max 2 decimals')
    .max(99999.99, 'Price too high'),
  quantity: z
    .number('Quantity must be a number')
    .int('Quantity must be whole number')
    .min(1, 'Quantity must be at least 1')
    .max(1000, 'Quantity too high'),
})

export type LineItem = z.infer<typeof LineItemSchema>

/**
 * Validates complete checkout request
 */
export const CheckoutRequestSchema = z.object({
  items: z
    .array(LineItemSchema)
    .min(1, 'At least one item required')
    .max(100, 'Too many items'),
  orderId: z.string().cuid('Invalid order ID').optional(),
})

export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>

/**
 * Validates address from checkout
 */
export const AddressSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().min(1).optional(),
  street: z.string().min(1).max(255),
  apartment: z.string().max(100).optional(),
  city: z.string().min(1).max(100),
  postalCode: z.string().min(1).max(20),
  country: z.enum(['FR', 'BE', 'CH', 'LU', 'MC']),
})

export type Address = z.infer<typeof AddressSchema>

/**
 * Validates order creation request
 */
export const OrderCreationSchema = z.object({
  items: z.array(LineItemSchema).min(1),
  address: AddressSchema,
  paymentMethod: z.string().default('stripe'),
  subtotal: z.number().positive(),
  shipping: z.number().min(0),
})

export type OrderCreationRequest = z.infer<typeof OrderCreationSchema>

/**
 * Safe validation function with detailed error reporting
 */
export function validateData<T>(
  schema: z.ZodSchema,
  data: unknown
): { success: boolean; data?: T; error?: string; errors?: Record<string, string> } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated as T }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMap: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        errorMap[path] = err.message
      })
      return {
        success: false,
        error: 'Validation failed',
        errors: errorMap,
      }
    }
    return {
      success: false,
      error: 'Unknown validation error',
    }
  }
}
```

---

## Fix 3: Price Verification Service

### Create: `lib/price-verification.ts`

```typescript
import prisma from './prisma'
import { LineItem } from './validation'

/**
 * Verifies cart items against database
 * Prevents price manipulation attacks
 */
export async function verifyCartItems(
  items: LineItem[]
): Promise<{
  valid: boolean
  verified: LineItem[]
  errors: Array<{ productId: string; error: string }>
}> {
  const errors: Array<{ productId: string; error: string }> = []
  const verified: LineItem[] = []

  for (const item of items) {
    try {
      // Get product from database
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          slug: true,
        },
      })

      // Check product exists
      if (!product) {
        errors.push({
          productId: item.productId,
          error: 'Product not found',
        })
        continue
      }

      // Check name matches (prevent product swap)
      if (product.name !== item.name) {
        errors.push({
          productId: item.productId,
          error: `Product name mismatch: expected "${product.name}", got "${item.name}"`,
        })
        continue
      }

      // Check price matches exactly
      const dbPrice = Number(product.price)
      if (Math.abs(dbPrice - item.price) > 0.01) {
        // Allow 1 cent difference for rounding
        errors.push({
          productId: item.productId,
          error: `Price mismatch: expected ${dbPrice}, got ${item.price}`,
        })
        continue
      }

      // Check stock availability
      if (product.stock < item.quantity) {
        errors.push({
          productId: item.productId,
          error: `Insufficient stock: ${product.stock} available, ${item.quantity} requested`,
        })
        continue
      }

      // All checks passed
      verified.push({
        ...item,
        // Ensure price from database
        price: dbPrice,
      })
    } catch (error) {
      errors.push({
        productId: item.productId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return {
    valid: errors.length === 0,
    verified,
    errors,
  }
}

/**
 * Calculates final order total with verification
 */
export function calculateOrderTotal(
  items: LineItem[],
  shippingCost: number = 0
): { subtotal: number; shipping: number; total: number } {
  let subtotal = 0

  for (const item of items) {
    const itemTotal = item.price * item.quantity
    // Ensure no arithmetic overflow
    if (!isFinite(itemTotal) || itemTotal > 999999.99) {
      throw new Error('Item total exceeds maximum')
    }
    subtotal += itemTotal
  }

  // Round to 2 decimals
  subtotal = Math.round(subtotal * 100) / 100

  // Validate shipping
  if (shippingCost < 0 || shippingCost > 99999.99) {
    throw new Error('Invalid shipping cost')
  }

  const total = subtotal + shippingCost
  if (total > 999999.99) {
    throw new Error('Order total exceeds maximum')
  }

  return {
    subtotal,
    shipping: shippingCost,
    total: Math.round(total * 100) / 100,
  }
}

/**
 * Validates order total against database
 */
export async function verifyOrderTotal(
  orderId: string,
  expectedTotal: number
): Promise<boolean> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { total: true, status: true },
  })

  if (!order) {
    throw new Error('Order not found')
  }

  const dbTotal = Number(order.total)
  const matches = Math.abs(dbTotal - expectedTotal) <= 0.01

  if (!matches) {
    console.error('[Price Verification] Order total mismatch:', {
      orderId,
      expected: expectedTotal,
      actual: dbTotal,
    })
  }

  return matches
}
```

---

## Fix 4: Secure Checkout Endpoint

### Update: `app/api/stripe/checkout/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createCheckoutSession, LineItem } from '@/lib/stripe'
import { validateData, CheckoutRequestSchema } from '@/lib/validation'
import { verifyCartItems, calculateOrderTotal } from '@/lib/price-verification'
import { generateIdempotencyKey, getIdempotencyResponse, storeIdempotencyResponse } from '@/lib/idempotency'
import { logPaymentAction } from '@/lib/payment-logger'
import prisma from '@/lib/prisma'

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  process.env.NEXTAUTH_URL,
]

function isAllowedOrigin(origin: string): boolean {
  return ALLOWED_ORIGINS.some(allowed =>
    allowed && origin === allowed
  )
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'

  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || !session?.user?.id) {
      logPaymentAction(
        session?.user?.id || 'unknown',
        undefined,
        'checkout_unauthorized',
        0,
        'FAILED'
      )
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 2. Validate origin (prevent open redirect)
    const origin = request.headers.get('origin')
    if (!origin || !isAllowedOrigin(origin)) {
      console.warn('[Checkout] Suspicious origin:', { origin, requestId })
      logPaymentAction(
        session.user.id,
        undefined,
        'checkout_invalid_origin',
        0,
        'FAILED'
      )
      return NextResponse.json(
        { success: false, error: 'Invalid request origin' },
        { status: 403 }
      )
    }

    // 3. Validate request body
    const body = await request.json()
    const validation = validateData(CheckoutRequestSchema, body)

    if (!validation.success) {
      logPaymentAction(
        session.user.id,
        undefined,
        'checkout_validation_failed',
        0,
        'FAILED'
      )
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          errors: validation.errors,
        },
        { status: 400 }
      )
    }

    const { items, orderId } = validation.data!

    // 4. Generate idempotency key
    const idempotencyKey = generateIdempotencyKey(
      session.user.id,
      'checkout',
      { items: items.map(i => ({ productId: i.productId, quantity: i.quantity })), orderId }
    )

    // 5. Check if already processed
    const cached = await getIdempotencyResponse(idempotencyKey)
    if (cached.exists) {
      console.log('[Checkout] Returning cached response:', { requestId })
      return NextResponse.json(cached.response, { status: cached.status })
    }

    // 6. Verify all items against database
    const priceVerification = await verifyCartItems(items)

    if (!priceVerification.valid) {
      const errorMessage = priceVerification.errors
        .map(e => `${e.productId}: ${e.error}`)
        .join('; ')

      logPaymentAction(
        session.user.id,
        orderId,
        'checkout_price_verification_failed',
        0,
        'FAILED'
      )

      const response = {
        success: false,
        error: 'Cart verification failed',
        details: priceVerification.errors,
      }

      await storeIdempotencyResponse(
        idempotencyKey,
        session.user.id,
        'checkout',
        response,
        400
      )

      return NextResponse.json(response, { status: 400 })
    }

    // 7. Calculate and verify total
    const { subtotal, shipping, total } = calculateOrderTotal(
      priceVerification.verified,
      0 // Shipping handled on Stripe side
    )

    // 8. Verify order if orderId provided
    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          userId: true,
          status: true,
          total: true,
        },
      })

      if (!order) {
        logPaymentAction(
          session.user.id,
          orderId,
          'checkout_order_not_found',
          total,
          'FAILED'
        )

        const response = {
          success: false,
          error: 'Order not found',
        }

        await storeIdempotencyResponse(
          idempotencyKey,
          session.user.id,
          'checkout',
          response,
          404
        )

        return NextResponse.json(response, { status: 404 })
      }

      // Verify user owns order
      if (order.userId !== session.user.id) {
        console.error('[Checkout] User attempting to pay for order they do not own:', {
          userId: session.user.id,
          orderId: order.id,
          requestId,
        })
        logPaymentAction(
          session.user.id,
          orderId,
          'checkout_unauthorized_order',
          total,
          'FAILED'
        )

        const response = {
          success: false,
          error: 'Unauthorized',
        }

        await storeIdempotencyResponse(
          idempotencyKey,
          session.user.id,
          'checkout',
          response,
          403
        )

        return NextResponse.json(response, { status: 403 })
      }

      // Verify order status is PENDING
      if (order.status !== 'PENDING') {
        logPaymentAction(
          session.user.id,
          orderId,
          'checkout_order_invalid_status',
          total,
          'FAILED'
        )

        const response = {
          success: false,
          error: 'Order cannot be paid in current state',
        }

        await storeIdempotencyResponse(
          idempotencyKey,
          session.user.id,
          'checkout',
          response,
          400
        )

        return NextResponse.json(response, { status: 400 })
      }
    }

    // 9. Create Stripe checkout session
    logPaymentAction(
      session.user.id,
      orderId,
      'checkout_started',
      total,
      'PROCESSING'
    )

    const checkoutSession = await createCheckoutSession(
      priceVerification.verified,
      session.user.email,
      `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      `${origin}/panier`,
      {
        userId: session.user.id,
        orderId: orderId || '',
        requestId, // For audit trail
      }
    )

    if (!checkoutSession.id || !checkoutSession.url) {
      throw new Error('Failed to create Stripe session')
    }

    // 10. Cache successful response
    const response = {
      success: true,
      data: {
        sessionId: checkoutSession.id,
        url: checkoutSession.url,
      },
    }

    await storeIdempotencyResponse(
      idempotencyKey,
      session.user.id,
      'checkout',
      response,
      200
    )

    logPaymentAction(
      session.user.id,
      orderId,
      'checkout_session_created',
      total,
      'SUCCESS'
    )

    return NextResponse.json(response)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    console.error('[Checkout] Error:', {
      error: errorMessage,
      requestId,
      ipAddress,
    })

    logPaymentAction(
      session?.user?.id || 'unknown',
      undefined,
      'checkout_error',
      0,
      'FAILED'
    )

    // Differentiate error types
    if (errorMessage.includes('Stripe')) {
      return NextResponse.json(
        { success: false, error: 'Payment service error' },
        { status: 502 }
      )
    }

    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Checkout failed' },
      { status: 500 }
    )
  }
}
```

---

## Fix 5: Secure Webhook Handler

See `STRIPE_PAYMENT_AUDIT.md` - Fix #3 section for complete webhook implementation.

---

## Fix 6: Payment Logger Service

### Create: `lib/payment-logger.ts`

```typescript
import prisma from './prisma'

export interface PaymentAction {
  userId: string
  orderId?: string
  action: string
  amount: number
  currency: string
  status: 'SUCCESS' | 'FAILED' | 'PROCESSING'
  error?: string
  ipAddress?: string
  userAgent?: string
}

/**
 * Structured logging for payment operations
 * Required for PCI DSS compliance (Requirement 10)
 */
export async function logPaymentAction(
  userId: string,
  orderId: string | undefined,
  action: string,
  amount: number,
  status: 'SUCCESS' | 'FAILED' | 'PROCESSING',
  error?: string
): Promise<void> {
  try {
    await prisma.paymentAuditLog.create({
      data: {
        userId,
        orderId,
        action,
        amount: amount > 0 ? new Decimal(amount) : null,
        currency: 'EUR',
        status,
        error: error?.substring(0, 255),
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
    })
  } catch (error) {
    console.error('[Payment Logger] Error logging action:', error)
    // Non-blocking - continue operation
  }
}

/**
 * Retrieves payment audit trail for order
 */
export async function getPaymentAuditTrail(orderId: string) {
  return prisma.paymentAuditLog.findMany({
    where: { orderId },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Retrieves recent payment activity for user
 */
export async function getUserPaymentHistory(
  userId: string,
  days: number = 30
) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  return prisma.paymentAuditLog.findMany({
    where: {
      userId,
      createdAt: { gte: since },
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Detects suspicious payment patterns
 */
export async function detectSuspiciousActivity(
  userId: string,
  timewindowMinutes: number = 10
) {
  const since = new Date(Date.now() - timewindowMinutes * 60 * 1000)

  const recentAttempts = await prisma.paymentAuditLog.findMany({
    where: {
      userId,
      createdAt: { gte: since },
      action: { startsWith: 'checkout' },
    },
  })

  return {
    attemptCount: recentAttempts.length,
    failureCount: recentAttempts.filter(a => a.status === 'FAILED').length,
    isSuspicious:
      recentAttempts.length > 5 ||
      recentAttempts.filter(a => a.status === 'FAILED').length > 3,
  }
}

// Import Decimal for proper decimal handling
import { Decimal } from '@prisma/client/runtime/library'
```

---

## Fix 7: Stripe Configuration Service

### Create: `lib/stripe-config.ts`

```typescript
import Stripe from 'stripe'

/**
 * Enhanced Stripe configuration with all security settings
 */
export function initStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    console.error('[Stripe] Secret key not configured')
    return null
  }

  if (!secretKey.startsWith('sk_')) {
    console.error('[Stripe] Invalid secret key format')
    return null
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[Stripe] Webhook secret not configured')
    return null
  }

  if (!webhookSecret.startsWith('whsec_')) {
    console.error('[Stripe] Invalid webhook secret format')
    return null
  }

  const apiVersion = (process.env.STRIPE_API_VERSION || '2024-12-18') as Stripe.LatestApiVersion

  return new Stripe(secretKey, {
    apiVersion,
    typescript: true,
    appInfo: {
      name: 'VIVR E-Commerce',
      version: '1.0.0',
    },
  })
}

/**
 * Get configured Stripe instance
 */
export const stripe = initStripe()

/**
 * Validates Stripe configuration at startup
 */
export function validateStripeConfiguration(): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!process.env.STRIPE_SECRET_KEY) {
    errors.push('STRIPE_SECRET_KEY not configured')
  } else if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    errors.push('STRIPE_SECRET_KEY has invalid format')
  }

  if (!process.env.STRIPE_PUBLISHABLE_KEY) {
    errors.push('STRIPE_PUBLISHABLE_KEY not configured')
  } else if (!process.env.STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
    errors.push('STRIPE_PUBLISHABLE_KEY has invalid format')
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    errors.push('STRIPE_WEBHOOK_SECRET not configured')
  } else if (!process.env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_')) {
    errors.push('STRIPE_WEBHOOK_SECRET has invalid format')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
```

---

## Fix 8: Environment Variables

### Update: `.env.example`

```bash
# === STRIPE CONFIGURATION ===
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# API version - use latest stable
STRIPE_API_VERSION="2024-12-18"

# Webhook configuration
STRIPE_WEBHOOK_TIMEOUT_MS="60000"
STRIPE_MAX_RETRIES="3"

# Idempotency
STRIPE_IDEMPOTENCY_ENABLED="true"

# === PAYMENT CONFIGURATION ===
PAYMENT_MIN_AMOUNT="0.50"
PAYMENT_MAX_AMOUNT="99999.99"
PAYMENT_CURRENCY="EUR"
PAYMENT_STATEMENT_DESCRIPTOR="VIVR"
PAYMENT_CAPTURE_METHOD="automatic"
PAYMENT_CONFIRMATION_METHOD="automatic"
PAYMENT_SUCCESS_URL="http://localhost:3000/checkout/success"
PAYMENT_CANCEL_URL="http://localhost:3000/panier"

# === PCI COMPLIANCE ===
PCI_DSS_LEVEL="3"
DATA_RETENTION_DAYS="90"
LOG_RETENTION_DAYS="365"

# === FRAUD PREVENTION ===
FRAUD_CHECK_ENABLED="true"
FRAUD_VELOCITY_CHECK="true"
FRAUD_GEOLOCATION_CHECK="false"
FRAUD_MAX_ATTEMPTS_PER_HOUR="10"

# === MONITORING ===
PAYMENT_LOGGING_ENABLED="true"
PAYMENT_AUDIT_ENABLED="true"
SENTRY_DSN=""  # For error tracking
```

---

## Fix 9: Database Migrations

### Create Migration

Run: `npx prisma migrate dev --name add_payment_tracking`

This will create migrations for:
- IdempotencyKey table
- WebhookEvent table
- PaymentAuditLog table
- Enhanced Order model fields

---

## Testing Checklist

### Unit Tests
```bash
npm test -- lib/idempotency.ts
npm test -- lib/price-verification.ts
npm test -- lib/validation.ts
npm test -- lib/payment-logger.ts
```

### Integration Tests
```bash
npm test -- __tests__/api/stripe/checkout.test.ts
npm test -- __tests__/api/stripe/webhook.test.ts
```

### Manual Testing
1. Create order with idempotency
2. Retry same checkout - should return cached response
3. Try price manipulation - should fail
4. Test webhook with duplicate event - should only process once
5. Try accessing another user's order - should fail

---

## Deployment Steps

1. **Pre-deployment**
   ```bash
   npm run build
   npm test
   npm run lint
   ```

2. **Database migration**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

3. **Environment setup**
   - Copy `.env.example` to `.env.production`
   - Set all required Stripe keys
   - Verify webhook secret matches Stripe dashboard

4. **Stripe configuration**
   - Update webhook endpoint URL
   - Enable all required events
   - Configure retry policy

5. **Post-deployment verification**
   - Test checkout flow in Stripe test mode
   - Verify webhook delivery
   - Check audit logs
   - Monitor error rates

---

## Production Monitoring

### Alerts to Setup
1. Payment failure rate > 5%
2. Webhook processing errors
3. Idempotency key mismatches
4. Price verification failures
5. Suspicious activity detected

### Dashboards
1. Payment volume and revenue
2. Error rates by type
3. Webhook performance
4. Fraud detection hits
5. Customer payment success rate

---

## Maintenance Tasks

### Daily
- Review payment audit logs for anomalies
- Monitor error rates

### Weekly
- Review fraud detection results
- Check webhook delivery rates
- Audit failed payment attempts

### Monthly
- Analyze payment patterns
- Review PCI compliance metrics
- Update fraud detection rules
- Clean expired idempotency keys

---

## Rollback Procedure

If critical issues found in production:

1. Disable checkout endpoint
   ```typescript
   // app/api/stripe/checkout/route.ts
   export async function POST() {
     return NextResponse.json(
       { error: 'Maintenance in progress' },
       { status: 503 }
     )
   }
   ```

2. Revert database changes
   ```bash
   npx prisma migrate resolve --rolled-back add_payment_tracking
   ```

3. Redeploy previous version
   ```bash
   git revert HEAD
   npm run build && npm start
   ```

---

## Support & Documentation

- **Stripe API Docs:** https://stripe.com/docs/api
- **Webhook Events:** https://stripe.com/docs/api/events/types
- **PCI Compliance:** https://stripe.com/docs/security/pci-compliance
- **Error Handling:** https://stripe.com/docs/error-handling
