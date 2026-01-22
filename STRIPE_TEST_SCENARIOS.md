# Stripe Payment Integration - Test Scenarios & Test Data

## Test Scenarios Overview

This document provides detailed test scenarios, test data, and expected outcomes for the Stripe payment integration.

---

## Test Data Setup

### Test Products

```typescript
// Seed test products
const testProducts = [
  {
    name: 'Test Product A',
    slug: 'test-product-a',
    description: 'Test product for payment testing',
    price: new Decimal('99.99'),
    stock: 100,
    categoryId: 'test-category-1',
  },
  {
    name: 'Test Product B',
    slug: 'test-product-b',
    description: 'Second test product',
    price: new Decimal('49.99'),
    stock: 50,
    categoryId: 'test-category-1',
  },
  {
    name: 'Out of Stock Product',
    slug: 'out-of-stock',
    description: 'Product with no stock',
    price: new Decimal('29.99'),
    stock: 0,
    categoryId: 'test-category-1',
  },
]
```

### Test Users

```typescript
const testUsers = [
  {
    email: 'test-user-1@example.com',
    password: 'TestPassword123!',
    name: 'Test User 1',
  },
  {
    email: 'test-user-2@example.com',
    password: 'TestPassword456!',
    name: 'Test User 2',
  },
  {
    email: 'fraud-test@example.com',
    password: 'TestPassword789!',
    name: 'Fraud Test User',
  },
]
```

### Test Stripe Cards

| Card Number | Exp | CVC | Result | Use Case |
|------------|-----|-----|--------|----------|
| 4242 4242 4242 4242 | 12/25 | 123 | SUCCESS | Successful charge |
| 4000 0000 0000 0002 | 12/25 | 123 | DECLINE | Card declined |
| 4000 0000 0000 0069 | 12/25 | 123 | DECLINE | Expired card |
| 4000 0000 0000 0127 | 12/25 | 123 | 3D SECURE | 3D Secure required |
| 4000 0000 0000 9995 | 12/25 | 123 | BLOCK | Insufficient funds |
| 5555 5555 5555 4444 | 12/25 | 123 | SUCCESS | Mastercard |
| 3782 822463 10005 | 12/25 | 1234 | SUCCESS | American Express |

---

## Test Scenario 1: Happy Path - Normal Purchase

### Description
User completes full checkout flow successfully with valid payment

### Setup
1. Authenticate as test-user-1@example.com
2. Add Test Product A (qty: 1) to cart
3. Total: 99.99 EUR + 4.99 shipping = 104.98 EUR

### Steps
```bash
1. POST /api/orders
   Request:
   {
     "items": [
       {
         "productId": "test-product-a",
         "name": "Test Product A",
         "price": 99.99,
         "quantity": 1
       }
     ],
     "address": {
       "firstName": "Test",
       "lastName": "User",
       "email": "test-user-1@example.com",
       "phone": "+33612345678",
       "street": "123 Main St",
       "city": "Paris",
       "postalCode": "75001",
       "country": "FR"
     },
     "paymentMethod": "stripe",
     "subtotal": 99.99,
     "shipping": 4.99
   }

   Expected: 200 OK, returns orderId

2. POST /api/stripe/checkout
   Request:
   {
     "items": [
       {
         "productId": "test-product-a",
         "name": "Test Product A",
         "price": 99.99,
         "quantity": 1,
         "image": "/images/product-a.jpg"
       }
     ],
     "orderId": "<orderId from step 1>"
   }

   Expected: 200 OK, returns Stripe session URL

3. User completes Stripe payment with card 4242 4242 4242 4242

   Expected: Redirected to /checkout/success?session_id=<sessionId>

4. Webhook: checkout.session.completed
   Expected: Order status updated to PAID
   Expected: PaymentId stored
```

### Verification
```typescript
// Check order status
const order = await prisma.order.findUnique({
  where: { id: orderId },
})
assert(order.status === 'PAID')
assert(order.paymentId !== null)
assert(order.total === 104.98)

// Check audit log
const logs = await prisma.paymentAuditLog.findMany({
  where: { orderId }
})
assert(logs.some(l => l.action === 'checkout_started'))
assert(logs.some(l => l.action === 'checkout_session_created'))

// Check webhook processed
const webhook = await prisma.webhookEvent.findFirst({
  where: { stripeEventId: event.id }
})
assert(webhook !== null)
assert(webhook.processedAt !== null)
```

