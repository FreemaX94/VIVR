import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { generateOrderNumber } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: true,
              }
            }
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: orders.map((order) => ({
        ...order,
        address: JSON.parse(order.address),
        items: order.items.map((item) => ({
          ...item,
          product: {
            ...item.product,
            images: JSON.parse(item.product.images),
          },
        })),
      })),
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des commandes' },
      { status: 500 }
    )
  }
}

interface OrderItem {
  productId: string
  quantity: number
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { items, address, paymentMethod } = body as {
      items: OrderItem[]
      address: Record<string, unknown>
      paymentMethod: string
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Aucun article dans la commande' },
        { status: 400 }
      )
    }

    // Fetch actual product prices from database - NEVER trust client prices
    const productIds = items.map((item) => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        stock: true,
      },
    })

    const productMap = new Map(products.map((p) => [p.id, p]))

    // Validate products and calculate totals from database prices
    const orderItems: {
      productId: string
      name: string
      price: number
      quantity: number
      image?: string
    }[] = []
    let subtotal = 0

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

      const price = product.price
      subtotal += price * item.quantity

      const productImages = JSON.parse(product.images)
      orderItems.push({
        productId: product.id,
        name: product.name,
        price: price, // Use database price, NOT client price
        quantity: item.quantity,
        image: productImages[0],
      })
    }

    // Calculate shipping (free above 50€)
    const shipping = subtotal >= 50 ? 0 : 4.99
    const total = subtotal + shipping

    // Create order with validated prices and batch update stock
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session.user.id,
        subtotal,
        shipping,
        total,
        paymentMethod,
        address: JSON.stringify(address),
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
              }
            }
          }
        },
      },
    })

    // Batch update product stock in parallel instead of sequential queries
    // This reduces N queries to 1 query for stock updates
    await Promise.all(
      items.map(item =>
        prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      )
    )

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        address: JSON.parse(order.address),
      },
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la commande' },
      { status: 500 }
    )
  }
}
