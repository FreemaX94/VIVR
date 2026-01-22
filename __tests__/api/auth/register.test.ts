import { POST } from '@/app/api/auth/register/route'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>

describe('POST /api/auth/register', () => {
  const mockUserData = {
    email: 'newuser@example.com',
    password: 'SecurePassword123!',
    name: 'New User',
  }

  const mockCreatedUser = {
    id: 'user-1',
    email: 'newuser@example.com',
    name: 'New User',
    image: null,
    createdAt: new Date('2024-01-20'),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockBcrypt.hash.mockResolvedValue('hashed_password_123' as any)
    mockPrisma.user.findUnique.mockResolvedValue(null)
  })

  describe('Input Validation', () => {
    it('should return 400 when email is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ password: 'password123' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Email')
    })

    it('should return 400 when password is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: 'user@example.com' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('mot de passe')
    })

    it('should return 400 when both email and password are missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should accept empty name field', async () => {
      mockPrisma.user.create.mockResolvedValue(mockCreatedUser)

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'newuser@example.com',
          password: 'password123',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
    })
  })

  describe('Duplicate Email Check', () => {
    it('should return 400 when email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: 'newuser@example.com',
        name: 'Existing User',
      } as any)

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(mockUserData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('email est déjà utilisé')
    })

    it('should query database for existing user', async () => {
      mockPrisma.user.create.mockResolvedValue(mockCreatedUser)

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(mockUserData),
      })

      await POST(request)

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'newuser@example.com' },
      })
    })

    it('should check email case-insensitively if database supports it', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockResolvedValue(mockCreatedUser)

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          ...mockUserData,
          email: 'NewUser@Example.com',
        }),
      })

      await POST(request)

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'NewUser@Example.com' },
      })
    })
  })

  describe('Password Hashing', () => {
    beforeEach(() => {
      mockPrisma.user.create.mockResolvedValue(mockCreatedUser)
    })

    it('should hash password with bcrypt', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(mockUserData),
      })

      await POST(request)

      expect(mockBcrypt.hash).toHaveBeenCalledWith('SecurePassword123!', 12)
    })

    it('should use hashed password in user creation', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(mockUserData),
      })

      await POST(request)

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          password: 'hashed_password_123',
        }),
        select: expect.any(Object),
      })
    })

    it('should handle hashing errors', async () => {
      const hashError = new Error('Hashing failed')
      mockBcrypt.hash.mockRejectedValue(hashError)

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(mockUserData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
    })
  })

  describe('User Creation', () => {
    beforeEach(() => {
      mockPrisma.user.create.mockResolvedValue(mockCreatedUser)
    })

    it('should create user with email, hashed password, and name', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(mockUserData),
      })

      await POST(request)

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'newuser@example.com',
          password: 'hashed_password_123',
          name: 'New User',
        },
        select: expect.objectContaining({
          id: true,
          email: true,
          name: true,
          image: true,
          createdAt: true,
        }),
      })
    })

    it('should not return password in response', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(mockUserData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.data).not.toHaveProperty('password')
    })

    it('should return created user data', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(mockUserData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockCreatedUser)
    })

    it('should return success message', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(mockUserData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.message).toContain('Compte créé')
    })

    it('should include user ID in response', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(mockUserData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.data.id).toBe('user-1')
    })

    it('should include creation timestamp', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(mockUserData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.data.createdAt).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle database unique constraint violation', async () => {
      const uniqueConstraintError = new Error('Unique constraint failed on the fields: (`email`)')
      mockPrisma.user.create.mockRejectedValue(uniqueConstraintError)

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(mockUserData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toContain('création du compte')
    })

    it('should handle invalid JSON in request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
    })

    it('should handle Prisma connection errors', async () => {
      const connectionError = new Error('Connection to database failed')
      mockPrisma.user.findUnique.mockRejectedValue(connectionError)

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(mockUserData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
    })

    it('should log errors to console', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const error = new Error('Test error')
      mockPrisma.user.create.mockRejectedValue(error)

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(mockUserData),
      })

      await POST(request)

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error registering user:', error)
      consoleErrorSpy.mockRestore()
    })
  })

  describe('Various Name Scenarios', () => {
    beforeEach(() => {
      mockPrisma.user.create.mockResolvedValue(mockCreatedUser)
    })

    it('should accept user without name', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'newuser@example.com',
          password: 'password123',
          name: undefined,
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
    })

    it('should accept user with long name', async () => {
      const longName = 'A'.repeat(100)
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          ...mockUserData,
          name: longName,
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
    })

    it('should accept user with special characters in name', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          ...mockUserData,
          name: "Jean-Pierre O'Brien",
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
    })
  })

  describe('Security', () => {
    beforeEach(() => {
      mockPrisma.user.create.mockResolvedValue(mockCreatedUser)
    })

    it('should not reveal whether email exists in error message', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: 'newuser@example.com',
      } as any)

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(mockUserData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.error).not.toContain('user-1')
      expect(data.error).not.toContain('existing')
    })

    it('should hash passwords with salt rounds of 12', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(mockUserData),
      })

      await POST(request)

      expect(mockBcrypt.hash).toHaveBeenCalledWith(expect.anything(), 12)
    })

    it('should not store plaintext password', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(mockUserData),
      })

      await POST(request)

      const createCall = (mockPrisma.user.create as jest.Mock).mock.calls[0][0]
      expect(createCall.data.password).not.toBe('SecurePassword123!')
    })
  })

  describe('Response Format', () => {
    beforeEach(() => {
      mockPrisma.user.create.mockResolvedValue(mockCreatedUser)
    })

    it('should return JSON response', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(mockUserData),
      })

      const response = await POST(request)

      expect(response.headers.get('content-type')).toContain('application/json')
    })

    it('should include success flag in all responses', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(mockUserData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data).toHaveProperty('success')
      expect(typeof data.success).toBe('boolean')
    })

    it('should return 200 on successful registration', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(mockUserData),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
    })
  })
})
