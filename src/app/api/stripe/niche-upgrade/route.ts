import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { nicheId, billingCycle = 'monthly' } = await request.json();

    if (!nicheId) {
      return NextResponse.json({ error: 'Niche ID is required' }, { status: 400 });
    }

    // Validate niche ID
    const validNiches = ['coach', 'podcaster', 'freelancer'];
    if (!validNiches.includes(nicheId)) {
      return NextResponse.json({ error: 'Invalid niche ID' }, { status: 400 });
    }

    // Check if user has the Tango Core plan first
    const subscriptions = await stripe.subscriptions.list({
      limit: 100,
    });

    const userSubscriptions = subscriptions.data.filter(
      (subscription) => subscription.metadata?.clerk_user_id === userId
    );

    const hasCorePlan = userSubscriptions.some(
      (subscription) => (subscription.status === 'active' || subscription.status === 'trialing') && 
                       subscription.metadata?.type !== 'niche_upgrade'
    );

    if (!hasCorePlan) {
      return NextResponse.json({ 
        error: 'You must have the Tango Core plan before adding additional niches. Please complete onboarding first.' 
      }, { status: 403 });
    }

    // Get user's email from Clerk
    const user = await auth();
    const userEmail = user.sessionClaims?.email as string;

    // Use the dedicated add niche payment link
    const addNichePaymentLink = 'https://buy.stripe.com/14A28s5l0dqzgZG0XO2Nq02';
    
    return NextResponse.json({ 
      url: addNichePaymentLink,
      message: 'Redirecting to add niche payment'
    });
  } catch (error) {
    console.error('Error creating niche upgrade checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 