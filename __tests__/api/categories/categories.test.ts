/**
 * @jest-environment node
 */

import { GET, POST } from '@/app/api/categories/route'
import prisma from '@/lib/prisma'
import { NextRequest } from 'next/server'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    category: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('GET /api/categories', () => {
  const mockCategories = [
    {
      id: 'cat-1',
      name: 'Bureau',
      slug: 'bureau',
      description: 'Mobilier de bureau',
      image: 'bureau.jpg',
      _count: { products: 15 },
    },
    {
      id: 'cat-2',
      name: 'Chambre',
      slug: 'chambre',
      description: 'Mobilier de chambre',
      image: 'chambre.jpg',
      _count: { products: 23 },
    },
    {
      id: 'cat-3',
      name: 'Salon',
      slug: 'salon',
      description: 'Mobilier de salon',
      image: 'salon.jpg',
      _count: { products: 42 },
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockPrisma.category.findMany.mockResolvedValue(mockCategories as any)
  })

  describe('Basic Functionality', () => {
    it('should return all categories', async () => {
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(3)
    })

    it('should include product count for each category', async () => {
      const response = await GET()
      const data = await response.json()

      expect(data.data[0].productCount).toBe(15)
      expect(data.data[1].productCount).toBe(23)
      expect(data.data[2].productCount).toBe(42)
    })

    it('should transform category data correctly', async () => {
      const response = await GET()
      const data = await response.json()

      expect(data.data[0]).toMatchObject({
        id: 'cat-1',
        name: 'Bureau',
        slug: 'bureau',
        description: 'Mobilier de bureau',
        image: 'bureau.jpg',
        productCount: 15,
      })
    })
  })

  describe('Sorting', () => {
    it('should order categories by name ascending', async () => {
      await GET()

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { name: 'asc' },
        })
      )
    })

    it('should return categories in alphabetical order', async () => {
      const response = await GET()
      const data = await response.json()

      // Mock data is already sorted by name
      expect(data.data[0].name).toBe('Bureau')
      expect(data.data[1].name).toBe('Chambre')
      expect(data.data[2].name).toBe('Salon')
    })
  })

  describe('Caching', () => {
    it('should include cache headers', async () => {
      const response = await GET()

      expect(response.headers.get('Cache-Control')).toContain('public')
      expect(response.headers.get('Cache-Control')).toContain('s-maxage=3600')
      expect(response.headers.get('Cache-Control')).toContain('stale-while-revalidate=86400')
    })
  })

  describe('Includes', () => {
    it('should include product count in query', async () => {
      await GET()

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            _count: {
              select: { products: true },
            },
          },
        })
      )
    })
  })

  describe('Empty State', () => {
    it('should return empty array when no categories exist', async () => {
      mockPrisma.category.findMany.mockResolvedValue([])

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual([])
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed')
      mockPrisma.category.findMany.mockRejectedValue(dbError)

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to fetch categories')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching categories:', dbError)

      consoleErrorSpy.mockRestore()
    })

    it('should return 500 status code on error', async () => {
      mockPrisma.category.findMany.mockRejectedValue(new Error('Query failed'))
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const response = await GET()

      expect(response.status).toBe(500)
      consoleErrorSpy.mockRestore()
    })
  })

  describe('Data Transformation', () => {
    it('should map _count.products to productCount', async () => {
      const response = await GET()
      const data = await response.json()

      // Verify that each category has productCount from _count.products
      data.data.forEach((category: any, index: number) => {
        expect(category.productCount).toBe(mockCategories[index]._count.products)
      })
    })

    it('should preserve all category fields', async () => {
      const response = await GET()
      const data = await response.json()

      const category = data.data[0]
      expect(category).toHaveProperty('id')
      expect(category).toHaveProperty('name')
      expect(category).toHaveProperty('slug')
      expect(category).toHaveProperty('description')
      expect(category).toHaveProperty('image')
      expect(category).toHaveProperty('productCount')
    })
  })

  describe('Category with Zero Products', () => {
    it('should handle categories with zero products', async () => {
      mockPrisma.category.findMany.mockResolvedValue([
        {
          id: 'cat-empty',
          name: 'Empty Category',
          slug: 'empty-category',
          description: 'A category with no products',
          image: null,
          _count: { products: 0 },
        },
      ] as any)

      const response = await GET()
      const data = await response.json()

      expect(data.data[0].productCount).toBe(0)
    })
  })

  describe('Category without Image', () => {
    it('should handle categories without images', async () => {
      mockPrisma.category.findMany.mockResolvedValue([
        {
          id: 'cat-no-image',
          name: 'No Image Category',
          slug: 'no-image-category',
          description: null,
          image: null,
          _count: { products: 5 },
        },
      ] as any)

      const response = await GET()
      const data = await response.json()

      expect(data.data[0].image).toBeNull()
      expect(data.data[0].description).toBeNull()
    })
  })
})

