import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userOperations } from '@/lib/database';
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

    const body = await request.json();
    const { targetUserId, targetSubscriptionId } = body;

    // Get user profile from database
    const user = await userOperations.getProfile(targetUserId || userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('🔧 Debug - User data from database:', {
      userId: user.id,
      email: user.email,
      stripe_customer_id: user.stripe_customer_id,
      stripe_subscription_id: user.stripe_subscription_id,
      subscription_status: user.subscription_status,
      onboarding_completed: user.onboarding_completed,
      niches: user.niches
    });

    // Check Stripe customer
    let stripeCustomer = null;
    let stripeSubscriptions: any[] = [];
    
    if (user.stripe_customer_id) {
      try {
        stripeCustomer = await stripe.customers.retrieve(user.stripe_customer_id);
        console.log('🔧 Debug - Stripe customer:', stripeCustomer);
        
        // Get all subscriptions for this customer
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripe_customer_id,
          status: 'all',
          limit: 10
        });
        
        stripeSubscriptions = subscriptions.data;
        console.log('🔧 Debug - Stripe subscriptions:', stripeSubscriptions);
      } catch (error) {
        console.error('❌ Error fetching Stripe customer:', error);
      }
    }

    // Check specific subscription if provided
    let specificSubscription = null;
    if (targetSubscriptionId) {
      try {
        specificSubscription = await stripe.subscriptions.retrieve(targetSubscriptionId);
        console.log('🔧 Debug - Specific subscription:', specificSubscription);
      } catch (error) {
        console.error('❌ Error fetching specific subscription:', error);
      }
    }

    // Check if we need to fix the subscription ID
    let fixNeeded = false;
    let fixAction = '';

    if (user.stripe_customer_id && stripeSubscriptions.length > 0) {
      const activeSubscription = stripeSubscriptions.find(sub => 
        sub.status === 'active' || sub.status === 'trialing' || sub.status === 'past_due'
      );
      
      if (activeSubscription && user.stripe_subscription_id !== activeSubscription.id) {
        fixNeeded = true;
        fixAction = `Update stripe_subscription_id from ${user.stripe_subscription_id} to ${activeSubscription.id}`;
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        stripe_customer_id: user.stripe_customer_id,
        stripe_subscription_id: user.stripe_subscription_id,
        subscription_status: user.subscription_status,
        onboarding_completed: user.onboarding_completed,
        niches: user.niches
      },
      stripeCustomer,
      stripeSubscriptions,
      specificSubscription,
      fixNeeded,
      fixAction
    });

  } catch (error) {
    console.error('Error debugging user subscription:', error);
    return NextResponse.json(
      { error: 'Failed to debug user subscription' },
      { status: 500 }
    );
  }
} 