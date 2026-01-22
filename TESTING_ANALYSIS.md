# VIVR E-Commerce Testing Analysis & Strategy

**Project:** Next.js 14 TypeScript E-Commerce Platform
**Framework Stack:** Jest, React Testing Library, Zustand, Stripe, NextAuth
**Analysis Date:** 2026-01-21
**Test Coverage:** 45.67% (463 tests passing)

---

## Table of Contents
1. [Current Test Coverage Analysis](#current-test-coverage-analysis)
2. [Critical Testing Gaps](#critical-testing-gaps)
3. [Test Quality Assessment](#test-quality-assessment)
4. [Missing Test Files Priority Matrix](#missing-test-files-priority-matrix)
5. [Example Test Code](#example-test-code)
6. [Implementation Roadmap](#implementation-roadmap)

---

## Current Test Coverage Analysis

### Overall Metrics
```
Total Test Suites: 20
Total Tests: 463
Coverage: 45.67%
Lines Covered: 191/418 source files
```

### Coverage by Category

#### ✅ Well-Covered Areas (90-100%)

| Category | Files | Coverage | Status |
|----------|-------|----------|--------|
| **UI Components** | 9 files | 100% | Complete |
| **Stores (Zustand)** | 4 files | 100% | Complete |
| **Utility Functions** | 1 file | 100% | Complete |

**UI Components Tested:**
- Badge.tsx
- Button.tsx
- Card.tsx
- Input.tsx
- Modal.tsx
- Select.tsx
- Skeleton.tsx
- Spinner.tsx
- Toast.tsx

**Store Tests:**
- cartStore.ts (100% coverage)
- toastStore.ts (100% coverage)
- userStore.ts (100% coverage)
- wishlistStore.ts (100% coverage)

#### ⚠️ Partially Covered Areas (10-50%)

| Category | Files | Coverage | Main Gaps |
|----------|-------|----------|-----------|
| **Components** | 8 files | 32.32% | ProductCard (edge cases), ProductGallery, ProductReviews |
| **Layout** | 3 files | 13.48% | Header interaction, Footer, SearchBar |
| **Cart Components** | 3 files | 11.90% | CartItem (edge cases), CartDrawer, CartSummary |
| **Library Code** | 6 files | 35% | Stripe integration, Auth logic, Prisma operations |

#### ❌ Not Covered (0%)

| Category | Files | Coverage | Impact |
|----------|-------|----------|--------|
| **API Routes** | 7 routes | 0% | CRITICAL |
| **Auth Routes** | 2 routes | 0% | CRITICAL |
| **Pages/Layouts** | 10+ files | 0% | HIGH |
| **Third-party Integration** | 4 files | 0% | HIGH |

---

## Critical Testing Gaps

### 🚨 CRITICAL (Must Test Immediately)

#### 1. **API Route Testing (0% coverage)**

**Missing Test Files:**
- `/app/api/auth/register/route.ts` - User registration
- `/app/api/stripe/checkout/route.ts` - Stripe checkout session creation
- `/app/api/stripe/webhook/route.ts` - Stripe payment webhook
- `/app/api/orders/route.ts` - Order creation & retrieval
- `/app/api/products/route.ts` - Product fetching
- `/app/api/products/[slug]/route.ts` - Individual product details
- `/app/api/reviews/route.ts` - Review operations

**Business Risk:** Payment flow is untested, registration failures unknown, order creation bugs

#### 2. **Checkout Flow Integration (0% coverage)**

**Missing Components:**
- `/app/(shop)/checkout/page.tsx` - Multi-step checkout form
- Multi-step form validation
- Shipping option selection logic
- Address form validation
- Stripe integration flow

**User Impact:** Complete checkout flow is unvalidated; payment failures could occur in production

#### 3. **Authentication & Security (0% coverage)**

**Missing Tests:**
- NextAuth registration flow
- Password hashing verification
- Unauthorized access handling
- Session validation
- Protected route access

**Security Risk:** Unauthorized users might access protected routes

#### 4. **Stripe Integration (0% coverage)**

**Missing Tests:**
- Checkout session creation
- Line item calculation
- Shipping rate integration
- Webhook processing
- Payment status updates
- Error handling for failed payments

**Financial Risk:** Payment processing untested; revenue-impacting bugs

### ⚠️ HIGH PRIORITY (Important Business Logic)

#### 5. **Product Components**

**ProductCard Issues:**
- Image switching on hover incomplete testing
- Wishlist toggle edge cases
- Stock status display
- Discount badge calculation

**ProductGallery:**
- Multi-image navigation
- Zoom functionality (if implemented)
- Image loading states

#### 6. **Cart Operations**

**CartSummary Untested:**
- Promo code application logic
- Free shipping threshold calculation
- Dynamic discount calculations
- Tax display accuracy

**CartDrawer:**
- Cart item removal UI
- Quantity update interactions
- Empty cart state

#### 7. **Header/Navigation**

**Header.tsx (60% coverage):**
- Search functionality
- Category navigation
- Cart badge updates
- User menu interactions

#### 8. **Product Filtering & Search**

**Missing:**
- Category filtering
- Price range filtering
- Search query processing
- Sort options (price, newest, popular)
- Pagination

---

## Test Quality Assessment

### Strengths ✅

1. **Comprehensive Unit Tests for Stores**
   - All Zustand stores have excellent coverage
   - Good mocking of localStorage
   - State transition testing

2. **UI Component Library Well-Tested**
   - Primitive components (Button, Input, Select) covered
   - Props validation included
   - Accessibility attributes tested

3. **Setup Configuration Solid**
   - Good mock setup in jest.setup.js
   - Next.js, NextAuth, and framer-motion mocked
   - Browser APIs properly mocked

### Weaknesses ⚠️

1. **No API Route Testing**
   - Critical routes completely untested
   - No request/response validation
   - No error handling verification

2. **Missing Integration Tests**
   - No end-to-end checkout flow tests
   - No authentication flows tested
   - No payment processing tests

3. **Limited Component Interaction Testing**
   - Form submissions incomplete
   - User interactions with complex components
   - Async operations (fetch calls) not covered

4. **No Snapshot Tests**
   - UI regression detection missing
   - Visual changes not tracked

5. **Limited Error Scenario Testing**
   - Network failures not tested
   - Validation error flows incomplete
   - Edge cases underrepresented

### Testing Anti-Patterns Found

```javascript
// ⚠️ Issue: localStorage mock not properly cleared between tests
// Missing: beforeEach(() => localStorage.clear())

// ⚠️ Issue: No proper async/await handling in some component tests
// Missing: waitFor() for state updates

// ⚠️ Issue: Insufficient error boundary testing
// Missing: error state scenarios
```

---

## Missing Test Files Priority Matrix

### Priority Level 1: CRITICAL (Week 1)

| Test File | Path | Lines of Code | Business Impact | Estimated Tests |
|-----------|------|---------------|-----------------|-----------------|
| **Stripe Checkout API** | `__tests__/api/stripe/checkout.test.ts` | ~400 | 🔴 Critical | 12 |
| **Auth Register API** | `__tests__/api/auth/register.test.ts` | ~250 | 🔴 Critical | 10 |
| **Orders API** | `__tests__/api/orders.test.ts` | ~300 | 🔴 Critical | 15 |
| **Checkout Page** | `__tests__/pages/checkout.test.tsx` | ~500 | 🔴 Critical | 20 |
| **CartSummary** | `__tests__/components/cart/CartSummary.test.tsx` | ~350 | 🔴 Critical | 15 |

**Subtotal: 52 tests, 70 coverage impact**

### Priority Level 2: HIGH (Week 2)

| Test File | Path | Lines of Code | Business Impact | Estimated Tests |
|-----------|------|---------------|-----------------|-----------------|
| **Products API** | `__tests__/api/products.test.ts` | ~250 | 🟠 High | 12 |
| **Reviews API** | `__tests__/api/reviews.test.ts` | ~200 | 🟠 High | 8 |
| **Stripe Webhook** | `__tests__/api/stripe/webhook.test.ts` | ~350 | 🟠 High | 14 |
| **ProductCard Full** | Enhanced `ProductCard.test.tsx` | +150 | 🟠 High | 10 |
| **Header Navigation** | Enhanced `Header.test.tsx` | +200 | 🟠 High | 12 |

**Subtotal: 56 tests, 50 coverage impact**

### Priority Level 3: MEDIUM (Week 3)

| Test File | Path | Lines of Code | Business Impact | Estimated Tests |
|-----------|------|---------------|-----------------|-----------------|
| **ProductGallery** | `__tests__/components/product/ProductGallery.test.tsx` | ~300 | 🟡 Medium | 10 |
| **ProductReviews** | `__tests__/components/product/ProductReviews.test.tsx` | ~400 | 🟡 Medium | 12 |
| **Categories Page** | `__tests__/pages/categories.test.tsx` | ~250 | 🟡 Medium | 10 |
| **Wishlist Page** | `__tests__/pages/wishlist.test.tsx` | ~150 | 🟡 Medium | 8 |
| **Cart Drawer** | `__tests__/components/cart/CartDrawer.test.tsx` | ~200 | 🟡 Medium | 8 |

**Subtotal: 48 tests, 35 coverage impact**

---

## Example Test Code

### 1. Stripe Checkout API Route Test

**File:** `/c/Users/freex/Desktop/Projet VS Code/VIVR/__tests__/api/stripe/checkout.test.ts`

```typescript
import { POST } from '@/app/api/stripe/checkout/route'
import { getServerSession } from 'next-auth'
import { createCheckoutSession } from '@/lib/stripe'
import { NextRequest } from 'next/server'

// Mock dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/stripe', () => ({
  createCheckoutSession: jest.fn(),
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
const mockCreateCheckoutSession = createCheckoutSession as jest.MockedFunction<typeof createCheckoutSession>

describe('POST /api/stripe/checkout', () => {
  const mockSession = {
    user: {
      id: 'user-1',
      email: 'user@example.com',
      name: 'Test User',
    },
  }

  const mockLineItems = [
    {
      name: 'Lampe Moderne',
      price: 89.99,
      quantity: 1,
      description: 'Salon',
      image: 'lamp.jpg',
    },
  ]

  const mockCheckoutSession = {
    id: 'cs_test_123',
    url: 'https://checkout.stripe.com/pay/test',
    payment_status: 'unpaid',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ items: mockLineItems }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toContain('connecté')
    })

    it('should return 401 when user has no email', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1', name: 'Test' },
      })

      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ items: mockLineItems }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    })
  })

  describe('Validation', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession)
    })

    it('should return 400 when cart is empty', async () => {
      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ items: [] }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('panier est vide')
    })

    it('should return 400 when items is null', async () => {
      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ items: null }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
    })

    it('should return 400 when items is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
    })
  })

  describe('Checkout Session Creation', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession)
      mockCreateCheckoutSession.mockResolvedValue(mockCheckoutSession as any)
    })

    it('should create checkout session with correct parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        headers: {
          origin: 'https://vivr.com',
        },
        body: JSON.stringify({ items: mockLineItems }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
        mockLineItems,
        'user@example.com',
        'https://vivr.com/checkout/success?session_id={CHECKOUT_SESSION_ID}',
        'https://vivr.com/panier',
        expect.objectContaining({
          userId: 'user-1',
          orderId: '',
        })
      )

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.sessionId).toBe('cs_test_123')
      expect(data.data.url).toBe('https://checkout.stripe.com/pay/test')
    })

    it('should use orderId from request if provided', async () => {
      const orderId = 'order-123'
      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ items: mockLineItems, orderId }),
      })

      await POST(request)

      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          orderId: 'order-123',
        })
      )
    })

    it('should use localhost as fallback origin', async () => {
      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ items: mockLineItems }),
      })

      // Don't set origin header
      await POST(request)

      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.stringContaining('http://localhost:3000'),
        expect.anything(),
        expect.anything()
      )
    })

    it('should return checkout session data', async () => {
      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ items: mockLineItems }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data).toEqual({
        success: true,
        data: {
          sessionId: 'cs_test_123',
          url: 'https://checkout.stripe.com/pay/test',
        },
      })
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession)
    })

    it('should handle Stripe errors gracefully', async () => {
      const stripeError = new Error('Stripe API error')
      mockCreateCheckoutSession.mockRejectedValue(stripeError)

      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ items: mockLineItems }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toContain('session')
    })

    it('should handle invalid JSON in request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
    })

    it('should log errors to console', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const error = new Error('Test error')
      mockCreateCheckoutSession.mockRejectedValue(error)

      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ items: mockLineItems }),
      })

      await POST(request)

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating checkout session:', error)
      consoleErrorSpy.mockRestore()
    })
  })

  describe('Multiple Items', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession)
      mockCreateCheckoutSession.mockResolvedValue(mockCheckoutSession as any)
    })

    it('should handle multiple line items', async () => {
      const multipleItems = [
        {
          name: 'Lampe Moderne',
          price: 89.99,
          quantity: 2,
          description: 'Salon',
        },
        {
          name: 'Chaise Scandinave',
          price: 199.99,
          quantity: 1,
          description: 'Salon',
        },
      ]

      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ items: multipleItems }),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(multipleItems, expect.anything(), expect.anything(), expect.anything(), expect.anything())
    })
  })
})
```

### 2. Orders API Route Test

**File:** `/c/Users/freex/Desktop/Projet VS Code/VIVR/__tests__/api/orders.test.ts`

```typescript
import { GET, POST } from '@/app/api/orders/route'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { NextRequest } from 'next/server'

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    order: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}))

jest.mock('@/lib/utils', () => ({
  generateOrderNumber: jest.fn(() => 'ORD-2024-001'),
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('Orders API', () => {
  const mockSession = {
    user: {
      id: 'user-1',
      email: 'user@example.com',
    },
  }

  const mockOrder = {
    id: 'order-1',
    orderNumber: 'ORD-2024-001',
    userId: 'user-1',
    subtotal: 89.99,
    shipping: 4.99,
    total: 94.98,
    paymentMethod: 'card',
    address: {
      street: '123 Main St',
      city: 'Paris',
      postalCode: '75001',
      country: 'FR',
    },
    items: [
      {
        id: 'item-1',
        orderId: 'order-1',
        productId: 'prod-1',
        name: 'Lampe Moderne',
        price: 89.99,
        quantity: 1,
        product: { id: 'prod-1', name: 'Lampe Moderne' },
      },
    ],
    createdAt: new Date('2024-01-20'),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/orders', () => {
    describe('Authentication', () => {
      it('should return 401 when user is not authenticated', async () => {
        mockGetServerSession.mockResolvedValue(null)

        const request = new NextRequest('http://localhost:3000/api/orders', {
          method: 'GET',
        })

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Non autorisé')
      })

      it('should return 401 when user has no ID', async () => {
        mockGetServerSession.mockResolvedValue({
          user: { email: 'user@example.com' },
        })

        const request = new NextRequest('http://localhost:3000/api/orders', {
          method: 'GET',
        })

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(401)
      })
    })

    describe('Fetching Orders', () => {
      beforeEach(() => {
        mockGetServerSession.mockResolvedValue(mockSession)
      })

      it('should fetch user orders sorted by creation date', async () => {
        mockPrisma.order.findMany.mockResolvedValue([mockOrder] as any)

        const request = new NextRequest('http://localhost:3000/api/orders', {
          method: 'GET',
        })

        const response = await GET(request)
        const data = await response.json()

        expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
          where: { userId: 'user-1' },
          include: {
            items: {
              include: { product: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        })

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toHaveLength(1)
        expect(data.data[0].id).toBe('order-1')
      })

      it('should convert Decimal fields to numbers', async () => {
        const orderWithDecimals = {
          ...mockOrder,
          subtotal: { toNumber: () => 89.99 },
          shipping: { toNumber: () => 4.99 },
          total: { toNumber: () => 94.98 },
        }
        mockPrisma.order.findMany.mockResolvedValue([orderWithDecimals] as any)

        const request = new NextRequest('http://localhost:3000/api/orders', {
          method: 'GET',
        })

        const response = await GET(request)
        const data = await response.json()

        expect(typeof data.data[0].subtotal).toBe('number')
        expect(typeof data.data[0].shipping).toBe('number')
        expect(typeof data.data[0].total).toBe('number')
        expect(typeof data.data[0].items[0].price).toBe('number')
      })

      it('should return empty array when user has no orders', async () => {
        mockPrisma.order.findMany.mockResolvedValue([])

        const request = new NextRequest('http://localhost:3000/api/orders', {
          method: 'GET',
        })

        const response = await GET(request)
        const data = await response.json()

        expect(data.success).toBe(true)
        expect(data.data).toEqual([])
      })

      it('should handle database errors', async () => {
        const error = new Error('Database connection failed')
        mockPrisma.order.findMany.mockRejectedValue(error)

        const request = new NextRequest('http://localhost:3000/api/orders', {
          method: 'GET',
        })

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.success).toBe(false)
      })
    })
  })

  describe('POST /api/orders', () => {
    describe('Authentication', () => {
      it('should return 401 when user is not authenticated', async () => {
        mockGetServerSession.mockResolvedValue(null)

        const request = new NextRequest('http://localhost:3000/api/orders', {
          method: 'POST',
          body: JSON.stringify({ items: [], subtotal: 0, shipping: 0 }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(401)
      })
    })

    describe('Order Creation', () => {
      beforeEach(() => {
        mockGetServerSession.mockResolvedValue(mockSession)
        mockPrisma.order.create.mockResolvedValue(mockOrder as any)
      })

      it('should create order with correct data', async () => {
        const orderData = {
          items: [
            {
              productId: 'prod-1',
              name: 'Lampe Moderne',
              price: 89.99,
              quantity: 1,
              image: 'lamp.jpg',
            },
          ],
          address: {
            street: '123 Main St',
            city: 'Paris',
            postalCode: '75001',
            country: 'FR',
          },
          paymentMethod: 'card',
          subtotal: 89.99,
          shipping: 4.99,
        }

        const request = new NextRequest('http://localhost:3000/api/orders', {
          method: 'POST',
          body: JSON.stringify(orderData),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(mockPrisma.order.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              userId: 'user-1',
              paymentMethod: 'card',
              address: orderData.address,
              subtotal: 89.99,
              shipping: 4.99,
              total: 94.98,
            }),
          })
        )

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data.id).toBe('order-1')
      })

      it('should calculate total correctly', async () => {
        const orderData = {
          items: [],
          address: {},
          paymentMethod: 'card',
          subtotal: 100,
          shipping: 10,
        }

        const request = new NextRequest('http://localhost:3000/api/orders', {
          method: 'POST',
          body: JSON.stringify(orderData),
        })

        await POST(request)

        expect(mockPrisma.order.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              total: 110,
            }),
          })
        )
      })

      it('should create order items with product data', async () => {
        const orderData = {
          items: [
            {
              productId: 'prod-1',
              name: 'Product 1',
              price: 50,
              quantity: 2,
              image: 'img.jpg',
            },
            {
              productId: 'prod-2',
              name: 'Product 2',
              price: 30,
              quantity: 1,
            },
          ],
          address: {},
          paymentMethod: 'card',
          subtotal: 130,
          shipping: 5,
        }

        const request = new NextRequest('http://localhost:3000/api/orders', {
          method: 'POST',
          body: JSON.stringify(orderData),
        })

        await POST(request)

        const callArgs = (mockPrisma.order.create as jest.Mock).mock.calls[0][0]
        expect(callArgs.data.items.create).toHaveLength(2)
        expect(callArgs.data.items.create[0]).toMatchObject({
          productId: 'prod-1',
          name: 'Product 1',
          price: 50,
          quantity: 2,
          image: 'img.jpg',
        })
      })
    })

    describe('Validation', () => {
      beforeEach(() => {
        mockGetServerSession.mockResolvedValue(mockSession)
      })

      it('should handle invalid JSON', async () => {
        const request = new NextRequest('http://localhost:3000/api/orders', {
          method: 'POST',
          body: 'invalid json',
        })

        const response = await POST(request)

        expect(response.status).toBe(500)
      })
    })

    describe('Error Handling', () => {
      beforeEach(() => {
        mockGetServerSession.mockResolvedValue(mockSession)
      })

      it('should handle database errors during creation', async () => {
        const error = new Error('Unique constraint failed')
        mockPrisma.order.create.mockRejectedValue(error)

        const request = new NextRequest('http://localhost:3000/api/orders', {
          method: 'POST',
          body: JSON.stringify({ items: [], address: {}, paymentMethod: 'card', subtotal: 0, shipping: 0 }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.success).toBe(false)
      })
    })
  })
})
```

### 3. Checkout Page Integration Test

**File:** `/c/Users/freex/Desktop/Projet VS Code/VIVR/__tests__/pages/checkout.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CheckoutPage from '@/app/(shop)/checkout/page'
import { useSession } from 'next-auth/react'
import { useCartStore } from '@/stores/cartStore'
import { useRouter } from 'next/navigation'

jest.mock('next-auth/react')
jest.mock('next/navigation')

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('CheckoutPage', () => {
  const mockRouterPush = jest.fn()
  const mockRouterRefresh = jest.fn()

  const mockProduct = {
    id: 'prod-1',
    name: 'Lampe Moderne',
    slug: 'lampe-moderne',
    price: 89.99,
    images: ['lamp.jpg'],
    category: {
      id: 'cat-1',
      name: 'Salon',
      slug: 'salon',
    },
    categoryId: 'cat-1',
    stock: 10,
    featured: false,
    reviews: [],
    createdAt: new Date(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({
      push: mockRouterPush,
      refresh: mockRouterRefresh,
    } as any)

    // Add items to cart
    useCartStore.getState().clearCart()
    useCartStore.getState().addItem(mockProduct, 1)
  })

  describe('Authentication Check', () => {
    it('should redirect to login when not authenticated', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      } as any)

      render(<CheckoutPage />)

      await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledWith('/connexion?callbackUrl=/checkout')
      })
    })

    it('should show loading state while session is loading', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
        update: jest.fn(),
      } as any)

      render(<CheckoutPage />)

      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('Cart Check', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user-1',
            email: 'user@example.com',
            name: 'Test User',
          },
        },
        status: 'authenticated',
        update: jest.fn(),
      } as any)
    })

    it('should redirect to cart when cart is empty', async () => {
      useCartStore.getState().clearCart()

      render(<CheckoutPage />)

      await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledWith('/panier')
      })
    })

    it('should display checkout form when authenticated with items', () => {
      render(<CheckoutPage />)

      expect(screen.getByText('Adresse de livraison')).toBeInTheDocument()
    })
  })

  describe('Multi-Step Checkout', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user-1',
            email: 'user@example.com',
            name: 'Test User',
          },
        },
        status: 'authenticated',
        update: jest.fn(),
      } as any)
    })

    it('should display address step first', () => {
      render(<CheckoutPage />)

      expect(screen.getByText('Adresse de livraison')).toBeInTheDocument()
      expect(screen.getByLabelText('Prénom')).toBeInTheDocument()
      expect(screen.getByLabelText('Nom')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
    })

    it('should move to shipping step on continue', async () => {
      const user = userEvent.setup()
      render(<CheckoutPage />)

      // Fill address form
      await user.type(screen.getByLabelText('Prénom'), 'Jean')
      await user.type(screen.getByLabelText('Nom'), 'Dupont')
      await user.type(screen.getByLabelText('Téléphone'), '0612345678')
      await user.type(screen.getByLabelText('Adresse'), '123 Rue de la Paix')
      await user.type(screen.getByLabelText('Ville'), 'Paris')
      await user.type(screen.getByLabelText('Code postal'), '75001')

      const continueButton = screen.getByRole('button', { name: /continuer/i })
      await user.click(continueButton)

      await waitFor(() => {
        expect(screen.getByText('Mode de livraison')).toBeInTheDocument()
      })
    })

    it('should move to payment step from shipping', async () => {
      const user = userEvent.setup()
      render(<CheckoutPage />)

      // Move to shipping step
      const addresses = [
        { label: 'Prénom', value: 'Jean' },
        { label: 'Nom', value: 'Dupont' },
        { label: 'Téléphone', value: '0612345678' },
        { label: 'Adresse', value: '123 Rue de la Paix' },
        { label: 'Ville', value: 'Paris' },
        { label: 'Code postal', value: '75001' },
      ]

      for (const { label, value } of addresses) {
        await user.type(screen.getByLabelText(label), value)
      }

      await user.click(screen.getByRole('button', { name: /continuer/i }))

      await waitFor(() => {
        expect(screen.getByText('Mode de livraison')).toBeInTheDocument()
      })

      // Move to payment
      await user.click(screen.getByRole('button', { name: /continuer/i }))

      await waitFor(() => {
        expect(screen.getByText('Paiement')).toBeInTheDocument()
      })
    })

    it('should show payment step with Stripe info', async () => {
      const user = userEvent.setup()
      render(<CheckoutPage />)

      // Skip to payment step
      const fields = ['Prénom', 'Nom', 'Téléphone', 'Adresse', 'Ville', 'Code postal']
      for (const field of fields) {
        await user.type(screen.getByLabelText(field), 'Test')
      }

      await user.click(screen.getByRole('button', { name: /continuer/i }))
      await waitFor(() => {
        expect(screen.getByText('Mode de livraison')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /continuer/i }))
      await waitFor(() => {
        expect(screen.getByText('Paiement sécurisé par Stripe')).toBeInTheDocument()
      })
    })
  })

  describe('Shipping Options', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user-1',
            email: 'user@example.com',
          },
        },
        status: 'authenticated',
        update: jest.fn(),
      } as any)
    })

    it('should display all shipping options', async () => {
      const user = userEvent.setup()
      render(<CheckoutPage />)

      // Move to shipping step
      const fields = ['Prénom', 'Nom', 'Adresse', 'Ville', 'Code postal']
      for (const field of fields) {
        await user.type(screen.getByLabelText(field), 'Test')
      }

      await user.click(screen.getByRole('button', { name: /continuer/i }))

      await waitFor(() => {
        expect(screen.getByText('Livraison standard')).toBeInTheDocument()
        expect(screen.getByText('Livraison express')).toBeInTheDocument()
        expect(screen.getByText('Livraison gratuite')).toBeInTheDocument()
      })
    })

    it('should disable free shipping when order total is below threshold', async () => {
      // Create a cart with total < 50
      useCartStore.getState().clearCart()
      const cheapProduct = { ...mockProduct, price: 25 }
      useCartStore.getState().addItem(cheapProduct, 1)

      const user = userEvent.setup()
      render(<CheckoutPage />)

      // Move to shipping step
      const fields = ['Prénom', 'Nom', 'Adresse', 'Ville', 'Code postal']
      for (const field of fields) {
        await user.type(screen.getByLabelText(field), 'Test')
      }

      await user.click(screen.getByRole('button', { name: /continuer/i }))

      await waitFor(() => {
        const freeShippingRadio = screen.getByLabelText(/Livraison gratuite/, { selector: 'input' })
        expect(freeShippingRadio).toBeDisabled()
      })
    })

    it('should update total with selected shipping cost', async () => {
      const user = userEvent.setup()
      render(<CheckoutPage />)

      // Move to shipping
      const fields = ['Prénom', 'Nom', 'Adresse', 'Ville', 'Code postal']
      for (const field of fields) {
        await user.type(screen.getByLabelText(field), 'Test')
      }

      await user.click(screen.getByRole('button', { name: /continuer/i }))

      await waitFor(() => {
        expect(screen.getByText('Mode de livraison')).toBeInTheDocument()
      })

      // Express shipping costs 9.99
      const expressRadio = screen.getByLabelText(/Livraison express/, { selector: 'input' })
      await user.click(expressRadio)

      // Total should be 89.99 (product) + 9.99 (shipping) = 99.98
      expect(screen.getByText(/99,98/)).toBeInTheDocument()
    })
  })

  describe('Order Summary', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user-1',
            email: 'user@example.com',
          },
        },
        status: 'authenticated',
        update: jest.fn(),
      } as any)
    })

    it('should display order summary sidebar', () => {
      render(<CheckoutPage />)

      expect(screen.getByText('Récapitulatif')).toBeInTheDocument()
      expect(screen.getByText('Lampe Moderne')).toBeInTheDocument()
    })

    it('should show product image in summary', () => {
      render(<CheckoutPage />)

      const summarySection = screen.getByText('Récapitulatif').closest('div')
      const image = within(summarySection!).getByAltText('Lampe Moderne')
      expect(image).toBeInTheDocument()
    })

    it('should display quantity badge on product image', () => {
      render(<CheckoutPage />)

      const badge = screen.getByText('1').closest('span')
      expect(badge).toHaveClass('bg-black')
    })
  })

  describe('Checkout Action', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user-1',
            email: 'user@example.com',
          },
        },
        status: 'authenticated',
        update: jest.fn(),
      } as any)

      global.fetch = jest.fn()
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should call Stripe checkout API on payment', async () => {
      const user = userEvent.setup()
      const mockFetch = global.fetch as jest.Mock
      mockFetch.mockResolvedValue({
        json: async () => ({
          success: true,
          data: {
            sessionId: 'cs_test_123',
            url: 'https://checkout.stripe.com/pay/test',
          },
        }),
      })

      render(<CheckoutPage />)

      // Complete all steps
      const fields = ['Prénom', 'Nom', 'Adresse', 'Ville', 'Code postal']
      for (const field of fields) {
        await user.type(screen.getByLabelText(field), 'Test')
      }

      // Move to payment
      await user.click(screen.getByRole('button', { name: /continuer/i }))
      await waitFor(() => {
        expect(screen.getByText('Mode de livraison')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /continuer/i }))
      await waitFor(() => {
        expect(screen.getByText('Paiement')).toBeInTheDocument()
      })

      // Trigger payment
      const payButton = screen.getByRole('button', { name: /Payer/ })
      await user.click(payButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/stripe/checkout', expect.any(Object))
      })
    })

    it('should redirect to Stripe on successful checkout', async () => {
      const user = userEvent.setup()
      const mockFetch = global.fetch as jest.Mock
      const stripeUrl = 'https://checkout.stripe.com/pay/test'

      mockFetch.mockResolvedValue({
        json: async () => ({
          success: true,
          data: {
            sessionId: 'cs_test_123',
            url: stripeUrl,
          },
        }),
      })

      delete (window as any).location
      ;(window as any).location = { href: '' }

      render(<CheckoutPage />)

      // Complete checkout
      const fields = ['Prénom', 'Nom', 'Adresse', 'Ville', 'Code postal']
      for (const field of fields) {
        await user.type(screen.getByLabelText(field), 'Test')
      }

      await user.click(screen.getAllByRole('button', { name: /continuer/i })[0])
      await waitFor(() => {
        expect(screen.getByText('Mode de livraison')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /continuer/i }))
      await waitFor(() => {
        expect(screen.getByText('Paiement')).toBeInTheDocument()
      })

      const payButton = screen.getByRole('button', { name: /Payer/ })
      await user.click(payButton)

      await waitFor(() => {
        expect(window.location.href).toBe(stripeUrl)
      })
    })

    it('should show error message on API failure', async () => {
      const user = userEvent.setup()
      const mockFetch = global.fetch as jest.Mock
      mockFetch.mockResolvedValue({
        json: async () => ({
          success: false,
          error: 'Erreur Stripe',
        }),
      })

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation()

      render(<CheckoutPage />)

      // Complete checkout
      const fields = ['Prénom', 'Nom', 'Adresse', 'Ville', 'Code postal']
      for (const field of fields) {
        await user.type(screen.getByLabelText(field), 'Test')
      }

      await user.click(screen.getAllByRole('button', { name: /continuer/i })[0])
      await waitFor(() => {
        expect(screen.getByText('Mode de livraison')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /continuer/i }))
      await waitFor(() => {
        expect(screen.getByText('Paiement')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /Payer/ }))

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Erreur Stripe')
      })

      alertSpy.mockRestore()
    })
  })

  describe('Navigation', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user-1',
            email: 'user@example.com',
          },
        },
        status: 'authenticated',
        update: jest.fn(),
      } as any)
    })

    it('should show back to cart button on first step', () => {
      render(<CheckoutPage />)

      const backLink = screen.getByRole('link', { name: /Retour au panier/ })
      expect(backLink).toHaveAttribute('href', '/panier')
    })

    it('should show previous button on step 2+', async () => {
      const user = userEvent.setup()
      render(<CheckoutPage />)

      // Move to step 2
      const fields = ['Prénom', 'Nom', 'Adresse', 'Ville', 'Code postal']
      for (const field of fields) {
        await user.type(screen.getByLabelText(field), 'Test')
      }

      await user.click(screen.getByRole('button', { name: /continuer/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Retour/i })).toBeInTheDocument()
      })
    })

    it('should navigate backward correctly', async () => {
      const user = userEvent.setup()
      render(<CheckoutPage />)

      // Move to step 2
      const fields = ['Prénom', 'Nom', 'Adresse', 'Ville', 'Code postal']
      for (const field of fields) {
        await user.type(screen.getByLabelText(field), 'Test')
      }

      await user.click(screen.getByRole('button', { name: /continuer/i }))
      await waitFor(() => {
        expect(screen.getByText('Mode de livraison')).toBeInTheDocument()
      })

      // Go back
      await user.click(screen.getByRole('button', { name: /Retour/i }))

      expect(screen.getByText('Adresse de livraison')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user-1',
            email: 'user@example.com',
          },
        },
        status: 'authenticated',
        update: jest.fn(),
      } as any)
    })

    it('should have proper heading hierarchy', () => {
      render(<CheckoutPage />)

      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(0)
    })

    it('should have properly labeled form inputs', () => {
      render(<CheckoutPage />)

      expect(screen.getByLabelText('Prénom')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Adresse')).toBeInTheDocument()
    })

    it('should have breadcrumb navigation', () => {
      render(<CheckoutPage />)

      expect(screen.getByText('Accueil')).toBeInTheDocument()
      expect(screen.getByText('Panier')).toBeInTheDocument()
      expect(screen.getByText('Checkout')).toBeInTheDocument()
    })
  })
})
```

### 4. CartSummary Component Test

**File:** `/c/Users/freex/Desktop/Projet VS Code/VIVR/__tests__/components/cart/CartSummary.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CartSummary } from '@/components/cart/CartSummary'
import { useCartStore } from '@/stores/cartStore'
import { Product, Category } from '@/types'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}))

describe('CartSummary', () => {
  const mockCategory: Category = {
    id: 'cat-1',
    name: 'Salon',
    slug: 'salon',
  }

  const mockProduct: Product = {
    id: 'prod-1',
    name: 'Lampe Moderne',
    slug: 'lampe-moderne',
    description: 'Une belle lampe',
    price: 89.99,
    images: ['lamp.jpg'],
    category: mockCategory,
    categoryId: 'cat-1',
    stock: 10,
    featured: false,
    reviews: [],
    createdAt: new Date(),
  }

  beforeEach(() => {
    useCartStore.getState().clearCart()
  })

  describe('Rendering', () => {
    it('should render title', () => {
      render(<CartSummary />)
      expect(screen.getByText('Résumé de la commande')).toBeInTheDocument()
    })

    it('should display subtotal', () => {
      useCartStore.getState().addItem(mockProduct, 2)
      render(<CartSummary />)

      expect(screen.getByText(/2 articles/)).toBeInTheDocument()
      expect(screen.getByText(/179,98/)).toBeInTheDocument()
    })

    it('should display shipping cost', () => {
      useCartStore.getState().addItem(mockProduct, 1)
      render(<CartSummary />)

      expect(screen.getByText('Livraison')).toBeInTheDocument()
      expect(screen.getByText(/4,99/)).toBeInTheDocument()
    })

    it('should display free shipping message when applicable', () => {
      // Add multiple items to reach threshold of 50
      useCartStore.getState().addItem(mockProduct, 1)
      const expensiveProduct = { ...mockProduct, id: 'prod-2', price: 100 }
      useCartStore.getState().addItem(expensiveProduct, 1)

      render(<CartSummary />)

      expect(screen.getByText('Gratuite')).toBeInTheDocument()
    })
  })

  describe('Shipping Calculation', () => {
    const FREE_SHIPPING_THRESHOLD = 50

    it('should charge shipping when total is below threshold', () => {
      const cheapProduct = { ...mockProduct, price: 30 }
      useCartStore.getState().addItem(cheapProduct, 1)

      render(<CartSummary />)

      expect(screen.getByText(/4,99/)).toBeInTheDocument()
    })

    it('should offer free shipping when total meets threshold', () => {
      // Total = 89.99, which is > 50
      useCartStore.getState().addItem(mockProduct, 1)

      render(<CartSummary />)

      expect(screen.getByText('Gratuite')).toBeInTheDocument()
    })

    it('should show progress bar when shipping cost applies', () => {
      const cheapProduct = { ...mockProduct, price: 30 }
      useCartStore.getState().addItem(cheapProduct, 1)

      const { container } = render(<CartSummary />)

      const progressBar = container.querySelector('.bg-success')
      expect(progressBar).toBeInTheDocument()
    })

    it('should calculate progress percentage correctly', () => {
      const cheapProduct = { ...mockProduct, price: 25 }
      useCartStore.getState().addItem(cheapProduct, 1)

      const { container } = render(<CartSummary />)

      const progressBar = container.querySelector('[style*="width"]')
      // 25/50 = 50%
      expect(progressBar).toHaveStyle('width: 50%')
    })
  })

  describe('Promo Code', () => {
    beforeEach(() => {
      useCartStore.getState().addItem(mockProduct, 1)
    })

    it('should render promo code input', () => {
      render(<CartSummary />)

      expect(screen.getByPlaceholderText('Code promo')).toBeInTheDocument()
    })

    it('should render apply button', () => {
      render(<CartSummary />)

      expect(screen.getByRole('button', { name: /Appliquer/i })).toBeInTheDocument()
    })

    it('should apply valid promo code', async () => {
      const user = userEvent.setup()
      render(<CartSummary />)

      const input = screen.getByPlaceholderText('Code promo')
      const button = screen.getByRole('button', { name: /Appliquer/i })

      await user.type(input, 'BIENVENUE10')
      await user.click(button)

      expect(screen.getByText(/BIENVENUE10 appliqué/)).toBeInTheDocument()
    })

    it('should show error for invalid promo code', async () => {
      const user = userEvent.setup()
      render(<CartSummary />)

      const input = screen.getByPlaceholderText('Code promo')
      const button = screen.getByRole('button', { name: /Appliquer/i })

      await user.type(input, 'INVALID')
      await user.click(button)

      expect(screen.getByText('Code promo invalide')).toBeInTheDocument()
    })

    it('should disable apply button when input is empty', () => {
      render(<CartSummary />)

      const button = screen.getByRole('button', { name: /Appliquer/i })
      expect(button).toBeDisabled()
    })

    it('should disable apply button after successful promo application', async () => {
      const user = userEvent.setup()
      render(<CartSummary />)

      const input = screen.getByPlaceholderText('Code promo')
      const button = screen.getByRole('button', { name: /Appliquer/i })

      await user.type(input, 'BIENVENUE10')
      await user.click(button)

      await waitFor(() => {
        expect(button).toBeDisabled()
      })
    })

    it('should apply 10% discount for BIENVENUE10 code', async () => {
      const user = userEvent.setup()
      render(<CartSummary />)

      // Initial total: 89.99
      expect(screen.getByText(/89,99/)).toBeInTheDocument()

      const input = screen.getByPlaceholderText('Code promo')
      await user.type(input, 'BIENVENUE10')
      await user.click(screen.getByRole('button', { name: /Appliquer/i }))

      // Discount: 8.999 (rounded to 9.00)
      // Final: 89.99 - 9.00 + 4.99 = 85.98
      expect(screen.getByText(/85,98/)).toBeInTheDocument()
    })

    it('should clear error when user types after failed promo', async () => {
      const user = userEvent.setup()
      render(<CartSummary />)

      const input = screen.getByPlaceholderText('Code promo')
      const button = screen.getByRole('button', { name: /Appliquer/i })

      // Try invalid code
      await user.type(input, 'INVALID')
      await user.click(button)
      expect(screen.getByText('Code promo invalide')).toBeInTheDocument()

      // Type new code
      await user.clear(input)
      await user.type(input, 'BIENVENUE10')

      // Error should be cleared
      expect(screen.queryByText('Code promo invalide')).not.toBeInTheDocument()
    })
  })

  describe('Discount Display', () => {
    beforeEach(() => {
      useCartStore.getState().addItem(mockProduct, 1)
    })

    it('should not display discount when no promo applied', () => {
      render(<CartSummary />)

      expect(screen.queryByText(/Réduction/)).not.toBeInTheDocument()
    })

    it('should display discount row when promo applied', async () => {
      const user = userEvent.setup()
      render(<CartSummary />)

      const input = screen.getByPlaceholderText('Code promo')
      await user.type(input, 'BIENVENUE10')
      await user.click(screen.getByRole('button', { name: /Appliquer/i }))

      expect(screen.getByText('Réduction')).toBeInTheDocument()
    })

    it('should display discount in green', async () => {
      const user = userEvent.setup()
      const { container } = render(<CartSummary />)

      const input = screen.getByPlaceholderText('Code promo')
      await user.type(input, 'BIENVENUE10')
      await user.click(screen.getByRole('button', { name: /Appliquer/i }))

      const discountElement = screen.getByText('Réduction').parentElement
      expect(discountElement).toHaveClass('text-success')
    })
  })

  describe('Total Calculation', () => {
    it('should display total with all components', () => {
      useCartStore.getState().addItem(mockProduct, 1)
      render(<CartSummary />)

      // 89.99 + 4.99 = 94.98
      const totalElement = screen.getByText(/94,98/)
      expect(totalElement).toBeInTheDocument()
      expect(totalElement).toHaveClass('text-xl', 'font-bold')
    })

    it('should calculate correct total with discount', async () => {
      const user = userEvent.setup()
      useCartStore.getState().addItem(mockProduct, 1)
      render(<CartSummary />)

      const input = screen.getByPlaceholderText('Code promo')
      await user.type(input, 'BIENVENUE10')
      await user.click(screen.getByRole('button', { name: /Appliquer/i }))

      // 89.99 - (89.99 * 0.1) + 4.99 = 85.98
      await waitFor(() => {
        expect(screen.getByText(/85,98/)).toBeInTheDocument()
      })
    })

    it('should display tax notice', () => {
      render(<CartSummary />)

      expect(screen.getByText('TVA incluse')).toBeInTheDocument()
    })
  })

  describe('Checkout Button', () => {
    beforeEach(() => {
      useCartStore.getState().addItem(mockProduct, 1)
    })

    it('should show checkout button by default', () => {
      render(<CartSummary />)

      expect(screen.getByRole('link', { name: /Passer la commande/i })).toBeInTheDocument()
    })

    it('should hide checkout button when showCheckoutButton is false', () => {
      render(<CartSummary showCheckoutButton={false} />)

      expect(screen.queryByRole('link', { name: /Passer la commande/i })).not.toBeInTheDocument()
    })

    it('should link to checkout page', () => {
      render(<CartSummary />)

      const checkoutLink = screen.getByRole('link', { name: /Passer la commande/i })
      expect(checkoutLink).toHaveAttribute('href', '/checkout')
    })

    it('should display continue shopping link', () => {
      render(<CartSummary />)

      const continueLink = screen.getByRole('link', { name: /Continuer mes achats/i })
      expect(continueLink).toHaveAttribute('href', '/produits')
    })
  })

  describe('Trust Badges', () => {
    it('should display trust badges', () => {
      render(<CartSummary />)

      expect(screen.getByText('Paiement sécurisé')).toBeInTheDocument()
      expect(screen.getByText('Retours gratuits')).toBeInTheDocument()
      expect(screen.getByText('Livraison rapide')).toBeInTheDocument()
    })
  })

  describe('Article Count', () => {
    it('should display singular article text', () => {
      useCartStore.getState().addItem(mockProduct, 1)
      render(<CartSummary />)

      expect(screen.getByText(/1 article[^s]/)).toBeInTheDocument()
    })

    it('should display plural articles text', () => {
      useCartStore.getState().addItem(mockProduct, 3)
      render(<CartSummary />)

      expect(screen.getByText(/3 articles/)).toBeInTheDocument()
    })
  })

  describe('Responsive', () => {
    it('should accept custom className', () => {
      const { container } = render(
        <CartSummary className="custom-class" />
      )

      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
  })
})
```

---

## Implementation Roadmap

### Phase 1: Critical API Routes (Week 1)

**Files to Create:**
1. `__tests__/api/stripe/checkout.test.ts` - Stripe checkout session creation
2. `__tests__/api/auth/register.test.ts` - User registration validation
3. `__tests__/api/orders.test.ts` - Order CRUD operations
4. `__tests__/pages/checkout.test.tsx` - Multi-step checkout flow

**Action Items:**
- Use provided test templates above
- Mock NextAuth and Stripe properly
- Test authentication checks on all routes
- Validate input sanitization and error handling
- Test database operations with Prisma mocks

### Phase 2: Component Enhancements (Week 2)

**Files to Create/Enhance:**
1. Enhance `CartItem.test.tsx` with edge cases (out of stock, max quantity)
2. Create `__tests__/components/cart/CartSummary.test.tsx`
3. Create `__tests__/components/cart/CartDrawer.test.tsx`
4. Enhance `ProductCard.test.tsx` with image switching, discount calculations
5. Create `__tests__/components/product/ProductGallery.test.tsx`

**Action Items:**
- Add comprehensive interaction testing
- Test form submissions and validations
- Test async state updates with waitFor
- Add accessibility testing
- Test error states and loading states

### Phase 3: Integration Tests (Week 3)

**Files to Create:**
1. `__tests__/integration/checkout-flow.test.tsx` - End-to-end checkout
2. `__tests__/integration/product-discovery.test.tsx` - Browse → Cart
3. `__tests__/integration/user-auth.test.tsx` - Register → Login → Checkout

**Action Items:**
- Test complete user journeys
- Mock all external APIs consistently
- Validate data persistence across components
- Test error recovery flows

### Phase 4: API & Business Logic (Week 4)

**Files to Create:**
1. `__tests__/api/products.test.ts` - Product fetching and filtering
2. `__tests__/api/reviews.test.ts` - Review operations
3. `__tests__/api/stripe/webhook.test.ts` - Payment webhook processing
4. `__tests__/lib/stripe.test.ts` - Stripe utility functions
5. `__tests__/lib/auth.test.ts` - Authentication utilities

**Action Items:**
- Test filtering and sorting logic
- Test webhook signature verification
- Test business calculations (discounts, totals)
- Test error scenarios (network failures, timeouts)

### Quick Start Commands

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm test __tests__/api/stripe/checkout.test.ts

# Update snapshots
npm test -- -u

# Debug tests
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## Coverage Goals

### Current State
- **Overall Coverage:** 45.67%
- **Lines:** 191/418
- **Branches:** Not fully tracked
- **Functions:** Varies by category
- **Statements:** Varies by category

### Target Goals (6-Month Plan)

| Phase | Timeline | Coverage | Focus |
|-------|----------|----------|-------|
| Phase 1 | Week 1 | 55% | Critical paths |
| Phase 2 | Week 2 | 65% | Components |
| Phase 3 | Week 3 | 75% | Integration |
| Phase 4 | Week 4 | 85% | Complete coverage |
| Maintenance | Ongoing | 85%+ | New features |

### Coverage Targets by Category

| Category | Current | Phase 1 | Phase 4 | Method |
|----------|---------|---------|---------|--------|
| API Routes | 0% | 80% | 95% | Add unit tests |
| Components | 32% | 60% | 90% | Enhance existing |
| Stores | 100% | 100% | 100% | Maintain |
| Pages | 0% | 40% | 85% | Integration tests |
| Lib | 35% | 70% | 95% | Add unit tests |

---

## Best Practices Applied

### Testing Patterns ✅

1. **Arrange-Act-Assert (AAA)**
   - Clear test structure
   - One assertion per test concept
   - Descriptive test names

2. **Mocking Strategy**
   - Mock external dependencies (Stripe, NextAuth, Prisma)
   - Use realistic mock data
   - Clear mock reset between tests

3. **Async Testing**
   - Proper use of `waitFor()` and `act()`
   - Handle promises correctly
   - Wait for state updates

4. **Error Testing**
   - Test error paths, not just happy paths
   - Validate error messages
   - Test error recovery

5. **Accessibility**
   - Query by accessible names (role, label, text)
   - Test keyboard navigation
   - Validate ARIA attributes

### Tools & Configuration

**Testing Framework:** Jest 29.7.0
**Component Testing:** React Testing Library 16.3.2
**User Interaction:** @testing-library/user-event 14.6.1
**Assertion Library:** Jest (built-in) + @testing-library/jest-dom

---

## Maintenance & Monitoring

### Continuous Integration Checklist

- [ ] All tests pass before merge
- [ ] Coverage maintained at 85%+
- [ ] No console errors in tests
- [ ] New features include tests
- [ ] API changes updated in mocks
- [ ] Third-party library updates reflected

### Code Review Checklist

- [ ] Test covers happy path
- [ ] Test covers error cases
- [ ] Mocks are appropriate
- [ ] Async operations handled
- [ ] Test naming is clear
- [ ] No flaky/random failures

---

## Resources & References

- [Jest Documentation](https://jestjs.io)
- [React Testing Library Docs](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [NextAuth Testing](https://next-auth.js.org/getting-started/example)

---

**Generated:** 2026-01-21
**Project:** VIVR E-Commerce Platform
**Analysis By:** Test Automation Engineer

