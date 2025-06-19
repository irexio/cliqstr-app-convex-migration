// src/app/api/create-setup-intent/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil', // ✅ Updated to fix type error
});

export async function POST(req: Request) {
  try {
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
