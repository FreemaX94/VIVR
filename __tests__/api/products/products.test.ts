/**
 * @jest-environment node
 */

import { GET, POST } from '@/app/api/products/route'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextRequest } from 'next/server'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    product: {
      count: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    review: {
      groupBy: jest.fn(),
    },
  },
}))

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('GET /api/products', () => {
  const mockCategory = {
    id: 'cat-1',
    name: 'Salon',
    slug: 'salon',
  }

  const mockProducts = [
    {
      id: 'prod-1',
      name: 'Lampe Moderne',
      slug: 'lampe-moderne',
      description: 'Une belle lampe',
      price: 89.99,
      comparePrice: 129.99,
      images: ['lamp.jpg'],
      category: mockCategory,
      categoryId: 'cat-1',
      stock: 10,
      featured: true,
      createdAt: new Date('2024-01-15'),
      _count: { reviews: 5 },
    },
    {
      id: 'prod-2',
      name: 'Vase Ceramique',
      slug: 'vase-ceramique',
      description: 'Un beau vase',
      price: 45.00,
      comparePrice: null,
      images: ['vase.jpg'],
      category: mockCategory,
      categoryId: 'cat-1',
      stock: 5,
      featured: false,
      createdAt: new Date('2024-01-10'),
      _count: { reviews: 2 },
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockPrisma.product.count.mockResolvedValue(2)
    mockPrisma.product.findMany.mockResolvedValue(mockProducts as any)
    mockPrisma.review.groupBy.mockResolvedValue([
      { productId: 'prod-1', _avg: { rating: 4.5 } },
      { productId: 'prod-2', _avg: { rating: 3.8 } },
    ] as any)
  })

  describe('Basic Functionality', () => {
    it('should return products with default pagination', async () => {
      const request = new NextRequest('http://localhost:3000/api/products')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.pagination).toEqual({
        page: 1,
        limit: 12,
        total: 2,
        totalPages: 1,
      })
    })

    it('should transform products correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/products')

      const response = await GET(request)
      const data = await response.json()

      expect(data.data[0]).toMatchObject({
        id: 'prod-1',
        name: 'Lampe Moderne',
        price: 89.99,
        comparePrice: 129.99,
        averageRating: 4.5,
        reviewCount: 5,
      })
    })

    it('should handle null comparePrice', async () => {
      const request = new NextRequest('http://localhost:3000/api/products')

      const response = await GET(request)
      const data = await response.json()

      expect(data.data[1].comparePrice).toBeNull()
    })

    it('should include cache headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/products')

      const response = await GET(request)

      expect(response.headers.get('Cache-Control')).toContain('public')
      expect(response.headers.get('Cache-Control')).toContain('s-maxage=60')
    })
  })

  describe('Pagination', () => {
    it('should respect page parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/products?page=2')

      await GET(request)

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 12, // (2-1) * 12
          take: 12,
        })
      )
    })

    it('should respect limit parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/products?limit=6')

      await GET(request)

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 6,
        })
      )
    })

    it('should calculate totalPages correctly', async () => {
      mockPrisma.product.count.mockResolvedValue(25)

      const request = new NextRequest('http://localhost:3000/api/products?limit=10')

      const response = await GET(request)
      const data = await response.json()

      expect(data.pagination.totalPages).toBe(3) // Math.ceil(25/10)
    })

    it('should handle page and limit together', async () => {
      const request = new NextRequest('http://localhost:3000/api/products?page=3&limit=5')

      await GET(request)

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10, // (3-1) * 5
          take: 5,
        })
      )
    })
  })

  describe('Filtering', () => {
    it('should filter by category slug', async () => {
      const request = new NextRequest('http://localhost:3000/api/products?category=salon')

      await GET(request)

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: { slug: 'salon' },
          }),
        })
      )
    })

    it('should filter by search term', async () => {
      const request = new NextRequest('http://localhost:3000/api/products?search=lampe')

      await GET(request)

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'lampe', mode: 'insensitive' } },
              { description: { contains: 'lampe', mode: 'insensitive' } },
            ],
          }),
        })
      )
    })

    it('should filter by minPrice', async () => {
      const request = new NextRequest('http://localhost:3000/api/products?minPrice=50')

      await GET(request)

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: { gte: 50 },
          }),
        })
      )
    })

    it('should filter by maxPrice', async () => {
      const request = new NextRequest('http://localhost:3000/api/products?maxPrice=100')

      await GET(request)

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: { lte: 100 },
          }),
        })
      )
    })

    it('should filter by price range', async () => {
      const request = new NextRequest('http://localhost:3000/api/products?minPrice=50&maxPrice=100')

      await GET(request)

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: { gte: 50, lte: 100 },
          }),
        })
      )
    })

    it('should filter featured products', async () => {
      const request = new NextRequest('http://localhost:3000/api/products?featured=true')

      await GET(request)

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            featured: true,
          }),
        })
      )
    })

    it('should combine multiple filters', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/products?category=salon&minPrice=50&featured=true'
      )

      await GET(request)

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: { slug: 'salon' },
            price: { gte: 50 },
            featured: true,
          }),
        })
      )
    })
  })

  describe('Sorting', () => {
    it('should sort by newest by default', async () => {
      const request = new NextRequest('http://localhost:3000/api/products')

      await GET(request)

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      )
    })

    it('should sort by price ascending', async () => {
      const request = new NextRequest('http://localhost:3000/api/products?sort=price-asc')

      await GET(request)

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { price: 'asc' },
        })
      )
    })

    it('should sort by price descending', async () => {
      const request = new NextRequest('http://localhost:3000/api/products?sort=price-desc')

      await GET(request)

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { price: 'desc' },
        })
      )
    })

    it('should sort by popularity (review count)', async () => {
      const request = new NextRequest('http://localhost:3000/api/products?sort=popular')

      await GET(request)

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { reviews: { _count: 'desc' } },
        })
      )
    })
  })

  describe('Ratings', () => {
    it('should include average ratings in response', async () => {
      const request = new NextRequest('http://localhost:3000/api/products')

      const response = await GET(request)
      const data = await response.json()

      expect(data.data[0].averageRating).toBe(4.5)
      expect(data.data[1].averageRating).toBe(3.8)
    })

    it('should return 0 rating for products without reviews', async () => {
      mockPrisma.review.groupBy.mockResolvedValue([
        { productId: 'prod-1', _avg: { rating: 4.5 } },
        // prod-2 has no reviews in this mock
      ] as any)

      const request = new NextRequest('http://localhost:3000/api/products')

      const response = await GET(request)
      const data = await response.json()

      expect(data.data[1].averageRating).toBe(0)
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed')
      mockPrisma.product.count.mockRejectedValue(dbError)

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const request = new NextRequest('http://localhost:3000/api/products')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to fetch products')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching products:', dbError)

      consoleErrorSpy.mockRestore()
    })

    it('should handle findMany errors', async () => {
      mockPrisma.product.findMany.mockRejectedValue(new Error('Query failed'))
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const request = new NextRequest('http://localhost:3000/api/products')

      const response = await GET(request)

      expect(response.status).toBe(500)
      consoleErrorSpy.mockRestore()
    })
  })

  describe('Includes', () => {
    it('should include category in response', async () => {
      const request = new NextRequest('http://localhost:3000/api/products')

      await GET(request)

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            category: true,
          }),
        })
      )
    })

    it('should include review count', async () => {
      const request = new NextRequest('http://localhost:3000/api/products')

      await GET(request)

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            _count: { select: { reviews: true } },
          }),
        })
      )
    })
  })
})

