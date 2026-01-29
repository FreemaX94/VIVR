import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { keywords, categories, limit = 12 } = body

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Keywords requis' },
        { status: 400 }
      )
    }

    // Build search conditions for each keyword
    const searchConditions = keywords.slice(0, 10).map((keyword: string) => ({
      OR: [
        { name: { contains: keyword } },
        { description: { contains: keyword } },
      ]
    }))

    // Build category filter if provided
    const categoryCondition = categories && categories.length > 0
      ? { category: { slug: { in: categories } } }
      : {}

    // Search products matching any keyword
    const products = await prisma.product.findMany({
      where: {
        AND: [
          { OR: searchConditions },
          categoryCondition,
          { stock: { gt: 0 } } // Only in-stock products
        ]
      },
      take: limit,
      include: {
        category: true,
        _count: {
          select: { reviews: true }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // If not enough results, get additional products from suggested categories
    let additionalProducts: typeof products = []
    if (products.length < limit && categories && categories.length > 0) {
      const existingIds = products.map(p => p.id)
      additionalProducts = await prisma.product.findMany({
        where: {
          AND: [
            { category: { slug: { in: categories } } },
            { id: { notIn: existingIds } },
            { stock: { gt: 0 } }
          ]
        },
        take: limit - products.length,
        include: {
          category: true,
          _count: {
            select: { reviews: true }
          }
        },
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ]
      })
    }

    const allProducts = [...products, ...additionalProducts]

    // Get average ratings
    const productIds = allProducts.map(p => p.id)
    const avgRatings = await prisma.review.groupBy({
      by: ['productId'],
      where: { productId: { in: productIds } },
      _avg: { rating: true }
    })
    const ratingsMap = new Map(avgRatings.map(r => [r.productId, r._avg.rating || 0]))

    // Transform products
    const transformedProducts = allProducts.map((product) => ({
      ...product,
      price: product.price,
      comparePrice: product.comparePrice || null,
      images: JSON.parse(product.images),
      averageRating: ratingsMap.get(product.id) || 0,
      reviewCount: product._count.reviews,
    }))

    return NextResponse.json({
      success: true,
      data: transformedProducts,
      meta: {
        total: transformedProducts.length,
        keywordsUsed: keywords.slice(0, 10),
        categoriesUsed: categories || []
      }
    })

  } catch (error) {
    console.error('Visual search error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la recherche' },
      { status: 500 }
    )
  }
}