### Expected Outcomes
- ✓ Order created with PENDING status
- ✓ Checkout session created
- ✓ User redirected to success page
- ✓ Webhook received and processed
- ✓ Order marked as PAID
- ✓ Audit log entries created

---

## Test Scenario 2: Price Manipulation Attack

### Description
User attempts to modify product price in checkout request

### Setup
Same as Test Scenario 1, but modify price in step 2

### Steps
```bash
POST /api/stripe/checkout
Request:
{
  "items": [
    {
      "productId": "test-product-a",
      "name": "Test Product A",
      "price": 0.01,  // ATTACKER MODIFIED: Should be 99.99
      "quantity": 1
    }
  ],
  "orderId": "<orderId>"
}

Expected: 400 Bad Request
Error: "Price mismatch: expected 99.99, got 0.01"
```

### Verification
```typescript
// Confirm no Stripe session created
const sessions = await stripe.checkout.sessions.list()
const maliciousSession = sessions.data.find(s => s.metadata?.orderId === orderId)
assert(maliciousSession === undefined)

// Check audit log
const logs = await prisma.paymentAuditLog.findMany({
  where: { orderId }
})
assert(logs.some(l => l.action === 'checkout_price_verification_failed'))
assert(logs.some(l => l.status === 'FAILED'))
```

### Expected Outcomes
- ✗ Request rejected
- ✗ No Stripe session created
- ✗ No charge attempted
- ✓ Audit log created with FAILED status
- ✓ Error message returned to user

---

## Test Scenario 3: Duplicate Idempotent Request

### Description
User accidentally sends checkout request twice (network retry)

### Setup
1. User completes to checkout step
2. Network error occurs
3. User retries same request

### Steps
```bash
REQUEST 1:
POST /api/stripe/checkout
Request body: { items: [...], orderId: "order-123" }
Response: 200 OK
{
  "success": true,
  "data": {
    "sessionId": "cs_test_123",
    "url": "https://checkout.stripe.com/..."
  }
}

REQUEST 2 (Duplicate, same body):
POST /api/stripe/checkout
Request body: { items: [...], orderId: "order-123" }
Response: 200 OK
{
  "success": true,
  "data": {
    "sessionId": "cs_test_123",  // SAME SESSION ID
    "url": "https://checkout.stripe.com/..."
  }
}
```

### Verification
```typescript
// Both requests should return identical session IDs
assert(response1.data.sessionId === response2.data.sessionId)

// Only one Stripe session should exist
const sessions = await stripe.checkout.sessions.list({
  limit: 100
})
const relatedSessions = sessions.data.filter(s => s.metadata?.orderId === 'order-123')
assert(relatedSessions.length === 1)

// Check idempotency key
const idempotencyKey = await prisma.idempotencyKey.findFirst({
  where: { userId: session.user.id }
})
assert(idempotencyKey !== null)
assert(idempotencyKey.response.sessionId === 'cs_test_123')
```

### Expected Outcomes
- ✓ Second request returns cached response
- ✓ Same session ID returned
- ✓ Only one Stripe session created
- ✓ Idempotency key stored and retrieved
- ✓ User not charged twice

---

## Test Scenario 4: Webhook Duplicate Processing

### Description
Stripe sends same webhook event twice (network retry)

### Setup
1. Payment completed
2. Webhook delivered
3. Stripe retries webhook (rare but possible)

### Steps
```bash
WEBHOOK 1:
Event: checkout.session.completed
Event ID: evt_test_123
{
  "id": "evt_test_123",
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_456",
      "status": "complete",
      "amount_total": 10498,
      "currency": "eur",
      "metadata": {
        "orderId": "order-123"
      }
    }
  }
}

WEBHOOK 2 (Duplicate):
Same event ID: evt_test_123
Same payload
```

