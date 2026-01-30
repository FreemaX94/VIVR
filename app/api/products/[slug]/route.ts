import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Get product with category and paginated reviews
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        reviews: {
          take: 5,  // Paginate reviews to avoid loading thousands
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Get related products in parallel - no need for transaction as it's read-only
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      take: 4,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        comparePrice: true,
        images: true,
        category: { select: { id: true, name: true } },
      },
    })

    // Calculate average rating
    const averageRating =
      product.reviews.length > 0
        ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
        : 0

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        price: product.price,
        comparePrice: product.comparePrice || null,
        images: JSON.parse(product.images),
        averageRating,
        reviewCount: product.reviews.length,
        relatedProducts: relatedProducts.map((p) => ({
          ...p,
          price: p.price,
          comparePrice: p.comparePrice || null,
          images: JSON.parse(p.images),
        })),
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600'
      }
    })
  } catch (error) {
    console.error('Error fetching product:', error)

    // Fallback to mock data when database is unavailable
    try {
      const { mockProducts } = await import('@/lib/mock-data')
      const { slug } = await params
      const product = mockProducts.find(p => p.slug === slug)

      if (!product) {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 }
        )
      }

      const related = mockProducts
        .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
        .slice(0, 4)
        .map(p => ({ ...p, images: JSON.parse(p.images) }))

      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / product.reviews.length
        : 0

      return NextResponse.json({
        success: true,
        data: {
          ...product,
          images: JSON.parse(product.images),
          averageRating: avgRating,
          reviewCount: product.reviews.length,
          relatedProducts: related,
        },
      }, {
        headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' }
      })
    } catch {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch product' },
        { status: 500 }
      )
    }
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()

    const product = await prisma.product.update({
      where: { slug },
      data: body,
      include: {
        category: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        price: product.price,
        comparePrice: product.comparePrice || null,
        images: JSON.parse(product.images),
      },
    })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    await prisma.product.delete({
      where: { slug },
    })

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