describe('POST /api/products', () => {
  const mockCategory = {
    id: 'cat-1',
    name: 'Salon',
    slug: 'salon',
  }

  const mockProductData = {
    name: 'New Product',
    slug: 'new-product',
    description: 'A new product',
    price: 99.99,
    comparePrice: 149.99,
    images: ['image.jpg'],
    categoryId: 'cat-1',
    stock: 20,
    featured: true,
  }

  const mockCreatedProduct = {
    id: 'prod-new',
    ...mockProductData,
    category: mockCategory,
    createdAt: new Date(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(mockProductData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Non autorisé')
    })

    it('should return 403 when user is not admin', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1', email: 'user@example.com', role: 'USER' },
      })

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(mockProductData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
      expect(data.error).toContain('administrateurs')
    })
  })

  describe('Product Creation', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin-1', email: 'admin@example.com', role: 'ADMIN' },
      })
      mockPrisma.product.create.mockResolvedValue(mockCreatedProduct as any)
    })

    it('should create product when user is admin', async () => {
      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(mockProductData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toMatchObject({
        id: 'prod-new',
        name: 'New Product',
        price: 99.99,
        comparePrice: 149.99,
      })
    })

    it('should pass correct data to prisma create', async () => {
      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(mockProductData),
      })

      await POST(request)

      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: {
          name: 'New Product',
          slug: 'new-product',
          description: 'A new product',
          price: 99.99,
          comparePrice: 149.99,
          images: ['image.jpg'],
          categoryId: 'cat-1',
          stock: 20,
          featured: true,
        },
        include: { category: true },
      })
    })

    it('should default stock to 0 if not provided', async () => {
      const dataWithoutStock = { ...mockProductData }
      delete (dataWithoutStock as any).stock

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(dataWithoutStock),
      })

      await POST(request)

      expect(mockPrisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            stock: 0,
          }),
        })
      )
    })

    it('should default featured to false if not provided', async () => {
      const dataWithoutFeatured = { ...mockProductData }
      delete (dataWithoutFeatured as any).featured

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(dataWithoutFeatured),
      })

      await POST(request)

      expect(mockPrisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            featured: false,
          }),
        })
      )
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin-1', email: 'admin@example.com', role: 'ADMIN' },
      })
    })

    it('should handle database errors', async () => {
      const dbError = new Error('Database error')
      mockPrisma.product.create.mockRejectedValue(dbError)
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(mockProductData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to create product')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating product:', dbError)

      consoleErrorSpy.mockRestore()
    })

    it('should handle invalid JSON in request body', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      consoleErrorSpy.mockRestore()
    })
  })
})