### Verification
```typescript
// First webhook processing
const webhook1Result = await processWebhook(event1)
assert(webhook1Result.success === true)

// Check webhook recorded
let webhookRecord = await prisma.webhookEvent.findUnique({
  where: { stripeEventId: 'evt_test_123' }
})
assert(webhookRecord !== null)
assert(webhookRecord.processedAt !== null)

// Second webhook processing
const webhook2Result = await processWebhook(event2)
assert(webhook2Result.success === true) // Still succeeds but doesn't reprocess

// Verify order only updated once
const orderUpdates = await prisma.paymentAuditLog.findMany({
  where: {
    orderId: 'order-123',
    action: 'checkout_session_completed'
  }
})
assert(orderUpdates.length === 1) // Only one update

// Check webhook retry tracking
webhookRecord = await prisma.webhookEvent.findUnique({
  where: { stripeEventId: 'evt_test_123' }
})
assert(webhookRecord.retries === 1)
```

### Expected Outcomes
- ✓ Both webhook calls succeed
- ✓ Order only updated once (not twice)
- ✓ Webhook event recorded with retry count
- ✓ No duplicate charge or audit entries
- ✓ Idempotent processing verified

---

## Test Scenario 5: Payment Failure

### Description
User attempts payment with declined card

### Setup
1. User adds items to cart
2. Initiates checkout
3. Uses card: 4000 0000 0000 0002 (will be declined)

### Steps
```bash
1. POST /api/stripe/checkout
   Returns valid session and Stripe URL

2. User enters card 4000 0000 0000 0002 in Stripe checkout
   Stripe declines the card

3. Stripe sends webhook: payment_intent.payment_failed
   {
     "type": "payment_intent.payment_failed",
     "data": {
       "object": {
         "id": "pi_test_failed",
         "status": "requires_payment_method",
         "last_payment_error": {
           "message": "Your card was declined"
         },
         "metadata": {
           "orderId": "order-456"
         }
       }
     }
   }
```

### Verification
```typescript
// Check order status
const order = await prisma.order.findUnique({
  where: { id: 'order-456' }
})
assert(order.status === 'PENDING') // Reset to PENDING for retry
assert(order.paymentFailureReason !== null)

// Check audit log
const logs = await prisma.paymentAuditLog.findMany({
  where: { orderId: 'order-456' }
})
const failureLog = logs.find(l => l.action === 'payment_failed')
assert(failureLog !== null)
assert(failureLog.error !== null)

// Check user notification (should be sent)
const notification = await prisma.notification.findFirst({
  where: { userId, orderId: 'order-456' }
})
// Should exist if notification system implemented
```

### Expected Outcomes
- ✓ User sees error in Stripe checkout
- ✓ No charge created
- ✓ Order remains PENDING
- ✓ Webhook received and processed
- ✓ Audit log entry created
- ✓ User notified of failure
- ✓ Can retry with different card

---

## Test Scenario 6: Unauthorized Order Access

### Description
User attempts to checkout using another user's order

### Setup
1. Create order by User A (email: test-user-1@example.com)
2. Authenticate as User B (email: test-user-2@example.com)
3. Attempt checkout with User A's orderId

### Steps
```bash
1. As User A:
   POST /api/orders
   Create order, get orderId: "order-userA"

   User A session token: "<tokenA>"

2. As User B:
   POST /api/stripe/checkout
   Headers: Authorization: Bearer <tokenB>
   Request:
   {
     "items": [...],
     "orderId": "order-userA"  // UNAUTHORIZED
   }

   Expected: 403 Forbidden
   Error: "Unauthorized"
```

### Verification
```typescript
// Confirm request rejected
const response = await fetch('/api/stripe/checkout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${tokenUserB}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    items: [...],
    orderId: 'order-userA'
  })
})

assert(response.status === 403)
const data = await response.json()
assert(data.error === 'Unauthorized')

// Check audit log
const logs = await prisma.paymentAuditLog.findMany({
  where: { orderId: 'order-userA' }
})
const unauthorized = logs.find(l => l.action === 'checkout_unauthorized_order')
assert(unauthorized !== null)

// Confirm no Stripe session created
const sessions = await stripe.checkout.sessions.list()
const userBSession = sessions.data.find(s => s.metadata?.orderId === 'order-userA')
assert(userBSession === undefined)
```

