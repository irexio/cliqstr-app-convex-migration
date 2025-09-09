// 📦 Stripe SetupIntent API — used for adding payment methods
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil', // ✅ updated to match Stripe SDK
  });
};

// Fallback for build-time initialization
const stripe = process.env.STRIPE_SECRET_KEY ? getStripe() : null;

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripeInstance = stripe || getStripe();
    const setupIntent = await stripeInstance.setupIntents.create({
      metadata: {
        userId: user.id,
      },
    });

    return NextResponse.json({ clientSecret: setupIntent.client_secret });
  } catch (err) {
    console.error('💥 SetupIntent error:', err);
    return NextResponse.json({ error: 'Failed to create SetupIntent' }, { status: 500 });
  }
}
