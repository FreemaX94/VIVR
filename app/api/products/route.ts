import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'newest'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const featured = searchParams.get('featured')

    // Build where clause
    const where: Record<string, unknown> = {}

    if (category) {
      where.category = { slug: category }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (minPrice || maxPrice) {
      const priceFilter: { gte?: number; lte?: number } = {}
      if (minPrice) priceFilter.gte = parseFloat(minPrice)
      if (maxPrice) priceFilter.lte = parseFloat(maxPrice)
      where.price = priceFilter
    }

    if (featured === 'true') {
      where.featured = true
    }

    // Build orderBy clause
    let orderBy: Record<string, unknown> = {}
    switch (sort) {
      case 'price-asc':
        orderBy = { price: 'asc' }
        break
      case 'price-desc':
        orderBy = { price: 'desc' }
        break
      case 'popular':
        orderBy = { reviews: { _count: 'desc' } }
        break
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' }
    }

    // Get total count and products in parallel
    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: true,
          _count: {
            select: { reviews: true }
          }
        },
      })
    ])

    // Get average ratings in a single query (avoid N+1)
    const productIds = products.map(p => p.id)
    const avgRatings = await prisma.review.groupBy({
      by: ['productId'],
      where: { productId: { in: productIds } },
      _avg: { rating: true }
    })
    const ratingsMap = new Map(avgRatings.map(r => [r.productId, r._avg.rating || 0]))

    // Transform products
    const transformedProducts = products.map((product) => ({
      ...product,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      averageRating: ratingsMap.get(product.id) || 0,
      reviewCount: product._count.reviews,
    }))

    // Add cache headers for better performance
    return NextResponse.json({
      success: true,
      data: transformedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Accès réservé aux administrateurs' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        price: body.price,
        comparePrice: body.comparePrice,
        images: body.images,
        categoryId: body.categoryId,
        stock: body.stock || 0,
        featured: body.featured || false,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        price: Number(product.price),
        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      },
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
