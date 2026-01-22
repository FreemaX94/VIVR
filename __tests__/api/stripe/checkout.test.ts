import { getServerSession } from 'next-auth'
import { createCheckoutSession } from '@/lib/stripe'

// Mock NextRequest before importing the route
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: jest.fn(),
}))

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
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
        multipleItems,
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything()
      )
    })

    it('should accept items without description', async () => {
      const itemsWithoutDesc = [
        {
          name: 'Product',
          price: 50,
          quantity: 1,
        },
      ]

      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ items: itemsWithoutDesc }),
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
    })
  })
})
