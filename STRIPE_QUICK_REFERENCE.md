# Stripe Payment Integration - Quick Reference

## Critical Files to Review/Fix

| File | Issue | Severity | Status |
|------|-------|----------|--------|
| `lib/stripe.ts` | Outdated API version, no idempotency | CRITICAL | NOT FIXED |
| `app/api/stripe/checkout/route.ts` | No input validation, price manipulation vulnerable | CRITICAL | NOT FIXED |
| `app/api/stripe/webhook/route.ts` | Incomplete event handling, no state validation | CRITICAL | NOT FIXED |
| `app/api/orders/route.ts` | No idempotency, order state not verified | HIGH | NOT FIXED |
| `prisma/schema.prisma` | Missing payment fields | MEDIUM | NOT FIXED |

---

## 10-Step Production Readiness Checklist

### Step 1: Implement Idempotency ⚠️ CRITICAL
- [ ] Create `lib/idempotency.ts`
- [ ] Add `IdempotencyKey` table to Prisma schema
- [ ] Update checkout route to use idempotency
- [ ] Add idempotency check to order creation
- [ ] Test duplicate request handling

**Files:** `lib/idempotency.ts`, `app/api/stripe/checkout/route.ts`, `prisma/schema.prisma`

### Step 2: Add Input Validation ⚠️ CRITICAL
- [ ] Create `lib/validation.ts` with Zod schemas
- [ ] Validate all checkout requests
- [ ] Validate order creation requests
- [ ] Return detailed validation errors
- [ ] Test with malformed requests

**Files:** `lib/validation.ts`, `app/api/stripe/checkout/route.ts`, `app/api/orders/route.ts`

### Step 3: Verify Prices Against Database ⚠️ CRITICAL
- [ ] Create `lib/price-verification.ts`
- [ ] Verify each cart item exists in DB
- [ ] Check prices match exactly
- [ ] Verify stock availability
- [ ] Test price manipulation attack

**Files:** `lib/price-verification.ts`, `app/api/stripe/checkout/route.ts`

### Step 4: Fix Order State Management ⚠️ CRITICAL
- [ ] Update webhook to check order status before updating
- [ ] Use atomic transactions with state verification
- [ ] Add unique constraint on order creation
- [ ] Validate Stripe amount matches order total
- [ ] Test race conditions

**Files:** `app/api/stripe/webhook/route.ts`, `prisma/schema.prisma`

### Step 5: Implement Refund System ⚠️ CRITICAL
- [ ] Create refund endpoint: `app/api/stripe/refunds/route.ts`
- [ ] Handle `charge.refunded` webhook event
- [ ] Add refund fields to Order model
- [ ] Implement refund audit logging
- [ ] Test refund flow end-to-end

**Files:** `app/api/stripe/refunds/route.ts`, `app/api/stripe/webhook/route.ts`, `prisma/schema.prisma`

### Step 6: Add Webhook Event Handling ✓ PARTIALLY DONE
- [ ] Handle `checkout.session.expired`
- [ ] Handle `payment_intent.canceled`
- [ ] Handle `charge.dispute.created` (chargebacks)
- [ ] Handle `charge.refunded`
- [ ] Add webhook idempotency/retry tracking

**Files:** `app/api/stripe/webhook/route.ts`, `prisma/schema.prisma`

### Step 7: Implement Error Handling & Logging
- [ ] Create `lib/payment-logger.ts` for structured logging
- [ ] Implement error categorization in checkout
- [ ] Add retry logic for transient errors
- [ ] Create PCI-compliant audit trail
- [ ] Setup monitoring/alerting

**Files:** `lib/payment-logger.ts`, `app/api/stripe/checkout/route.ts`, `app/api/stripe/webhook/route.ts`

### Step 8: Add Security Hardening
- [ ] Add rate limiting to payment endpoints
- [ ] Implement origin validation
- [ ] Add request size limits
- [ ] Implement fraud detection checks
- [ ] Add IP address logging

**Files:** `middleware.ts`, `app/api/stripe/checkout/route.ts`, `lib/payment-logger.ts`

### Step 9: Update Database Schema
- [ ] Add `IdempotencyKey` table
- [ ] Add `WebhookEvent` table
- [ ] Add `PaymentAuditLog` table
- [ ] Add payment fields to `Order` table
- [ ] Run migrations

**Files:** `prisma/schema.prisma`

### Step 10: Configuration & Documentation
- [ ] Update `.env.example` with all variables
- [ ] Document PCI compliance measures
- [ ] Create incident response plan
- [ ] Setup webhook configuration
- [ ] Update team documentation

**Files:** `.env.example`, `STRIPE_PAYMENT_AUDIT.md`

