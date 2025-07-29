import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth } from '@clerk/nextjs/server';
import { userOperations } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    // Get user profile to find Stripe customer ID
    const user = await userOperations.getProfile(userId);
    
    if (!user || !user.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No Stripe customer found for this user' },
        { status: 404 }
      );
    }

    // Create billing portal session with actual Stripe customer ID
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${request.nextUrl.origin}/dashboard/settings`,
    });

    console.log('✅ Created billing portal session for user:', userId, 'customer:', user.stripe_customer_id);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('❌ Stripe portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
} 