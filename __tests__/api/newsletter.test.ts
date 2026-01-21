/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { POST } from '@/app/api/newsletter/route'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    newsletter: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

import prisma from '@/lib/prisma'

const mockPrisma = prisma as jest.Mocked<typeof prisma>

function createMockRequest(body: object): NextRequest {
  return new NextRequest('http://localhost:3000/api/newsletter', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

describe('POST /api/newsletter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('validation', () => {
    it('should return 400 if email is missing', async () => {
      const request = createMockRequest({})
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Email requis')
    })

    it('should return 400 if email is empty string', async () => {
      const request = createMockRequest({ email: '' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should return 400 for invalid email format', async () => {
      const request = createMockRequest({ email: 'invalid-email' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe("Format d'email invalide")
    })

    it('should return 400 for email without domain', async () => {
      const request = createMockRequest({ email: 'test@' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe("Format d'email invalide")
    })

    it('should return 400 for email without @', async () => {
      const request = createMockRequest({ email: 'test.example.com' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe("Format d'email invalide")
    })
  })

  describe('duplicate email', () => {
    it('should return 400 if email is already subscribed', async () => {
      ;(mockPrisma.newsletter.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'existing@example.com',
        createdAt: new Date(),
      })

      const request = createMockRequest({ email: 'existing@example.com' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Cet email est déjà inscrit à la newsletter')
    })
  })

  describe('successful subscription', () => {
    it('should return 200 and create newsletter subscription', async () => {
      ;(mockPrisma.newsletter.findUnique as jest.Mock).mockResolvedValue(null)
      ;(mockPrisma.newsletter.create as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'new@example.com',
        createdAt: new Date(),
      })

      const request = createMockRequest({ email: 'new@example.com' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Inscription réussie ! Merci de rejoindre notre communauté.')
    })

    it('should call prisma.newsletter.create with email', async () => {
      ;(mockPrisma.newsletter.findUnique as jest.Mock).mockResolvedValue(null)
      ;(mockPrisma.newsletter.create as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        createdAt: new Date(),
      })

      const request = createMockRequest({ email: 'test@example.com' })
      await POST(request)

      expect(mockPrisma.newsletter.create).toHaveBeenCalledWith({
        data: { email: 'test@example.com' },
      })
    })
  })

  describe('error handling', () => {
    it('should return 500 on database error', async () => {
      ;(mockPrisma.newsletter.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      const request = createMockRequest({ email: 'test@example.com' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe("Erreur lors de l'inscription")
    })
  })

  describe('valid email formats', () => {
    it.each([
      'simple@example.com',
      'user.name@example.com',
      'user+tag@example.com',
      'user@subdomain.example.com',
    ])('should accept valid email: %s', async (email) => {
      ;(mockPrisma.newsletter.findUnique as jest.Mock).mockResolvedValue(null)
      ;(mockPrisma.newsletter.create as jest.Mock).mockResolvedValue({
        id: '1',
        email,
        createdAt: new Date(),
      })

      const request = createMockRequest({ email })
      const response = await POST(request)
      const data = await response.json()

      expect(data.success).toBe(true)
    })
  })
})
