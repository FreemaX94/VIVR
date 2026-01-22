import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Vous devez être connecté pour laisser un avis' },
        { status: 401 }
      )
    }

    // Rate limiting based on user ID
    const rateLimitResult = rateLimit(`reviews:${session.user.id}`, RATE_LIMITS.reviews)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Trop d\'avis soumis. Réessayez plus tard.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { productId, rating, title, comment } = body

    if (!productId || !rating) {
      return NextResponse.json(
        { success: false, error: 'Produit et note requis' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'La note doit être entre 1 et 5' },
        { status: 400 }
      )
    }

    // Batch all verification queries in a transaction to prevent race conditions
    // This reduces 3+ sequential queries to 1 batched transaction
    const [product, existingReview, hasPurchased] = await prisma.$transaction([
      prisma.product.findUnique({
        where: { id: productId },
      }),
      prisma.review.findUnique({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId,
          },
        },
      }),
      prisma.orderItem.findFirst({
        where: {
          productId,
          order: {
            userId: session.user.id,
            status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] },
          },
        },
        select: { id: true },  // Only need existence check
      }),
    ])

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Produit non trouvé' },
        { status: 404 }
      )
    }

    if (existingReview) {
      // Update existing review
      const review = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          title: title || null,
          comment: comment || null,
        },
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
      })

      return NextResponse.json({
        success: true,
        data: review,
        message: 'Avis mis à jour',
      })
    }

    // Create new review
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId,
        rating,
        title: title || null,
        comment: comment || null,
        verified: !!hasPurchased,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Avis publié avec succès',
    })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la publication de l\'avis' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'ID produit requis' },
        { status: 400 }
      )
    }

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: reviews,
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des avis' },
      { status: 500 }
    )
  }
}
