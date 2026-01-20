import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createCheckoutSession, LineItem } from '@/lib/stripe'

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
    const { items, orderId } = body as { items: LineItem[]; orderId?: string }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Le panier est vide' },
        { status: 400 }
      )
    }

    const origin = request.headers.get('origin') || 'http://localhost:3000'

    const checkoutSession = await createCheckoutSession(
      items,
      session.user.email,
      `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      `${origin}/panier`,
      {
        userId: session.user.id,
        orderId: orderId || '',
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
