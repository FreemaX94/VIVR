import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { validatePassword, validateEmail, sanitizeInput } from '@/lib/auth-security'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request)
    const rateLimitResult = rateLimit(`register:${ip}`, RATE_LIMITS.auth)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Trop de tentatives. Réessayez plus tard.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    // P2-1: Enhanced email validation
    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Format d\'email invalide' },
        { status: 400 }
      )
    }

    // P2-1: Enhanced password validation (includes special characters)
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: `Le mot de passe doit contenir ${passwordValidation.errors.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // P2-7: Sanitize name input
    const sanitizedName = name ? sanitizeInput(name) : null

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Cet email est déjà utilisé' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with sanitized input
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: sanitizedName,
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: user,
      message: 'Compte créé avec succès',
    })
  } catch (error) {
    console.error('Error registering user:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du compte' },
      { status: 500 }
    )
  }
}
