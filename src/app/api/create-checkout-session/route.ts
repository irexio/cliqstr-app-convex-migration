export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Check if Stripe secret key is available
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set. Stripe functionality will be disabled.');
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil', // ✅ Use latest Stripe version
    })
  : null;

const PRICE_MAP: Record<string, string> = {
  basic: 'price_1RMN9TEa19eiTLnA506gOh6S',
  creator: 'price_1RMNAHEa19eiTLnAMKKwjUls',
  family: 'price_1RMNV8Ea19eiTLnAX4P74BQ4',
};

export async function POST(req: Request) {
  try {
    // Check if Stripe is properly initialized
    if (!stripe) {
      return NextResponse.json({ error: 'Payment processing is not configured' }, { status: 503 });
    }

    const { planKey, inviteCode, cliqId, promo } = await req.json();

    if (!planKey || !PRICE_MAP[planKey]) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const domain = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: PRICE_MAP[planKey],
          quantity: 1,
        },
      ],
      metadata: {
        planKey,
        inviteCode: inviteCode || '',
        cliqId: cliqId || '',
        promo: promo || '',
      },
      success_url: `${domain}/parents-hq`,
      cancel_url: `${domain}/choose-plan?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe Checkout Error:', err);
    return NextResponse.json({ error: 'Checkout session failed' }, { status: 500 });
  }
}
