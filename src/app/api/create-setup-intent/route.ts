// 📦 Stripe SetupIntent API — used for adding payment methods
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil', // ✅ updated to match Stripe SDK
});

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const setupIntent = await stripe.setupIntents.create({
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
