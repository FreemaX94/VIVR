import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createCheckoutSession, LineItem } from '@/lib/stripe'
import prisma from '@/lib/prisma'

interface CartItem {
  productId: string
  quantity: number
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Vous devez être connecté' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { items, orderId } = body as { items: CartItem[]; orderId?: string }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Le panier est vide' },
        { status: 400 }
      )
    }

    // Extract product IDs from cart items
    const productIds = items.map((item) => item.productId)

    // Fetch actual prices from database - NEVER trust client prices
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        images: true,
        stock: true,
      },
    })

    // Create a map for quick lookup
    const productMap = new Map(products.map((p) => [p.id, p]))

    // Validate all products exist and have sufficient stock
    const lineItems: LineItem[] = []
    for (const item of items) {
      const product = productMap.get(item.productId)

      if (!product) {
        return NextResponse.json(
          { success: false, error: `Produit introuvable: ${item.productId}` },
          { status: 400 }
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Stock insuffisant pour: ${product.name}` },
          { status: 400 }
        )
      }

      lineItems.push({
        name: product.name,
        description: product.description || undefined,
        image: product.images[0] || undefined,
        price: Number(product.price), // Use database price, NOT client price
        quantity: item.quantity,
      })
    }

    // Validate origin to prevent open redirect attacks
    const requestOrigin = request.headers.get('origin')
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.NEXT_PUBLIC_APP_URL,
      'https://vivr.fr',
      'https://www.vivr.fr',
    ].filter(Boolean)

    const origin = allowedOrigins.includes(requestOrigin || '')
      ? requestOrigin
      : process.env.NEXT_PUBLIC_APP_URL || 'https://vivr.fr'

    const checkoutSession = await createCheckoutSession(
      lineItems,
      session.user.email,
      `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      `${origin}/panier`,
      {
        userId: session.user.id,
        orderId: orderId || '',
        productIds: productIds.join(','),
      }
    )

    return NextResponse.json({
      success: true,
      data: {
        sessionId: checkoutSession.id,
        url: checkoutSession.url,
      },
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la session' },
      { status: 500 }
    )
  }
}