describe('POST /api/categories', () => {
  const mockCategoryData = {
    name: 'New Category',
    slug: 'new-category',
    description: 'A new category',
    image: 'new-category.jpg',
  }

  const mockCreatedCategory = {
    id: 'cat-new',
    ...mockCategoryData,
    createdAt: new Date(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockPrisma.category.create.mockResolvedValue(mockCreatedCategory as any)
  })

  describe('Category Creation', () => {
    it('should create a new category', async () => {
      const request = new NextRequest('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify(mockCategoryData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toMatchObject({
        id: 'cat-new',
        name: 'New Category',
        slug: 'new-category',
      })
    })

    it('should pass correct data to prisma create', async () => {
      const request = new NextRequest('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify(mockCategoryData),
      })

      await POST(request)

      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: {
          name: 'New Category',
          slug: 'new-category',
          description: 'A new category',
          image: 'new-category.jpg',
        },
      })
    })

    it('should create category with minimal data', async () => {
      const minimalData = {
        name: 'Minimal Category',
        slug: 'minimal-category',
      }

      const request = new NextRequest('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify(minimalData),
      })

      await POST(request)

      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Minimal Category',
          slug: 'minimal-category',
        }),
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors', async () => {
      const dbError = new Error('Database error')
      mockPrisma.category.create.mockRejectedValue(dbError)
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const request = new NextRequest('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify(mockCategoryData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to create category')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating category:', dbError)

      consoleErrorSpy.mockRestore()
    })

    it('should handle invalid JSON in request body', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const request = new NextRequest('http://localhost:3000/api/categories', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      consoleErrorSpy.mockRestore()
    })

    it('should handle unique constraint violations', async () => {
      const uniqueError = new Error('Unique constraint failed on the fields: (`slug`)')
      mockPrisma.category.create.mockRejectedValue(uniqueError)
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const request = new NextRequest('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify(mockCategoryData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Response Format', () => {
    it('should return JSON response', async () => {
      const request = new NextRequest('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify(mockCategoryData),
      })

      const response = await POST(request)

      expect(response.headers.get('content-type')).toContain('application/json')
    })

    it('should include success flag in response', async () => {
      const request = new NextRequest('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify(mockCategoryData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data).toHaveProperty('success')
      expect(typeof data.success).toBe('boolean')
    })

    it('should include created category in data field', async () => {
      const request = new NextRequest('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify(mockCategoryData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data).toHaveProperty('data')
      expect(data.data).toHaveProperty('id')
    })
  })

  describe('Special Characters in Data', () => {
    it('should handle categories with special characters in name', async () => {
      const specialData = {
        name: "Décoration d'intérieur",
        slug: 'decoration-interieur',
        description: 'Accessoires & déco',
      }

      mockPrisma.category.create.mockResolvedValue({
        id: 'cat-special',
        ...specialData,
      } as any)

      const request = new NextRequest('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify(specialData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.name).toBe("Décoration d'intérieur")
    })
  })
})
