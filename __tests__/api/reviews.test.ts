/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { POST, GET } from '@/app/api/reviews/route'

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

// Mock auth options
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    product: {
      findUnique: jest.fn(),
    },
    review: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    orderItem: {
      findFirst: jest.fn(),
    },
  },
}))

import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'

const mockGetServerSession = getServerSession as jest.Mock
const mockPrisma = prisma as jest.Mocked<typeof prisma>

function createMockPostRequest(body: object): NextRequest {
  return new NextRequest('http://localhost:3000/api/reviews', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

function createMockGetRequest(productId?: string): NextRequest {
  const url = productId
    ? `http://localhost:3000/api/reviews?productId=${productId}`
    : 'http://localhost:3000/api/reviews'
  return new NextRequest(url, { method: 'GET' })
}

describe('POST /api/reviews', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('authentication', () => {
    it('should return 401 if not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = createMockPostRequest({
        productId: 'prod-1',
        rating: 5,
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Vous devez être connecté pour laisser un avis')
    })

    it('should return 401 if session has no user id', async () => {
      mockGetServerSession.mockResolvedValue({ user: {} })

      const request = createMockPostRequest({
        productId: 'prod-1',
        rating: 5,
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
    })
  })

  describe('validation', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1', name: 'Test User' },
      })
    })

    it('should return 400 if productId is missing', async () => {
      const request = createMockPostRequest({ rating: 5 })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Produit et note requis')
    })

    it('should return 400 if rating is missing', async () => {
      const request = createMockPostRequest({ productId: 'prod-1' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Produit et note requis')
    })

    it('should return 400 if rating is zero (treated as missing)', async () => {
      const request = createMockPostRequest({
        productId: 'prod-1',
        rating: 0,
      })
      const response = await POST(request)
      const data = await response.json()

      // Note: rating 0 is falsy, so it's treated as missing
      expect(response.status).toBe(400)
      expect(data.error).toBe('Produit et note requis')
    })

    it('should return 400 if rating is negative', async () => {
      ;(mockPrisma.product.findUnique as jest.Mock).mockResolvedValue({ id: 'prod-1' })

      const request = createMockPostRequest({
        productId: 'prod-1',
        rating: -1,
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('La note doit être entre 1 et 5')
    })

    it('should return 400 if rating is greater than 5', async () => {
      const request = createMockPostRequest({
        productId: 'prod-1',
        rating: 6,
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('La note doit être entre 1 et 5')
    })
  })

  describe('product validation', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1', name: 'Test User' },
      })
    })

    it('should return 404 if product does not exist', async () => {
      ;(mockPrisma.product.findUnique as jest.Mock).mockResolvedValue(null)

      const request = createMockPostRequest({
        productId: 'non-existent',
        rating: 5,
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Produit non trouvé')
    })
  })

  describe('create review', () => {
    const mockProduct = { id: 'prod-1', name: 'Test Product' }
    const mockUser = { id: 'user-1', name: 'Test User' }

    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({ user: mockUser })
      ;(mockPrisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct)
      ;(mockPrisma.review.findUnique as jest.Mock).mockResolvedValue(null)
      ;(mockPrisma.orderItem.findFirst as jest.Mock).mockResolvedValue(null)
    })

    it('should create a new review', async () => {
      const mockReview = {
        id: 'review-1',
        userId: 'user-1',
        productId: 'prod-1',
        rating: 5,
        title: 'Great product',
        comment: 'Love it!',
        verified: false,
        user: mockUser,
      }
      ;(mockPrisma.review.create as jest.Mock).mockResolvedValue(mockReview)

      const request = createMockPostRequest({
        productId: 'prod-1',
        rating: 5,
        title: 'Great product',
        comment: 'Love it!',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Avis publié avec succès')
      expect(data.data).toEqual(mockReview)
    })

    it('should set verified to true if user has purchased', async () => {
      ;(mockPrisma.orderItem.findFirst as jest.Mock).mockResolvedValue({
        id: 'order-item-1',
      })
      ;(mockPrisma.review.create as jest.Mock).mockImplementation((args) => {
        return Promise.resolve({
          ...args.data,
          id: 'review-1',
          user: mockUser,
        })
      })

      const request = createMockPostRequest({
        productId: 'prod-1',
        rating: 5,
      })
      await POST(request)

      expect(mockPrisma.review.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            verified: true,
          }),
        })
      )
    })

    it('should set verified to false if user has not purchased', async () => {
      ;(mockPrisma.orderItem.findFirst as jest.Mock).mockResolvedValue(null)
      ;(mockPrisma.review.create as jest.Mock).mockImplementation((args) => {
        return Promise.resolve({
          ...args.data,
          id: 'review-1',
          user: mockUser,
        })
      })

      const request = createMockPostRequest({
        productId: 'prod-1',
        rating: 5,
      })
      await POST(request)

      expect(mockPrisma.review.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            verified: false,
          }),
        })
      )
    })
  })

  describe('update existing review', () => {
    const mockUser = { id: 'user-1', name: 'Test User' }
    const mockProduct = { id: 'prod-1', name: 'Test Product' }
    const mockExistingReview = {
      id: 'review-1',
      userId: 'user-1',
      productId: 'prod-1',
      rating: 3,
    }

    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({ user: mockUser })
      ;(mockPrisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct)
      ;(mockPrisma.review.findUnique as jest.Mock).mockResolvedValue(mockExistingReview)
    })

    it('should update existing review', async () => {
      const updatedReview = {
        ...mockExistingReview,
        rating: 5,
        title: 'Updated title',
        user: mockUser,
      }
      ;(mockPrisma.review.update as jest.Mock).mockResolvedValue(updatedReview)

      const request = createMockPostRequest({
        productId: 'prod-1',
        rating: 5,
        title: 'Updated title',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Avis mis à jour')
    })
  })

  describe('error handling', () => {
    it('should return 500 on database error during creation', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1', name: 'Test User' },
      })
      ;(mockPrisma.product.findUnique as jest.Mock).mockResolvedValue({ id: 'prod-1' })
      ;(mockPrisma.review.findUnique as jest.Mock).mockResolvedValue(null)
      ;(mockPrisma.orderItem.findFirst as jest.Mock).mockResolvedValue(null)
      ;(mockPrisma.review.create as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      const request = createMockPostRequest({
        productId: 'prod-1',
        rating: 5,
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe("Erreur lors de la publication de l'avis")
    })
  })
})

describe('GET /api/reviews', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 400 if productId is missing', async () => {
    const request = createMockGetRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('ID produit requis')
  })

  it('should return reviews for product', async () => {
    const mockReviews = [
      {
        id: 'review-1',
        rating: 5,
        comment: 'Great!',
        user: { id: 'user-1', name: 'User 1' },
      },
      {
        id: 'review-2',
        rating: 4,
        comment: 'Good',
        user: { id: 'user-2', name: 'User 2' },
      },
    ]
    ;(mockPrisma.review.findMany as jest.Mock).mockResolvedValue(mockReviews)

    const request = createMockGetRequest('prod-1')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toEqual(mockReviews)
  })

  it('should return empty array if no reviews', async () => {
    ;(mockPrisma.review.findMany as jest.Mock).mockResolvedValue([])

    const request = createMockGetRequest('prod-1')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toEqual([])
  })

  it('should handle database errors', async () => {
    ;(mockPrisma.review.findMany as jest.Mock).mockRejectedValue(
      new Error('Database error')
    )

    const request = createMockGetRequest('prod-1')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe("Erreur lors de la récupération des avis")
  })
})
