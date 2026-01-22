import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import prisma from '@/lib/prisma'
import {
  isEventProcessed,
  markEventProcessed,
  validateWebhookPayloadSize,
} from '@/lib/stripe-security'

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'Webhook secret is not configured' },
      { status: 500 }
    )
  }

  const body = await request.text()

  // P1-4: Validate payload size to prevent memory exhaustion
  try {
    validateWebhookPayloadSize(body)
  } catch (err) {
    console.error('Webhook payload too large:', err)
    return NextResponse.json(
      { error: 'Payload too large' },
      { status: 413 }
    )
  }

  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  // P1-5: Check if event already processed (idempotency)
  const alreadyProcessed = await isEventProcessed(event.id)
  if (alreadyProcessed) {
    console.log(`Event ${event.id} already processed, skipping`)
    return NextResponse.json({ received: true, status: 'already_processed' })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.metadata?.orderId) {
          await prisma.order.update({
            where: { id: session.metadata.orderId },
            data: {
              status: 'PAID',
              paymentId: session.payment_intent as string,
            },
          })
        }

        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment succeeded:', paymentIntent.id)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error('Payment failed:', paymentIntent.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // P1-5: Mark event as processed after successful handling
    await markEventProcessed(event.id, event.type, {
      created: event.created,
      livemode: event.livemode,
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
