import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// CORS headers for Chrome extension
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Extension-Key',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({
      success: true,
      data: categories.map((category) => ({
        ...category,
        productCount: category._count.products,
      })),
    }, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500, headers: corsHeaders }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        image: body.image,
      },
    })

    return NextResponse.json({
      success: true,
      data: category,
    })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
