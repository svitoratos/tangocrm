import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { userOperations } from '@/lib/database';
import type Stripe from 'stripe';

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
      current_period_end: (validSubscription as any).current_period_end,
      items_count: validSubscription.items.data.length
    });

    // Get all subscription items (niches)
    const subscriptionItems = validSubscription.items.data;
    const niches = [];
    let totalAmount = 0;
    let primaryPrice = null;

    for (const item of subscriptionItems) {
      const price = await stripe.prices.retrieve(item.price.id);
      const product = await stripe.products.retrieve(price.product as string);
      
      // Extract niche from product metadata or name
      const niche = product.metadata?.niche || product.name?.toLowerCase().replace(/\s+/g, '') || 'unknown';
      
      niches.push({
        id: item.id,
        niche: niche,
        price_id: item.price.id,
        quantity: item.quantity,
        amount: price.unit_amount || 0,
        currency: price.currency,
        interval: price.recurring?.interval || 'month',
        interval_count: price.recurring?.interval_count || 1,
        product_name: product.name || 'Unknown Product'
      });
      
      totalAmount += (price.unit_amount || 0) * (item.quantity || 1);
      
      // Set the first item as primary price for billing cycle info
      if (!primaryPrice) {
        primaryPrice = price;
      }
    }

    const subscriptionDetails = {
      id: validSubscription.id,
      status: validSubscription.status,
      current_period_end: (validSubscription as any).current_period_end as number,
      billing_interval: (primaryPrice?.recurring?.interval || 'month') as 'month' | 'year',
      billing_interval_count: primaryPrice?.recurring?.interval_count || 1,
      amount: totalAmount,
      currency: primaryPrice?.currency || 'usd',
      product_id: typeof primaryPrice?.product === 'string' ? primaryPrice.product : (primaryPrice?.product as any)?.id || '',
      discount_applied: (validSubscription as any).discount?.coupon?.name || null,
      discount_end: (validSubscription as any).discount?.end || null,
      niches: niches,
      items_count: subscriptionItems.length
    };

    console.log('✅ Returning subscription details:', {
      ...subscriptionDetails,
      niches_count: niches.length
    });

    return NextResponse.json({
      success: true,
      subscription: subscriptionDetails
    });

  } catch (error) {
    console.error('❌ Error fetching subscription details:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('No such customer')) {
        return NextResponse.json({ 
          error: 'Customer not found in Stripe' 
        }, { status: 404 });
      }
      if (error.message.includes('Invalid API key')) {
        return NextResponse.json({ 
          error: 'Stripe configuration error' 
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch subscription details',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 