export const dynamic = 'force-dynamic';

/**
 * Stripe Webhook API Route
 * 
 * This webhook handler processes Stripe events, particularly focusing on payment success
 * to automatically verify user accounts when they make a successful payment.
 */

import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { verifyAccount } from '@/lib/auth/verifyAccount';

// Initialize Stripe client with our secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
// Note: We're not specifying apiVersion to let Stripe use the default

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    // Get the Stripe signature from request headers
    const signature = req.headers.get('stripe-signature') || '';

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
      return new NextResponse(`Webhook signature verification failed: ${err.message}`, { status: 400 });
    }

    // Process the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;

        // Process the successful checkout
        if (session.payment_status === 'paid') {
          const userId = session.client_reference_id;

          if (!userId) {
            console.error('No user ID found in Stripe session');
            return new NextResponse('Missing user reference', { status: 400 });
          }

          // Verify the account using our helper function
          const result = await verifyAccount({
            userId,
            method: 'credit_card',
            metadata: {
              stripeSessionId: session.id,
              stripeCustomerId: session.customer,
            },
          });

          if (!result.success) {
            console.error(`Failed to verify account for user ${userId}:`, result.message);
          } else {
            console.log(`✅ Account verified via payment for user ${userId}`);
          }
        }
        break;

      default:
        // Unhandled event type
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