---

## Security Audit Scoring

### Current State: 25/100 (Production: NOT READY)

```
Authentication & Authorization:     40/50
├─ ✓ User verification
├─ ✓ Order ownership checks
├─ ✗ Rate limiting
└─ ✗ Request signing

Payment Security:                    15/50
├─ ✗ Idempotency keys
├─ ✗ Amount verification
├─ ✗ Price verification
└─ ✗ 3D Secure

Data Protection:                     20/30
├─ ✓ No card storage
├─ ✗ Logging/masking
├─ ✗ Data retention policy
└─ ✗ Encryption config

Webhook Security:                    30/50
├─ ✓ Signature verification
├─ ✗ Event idempotency
├─ ✗ Retry tracking
└─ ✗ Error handling

Fraud Prevention:                    0/50
├─ ✗ Velocity checking
├─ ✗ Pattern detection
├─ ✗ Geographic checks
└─ ✗ Duplicate prevention

Monitoring & Compliance:             10/50
├─ ✗ Structured logging
├─ ✗ Audit trail
├─ ✗ PCI documentation
└─ ✗ Incident response
```

**Target: 85/100 for production deployment**

---

## Code Snippets for Quick Implementation

### Quick Fix: Add Idempotency to Checkout

```typescript
// In app/api/stripe/checkout/route.ts
import { generateIdempotencyKey, getIdempotencyResponse, storeIdempotencyResponse } from '@/lib/idempotency'

// Add after auth check:
const idempotencyKey = generateIdempotencyKey(session.user.id, 'checkout', { items })
const cached = await getIdempotencyResponse(idempotencyKey)
if (cached.exists) return NextResponse.json(cached.response, { status: cached.status })

// After successful checkout:
await storeIdempotencyResponse(idempotencyKey, session.user.id, 'checkout', response, 200)
```

### Quick Fix: Verify Prices

```typescript
// In app/api/stripe/checkout/route.ts
import { verifyCartItems } from '@/lib/price-verification'

const verification = await verifyCartItems(items)
if (!verification.valid) {
  return NextResponse.json(
    { success: false, error: 'Cart verification failed', details: verification.errors },
    { status: 400 }
  )
}
```

### Quick Fix: Validate Order State

```typescript
// In app/api/stripe/webhook/route.ts
case 'checkout.session.completed': {
  const updated = await prisma.order.updateMany({
    where: {
      id: session.metadata.orderId,
      status: 'PENDING', // Only update if PENDING
    },
    data: {
      status: 'PAID',
      paymentId: session.payment_intent as string,
    },
  })

  if (updated.count === 0) {
    console.warn('[Webhook] Order not in PENDING state')
  }
  break
}
```

---

## Security Headers Recommendation

Add to `next.config.js`:

```javascript
headers: async () => {
  return [
    {
      source: '/api/stripe/:path*',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains',
        },
      ],
    },
  ]
}
```

---

## Environment Variables - Production Setup

```bash
# Test Mode (development)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# Production Setup
STRIPE_SECRET_KEY=sk_live_... # MUST be live key
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...

# Features
PAYMENT_CURRENCY=EUR
PAYMENT_MIN_AMOUNT=0.50
PAYMENT_MAX_AMOUNT=99999.99

# Compliance
PCI_DSS_LEVEL=3
DATA_RETENTION_DAYS=90
LOG_RETENTION_DAYS=365
```

---

## Testing Scenarios

### Test 1: Price Manipulation
```bash
1. Add item to cart (price: $100)
2. Send checkout request with modified price (0.01)
3. Expected: Error - "Price mismatch"
4. Expected: Audit log entry
```

### Test 2: Duplicate Checkout
```bash
1. Send checkout request
2. Immediately resend same request
3. Expected: Cached response with same sessionId
4. Expected: No duplicate Stripe session created
```

### Test 3: Race Condition
```bash
1. Send checkout request (starts processing)
2. Send second checkout request before first completes
3. Expected: Idempotency prevents duplicate charge
4. Expected: User sees same checkout session
```

### Test 4: Webhook Idempotency
```bash
1. Send webhook event
2. Immediately resend same webhook
3. Expected: Second webhook ignored
4. Expected: No duplicate order status updates
```

### Test 5: Order Ownership
```bash
1. Get Order ID from User A
2. Try to checkout as User B with User A's Order ID
3. Expected: Error - "Unauthorized"
4. Expected: Audit log of unauthorized attempt
```

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Checkout API response time | < 500ms | Unknown |
| Price verification time | < 100ms | Unknown |
| Webhook processing time | < 1s | Unknown |
| Idempotency check time | < 50ms | Unknown |
| Error rate | < 0.1% | Unknown |

