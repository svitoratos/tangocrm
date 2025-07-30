import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscription from your database
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: user } = await supabase
      .from('users')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('id', userId)
      .single();

    if (!user?.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      );
    }

    // Get detailed subscription info from Stripe
    const subscription = await stripe.subscriptions.retrieve(user.stripe_subscription_id);
    
    // Ensure subscription.items.data[0].price.id exists before retrieving price
    if (!subscription.items.data[0]?.price?.id) {
      return NextResponse.json(
        { error: 'Subscription price ID not found' },
        { status: 400 }
      );
    }
    
    // Get the price details to determine billing interval
    const price = await stripe.prices.retrieve(subscription.items.data[0].price.id);
    
    // Handle discounts properly
    const firstDiscount = subscription.discounts?.[0];
    const discountApplied = typeof firstDiscount === 'object' && firstDiscount?.coupon ? firstDiscount.coupon.id : null;
    const discountEnd = typeof firstDiscount === 'object' && firstDiscount?.end ? firstDiscount.end : null;
    
    const subscriptionDetails = {
      id: subscription.id,
      status: subscription.status,
      current_period_end: (subscription as any).current_period_end,
      billing_interval: price.recurring?.interval, // 'month' or 'year'
      billing_interval_count: price.recurring?.interval_count, // 1 for monthly, 12 for yearly
      amount: price.unit_amount, // Use price.unit_amount for the base amount
      currency: price.currency,
      product_id: price.product,
      discount_applied: discountApplied,
      discount_end: discountEnd,
    };

    return NextResponse.json({
      success: true,
      subscription: subscriptionDetails,
    });

  } catch (error) {
    console.error('Error fetching subscription details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription details' },
      { status: 500 }
    );
  }
} 