### Expected Outcomes
- ✗ Request rejected with 403 Forbidden
- ✗ No Stripe session created
- ✗ No charge attempted
- ✓ Audit log records unauthorized attempt
- ✓ Security alert triggered

---

## Test Scenario 7: Out of Stock Product

### Description
User attempts to checkout with product that's out of stock

### Setup
1. Add Test Product C (stock: 0) to cart
2. Initiate checkout

### Steps
```bash
POST /api/stripe/checkout
Request:
{
  "items": [
    {
      "productId": "out-of-stock-product",
      "name": "Out of Stock Product",
      "price": 29.99,
      "quantity": 1
    }
  ]
}

Expected: 400 Bad Request
Error: "Insufficient stock: 0 available, 1 requested"
```

### Verification
```typescript
// Confirm error returned
assert(response.status === 400)
assert(response.body.error === 'Cart verification failed')
assert(response.body.details[0].error.includes('Insufficient stock'))

// Confirm no order created
const orders = await prisma.order.findMany({
  where: { userId: session.user.id }
})
const newOrder = orders[orders.length - 1]
assert(newOrder.status !== 'PENDING' || newOrder.items[0].quantity !== 1)

// Confirm no Stripe session
const sessions = await stripe.checkout.sessions.list()
assert(sessions.data.length === 0)
```

### Expected Outcomes
- ✗ Request rejected
- ✗ No order created
- ✗ No Stripe session created
- ✓ Clear error message about stock
- ✓ User can modify cart and retry

---

## Test Scenario 8: Refund Processing

### Description
User requests refund for completed order

### Setup
1. Complete successful payment (Test Scenario 1)
2. Order in PAID status
3. User requests refund

### Steps
```bash
1. POST /api/stripe/refunds
   Request:
   {
     "orderId": "order-123",
     "reason": "customer_request"
   }

   Expected: 200 OK
   {
     "success": true,
     "refundId": "re_test_789"
   }

2. Stripe processes refund

3. Webhook: charge.refunded
   {
     "type": "charge.refunded",
     "data": {
       "object": {
         "id": "ch_test_456",
         "refunded": true,
         "amount_refunded": 10498
       }
     }
   }
```

### Verification
```typescript
// Check order status
const order = await prisma.order.findUnique({
  where: { id: 'order-123' }
})
assert(order.status === 'REFUNDED')
assert(order.refundId !== null)
assert(order.refundedAt !== null)

// Check refund amount
assert(order.refundAmount === 104.98)

// Check audit log
const logs = await prisma.paymentAuditLog.findMany({
  where: { orderId: 'order-123' }
})
const refundLog = logs.find(l => l.action === 'refund_completed')
assert(refundLog !== null)

// Verify Stripe refund
const refund = await stripe.refunds.retrieve('re_test_789')
assert(refund.status === 'succeeded')
```

### Expected Outcomes
- ✓ Refund request accepted
- ✓ Refund created in Stripe
- ✓ Webhook received
- ✓ Order status updated to REFUNDED
- ✓ Refund amount tracked
- ✓ User notified

---

## Test Scenario 9: Chargeback/Dispute

### Description
Stripe receives dispute for completed payment

### Setup
1. Completed order: order-789
2. Customer files dispute with bank
3. Stripe receives dispute notification

### Steps
```bash
Webhook: charge.dispute.created
{
  "type": "charge.dispute.created",
  "data": {
    "object": {
      "id": "dp_test_dispute",
      "charge": "ch_test_789",
      "reason": "fraudulent",
      "status": "warning_under_review",
      "amount": 10498
    }
  }
}
```

### Verification
```typescript
// Check order marked as disputed
const order = await prisma.order.findUnique({
  where: { id: 'order-789' }
})
assert(order.status === 'DISPUTED')

// Check audit log
const logs = await prisma.paymentAuditLog.findMany({
  where: { orderId: 'order-789' }
})
const disputeLog = logs.find(l => l.action === 'charge_dispute_created')
assert(disputeLog !== null)

// Alert sent to admin
const alert = await prisma.adminAlert.findFirst({
  where: { type: 'DISPUTE', orderId: 'order-789' }
})
assert(alert !== null)
```

