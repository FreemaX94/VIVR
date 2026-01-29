import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Extension API Key - In production, store this in environment variables
// and consider using a more robust authentication system
const EXTENSION_API_KEY = process.env.EXTENSION_API_KEY || 'vivr-extension-key-2024'

// CORS headers for Chrome extension
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Extension-Key',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.description || !body.price) {
      return NextResponse.json(
        { success: false, error: 'Champs requis manquants (name, description, price)' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Verify category exists if provided
    if (body.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: body.categoryId }
      })

      if (!category) {
        return NextResponse.json(
          { success: false, error: 'Catégorie non trouvée' },
          { status: 404, headers: corsHeaders }
        )
      }
    }

    // Generate unique slug
    let slug = body.slug || generateSlug(body.name)
    let slugExists = await prisma.product.findUnique({ where: { slug } })
    let counter = 1

    while (slugExists) {
      slug = `${body.slug || generateSlug(body.name)}-${counter}`
      slugExists = await prisma.product.findUnique({ where: { slug } })
      counter++
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: slug,
        description: body.description,
        price: body.price,
        comparePrice: body.comparePrice || null,
        images: JSON.stringify(body.images || []),
        categoryId: body.categoryId || undefined,
        stock: body.stock || 10,
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
        price: product.price,
        comparePrice: product.comparePrice || null,
        images: JSON.parse(product.images),
      },
      message: 'Produit créé avec succès'
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('Error creating product from extension:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du produit' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// Helper function to generate slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}
