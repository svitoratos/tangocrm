import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { userOperations } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔧 Fetching subscription details for user:', userId);

    // Get user profile to get Stripe customer ID
    const userProfile = await userOperations.getProfile(userId);
    
    if (!userProfile || !userProfile.stripe_customer_id) {
      console.log('❌ No user profile or Stripe customer ID found for user:', userId);
      return NextResponse.json({ 
        success: false, 
        error: 'No subscription found',
        subscription: null 
      });
    }

    console.log('🔧 Found Stripe customer ID:', userProfile.stripe_customer_id);

    // Get active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: userProfile.stripe_customer_id,
      status: 'active',
      limit: 1,
    });

    // Also check for trialing and past_due subscriptions
    const allSubscriptions = await stripe.subscriptions.list({
      customer: userProfile.stripe_customer_id,
      status: 'all',
      limit: 10,
    });

    console.log('🔧 Found subscriptions:', {
      active: subscriptions.data.length,
      total: allSubscriptions.data.length,
      statuses: allSubscriptions.data.map(sub => sub.status)
    });

    // Find the most recent subscription (active, trialing, or past_due)
    const validSubscription = allSubscriptions.data.find(sub => 
      ['active', 'trialing', 'past_due'].includes(sub.status)
    );

    if (!validSubscription) {
      console.log('❌ No valid subscription found for customer:', userProfile.stripe_customer_id);
      return NextResponse.json({ 
        success: false, 
        error: 'No active subscription found',
        subscription: null 
      });
    }

    console.log('✅ Found valid subscription:', {
      id: validSubscription.id,
      status: validSubscription.status,
      current_period_end: validSubscription.current_period_end,
    });

    // Get the price details
    const priceId = validSubscription.items.data[0]?.price.id;
    if (!priceId) {
      console.log('❌ No price ID found in subscription items');
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid subscription data',
        subscription: null 
      });
    }
    
    const price = await stripe.prices.retrieve(priceId);
    
    const subscriptionDetails = {
      id: validSubscription.id,
      status: validSubscription.status,
      current_period_end: validSubscription.current_period_end as number,
      billing_interval: (price.recurring?.interval || 'month') as 'month' | 'year',
      billing_interval_count: price.recurring?.interval_count || 1,
      amount: price.unit_amount || 0,
      currency: price.currency,
      product_id: typeof price.product === 'string' ? price.product : (price.product as any)?.id || '',
      discount_applied: validSubscription.discount?.coupon?.name || null,
      discount_end: validSubscription.discount?.end || null,
    };

    console.log('✅ Returning subscription details:', subscriptionDetails);

    return NextResponse.json({
      success: true,
      subscription: subscriptionDetails
    });

  } catch (error) {
    console.error('❌ Error fetching subscription details:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch subscription details',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 