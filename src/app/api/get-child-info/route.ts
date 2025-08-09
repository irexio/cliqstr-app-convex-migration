export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { getCodeFromJson } from '@/lib/invites/getCodeParam';

// Check if Stripe secret key is available
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set. Stripe functionality will be disabled.');
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil'
, // ✅ Correct version
    })
  : null;

export async function POST(req: NextRequest) {
  try {
    // ✅ Require authenticated user
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ Confirm Stripe is enabled
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment processing is not configured' },
        { status: 503 }
      );
    }

    // Normalize invite code (accept legacy inviteCode, standardize to code)
    const { code } = await getCodeFromJson(req.clone());
    const { cliqId, role } = await req.json();

    if (!code || !cliqId || !role) {
      return NextResponse.json(
        { error: 'Missing code, cliqId, or role' },
        { status: 400 }
      );
    }

    // Optional: Add backend-side role validation if needed

    const setupIntent = await stripe.setupIntents.create({
      usage: 'off_session',
      metadata: {
        code,
        cliqId,
        role,
        initiatedBy: user.id,
        reason: 'Identity verification for invited user',
      },
    });

    return NextResponse.json({
      success: true,
      setupIntentId: setupIntent.id,
      clientSecret: setupIntent.client_secret,
    });
  } catch (err) {
    console.error('❌ SetupIntent error:', err);
    return NextResponse.json(
      { error: 'Failed to create setup intent' },
      { status: 500 }
    );
  }
}
