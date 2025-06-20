// src/app/api/create-setup-intent/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Check if Stripe secret key is available
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set. Stripe functionality will be disabled.');
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-04-30.basil', // ✅ Updated to fix type error
    })
  : null;

export async function POST(req: Request) {
  try {
    // Check if Stripe is properly initialized
    if (!stripe) {
      return NextResponse.json({ error: 'Payment processing is not configured' }, { status: 503 });
    }

    const { inviteCode, cliqId, role } = await req.json();

    if (!inviteCode || !cliqId || !role) {
      return NextResponse.json(
        { error: 'Missing inviteCode, cliqId, or role' },
        { status: 400 }
      );
    }

    const setupIntent = await stripe.setupIntents.create({
      usage: 'off_session',
      metadata: {
        inviteCode,
        cliqId,
        role,
        reason: 'Identity verification for invited user',
      },
    });

    return NextResponse.json({
      success: true,
      setupIntentId: setupIntent.id,
      clientSecret: setupIntent.client_secret,
    });
  } catch (err) {
    console.error('SetupIntent error:', err);
    return NextResponse.json(
      { error: 'Failed to create setup intent' },
      { status: 500 }
    );
  }
}