### Expected Outcomes
- ✓ Order marked as DISPUTED
- ✓ Audit log entry created
- ✓ Admin notification sent
- ✓ Monitoring alert triggered
- ✓ Manual review flagged

---

## Test Scenario 10: High-Value Transaction

### Description
User attempts very large purchase (fraud prevention test)

### Setup
1. Authenticate as normal user
2. Add $9,999 worth of products
3. Initiate checkout

### Steps
```bash
POST /api/stripe/checkout
Request:
{
  "items": [
    {
      "productId": "expensive-item",
      "name": "Expensive Product",
      "price": 9999.00,
      "quantity": 1
    }
  ]
}
```

### Verification
```typescript
// Should allow but trigger fraud checks
assert(response.status === 200)

// Check fraud detection logs
const fraudCheck = await prisma.fraudCheck.findFirst({
  where: {
    userId: session.user.id,
    amount: 9999.00
  }
})
assert(fraudCheck.riskLevel === 'high' || 'medium')

// 3D Secure should be enforced
const session = await stripe.checkout.sessions.retrieve(sessionId)
assert(session.payment_intent_data?.confirmation_method === 'manual')

// Audit log should reflect high-value transaction
const logs = await prisma.paymentAuditLog.findMany({
  where: { userId: session.user.id }
})
const highValue = logs.find(l => l.amount === 9999.00)
assert(highValue !== null)
```

### Expected Outcomes
- ✓ Request accepted
- ✓ Fraud risk assessed
- ✓ 3D Secure potentially required
- ✓ Audit logged
- ✓ Admin monitoring alert

---

## Performance Test Scenarios

### Test Scenario 11: Load Test - 100 Concurrent Checkouts

```bash
Tool: Apache Bench or Artillery
Target: POST /api/stripe/checkout
Concurrent Users: 100
Duration: 5 minutes
Expected Results:
- Response time: < 500ms (p95)
- Error rate: < 0.1%
- Throughput: > 20 requests/second
```

### Test Scenario 12: Webhook Throughput

```bash
Test: 1000 webhook events in 1 minute
Expected Results:
- All events processed
- Latency: < 1s per event
- No lost events
- Proper ordering maintained
```

---

## Automation Test Template

```typescript
// tests/payment.test.ts
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'

describe('Payment Integration', () => {
  let testUser: any
  let testProduct: any

  beforeAll(async () => {
    // Setup test data
    testUser = await setupTestUser()
    testProduct = await setupTestProduct()
  })

  afterAll(async () => {
    // Cleanup
    await cleanupTestData()
  })

  it('should complete successful payment flow', async () => {
    // Test Scenario 1
  })

  it('should reject price manipulation', async () => {
    // Test Scenario 2
  })

  it('should handle idempotent requests', async () => {
    // Test Scenario 3
  })

  // ... more tests
})
```

---

## Test Execution Checklist

### Pre-Test
- [ ] Set Stripe to test mode
- [ ] Clear test data from previous runs
- [ ] Verify database connectivity
- [ ] Check webhook endpoint accessibility
- [ ] Confirm test API keys configured

### During Test
- [ ] Monitor application logs
- [ ] Watch Stripe webhook logs
- [ ] Monitor database queries
- [ ] Check error rates
- [ ] Verify audit logs being created

### Post-Test
- [ ] Generate test report
- [ ] Document any failures
- [ ] Review performance metrics
- [ ] Clean up test data
- [ ] Update test results in tracking system

---

## Expected Test Results

| Scenario | Success Rate | Avg Time | Notes |
|----------|--------------|----------|-------|
| Happy Path | 100% | 450ms | All steps complete |
| Price Manipulation | 100% | 200ms | Rejected quickly |
| Idempotency | 100% | 50ms | Cached response |
| Duplicate Webhook | 100% | 100ms | No double processing |
| Payment Failure | 100% | 800ms | Proper error handling |
| Unauthorized Access | 100% | 150ms | Rejected at auth |
| Out of Stock | 100% | 250ms | Validation works |
| Refund | 95%* | 2s | *Stripe dependent |
| Chargeback | 100% | 100ms | Webhook processing |
| High Value | 100% | 600ms | Fraud checks pass |

---

**Note:** All tests should be run with Stripe TEST keys. Never test with LIVE keys!