---

## Incident Response Procedures

### Payment Processing Down
1. Disable checkout endpoint (return 503)
2. Notify customers via banner
3. Investigate root cause
4. Fix issue
5. Re-enable with monitoring
6. Send customer notification

### Webhook Failures
1. Check webhook endpoint logs
2. Manually verify failed orders in Stripe dashboard
3. Replay failed webhooks from Stripe UI
4. Update audit logs
5. Notify affected customers

### Fraud Detected
1. Flag orders in suspicious activity log
2. Cancel payment if not yet captured
3. Contact user for verification
4. Review patterns in audit logs
5. Adjust fraud detection rules

### Data Breach Suspected
1. Immediately disable checkout
2. Notify Stripe support
3. Review audit logs for unauthorized access
4. Force password reset for all users
5. Notify customers
6. Report to authorities if required

---

## Compliance Checklist - PCI DSS v3.2.1

### Requirement 1: Firewall Configuration
- [ ] Firewall deployed and documented
- [ ] Inbound/outbound rules documented
- [ ] Default deny policy

### Requirement 2: No Default Passwords
- [ ] All default passwords changed
- [ ] Database credentials secured
- [ ] API keys rotated

### Requirement 3: Data Protection
- [ ] No credit card data stored
- [ ] Data retention policy < 90 days
- [ ] Encryption in transit verified (TLS 1.2+)

### Requirement 4: Encryption
- [ ] HTTPS enforced
- [ ] TLS 1.2 minimum
- [ ] Certificate valid and trusted

### Requirement 5: Antivirus
- [ ] Antivirus deployed
- [ ] Signatures up to date
- [ ] Scanning enabled

### Requirement 6: Security Patches
- [ ] Patch management process
- [ ] All systems patched
- [ ] Dependencies updated

### Requirement 7: Access Control
- [ ] Role-based access control
- [ ] User provisioning documented
- [ ] Access reviewed quarterly

### Requirement 8: User Authentication
- [ ] Strong passwords enforced
- [ ] MFA enabled
- [ ] Password policies documented

### Requirement 9: Physical Security
- [ ] Physical access restricted
- [ ] Video surveillance
- [ ] Access logs maintained

### Requirement 10: Logging & Monitoring
- [ ] Payment events logged (see `PaymentAuditLog`)
- [ ] Logs protected from alteration
- [ ] Log retention > 1 year
- [ ] Logs reviewed for anomalies

### Requirement 11: Security Testing
- [ ] Quarterly vulnerability scans
- [ ] Annual penetration testing
- [ ] Remediation tracking

### Requirement 12: Security Policy
- [ ] Written security policy
- [ ] Incident response plan
- [ ] Annual risk assessment

---

## Quick Deployment Commands

```bash
# Prepare
npm run lint
npm run test
npm run build

# Database
npx prisma migrate deploy
npx prisma generate

# Deploy
git add .
git commit -m "fix: Stripe payment security audit fixes"
git push

# Verify
curl -X POST https://yourapi.com/api/stripe/checkout \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items": [{"productId": "test", "quantity": 1, "price": 10}]}'

# Monitor
tail -f logs/payment.log
```

---

## Rollout Strategy

### Phase 1: Staging (1 week)
- Deploy to staging environment
- Run full test suite
- Load test with 1000 concurrent users
- Security team review
- Get sign-off

### Phase 2: Limited Rollout (2 weeks)
- Deploy to 10% of production traffic
- Monitor error rates
- Verify webhook delivery
- Review payment success rate
- Get stakeholder approval

### Phase 3: Full Rollout (1 week)
- Deploy to 100% of production
- Real-time monitoring
- Incident response team on standby
- Customer communication plan

### Phase 4: Post-Deployment (ongoing)
- Weekly metrics review
- Monthly security audit
- Quarterly penetration testing
- Continuous monitoring

---

## Support Contacts

- **Stripe Support:** https://support.stripe.com
- **Stripe Security:** security@stripe.com
- **PCI-DSS Questions:** compliance@stripe.com
- **Webhook Issues:** Use Stripe dashboard Events tab

---

## Additional Resources

- **Stripe Security:** https://stripe.com/docs/security
- **PCI Compliance Guide:** https://stripe.com/files/stripe-pci-compliance-guide.pdf
- **API Best Practices:** https://stripe.com/docs/payments/best-practices
- **Webhook Documentation:** https://stripe.com/docs/webhooks
- **Error Handling:** https://stripe.com/docs/error-handling

---

**Last Updated:** 2026-01-21
**Next Review:** 2026-02-21
